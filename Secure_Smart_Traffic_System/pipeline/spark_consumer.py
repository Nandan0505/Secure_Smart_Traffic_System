# pipeline/spark_consumer.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    from_json, col, avg, count, window,
    current_timestamp, to_timestamp
)
from pyspark.sql.types import (
    StructType, StructField, StringType,
    IntegerType, FloatType, BooleanType
)
import config, os

# ── Schema ────────────────────────────────────────────────
SENSOR_SCHEMA = StructType([
    StructField("sensor_id",      StringType(),  True),
    StructField("intersection",   StringType(),  True),
    StructField("vehicle_count",  IntegerType(), True),
    StructField("avg_speed",      FloatType(),   True),
    StructField("lane_occupancy", FloatType(),   True),
    StructField("timestamp",      StringType(),  True),
    StructField("is_attack",      BooleanType(), True),
    StructField("attack_type",    StringType(),  True),
])

# ── Spark Session ─────────────────────────────────────────
spark = SparkSession.builder \
    .appName("KumaraswamyTrafficPipeline") \
    .config("spark.jars.packages",
            "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0") \
    .config("spark.sql.shuffle.partitions", "4") \
    .config("spark.sql.streaming.checkpointLocation", "./logs/checkpoint") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

# ── Read from Kafka ───────────────────────────────────────
raw_stream = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", config.KAFKA_BROKER) \
    .option("subscribe", config.TRAFFIC_TOPIC) \
    .option("startingOffsets", "latest") \
    .load()

# ── Parse JSON ────────────────────────────────────────────
parsed = raw_stream.select(
    from_json(
        col("value").cast("string"), SENSOR_SCHEMA
    ).alias("data")
).select("data.*") \
 .withColumn("event_time", to_timestamp(col("timestamp")))

# ── 5-minute windowed aggregates per intersection ─────────
aggregated = parsed \
    .withWatermark("event_time", "1 minute") \
    .groupBy(
        window(col("event_time"), "5 minutes", "1 minute"),
        col("intersection")
    ).agg(
        avg("vehicle_count").alias("avg_vehicle_count"),
        avg("avg_speed").alias("avg_speed"),
        avg("lane_occupancy").alias("avg_lane_occupancy"),
        count("*").alias("reading_count")
    ) \
    .select(
        col("window.start").alias("window_start"),
        col("window.end").alias("window_end"),
        col("intersection"),
        col("avg_vehicle_count"),
        col("avg_speed"),
        col("avg_lane_occupancy"),
        col("reading_count")
    )

# ── Separate attack stream ────────────────────────────────
attacks = parsed.filter(col("is_attack") == True) \
    .select(
        col("sensor_id"),
        col("intersection"),
        col("attack_type"),
        col("vehicle_count"),
        col("avg_speed"),
        col("timestamp")
    )

# ── Sinks ─────────────────────────────────────────────────
os.makedirs("./data/raw",    exist_ok=True)
os.makedirs("./data/sample", exist_ok=True)
os.makedirs("./logs",        exist_ok=True)

# Aggregated traffic → parquet (feeds LSTM)
traffic_query = aggregated.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "./data/raw/traffic_agg") \
    .option("checkpointLocation", "./logs/checkpoint/traffic") \
    .trigger(processingTime="30 seconds") \
    .start()

# Raw parsed stream → console (debug)
console_query = parsed.writeStream \
    .outputMode("append") \
    .format("console") \
    .option("truncate", False) \
    .option("numRows", 10) \
    .trigger(processingTime="5 seconds") \
    .start()

# Attack events → parquet (feeds Isolation Forest)
attack_query = attacks.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "./data/raw/attacks") \
    .option("checkpointLocation", "./logs/checkpoint/attacks") \
    .trigger(processingTime="10 seconds") \
    .start()

print("=" * 55)
print(" Kumaraswamy Layout — Spark Pipeline running")
print(" Aggregating in 5-min windows, saving to parquet")
print("=" * 55)

spark.streams.awaitAnyTermination()
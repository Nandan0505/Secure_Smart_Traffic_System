import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Download,
  Target,
  MousePointer2,
  FileSearch,
  Activity,
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [statsRes, sensorsRes, summaryRes, healthRes, historyRes] = await Promise.all([
          axios.get('/api/traffic/stats'),
          axios.get('/api/traffic/sensors'),
          fetch(`${API_BASE}/api/analytics/summary`).then(r => r.json()),
          fetch(`${API_BASE}/api/analytics/system-health`).then(r => r.json()),
          fetch(`${API_BASE}/api/analytics/history?window=1h`).then(r => r.json())
        ]);

        setStats(statsRes.data);
        setSensors(sensorsRes.data);
        setSummary(summaryRes);
        setHealth(healthRes);

        // Transform history into Recharts format
        if (historyRes.timestamps) {
          const chartData = historyRes.timestamps.map((t: string, i: number) => ({
            time: t,
            actual: historyRes.actual[i],
            predicted: historyRes.predicted[i],
          }));
          setHistory(chartData);
        }
      } catch (err) {
        console.error('Failed to fetch analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter text-white uppercase italic">Advanced Data Analytics</h2>
          <p className="text-muted-foreground font-medium">Historical performance insight and long-term urban trends.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full border-white/5 bg-white/5 h-9 font-bold px-6 uppercase tracking-widest text-[10px]">
            <Calendar className="mr-2 h-4 w-4" />
            Select Range
          </Button>
          <Button className="rounded-full bg-primary text-primary-foreground h-9 font-bold px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: stats?.total_volume || '0', trend: '+4.2%', desc: 'Session Data' },
          { label: 'Avg Frequency', value: `${stats?.avg_flow?.toFixed(1) || '0'}Hz`, trend: 'Nominal', desc: 'Sync Rate' },
          { label: 'Model Accuracy', value: `${summary?.model_accuracy || '--'}%`, trend: summary?.accuracy_trend || 'Projected', desc: 'Forecast Precision' },
          { label: 'Busiest Window', value: summary?.busiest_window || 'N/A', trend: 'Actual', desc: 'Resource Allocation' },
        ].map((metric, idx) => (
          <Card key={idx} className="bg-surface-container border-white/5 p-4 flex flex-col justify-between hover:border-primary/20 transition-all cursor-default group">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1 tracking-widest">{metric.label}</p>
              <h4 className="text-2xl font-black font-heading tracking-tighter text-white uppercase italic group-hover:text-primary transition-colors">{metric.value}</h4>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${metric.trend.includes('+') || metric.trend === 'Stable' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/20 text-primary'
                }`}>
                {metric.trend}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-medium">{metric.desc}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LSTM Prediction vs Actual Chart */}
        <Card className="bg-surface-container border-white/5 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-primary">
                <Target className="h-5 w-5" />
                LSTM PREDICTION VS ACTUAL
              </CardTitle>
              <CardDescription>Real-time vehicle count forecasting vs ground-truth sensor data.</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#8b8fa8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b8fa8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="actual" stroke="#3fb950" strokeWidth={2} dot={false} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#f0883e" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Node Efficiency */}
        <Card className="bg-surface-container border-white/5 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                Node Throughput Ranking
              </CardTitle>
              <CardDescription>Top performing intersections by total volume capacity.</CardDescription>
            </div>
            <MousePointer2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensors.slice(0, 6).map(s => ({ name: s.sensor_id, value: s.vehicle_count }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b8fa8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b8fa8', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1000}>
                  {sensors.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#378ADD' : 'rgba(55, 138, 221, 0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Comprehensive Sensor Performance Table */}
      <Card className="bg-surface-container border-white/5 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-white">
              <HardDrive className="h-5 w-5 text-primary" />
              Node Infrastructure Audit
            </CardTitle>
            <CardDescription>Detailed telemetry readout of each mesh sensor unit.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="bg-surface-lowest/50 sticky top-0 z-10">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 pl-6">Node ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Location</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 text-center">Volume (Cars)</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 text-center">Load Factor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 pr-6 text-right">Integrity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensors.map((sensor, idx) => (
                  <TableRow key={sensor.sensor_id || idx} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-mono text-xs text-primary pl-6 font-bold">{sensor.sensor_id || 'N/A'}</TableCell>
                    <TableCell className="text-xs uppercase font-medium text-white/80">{sensor.intersection?.replace(/_/g, ' ') || 'Awaiting Node'}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{sensor.vehicle_count || 0}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-black text-white">{((sensor.lane_occupancy || 0) * 100).toFixed(1)}%</span>
                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(sensor.lane_occupancy || 0) * 100}%` }}
                            className={`h-full ${(sensor.lane_occupancy || 0) > 0.8 ? 'bg-secondary' : 'bg-primary'}`}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        Operational
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {sensors.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic uppercase tracking-widest text-[10px]">
                      No active nodes reporting telemetry
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        {/* System Health Panel */}
        <Card className="bg-surface-container border-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Infrastructure Health
              </CardTitle>
              <CardDescription>Real-time status of critical backend components.</CardDescription>
            </div>
          </div>

          <ScrollArea className="h-[200px] w-full pr-4">
            <div className="space-y-3">
              {health?.components.map((c: any) => (
                <div key={c.name} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${c.status === 'Active' || c.status === 'Connected' || c.status === 'Loaded' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                    <div>
                      <p className="text-[10px] font-black uppercase text-white tracking-widest">{c.name}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-medium">{c.detail}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${c.status === 'Active' || c.status === 'Connected' || c.status === 'Loaded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Additional Tool Card (Inference Precision) */}
        <Card className="bg-surface-container border-white/5 p-8 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all cursor-default">
          <div className="h-16 w-16 rounded-3xl bg-surface-lowest flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileSearch className="h-8 w-8 text-primary" />
          </div>
          <h4 className="text-xl font-heading font-black tracking-tighter uppercase italic text-white">Inference Precision</h4>
          <p className="text-muted-foreground text-sm font-medium mt-2 max-w-[200px]">LSTM baseline accuracy vs distributed node telemetry.</p>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-4xl font-black font-heading tracking-tighter text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/40">
              {summary?.model_accuracy || '--'}%
            </span>
            <span className="text-emerald-500 font-black text-xs uppercase">{summary?.accuracy_trend || 'Stable'}</span>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

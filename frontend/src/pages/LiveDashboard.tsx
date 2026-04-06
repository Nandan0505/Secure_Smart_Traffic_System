import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Clock,
  ArrowUpRight,
  Shield,
  Zap,
  Radio,
  BrainCircuit
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { useTraffic } from '../context/TrafficContext';

const SENSOR_COLORS: Record<string, string> = {
  "S001": "#378ADD", // Blue
  "S002": "#639922", // Green
  "S003": "#EF9F27", // Amber
  "S004": "#E24B4A", // Red
  "S005": "#7F77DD"  // Purple
};

const SEVERITY_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/50' },
  HIGH:     { bg: 'bg-orange-500/20', text: 'text-orange-500', border: 'border-orange-500/50' },
  MEDIUM:   { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500/50' },
  LOW:      { bg: 'bg-emerald-500/20', text: 'text-emerald-500', border: 'border-emerald-500/50' },
};

const API_BASE = 'http://localhost:5000';

export function LiveDashboard() {
  const { trafficData, alerts, sensorReadings, threatLevel } = useTraffic();
  const [congestion, setCongestion] = useState<any[]>([]);
  const [sessionSeeds, setSessionSeeds] = useState({
    sensors: [] as any[],
    stats: { total_vehicles: 0, avg_speed: 0, active_sensors: 0, total_sensors: 5 }
  });

  useEffect(() => {
    const fetchCongestion = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/traffic/congestion`);
        const json = await res.json();
        setCongestion(json.predictions);
      } catch (err) {
        console.error('Failed to fetch congestion', err);
      }
    };

    fetchCongestion();
    const interval = setInterval(fetchCongestion, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const seedDashboard = async () => {
      try {
        const [sensorsRes, statsRes] = await Promise.all([
          axios.get('/api/traffic/sensors'),
          axios.get('/api/traffic/stats')
        ]);
        setSessionSeeds({
          sensors: sensorsRes.data,
          stats: statsRes.data
        });
      } catch (err) {
        console.error('Failed to seed dashboard', err);
      }
    };
    seedDashboard();
  }, []);

  // Calculate current stats from context or seeds
  const currentTotalVehicles = Object.values(sensorReadings).reduce((sum, r) => sum + r.vehicle_count, 0) || sessionSeeds.stats.total_vehicles;
  const currentAvgSpeed = Object.values(sensorReadings).length > 0 
    ? (Object.values(sensorReadings).reduce((sum, r) => sum + r.avg_speed, 0) / Object.values(sensorReadings).length).toFixed(1)
    : sessionSeeds.stats.avg_speed;
  const activeSensorsCount = Object.values(sensorReadings).length || sessionSeeds.stats.active_sensors;

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      case 'LOW': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
      default: return 'bg-white/5 text-muted-foreground border-white/10';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter">LIVE COMMAND</h2>
          <p className="text-muted-foreground font-medium">Real-time urban mobility orchestration and monitoring.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Live Feed Active</span>
            </div>
            <Button className="rounded-full bg-primary text-primary-foreground h-10 font-bold px-6 shadow-lg shadow-primary/20">
                Network Status: Operational
            </Button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total City Flow', value: currentTotalVehicles, icon: Activity, color: 'text-primary', unit: 'vehicles' },
          { label: 'Avg City Velocity', value: `${currentAvgSpeed} km/h`, icon: TrendingUp, color: 'text-secondary', unit: 'real-time' },
          { label: 'Active Edge Nodes', value: `${activeSensorsCount}/5`, icon: Radio, color: 'text-emerald-500', unit: 'online' },
          { label: 'Cyber Threat Level', value: threatLevel, icon: Shield, color: getThreatColor(threatLevel), unit: 'isolation forest' },
        ].map((metric, idx) => (
          <Card key={idx} className="bg-surface-container border-white/5 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
               <CardTitle className="text-sm font-medium text-muted-foreground font-sans uppercase tracking-widest">
                 {metric.label}
               </CardTitle>
               <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-heading tracking-tighter ${metric.label.includes('Threat') && threatLevel === 'CRITICAL' ? 'animate-pulse' : ''}`}>
                {metric.value}
              </div>
              <div className="flex items-center pt-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 italic">
                    {metric.unit}
                 </span>
              </div>
            </CardContent>
            <div className="h-1 w-full bg-surface-lowest mt-auto overflow-hidden opacity-30">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className={`h-full ${metric.color.replace('text-', 'bg-')}`} 
               />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="lg:col-span-2 bg-surface-container border-white/5 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic">Multi-Node Traffic Velocity</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Real-time flow analysis across all active intersections.</CardDescription>
              </div>
              <div className="flex gap-2">
                 {Object.keys(SENSOR_COLORS).map(sid => (
                   <div key={sid} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SENSOR_COLORS[sid] }} />
                      <span className="text-[10px] font-bold text-muted-foreground">{sid}</span>
                   </div>
                 ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trafficData.slice(-60)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="timestamp" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b8fa8', fontSize: 10 }}
                  hide
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b8fa8', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                {Object.keys(SENSOR_COLORS).map(sid => (
                  <Line 
                    key={sid}
                    type="monotone" 
                    dataKey="vehicle_count" 
                    data={trafficData.filter(d => d.sensor_id === sid).slice(-60)}
                    stroke={SENSOR_COLORS[sid]} 
                    strokeWidth={2}
                    dot={false}
                    name={sid}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prediction Panel */}
        <Card className="bg-surface-container border-white/5 flex flex-col h-full">
           <CardHeader className="pb-2">
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
               <BrainCircuit className="h-5 w-5 text-primary" />
               LSTM PREDICTIONS
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">15-minute congestion forecasts.</CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1">
             <div className="p-4 space-y-3">
                {congestion?.map((item: any) => (
                  <div key={item.name} className="p-4 rounded-2xl bg-surface-lowest/50 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black uppercase tracking-tighter text-white">
                           {item.name}
                        </span>
                     </div>
                     <div className="flex items-end justify-between">
                        <div>
                           <div className="text-2xl font-black font-heading tracking-tighter">
                              {item.units} <span className="text-[10px] text-muted-foreground">PREDICTED UNITS</span>
                           </div>
                           <div className="text-[10px] text-muted-foreground font-medium italic">
                              Horizon: 15 min
                           </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${SEVERITY_COLORS[item.severity]?.bg} ${SEVERITY_COLORS[item.severity]?.text} ${SEVERITY_COLORS[item.severity]?.border}`}>
                           {item.severity}
                        </span>
                     </div>
                  </div>
                ))}
                {(!congestion || congestion.length === 0) && (
                   <div className="p-8 text-center text-muted-foreground italic text-xs uppercase tracking-widest">
                      Buffering inference...
                   </div>
                )}
             </div>
          </ScrollArea>
           <div className="p-4 border-t border-white/5">
             <Button variant="ghost" asChild className="w-full h-10 rounded-xl text-xs font-bold hover:bg-white/5 uppercase tracking-widest">
                <Link to="/predictive">VIEW DEEP FORECASTS</Link>
             </Button>
          </div>
        </Card>

      </div>

      {/* Sensor Status Grid - Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
         {Object.keys(SENSOR_COLORS).map(sid => {
           const sensor = sensorReadings[sid];
           return (
             <Card key={sid} className="bg-surface-container border-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-muted-foreground uppercase">{sid}</span>
                   <div className={`w-2 h-2 rounded-full ${sensor ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'} animate-pulse`} />
                </div>
                <div className="space-y-1">
                   <div className="text-lg font-black font-heading tracking-tighter truncate leading-tight">
                      {sensor?.intersection?.split('_')[0] || 'Node Disconnected'}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium italic">
                      <Zap className="h-3 w-3" />
                      {sensor ? `${sensor.vehicle_count} VHC | ${sensor.avg_speed} KMH` : 'Offline'}
                   </div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: sensor ? `${(sensor.vehicle_count / 150) * 100}%` : 0 }}
                     className="h-full bg-secondary"
                   />
                </div>
             </Card>
           );
         })}
      </div>

      {/* Alert Ticker Strip */}
      <div className={`fixed bottom-0 left-0 right-0 h-10 bg-surface-container border-t border-white/10 flex items-center overflow-hidden z-50 transition-colors duration-300 ${alerts[0]?.severity === 'HIGH' ? 'bg-red-950/30' : ''}`}>
         <div className="bg-primary px-4 h-full flex items-center gap-2 font-black italic text-[10px] uppercase tracking-widest text-primary-foreground whitespace-nowrap">
            <Radio className="h-3 w-3 animate-ping" />
            Live Intelligence
         </div>
         <div className="flex-1 overflow-hidden relative h-full">
            <div className="absolute inset-0 flex items-center gap-8 px-6 animate-scroll-text whitespace-nowrap">
               {alerts.length > 0 ? alerts.slice(0, 10).map((alert, idx) => (
                 <div key={idx} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-white">{alert.timestamp}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{alert.intersection.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${alert.severity === 'HIGH' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>
                       {alert.attack_type} detected
                    </span>
                    <span className="text-[10px] font-bold text-white/50">Score: {alert.score}</span>
                    <div className="h-1 w-8 bg-white/10 rounded-full" />
                 </div>
               )) : (
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                    All Urban Infrastructure Secure | No Current Anomalies Detected | Sentinel Monitoring Active
                 </span>
               )}
            </div>
         </div>
      </div>
    </motion.div>
  );
}

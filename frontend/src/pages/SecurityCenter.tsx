import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Fingerprint,
  Network,
  AlertTriangle,
  FileSearch,
  MoreVertical,
  Activity,
  History,
  TrendingDown
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTraffic } from '../context/TrafficContext';

const ATTACK_COLORS: Record<string, string> = {
  "spoofing": "#E24B4A",
  "replay": "#EF9F27",
  "ddos": "#7F77DD",
  "unknown": "#8b8fa8"
};

export function SecurityCenter() {
  const { alerts, threatLevel } = useTraffic();
  const [stats, setStats] = useState({
    total_alerts: 0,
    high_severity: 0,
    most_common_attack: 'N/A'
  });
  const [breakdown, setBreakdown] = useState<{ name: string, value: number }[]>([]);
  const [intensity, setIntensity] = useState<any>(null);

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const [statsRes, breakdownRes, intensityRes] = await Promise.all([
          axios.get('/api/alerts/stats'),
          axios.get('/api/alerts/breakdown'),
          fetch(`${API_BASE}/api/alerts/intensity`).then(r => r.json())
        ]);
        
        setStats(statsRes.data);
        setBreakdown(breakdownRes.data.map((d: any) => ({ name: d.attack_type || 'unknown', value: d.count })));
        
        // Transform intensity for Recharts
        if (intensityRes.timestamps) {
          const chartData = intensityRes.timestamps.map((t: string, i: number) => ({
             timestamp: t,
             score: intensityRes.scores[i],
             threshold: intensityRes.threshold
          }));
          setIntensity({ data: chartData, threshold: intensityRes.threshold });
        }
      } catch (err) {
        console.error('Failed to fetch security stats', err);
      }
    };
    fetchSecurityData();
  }, [alerts]); // Refresh stats when new alerts arrive

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter uppercase italic text-white">Security Command Center</h2>
          <p className="text-muted-foreground font-medium">Enterprise-level threat detection and anomaly orchestration.</p>
        </div>
        <div className="flex gap-2">
          <div className={`px-4 h-9 flex items-center rounded-full border ${threatLevel === 'SAFE' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'} font-bold text-xs uppercase tracking-widest`}>
             <ShieldAlert className="mr-2 h-4 w-4" />
             Threat Level: {threatLevel}
          </div>
          <Button className="rounded-full bg-primary text-primary-foreground h-9 font-bold px-6 uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
            System Lockdown
          </Button>
        </div>
      </div>

      {/* Security Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { label: 'Total Anomalies', value: stats.total_alerts, icon: Activity, color: 'text-primary' },
            { label: 'High Severity', value: stats.high_severity, icon: AlertTriangle, color: 'text-red-500' },
            { label: 'Primary Pattern', value: stats.most_common_attack, icon: Fingerprint, color: 'text-secondary' },
         ].map((stat, idx) => (
           <Card key={idx} className="bg-surface-container border-white/5 group hover:border-primary/20 transition-all">
              <CardHeader className="pb-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                 </div>
              </CardHeader>
              <CardContent>
                 <div className="text-3xl font-heading font-black tracking-tighter text-white uppercase italic">
                    {stat.value}
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attack Breakdown Donut */}
        <Card className="bg-surface-container border-white/5">
          <CardHeader>
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Attack Distribution
            </CardTitle>
            <CardDescription>Percentage breakdown of detected anomaly types.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown.length > 0 ? breakdown : [{ name: 'none', value: 1 }]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATTACK_COLORS[(entry.name || 'unknown').toLowerCase()] || '#8b8fa8'} />
                  ))}
                  {breakdown.length === 0 && <Cell fill="#1a1d27" />}
                </Pie>
                <RechartsTooltip 
                   contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anomaly Intensity chart */}
        <Card className="bg-surface-container border-white/5">
          <CardHeader>
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
               <History className="h-5 w-5 text-secondary" />
               Anomaly Intensity
            </CardTitle>
            <CardDescription>Real-time detection sensitivity monitoring.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={intensity?.data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[0, 1]} tick={{ fill: '#8b8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                   contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <ReferenceLine y={intensity?.threshold || 0.8} stroke="#E24B4A" strokeDasharray="3 3" label={{ value: 'THR', fill: '#E24B4A', fontSize: 10 }} />
                <Line 
                   type="monotone" 
                   dataKey="score" 
                   stroke="#378ADD" 
                   strokeWidth={2} 
                   dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (payload.score > (intensity?.threshold || 0.8)) {
                        return <circle cx={cx} cy={cy} r={3} fill="#E24B4A" />;
                      }
                      return <circle cx={cx} cy={cy} r={2} fill="#378ADD" />;
                   }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Alert Table */}
      <Card className="bg-surface-container border-white/5 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              Detection Stream
            </CardTitle>
            <CardDescription>Detailed audit of the last 100 anomaly detections.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 max-h-[400px]">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="bg-surface-lowest/50 sticky top-0 z-10">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 pl-6">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Node</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Pattern</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Score</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 pr-6 text-right">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert, idx) => (
                  <TableRow key={idx} className={`border-white/5 hover:bg-white/5 transition-colors group ${alert.severity === 'HIGH' ? 'border-l-4 border-l-red-500' : ''}`}>
                    <TableCell className="font-mono text-[10px] text-muted-foreground pl-6 uppercase">{alert.timestamp}</TableCell>
                    <TableCell className="font-bold text-xs uppercase">{alert.sensor_id}</TableCell>
                    <TableCell>
                       <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded uppercase ${
                          alert.attack_type === 'spoofing' ? 'bg-red-500/10 text-red-500' :
                          alert.attack_type === 'replay' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-purple-500/10 text-purple-500'
                       }`}>
                          {alert.attack_type}
                       </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium font-mono">{alert.score.toFixed(3)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${
                        alert.severity === 'HIGH' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {alert.severity}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {alerts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic uppercase tracking-widest text-[10px]">
                       No anomalies detected in the current session
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Lock, label: 'Encryption Protocol', status: 'AES-256 Quantum', color: 'text-primary' },
          { icon: Network, label: 'Traffic Node Mesh', status: 'Isolated vLAN', color: 'text-primary' },
          { icon: Fingerprint, label: 'Auth Multi-Factor', status: 'Biometric Stack', color: 'text-primary' },
          { icon: Activity, label: 'Heuristic Engine', status: 'Isolation Forest v2.1', color: 'text-emerald-500' },
        ].map((item, idx) => (
          <Card key={idx} className="bg-surface-container border-white/5 p-4 flex items-center gap-4 hover:border-primary/20 transition-all cursor-default group">
            <div className={`h-10 w-10 rounded-xl bg-surface-lowest border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
              <p className="text-sm font-black font-heading tracking-tighter uppercase text-white">{item.status}</p>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

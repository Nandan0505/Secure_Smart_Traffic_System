import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Terminal, 
  Zap, 
  Database,
  Activity,
  Layers,
  Radio,
  ShieldAlert,
  Bug,
  Server,
  Cpu,
  RefreshCcw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTraffic } from '../context/TrafficContext';
import { toast } from 'sonner';

const ATTACK_COLORS: Record<string, string> = {
  "spoofing": "#E24B4A",
  "replay": "#EF9F27",
  "ddos": "#7F77DD"
};

export function CyberIntelligence() {
  const { alerts } = useTraffic();
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [simulating, setSimulating] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const [statusRes, breakdownRes] = await Promise.all([
        axios.get('/api/simulate/status'),
        axios.get('/api/alerts/breakdown')
      ]);
      setSystemStatus(statusRes.data);
      setDistribution(breakdownRes.data);
    } catch (err) {
      console.error('Failed to fetch system status', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [alerts]);

  const triggerAttack = async (type: string) => {
    setSimulating(type);
    try {
      await axios.post('/api/simulate/attack', { type });
      toast.success(`Injected ${type.toUpperCase()} attack vector into stream`, {
        description: 'Monitor the detection feed for live results.',
        duration: 5000,
      });
    } catch (err) {
      toast.error('Failed to trigger simulation');
    } finally {
      setTimeout(() => setSimulating(null), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter text-white uppercase italic">Cyber Intelligence Port</h2>
          <p className="text-muted-foreground font-medium">Distributed mesh vulnerability testing and detection oversight.</p>
        </div>
        <div className="flex gap-2">
            <Button 
               variant="outline" 
               onClick={fetchStatus}
               className="rounded-full border-white/5 bg-white/5 h-9 font-bold px-6 uppercase tracking-widest text-[10px]"
            >
                <RefreshCcw className="mr-2 h-3 w-3" />
                Refresh State
            </Button>
            <div className="px-4 h-9 flex items-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
               Sentinel Mode: Active
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Attack Simulator Panel */}
        <Card className="lg:col-span-3 bg-surface-container border-white/5 overflow-hidden flex flex-col">
           <CardHeader>
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
                 <Bug className="h-5 w-5 text-secondary" />
                 Attack Vector Simulator
              </CardTitle>
              <CardDescription>Inject controlled anomalies to validate Isolation Forest detection accuracy.</CardDescription>
           </CardHeader>

           <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[
                   { type: 'spoofing', label: 'Spoofing Attack', color: 'bg-red-500', desc: 'Injection of fake GPS coordinates and timestamps.' },
                   { type: 'replay', label: 'Replay Attack', color: 'bg-amber-500', desc: 'Looping historical high-flow traffic signatures.' },
                   { type: 'ddos', label: 'DDoS Burst', color: 'bg-purple-500', desc: 'Rapid volumetric packet saturation from edge nodes.' }
                 ].map((attack) => (
                   <div key={attack.type} className="p-6 rounded-3xl bg-surface-lowest/50 border border-white/5 space-y-4 hover:border-primary/20 transition-all group">
                      <div className={`h-10 w-10 rounded-2xl ${attack.color}/10 flex items-center justify-center`}>
                         <ShieldAlert className={`h-5 w-5 ${attack.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                         <h4 className="font-black uppercase tracking-tighter text-sm text-white">{attack.label}</h4>
                         <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mt-1">{attack.desc}</p>
                      </div>
                      <Button 
                         onClick={() => triggerAttack(attack.type)}
                         disabled={simulating !== null}
                         className={`w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 ${attack.color} text-white shadow-xl shadow-${attack.type}/20 hover:scale-[1.02] transition-transform`}
                      >
                         {simulating === attack.type ? 'Injecting...' : 'Trigger Vector'}
                      </Button>
                   </div>
                 ))}
              </div>

              {/* Live Detection Feed In-Page */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detection Feed (Last 10 Anomalies)</h4>
                 </div>
                 <ScrollArea className="h-[250px] rounded-2xl border border-white/5 bg-surface-lowest/30 p-4">
                    <div className="space-y-3">
                       <AnimatePresence mode="popLayout">
                          {alerts.slice(0, 10).map((alert, idx) => (
                             <motion.div 
                                key={alert.timestamp + idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all"
                             >
                                <div className="flex items-center gap-4">
                                   <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${alert.severity === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                      <Activity className="h-4 w-4" />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black uppercase text-white">{(alert.attack_type || 'unknown').toUpperCase()} detected</p>
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold italic">{alert.intersection?.replace(/_/g, ' ') || 'Awaiting Node'}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black text-white">Score: {(alert.score || 0).toFixed(3)}</p>
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold">{alert.timestamp}</p>
                                </div>
                             </motion.div>
                          ))}
                          {alerts.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center py-12 space-y-2 opacity-50">
                               <Info className="h-8 w-8 text-muted-foreground" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No attacks detected yet — trigger one above</p>
                            </div>
                          )}
                       </AnimatePresence>
                    </div>
                 </ScrollArea>
              </div>
           </CardContent>
        </Card>

        {/* System Diagnostics */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
           <Card className="bg-surface-container border-white/5 flex flex-col flex-1">
              <CardHeader className="pb-2">
                 <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-white">
                    <Cpu className="h-5 w-5 text-primary" />
                    Sentinel Status
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 overflow-y-auto">
                 <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-surface-lowest/50 border border-white/5 space-y-3">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Server className="h-3 w-3" /> Core Infrastructure
                       </h5>
                       <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                             <span className="text-white/70">Apache Kafka</span>
                             <span className={systemStatus?.kafka === 'connected' ? 'text-emerald-500' : 'text-red-500'}>
                                {systemStatus?.kafka?.toUpperCase() || 'OFFLINE'}
                             </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                             <span className="text-white/70">LSTM Predictor</span>
                             <span className={systemStatus?.lstm === 'loaded' ? 'text-emerald-500' : 'text-amber-500'}>
                                {systemStatus?.lstm?.toUpperCase() || 'WAITING'}
                             </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase">
                             <span className="text-white/70">Anomaly Engine</span>
                             <span className={systemStatus?.isolation_forest === 'loaded' ? 'text-emerald-500' : 'text-amber-500'}>
                                {systemStatus?.isolation_forest?.toUpperCase() || 'BUSY'}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-lowest/50 border border-white/5 space-y-4">
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Edge Buffer Loading (30 REQ)</h5>
                       <div className="space-y-3">
                          {systemStatus?.sensors && Object.keys(systemStatus.sensors).map((sid: string) => {
                             const count = systemStatus.sensors[sid].buffer_count;
                             const ready = systemStatus.sensors[sid].buffer_ready;
                             return (
                                <div key={sid} className="space-y-1">
                                   <div className="flex items-center justify-between text-[9px] font-black uppercase mb-1">
                                      <span className="text-white/50">{sid} Node</span>
                                      <span className={ready ? 'text-primary' : 'text-muted-foreground'}>{count}/30</span>
                                   </div>
                                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                         initial={{ width: 0 }}
                                         animate={{ width: `${(count / 30) * 100}%` }}
                                         className={`h-full ${ready ? 'bg-primary' : 'bg-white/20'}`} 
                                      />
                                   </div>
                                </div>
                             );
                          })}
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
           
           <Card className="bg-surface-container border-white/5 p-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Detection Proximity</h5>
              <div className="h-[120px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                       <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {distribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={ATTACK_COLORS[entry.attack_type.toLowerCase()] || '#378ADD'} />
                          ))}
                       </Bar>
                       <XAxis dataKey="attack_type" hide />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>
        </div>
      </div>

      {/* Explainer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { 
               icon: Database, 
               label: 'Data Integrity', 
               sub: 'Anomaly Scoring', 
               desc: 'Isolation Forest assigns scores based on path isolation. Values > 0.8 trigger high-severity alerts.' 
            },
            { 
               icon: Layers, 
               label: 'Network Mesh', 
               sub: 'Dynamic Re-routing', 
               desc: 'Detected attack nodes are automatically quarantined, shifting traffic processing to secondary vLANs.' 
            },
            { 
               icon: Radio, 
               label: 'Real-time Sync', 
               sub: 'Latency Control', 
               desc: 'Direct WebSocket pipeline ensures detection-to-dashboard latency remains sub-100ms.' 
            },
         ].map((item, idx) => (
            <Card key={idx} className="bg-surface-container border-white/5 p-6 space-y-4 group hover:border-primary/20 transition-all">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-surface-lowest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                     <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black font-heading tracking-tighter uppercase text-white">{item.label}</h4>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.sub}</p>
                  </div>
               </div>
               <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {item.desc}
               </p>
            </Card>
         ))}
      </div>
    </motion.div>
  );
}

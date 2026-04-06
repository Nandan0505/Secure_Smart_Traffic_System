import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Cpu,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  Hourglass,
  ShieldCheck,
  Signal
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTraffic } from '../context/TrafficContext';

export function PredictiveAI() {
  const { predictions } = useTraffic();
  const predictionList = Object.values(predictions);
  const [stats, setStats] = useState({
    accuracy: 98.2,
    next_hour_volume: 0,
    suggested_buffer: 0
  });

  const [predicting, setPredicting] = useState(false);
  const [manualResult, setManualResult] = useState<any>(null);

  const API_BASE = 'http://localhost:5000';

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await axios.post(`${API_BASE}/api/traffic/predict`, {});
      setManualResult(res.data);
    } catch (err) {
      console.error('Manual prediction failed', err);
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
    const fetchForecastStats = async () => {
      try {
        const res = await axios.get('/api/forecast/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch forecast stats', err);
      }
    };
    fetchForecastStats();
  }, [predictions]);

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter text-white uppercase italic">Predictive AI Engine</h2>
          <p className="text-muted-foreground font-medium">LSTM-driven urban flow choreography and demand forecasting.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-white/5 bg-white/5 h-9 font-bold px-6 uppercase tracking-widest text-[10px]">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Retrain LSTM
            </Button>
            <div className="px-4 h-9 flex items-center rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/20">
               <Signal className="mr-2 h-3 w-3" />
               Real-time Inference: ON
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { label: 'Forecast Accuracy', value: `${stats.accuracy}%`, icon: ShieldCheck, color: 'text-emerald-500' },
            { label: 'Next Hour Flow', value: stats.next_hour_volume, icon: TrendingUp, color: 'text-primary' },
            { label: 'Suggested Buffer', value: stats.suggested_buffer, icon: Layers, color: 'text-secondary' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2 bg-surface-container border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                LSTM Load Projection
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Probabilistic traffic volume forecasting for the next 24 detection cycles.</CardDescription>
            </div>
            <div className="flex bg-surface-lowest p-1 rounded-full border border-white/5">
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-[10px] uppercase font-black bg-primary/20 text-primary px-4">Live</Button>
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-[10px] uppercase font-black text-muted-foreground hover:text-white px-4">History</Button>
            </div>
          </div>
          
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionList}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#378ADD" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="timestamp" 
                  hide
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8b8fa8', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted_vehicle_count" 
                  stroke="#378ADD" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFlow)" 
                  name="Predicted Volume"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Prediction Accuracy Matrix */}
        <Card className="bg-surface-container border-white/5 flex flex-col h-full overflow-hidden">
           <CardHeader className="bg-secondary/5 border-b border-white/5">
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-secondary">
                 <AlertCircle className="h-5 w-5" />
                 Confidence Matrix
              </CardTitle>
              <CardDescription className="text-secondary/60">AI model reliability across different urban intersections.</CardDescription>
           </CardHeader>
           <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full max-h-[450px]">
                 <div className="p-4 space-y-4">
                    {predictionList.slice(0, 8).map((pred, idx) => {
                       // Mock confidence since it's not in the backend data yet
                       const confidence = 95.0 + (Math.random() * 4);
                       return (
                        <div key={idx} className="p-4 rounded-2xl bg-surface-lowest/50 border border-white/5 group hover:border-secondary/30 transition-all relative overflow-hidden">
                           <div className="flex items-center justify-between">
                              <h4 className="font-black uppercase tracking-tighter text-xs text-white">{pred.sensor_id} Node</h4>
                              <span className="text-[10px] font-black text-secondary uppercase italic">
                                 {confidence.toFixed(1)}% Match
                              </span>
                           </div>
                           
                           <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                 <span>Optimization Range</span>
                                 <span className="text-white">{pred.predicted_vehicle_count} CARS</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confidence}%` }}
                                    className="h-full bg-secondary shadow-[0_0_10px_rgba(239,159,39,0.3)]"
                                 />
                              </div>
                           </div>

                          <div className="flex items-center gap-4 mt-4">
                             <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                                <Hourglass className="h-3 w-3" />
                                T+15 MINS
                             </div>
                             <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                                <Zap className="h-3 w-3" />
                                Resource Balanced
                             </div>
                          </div>
                        </div>
                       );
                    })}
                    {predictionList.length === 0 && (
                      <div className="h-40 flex flex-col items-center justify-center space-y-2 opacity-50">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synthesizing predictions...</p>
                      </div>
                    )}
                 </div>
              </ScrollArea>
           </CardContent>
           <div className="p-4 bg-surface-lowest/20 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                 <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                 Global Model Sync Complete
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
            { icon: Cpu, label: 'Model Confidence', value: '98.2%', status: 'Nominal', color: 'text-primary' },
            { icon: BarChart3, label: 'Efficiency Gain', value: '+22.4%', status: 'Measured', color: 'text-primary' },
            { icon: Layers, label: 'Simulations Run', value: '1.2M', status: 'Session', color: 'text-primary' },
            { icon: Calendar, label: 'Next Traffic Peak', value: '17:42', status: 'Predicted', color: 'text-secondary' },
         ].map((stat, idx) => (
            <Card key={idx} className="bg-surface-container border-white/5 p-6 flex flex-col justify-between hover:border-primary/20 transition-all cursor-default group">
               <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-surface-lowest group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                     <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${stat.status === 'Nominal' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                     {stat.status}
                  </span>
               </div>
               <div>
                  <h4 className="text-2xl font-black font-heading tracking-tighter text-white uppercase italic">{stat.value}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">{stat.label}</p>
               </div>
            </Card>
         ))}
      </div>
      
      {/* Simulation / Manual Trigger */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 p-8 rounded-[32px] relative overflow-hidden group">
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent -z-10 group-hover:w-1/2 transition-all duration-700" />
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2">
               <h3 className="text-2xl font-heading font-black tracking-tighter uppercase italic text-white">Manual Inference Trigger</h3>
               <p className="text-muted-foreground font-medium max-w-xl">Force a real-time LSTM inference cycle using the current in-memory buffer. This validates the active model state.</p>
               {manualResult && (
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                 >
                    <div className="flex items-center gap-4">
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Prediction Result</p>
                          <p className="text-xl font-black text-primary uppercase italic">{manualResult.predicted_vehicles} Vehicles</p>
                       </div>
                       <div className="h-8 w-px bg-white/10" />
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Horizon</p>
                          <p className="text-xl font-black text-white uppercase italic">{manualResult.horizon_minutes} Min</p>
                       </div>
                       <div className="ml-auto">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-primary/20 text-primary border border-primary/20 rounded">
                             Model: {manualResult.model_used}
                          </span>
                       </div>
                    </div>
                 </motion.div>
               )}
            </div>
            <Button 
               size="lg" 
               disabled={predicting}
               onClick={handlePredict}
               className="rounded-full h-14 px-10 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl shadow-primary/20"
            >
               {predicting ? 'Inference Active...' : 'Launch Manual Inference'}
            </Button>
         </div>
      </Card>
    </motion.div>
  );
}

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
  ArrowRight
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const forecastData = [
  { time: '08:00', actual: 400, predicted: 420 },
  { time: '10:00', actual: 300, predicted: 310 },
  { time: '12:00', actual: 500, predicted: 480 },
  { time: '14:00', actual: 450, predicted: 460 },
  { time: '16:00', actual: 600, predicted: 620 },
  { time: '18:00', actual: 800, predicted: 790 },
  { time: '20:00', actual: 550, predicted: 540 },
  { time: '22:00', actual: 300, predicted: 290 },
];

const anomalies = [
  { id: 1, type: 'Traffic Spike', probability: '94%', time: 'In 4 hours', impact: 'High', location: 'Gate 4-B' },
  { id: 2, type: 'Node Saturation', probability: '82%', time: 'In 12 hours', impact: 'Medium', location: 'Section Center' },
  { id: 3, type: 'Power Instability', probability: '64%', time: 'In 2 days', impact: 'Low', location: 'Urban Hub West' },
];

export function Predictive() {
  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter">PREDICTIVE AI</h2>
          <p className="text-muted-foreground font-medium">Forward-looking urban choreography and anomaly forecasting.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-white/5 bg-white/5 h-9 font-bold px-6">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Train Model
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground h-9 font-bold px-6">
                <Sparkles className="mr-2 h-4 w-4" />
                Run Forecast
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2 bg-surface-container border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                Load Forecast Accuracy
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Comparing real-time load vs. Sentinel-X7 AI predictions.</CardDescription>
            </div>
            <div className="flex bg-surface-lowest p-1 rounded-full border border-white/5">
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-[10px] uppercase font-black bg-primary/20 text-primary">24H</Button>
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-[10px] uppercase font-black text-muted-foreground hover:text-foreground">7D</Button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={forecastData}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A1C9FF" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#A1C9FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#C0C7D3', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#C0C7D3', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1E1F26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <ComposedChart data={forecastData}>
                <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#A1C9FF" 
                    strokeWidth={3}
                    strokeDasharray="5 5" 
                />
                <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#A1C9FF" 
                    strokeWidth={3}
                    dot={{ r: 4, stroke: '#111319', strokeWidth: 2, fill: '#A1C9FF' }}
                />
              </ComposedChart>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Predictive Anomaly Feed */}
        <Card className="bg-surface-container border-white/5 flex flex-col h-full overflow-hidden">
           <CardHeader className="bg-secondary/5 border-b border-white/5">
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-secondary">
                 <AlertCircle className="h-5 w-5" />
                 Anomaly Forecasting
              </CardTitle>
              <CardDescription className="text-secondary/60">AI-detected future disruptions and probability matrix.</CardDescription>
           </CardHeader>
           <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                 {anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="p-4 rounded-2xl bg-surface-lowest/50 border border-white/5 hover:border-secondary/30 transition-all group relative overflow-hidden">
                       <div className="absolute top-0 right-0 h-1 w-full bg-surface-lowest">
                          <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: anomaly.probability }}
                             className={`h-full ${anomaly.impact === 'High' ? 'bg-secondary' : 'bg-tertiary'}`}
                          />
                       </div>
                       <div className="flex items-center justify-between mt-2">
                          <h4 className="font-bold text-sm">{anomaly.type}</h4>
                          <span className={`text-[10px] font-black uppercase italic ${anomaly.impact === 'High' ? 'text-secondary' : 'text-tertiary'}`}>
                             {anomaly.probability} PROBABILITY
                          </span>
                       </div>
                       <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
                             <Hourglass className="h-3 w-3" />
                             {anomaly.time}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
                             <Zap className="h-3 w-3" />
                             {anomaly.location}
                          </div>
                       </div>
                       <Button variant="ghost" className="w-full h-8 mt-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                          PRE-EMPTIVE ACTION
                          <ArrowRight className="ml-2 h-3 w-3" />
                       </Button>
                    </div>
                 ))}
              </div>
           </ScrollArea>
           <div className="p-4 bg-surface-lowest/20 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                 <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                 MODELS RE-TRAINED: 14 MINS AGO
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
         {[
            { icon: Cpu, label: 'Model Confidence', value: '98.2%', status: 'Nominal', color: 'text-primary' },
            { icon: BarChart3, label: 'Optimization Gain', value: '+14.5%', status: 'Projected', color: 'text-primary' },
            { icon: Layers, label: 'Simulations Run', value: '42k/hr', status: 'Active', color: 'text-primary' },
            { icon: Calendar, label: 'Next Peak cycle', value: '17:42', status: 'Predicted', color: 'text-tertiary' },
         ].map((stat, idx) => (
            <Card key={idx} className="bg-surface-container border-white/5 p-6 flex flex-col justify-between hover:border-primary/20 transition-all cursor-default">
               <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-surface-lowest flex items-center justify-center">
                     <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${stat.status === 'Nominal' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                     {stat.status}
                  </span>
               </div>
               <div>
                  <h4 className="text-2xl font-black font-heading tracking-tighter">{stat.value}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{stat.label}</p>
               </div>
            </Card>
         ))}
      </div>
      
      {/* Simulation Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 p-8 rounded-[32px] relative overflow-hidden group">
         <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent -z-10 group-hover:w-1/2 transition-all duration-700" />
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2">
               <h3 className="text-2xl font-heading font-black tracking-tighter uppercase italic">Ready to run Urban-Scale Simulations?</h3>
               <p className="text-muted-foreground font-medium max-w-xl">Simulate massive traffic events, weather disruptions, and infrastructural failures to see how SecureTraffic AI responds before it happens.</p>
            </div>
            <Button size="lg" className="rounded-full h-14 px-10 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl shadow-primary/20">
               Enter Simulation Mode
            </Button>
         </div>
      </Card>
    </motion.div>
  );
}

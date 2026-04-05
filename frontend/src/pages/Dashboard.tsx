import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Clock,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const data = [
  { time: '00:00', flow: 120, avgSpeed: 45 },
  { time: '04:00', flow: 80, avgSpeed: 55 },
  { time: '08:00', flow: 450, avgSpeed: 25 },
  { time: '12:00', flow: 380, avgSpeed: 30 },
  { time: '16:00', flow: 520, avgSpeed: 22 },
  { time: '20:00', flow: 290, avgSpeed: 38 },
  { time: '23:59', flow: 150, avgSpeed: 48 },
];

const incidents = [
  { id: 1, type: 'Collision', status: 'Active', time: '2 mins ago', location: 'Section 4-B', severity: 'High' },
  { id: 2, type: 'Congestion', status: 'Cleared', time: '15 mins ago', location: 'Central Hub', severity: 'Low' },
  { id: 3, type: 'Signal Failure', status: 'Pending', time: '1 hour ago', location: 'Gate 7-A', severity: 'Medium' },
  { id: 4, type: 'Roadwork', status: 'Active', time: '3 hours ago', location: 'Perimeter West', severity: 'Low' },
];

export function Dashboard() {
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
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-white/5 bg-white/5 h-9">
               Export Data
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground h-9 font-bold px-6">
                System Status
            </Button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Throughput', value: '4.2k/hr', trend: '+12%', icon: Activity, color: 'text-primary' },
          { label: 'Active Incidents', value: '3', trend: '-2', icon: AlertCircle, color: 'text-secondary' },
          { label: 'System Efficiency', value: '94.2%', trend: '+0.5%', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Network Integrity', value: '99.9%', trend: 'Stable', icon: Shield, color: 'text-primary' },
        ].map((metric, idx) => (
          <Card key={idx} className="bg-surface-container border-white/5 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
               <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
                 {metric.label}
               </CardTitle>
               <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading tracking-tighter">{metric.value}</div>
              <div className="flex items-center pt-1">
                 <span className={`text-xs font-bold ${metric.trend.includes('+') ? 'text-emerald-500' : 'text-secondary'}`}>
                    {metric.trend}
                 </span>
                 <span className="text-[10px] text-muted-foreground ml-1">vs. last hour</span>
              </div>
            </CardContent>
            <div className="h-1 w-full bg-surface-lowest mt-auto overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: metric.trend.includes('+') ? '70%' : '30%' }}
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
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic">Network Load Velocity</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Historical throughput analysis across all urban nodes.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A1C9FF" stopOpacity={0.3}/>
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
                <Area 
                  type="monotone" 
                  dataKey="flow" 
                  stroke="#A1C9FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Feed */}
        <Card className="bg-surface-container border-white/5 flex flex-col h-full">
           <CardHeader className="pb-2">
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
               <AlertCircle className="h-5 w-5 text-secondary" />
               LIVE INCIDENTS
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Real-time alerts from edge sensors.</CardDescription>
          </CardHeader>
          <ScrollArea className="flex-1">
             <div className="p-4 space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="p-4 rounded-2xl bg-surface-lowest/50 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/20">
                          <ArrowUpRight className="h-3 w-3" />
                       </Button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          incident.severity === 'High' ? 'bg-secondary/20 text-secondary' : 
                          incident.severity === 'Medium' ? 'bg-tertiary/20 text-tertiary' : 
                          'bg-emerald-500/20 text-emerald-500'
                       }`}>
                          {incident.severity} SEVERITY
                       </span>
                       <span className="text-[10px] text-muted-foreground font-medium uppercase">{incident.time}</span>
                    </div>
                    <h4 className="font-bold text-sm mb-1">{incident.type} Detected</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                       <MapPin className="h-3 w-3" />
                       {incident.location}
                    </div>
                  </div>
                ))}
             </div>
          </ScrollArea>
          <div className="p-4 border-t border-white/5">
             <Button variant="ghost" className="w-full h-10 rounded-xl text-xs font-bold hover:bg-white/5">
                VIEW ALL LOGS
             </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <Button size="lg" className="h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 flex flex-col items-center justify-center gap-1 group">
             <MapPin className="h-5 w-5 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-tighter">View Grid Map</span>
          </Button>
          <Button size="lg" className="h-16 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 flex flex-col items-center justify-center gap-1 group">
             <Shield className="h-5 w-5 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-tighter">Secure Comms</span>
          </Button>
          <Button size="lg" className="h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 flex flex-col items-center justify-center gap-1 group">
             <TrendingUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-tighter">Opti-Flow AI</span>
          </Button>
          <Button size="lg" className="h-16 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 flex flex-col items-center justify-center gap-1 group">
             <Clock className="h-5 w-5 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-tighter">Time Machine</span>
          </Button>
      </div>
    </motion.div>
  );
}



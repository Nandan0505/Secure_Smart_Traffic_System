import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  PieChart,
  Target,
  Zap,
  MousePointer2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const barData = [
  { name: 'Node A', value: 400 },
  { name: 'Node B', value: 300 },
  { name: 'Node C', value: 200 },
  { name: 'Node D', value: 278 },
  { name: 'Node E', value: 189 },
  { name: 'Node F', value: 239 },
];

const lineData = [
  { name: 'Mon', active: 4000, passive: 2400 },
  { name: 'Tue', active: 3000, passive: 1398 },
  { name: 'Wed', active: 2000, passive: 9800 },
  { name: 'Thu', active: 2780, passive: 3908 },
  { name: 'Fri', active: 1890, passive: 4800 },
  { name: 'Sat', active: 2390, passive: 3800 },
  { name: 'Sun', active: 3490, passive: 4300 },
];

const COLORS = ['#A1C9FF', '#378ADD', '#A1C9FF80', '#378ADD80', '#A1C9FF40', '#378ADD40'];

export function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter">DATA ANALYTICS</h2>
          <p className="text-muted-foreground font-medium">Historical performance insight and long-term urban trends.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-white/5 bg-white/5 h-9 font-bold px-6">
                <Calendar className="mr-2 h-4 w-4" />
                Select Range
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground h-9 font-bold px-6">
                <Download className="mr-2 h-4 w-4" />
                Generate Report
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: '1,424,902', trend: '+4.2%', desc: 'Cars / Sensors' },
          { label: 'Avg Speed', value: '38.4 mph', trend: '-1.1%', desc: 'Across Network' },
          { label: 'Peak Load', value: '2.4 GB/s', trend: '+15.2%', desc: 'Telemetry Data' },
          { label: 'Target KPI', value: '98%', trend: 'Target: 95%', desc: 'Optimization Goal' },
        ].map((metric, idx) => (
          <Card key={idx} className="bg-surface-container border-white/5 p-4 flex flex-col justify-between hover:border-primary/20 transition-all">
             <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{metric.label}</p>
                <h4 className="text-2xl font-black font-heading tracking-tighter">{metric.value}</h4>
             </div>
             <div className="flex items-center justify-between mt-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                   metric.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary/10 text-secondary'
                }`}>
                   {metric.trend}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">{metric.desc}</span>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Distribution */}
        <Card className="bg-surface-container border-white/5 p-6">
           <div className="flex items-center justify-between mb-8">
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-primary">
                 <Target className="h-5 w-5" />
                 Node Distribution Efficiency
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                 <Filter className="h-4 w-4" />
              </Button>
           </div>
           <ResponsiveContainer width="100%" height={300}>
             <BarChart data={barData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
               <XAxis 
                  dataKey="name" 
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
                  cursor={{ fill: 'rgba(161,201,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1E1F26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
               />
               <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]} 
                  animationDuration={1500}
               >
                 {barData.map((_entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </Card>

        {/* Temporal Trends */}
        <Card className="bg-surface-container border-white/5 p-6">
           <div className="flex items-center justify-between mb-8">
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2 text-primary">
                 <TrendingUp className="h-5 w-5" />
                 Temporal Utilization Trends
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                 <MousePointer2 className="h-4 w-4" />
              </Button>
           </div>
           <ResponsiveContainer width="100%" height={300}>
             <LineChart data={lineData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
               <XAxis 
                  dataKey="name" 
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
               <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#A1C9FF" 
                  strokeWidth={4}
                  dot={{ r: 4, stroke: '#111319', strokeWidth: 2, fill: '#A1C9FF' }}
                  activeDot={{ r: 6, stroke: '#A1C9FF', strokeWidth: 2, fill: '#111319' }}
               />
               <Line 
                  type="monotone" 
                  dataKey="passive" 
                  stroke="rgba(161,201,255,0.3)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
               />
             </LineChart>
           </ResponsiveContainer>
           <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-1 rounded-full bg-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Load</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-1 border-t-2 border-dashed border-primary/40" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Passive Baseline</span>
              </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
         {[
            { icon: PieChart, label: 'Optimization Delta', value: '42%', desc: 'Improvement vs legacy baseline.' },
            { icon: Zap, label: 'Processing Speed', value: '0.4ms', desc: 'Average end-to-end telemetry sync.' },
            { icon: FileSearch, label: 'Data Integrity', value: '99.9%', desc: 'Verified through hash orchestration.' },
         ].map((tool, idx) => (
            <Card key={idx} className="bg-surface-container border-white/5 p-8 flex flex-col items-center text-center group hover:border-primary/20 transition-all cursor-default">
               <div className="h-16 w-16 rounded-3xl bg-surface-lowest flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <tool.icon className="h-8 w-8 text-primary" />
               </div>
               <h4 className="text-xl font-heading font-black tracking-tighter uppercase italic">{tool.label}</h4>
               <p className="text-muted-foreground text-sm font-medium mt-2 max-w-[200px]">{tool.desc}</p>
               <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-4xl font-black font-heading tracking-tighter text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/40">
                     {tool.value}
                  </span>
                  <span className="text-emerald-500 font-black text-xs">OK</span>
               </div>
            </Card>
         ))}
      </div>
    </motion.div>
  );
}

function FileSearch({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M11.5 13.5a2.5 2.5 0 1 0-2.5 2.5" />
      <path d="M11.5 13.5 13 15" />
    </svg>
  );
}

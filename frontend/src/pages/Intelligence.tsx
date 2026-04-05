import { motion } from 'framer-motion';
import { 
  Network, 
  Terminal, 
  Zap, 
  Database,
  Activity,
  Layers,
  Radio
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Intelligence() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter">CYBER INTELLIGENCE</h2>
          <p className="text-muted-foreground font-medium">Distributed urban mesh monitoring and autonomous orchestration.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-white/5 bg-white/5 h-9 font-bold px-6">
                Network Scan
            </Button>
            <Button className="rounded-full bg-primary text-primary-foreground h-9 font-bold px-6">
                Optimize Mesh
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Network Topography (Visual placeholder) */}
        <Card className="lg:col-span-3 bg-surface-container border-white/5 overflow-hidden h-full min-h-[500px] flex flex-col relative">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(161,201,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(161,201,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
           
           <CardHeader className="relative z-10">
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
                 <Network className="h-5 w-5 text-primary" />
                 Global Mesh Topography
              </CardTitle>
              <CardDescription>Live visualization of all urban sensor nodes and gateways.</CardDescription>
           </CardHeader>

           <CardContent className="flex-1 flex items-center justify-center relative">
              {/* Simulated mesh nodes */}
              <div className="absolute inset-0 flex items-center justify-center">
                 {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ 
                        duration: 3 + i, 
                        repeat: Infinity,
                        delay: i * 0.5 
                      }}
                      className="absolute rounded-full border border-primary/20"
                      style={{ 
                        width: `${(i + 1) * 100}px`, 
                        height: `${(i + 1) * 100}px` 
                      }}
                    />
                 ))}
                 
                 {[
                   { x: -150, y: -100, status: 'online' },
                   { x: 180, y: -40, status: 'online' },
                   { x: 60, y: 150, status: 'warning' },
                   { x: -220, y: 120, status: 'online' },
                   { x: 0, y: 0, status: 'primary' },
                 ].map((node, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute group"
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                       <div className={`h-4 w-4 rounded-full border-2 ${
                          node.status === 'primary' ? 'bg-primary border-white' : 
                          node.status === 'warning' ? 'bg-tertiary border-white/20' : 
                          'bg-emerald-500 border-white/20'
                       } ${node.status !== 'warning' ? 'animate-pulse' : ''}`} />
                       
                       <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-lowest border border-white/10 p-2 rounded-lg text-[10px] font-bold whitespace-nowrap z-20">
                          NODE-SECTOR {i + 1} | Load: 44%
                       </div>
                    </motion.div>
                 ))}
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-surface-lowest/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                 <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-primary" /> Active Hubs: 4
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500" /> Operational nodes: 1,424
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-tertiary" /> Anomalies Detected: 1
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-primary">
                    <Activity className="h-3 w-3" /> Sync Frequency: 4.2Hz
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* System Diagnostics */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
           <Card className="bg-surface-container border-white/5 flex flex-col flex-1">
              <CardHeader className="pb-2">
                 <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    Live Trace
                 </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                 <div className="p-4 font-mono text-[10px] space-y-2 text-muted-foreground overflow-x-hidden">
                    <p className="text-emerald-500/80">[SYSTEM] Initialization sequence complete.</p>
                    <p>[AUTH] Protocol AES-XTS success on Node-44.</p>
                    <p>[MESH] Re-routing traffic from Gate-07 to Gate-12.</p>
                    <p className="text-tertiary">[WARNING] Latency spike detected on Sector-K.</p>
                    <p>[SENTINEL] Anomaly scanned: Negative.</p>
                    <p>[DATA] 4.2GB telemetry streamed to Analytics.</p>
                    <p className="text-primary">[UPDATE] Node firmware v4.2.1 pushed.</p>
                    <p>[AUTH] Success: Root access verified.</p>
                    <p>[MESH] Sector-North optimal throughput achieved.</p>
                    <p className="text-secondary">[ALERT] Perimeter scan triggered.</p>
                    <p>[SENTINEL] Pattern matched: Valid.</p>
                    <p>[SYSTEM] Load balanced across edge nodes.</p>
                 </div>
              </ScrollArea>
              <div className="p-4 border-t border-white/5 bg-surface-lowest/20">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Listening for events...</span>
                 </div>
              </div>
           </Card>
           
           <Card className="bg-primary/5 border border-primary/20 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <Zap className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <div>
                 <h4 className="text-sm font-black uppercase tracking-tighter">AI Node Health</h4>
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Self-Healing Enabled</p>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94%" }}
                    className="h-full bg-primary" 
                 />
              </div>
              <p className="text-[10px] font-bold text-primary italic">94.2% Optimal</p>
           </Card>
        </div>
      </div>

      {/* Resource Allocation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { icon: Database, label: 'Central Hub Load', sub: 'Primary Processing', status: '82%', trend: 'Increasing' },
            { icon: Layers, label: 'Virtual Segments', sub: 'Isolated sub-networks', status: '24', trend: 'Stable' },
            { icon: Radio, label: 'Signal Stability', sub: 'Global mesh feedback', status: '99.8%', trend: 'Optimal' },
         ].map((item, idx) => (
            <Card key={idx} className="bg-surface-container border-white/5 p-6 flex items-center justify-between group hover:border-primary/20 transition-all">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-surface-lowest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                     <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black font-heading tracking-tighter uppercase">{item.label}</h4>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.sub}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-xl font-black font-heading tracking-tighter text-primary">{item.status}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.trend}</p>
               </div>
            </Card>
         ))}
      </div>
    </motion.div>
  );
}

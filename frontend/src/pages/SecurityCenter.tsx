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
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const logs = [
  { id: 'LOG-8822', user: 'Admin-01', action: 'Access Grant', resource: 'Mainframe G', status: 'Success', time: '14:22:01' },
  { id: 'LOG-8823', user: 'Node-44', action: 'Data Handshake', resource: 'Sensor Array 4', status: 'Blocked', time: '14:25:33' },
  { id: 'LOG-8824', user: 'Sys-Bot', action: 'Protocol Sync', resource: 'Urban Mesh', status: 'Success', time: '14:30:12' },
  { id: 'LOG-8825', user: 'Root-Access', action: 'Key Rotation', resource: 'Crypto Module', status: 'Failed', time: '14:45:00' },
  { id: 'LOG-8826', user: 'Operator-4', action: 'Login', resource: 'Command Portal', status: 'Success', time: '15:02:11' },
];

export function SecurityCenter() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-black tracking-tighter uppercase italic">Security Core</h2>
          <p className="text-muted-foreground font-medium">Enterprise-level threat detection and access orchestration.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="rounded-full hover:bg-secondary/10 text-secondary h-9 font-bold px-6 border border-secondary/20">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Active Alerts (2)
          </Button>
          <Button className="rounded-full bg-primary text-primary-foreground h-9 font-bold px-6 uppercase tracking-widest text-[10px]">
            System Lockdown
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-surface-container border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="h-24 w-24 text-emerald-500/10 -mr-4 -mt-4 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-500" />
          </div>
          <CardHeader>
            <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Integrity Status
            </CardTitle>
            <CardDescription>Overall network health signature.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="h-full w-full rotate-[-90deg]">
                  <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                  <motion.circle
                    cx="64" cy="64" r="58" stroke="#10b981" strokeWidth="8" fill="none"
                    strokeDasharray="364.42"
                    initial={{ strokeDashoffset: 364.42 }}
                    animate={{ strokeDashoffset: 36.44 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-heading tracking-tighter">98.2%</span>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Stable</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-2xl bg-surface-lowest/50 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Encrypted Nodes</p>
                <p className="text-lg font-black font-heading tracking-tighter text-primary">1,244</p>
              </div>
              <div className="p-3 rounded-2xl bg-surface-lowest/50 border border-white/5 text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Breach Attempts</p>
                <p className="text-lg font-black font-heading tracking-tighter">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Logs */}
        <Card className="md:col-span-2 bg-surface-container border-white/5 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading font-black tracking-tighter text-lg uppercase italic flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                Access Log Stream
              </CardTitle>
              <CardDescription>Real-time authentication and resource allocation tracking.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/5">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="border-t border-white/5 overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface-lowest/50">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 pl-6">Log ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Subject</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Action</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-3">Resource</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-3 pr-6">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-mono text-[10px] text-muted-foreground group-hover:text-primary transition-colors pl-6">{log.id}</TableCell>
                      <TableCell className="font-bold text-xs">{log.user}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.action}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{log.resource}</TableCell>
                      <TableCell className="pr-6">
                        <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full ${
                          log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' :
                          log.status === 'Blocked' ? 'bg-secondary/10 text-secondary' :
                          'bg-tertiary/10 text-tertiary'
                        }`}>
                          {log.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <div className="p-4 border-t border-white/5 bg-surface-lowest/20 flex items-center justify-between">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-primary' : 'bg-white/20'}`} />
              ))}
            </div>
            <Button variant="link" className="text-[10px] font-black uppercase tracking-widest text-primary p-0 h-auto hover:no-underline">Download Full Audit</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Lock, label: 'Encryption Protocol', status: 'AES-256 Quantum', color: 'text-primary' },
          { icon: Network, label: 'Traffic Node Mesh', status: 'Isolated vLAN', color: 'text-primary' },
          { icon: Fingerprint, label: 'Auth Multi-Factor', status: 'Biometric Stack', color: 'text-primary' },
          { icon: Activity, label: 'Heuristic Engine', status: 'Predictive-X7', color: 'text-emerald-500' },
        ].map((item, idx) => (
          <Card key={idx} className="bg-surface-container border-white/5 p-4 flex items-center gap-4 hover:border-primary/20 transition-all cursor-default group">
            <div className={`h-10 w-10 rounded-xl bg-surface-lowest border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</p>
              <p className="text-sm font-black font-heading tracking-tighter uppercase">{item.status}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pulse Alert Banner */}
      <div className="p-6 rounded-3xl pulse-alert border border-secondary/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-black tracking-tighter uppercase italic">Lateral Movement Detected</h3>
            <p className="text-secondary/80 font-medium">Unknown subject attempting horizontal privilege escalation on Node-33 (Sector East).</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-secondary hover:bg-secondary/90 text-white font-black rounded-full px-6 uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-secondary/20">Isolate Node</Button>
          <Button variant="outline" className="bg-transparent border-secondary/40 text-secondary hover:bg-secondary/5 font-black rounded-full px-6 uppercase tracking-widest text-[10px] h-10">Dismiss Alert</Button>
        </div>
      </div>
    </motion.div>
  );
}

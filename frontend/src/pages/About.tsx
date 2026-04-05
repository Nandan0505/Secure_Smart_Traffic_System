import { motion } from 'framer-motion';
import { 
  Target, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Mail,
  MapPin,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 } 
    }
  };

  return (
    <div className="p-6 overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-20 py-12"
      >
        {/* Hero Section */}
        <motion.section variants={itemVariants} className="text-center space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Our Mission</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter leading-none italic uppercase">
              The Architecture of <span className="text-primary text-6xl md:text-8xl">Future</span> Mobility
           </h1>
           <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              SecureTraffic is an AI-first orchestration layer for global urban infrastructure. We believe that efficiency should never come at the cost of security.
           </p>
        </motion.section>

        {/* Core Values */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-[40px] bg-surface-container border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Target className="h-24 w-24 text-primary scale-150 rotate-12" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">The Vision</h3>
              <h2 className="text-3xl font-heading font-black tracking-tighter mb-4">Towards Zero Congestion, Zero Attacks.</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                 We aim to build a world where urban flow is as seamless as a heartbeat, protected by decentralized cryptographic layers that ensure every citizen is safe and every node is trusted.
              </p>
           </div>
           
           <div className="p-8 rounded-[40px] bg-primary text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20">
              <div className="absolute -bottom-8 -right-8 p-8 opacity-10">
                 <Cpu className="h-48 w-48 text-primary-foreground scale-110" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-4">The Core</h3>
              <h2 className="text-3xl font-heading font-black tracking-tighter mb-4">Distributed Intelligence at Scale.</h2>
              <p className="font-bold opacity-90 leading-relaxed text-lg">
                 By leveraging edge-computing and post-quantum encryption, we provide municipal governance with the ultimate tool for autonomous resource management and traffic orchestration.
              </p>
           </div>
        </motion.section>

        {/* Team/Philosophy */}
        <motion.section variants={itemVariants} className="space-y-12">
           <div className="text-center">
              <h2 className="text-3xl font-heading font-black tracking-tighter italic uppercase">Principles of Operation</h2>
              <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, title: 'Obsidian Integrity', desc: 'Every data packet is verified through iterative hash checking.' },
                { icon: Zap, title: 'Quantum Velocity', desc: 'Low-latency re-routing ensuring sub-second response times.' },
                { icon: Globe, title: 'Universal Interop', desc: 'Ready to integrate with any existing legacy infrastructure.' },
              ].map((value, idx) => (
                <div key={idx} className="p-6 text-center space-y-4">
                   <div className="h-14 w-14 rounded-2xl bg-surface-container border border-white/5 mx-auto flex items-center justify-center">
                      <value.icon className="h-6 w-6 text-primary" />
                   </div>
                   <h4 className="font-black uppercase tracking-tighter text-sm italic">{value.title}</h4>
                   <p className="text-xs text-muted-foreground font-medium leading-relaxed">{value.desc}</p>
                </div>
              ))}
           </div>
        </motion.section>

        {/* Contact/Inquiry */}
        <motion.section variants={itemVariants} className="p-10 rounded-[48px] bg-surface-lowest border-2 border-primary/20 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(161,201,255,0.05),transparent_70%)]" />
           <div className="relative z-10 space-y-8">
              <div className="flex flex-col items-center gap-4">
                 <h2 className="text-4xl font-heading font-black tracking-tighter uppercase italic italic">Request Deployment</h2>
                 <p className="text-muted-foreground font-medium max-w-sm">Connect with our systems team to begin integrating SecureTraffic AI into your urban network.</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                 <Button className="rounded-full h-14 px-10 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">
                    Inquire Now
                 </Button>
                 <Button variant="ghost" className="rounded-full h-14 px-10 border border-white/5 font-black uppercase tracking-widest text-sm hover:bg-white/5">
                    Technical Docs
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>

              <div className="flex justify-center gap-6 pt-6">
                 <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 rounded-full hover:text-primary"><Globe className="h-5 w-5" /></Button>
                 <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 rounded-full hover:text-primary"><Mail className="h-5 w-5" /></Button>
                 <Button variant="ghost" size="icon" className="h-10 w-10 border border-white/5 rounded-full hover:text-primary"><Globe className="h-5 w-5" /></Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                 <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Silicon Valley, CA</div>
                 <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> deployment@securetraffic.ai</div>
                 <div className="flex items-center gap-2"><Globe className="h-3 w-3" /> securetraffic.ai</div>
              </div>
           </div>
        </motion.section>

        <footer className="pt-12 pb-6 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
           &copy; 2026 SecureTraffic AI Systems. All nodes operational. Protected by Obsidian Integrity.
        </footer>
      </motion.div>
    </div>
  );
}

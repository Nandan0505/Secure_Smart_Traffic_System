import { motion } from 'framer-motion';
import { 
  Shield, 
  BrainCircuit, 
  BarChart3, 
  Zap, 
  Lock, 
  Globe, 
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Shield,
    title: "Obsidian Integrity",
    description: "Multi-layered encryption protocols ensuring data remains untampered in urban mesh networks."
  },
  {
    icon: BrainCircuit,
    title: "Sentinel AI",
    description: "Advanced heuristics engine capable of predicting pattern anomalies before they escalate."
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Granular historical telemetry providing long-term infrastructure health optimization."
  }
];

export function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 } 
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-10 right-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] -z-10" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 container mx-auto px-6 py-20 flex flex-col items-center justify-center text-center space-y-12"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4 group cursor-default">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Online: v4.2.0</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter leading-none italic uppercase">
            ORCHESTRATING THE <br />
            <span className="text-primary text-7xl md:text-9xl">URBAN FLOW</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto py-4">
            A high-performance AI deployment for secure traffic monitoring and predictive urban coordination.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full h-14 px-10 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl shadow-primary/20">
            <Link to="/dashboard">Initialize Dashboard</Link>
          </Button>
          <Button variant="ghost" size="lg" className="rounded-full h-14 px-8 border border-white/5 font-black uppercase tracking-widest text-sm hover:bg-white/5">
            <Play className="mr-2 h-4 w-4 fill-current" />
            Watch Core Demo
          </Button>
        </motion.div>

        <motion.div 
           variants={itemVariants}
           className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-12"
        >
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="p-8 rounded-[32px] bg-surface-container border border-white/5 text-left space-y-4 hover:border-primary/20 transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-surface-lowest flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-black tracking-tighter uppercase italic">{feature.title}</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-8 flex items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-2 font-black italic tracking-tighter uppercase text-sm"><Zap className="h-4 w-4" /> Power-Nodes</div>
           <div className="flex items-center gap-2 font-black italic tracking-tighter uppercase text-sm"><Lock className="h-4 w-4" /> CryptoCore</div>
           <div className="flex items-center gap-2 font-black italic tracking-tighter uppercase text-sm"><Globe className="h-4 w-4" /> Global-Net</div>
        </motion.div>
      </motion.div>

      {/* Static Footer Overlay */}
      <div className="fixed bottom-0 left-0 w-full p-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> SYNCED</div>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> STABLE</div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white">
                <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
      </div>
    </div>
  );
}

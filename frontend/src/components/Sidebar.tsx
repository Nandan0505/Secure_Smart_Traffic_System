import { NavLink } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  ShieldAlert, 
  BrainCircuit, 
  BarChart3, 
  LineChart, 
  Info,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const navItems = [
  { icon: Home, label: 'Landing Page', path: '/' },
  { icon: LayoutDashboard, label: 'Live Dashboard', path: '/dashboard' },
  { icon: ShieldAlert, label: 'Security Center', path: '/security' },
  { icon: BrainCircuit, label: 'Cyber Intelligence', path: '/intelligence' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: LineChart, label: 'Predictive AI', path: '/predictive' },
  { icon: Info, label: 'About', path: '/about' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "relative h-screen border-r border-white/5 bg-surface-low transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-white/5">
        {!collapsed && (
          <span className="font-heading font-bold text-lg tracking-tighter text-primary">
            SECURE<span className="text-foreground">TRAFFIC</span>
          </span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hover:bg-white/5"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0",
                    "group-hover:scale-110 transition-transform"
                  )} />
                  {!collapsed && (
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-white/5 bg-surface-container/50">
        {!collapsed ? (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                AI
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold">Sentinel AI</span>
                <span className="text-[10px] text-muted-foreground">Active Oversight</span>
             </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
            AI
          </div>
        )}
      </div>
    </div>
  );
}

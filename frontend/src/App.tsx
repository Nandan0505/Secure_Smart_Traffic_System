import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { TrafficProvider } from './context/TrafficContext';
import { LandingPage } from './pages/LandingPage';
import { LiveDashboard } from './pages/LiveDashboard';
import { SecurityCenter } from './pages/SecurityCenter';
import { CyberIntelligence } from './pages/CyberIntelligence';
import { Analytics } from './pages/Analytics';
import { PredictiveAI } from './pages/PredictiveAI';
import { About } from './pages/About';
import './App.css';

function App() {
  return (
    <TrafficProvider>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<LiveDashboard />} />
          <Route path="/security" element={<SecurityCenter />} />
          <Route path="/cyber" element={<CyberIntelligence />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/predictive" element={<PredictiveAI />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </DashboardLayout>
    </TrafficProvider>
  );
}

export default App;

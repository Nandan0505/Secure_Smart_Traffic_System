import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { SecurityCenter } from './pages/SecurityCenter';
import { Intelligence } from './pages/Intelligence';
import { Analytics } from './pages/Analytics';
import { Predictive } from './pages/Predictive';
import { About } from './pages/About';
import './App.css';

function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/security" element={<SecurityCenter />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/predictive" element={<Predictive />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;

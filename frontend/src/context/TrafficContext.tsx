// src/context/TrafficContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface TrafficData {
  sensor_id: string;
  intersection: string;
  vehicle_count: number;
  avg_speed: number;
  lane_occupancy?: number;
  network_latency?: number;
  is_attack?: boolean;
  timestamp: string;
}

interface Alert {
  sensor_id: string;
  intersection: string;
  attack_type: string;
  score: number;
  severity: 'HIGH' | 'MEDIUM';
  vehicle_count: number;
  avg_speed: number;
  latency: number;
  timestamp: string;
}

interface Prediction {
  sensor_id: string;
  intersection: string;
  predicted_vehicle_count: number;
  predicted_avg_speed: number;
  congestion_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
}

interface TrafficContextType {
  trafficData: TrafficData[];
  alerts: Alert[];
  predictions: Record<string, Prediction>;
  sensorReadings: Record<string, TrafficData>;
  threatLevel: 'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const TrafficContext = createContext<TrafficContextType | null>(null);

export function TrafficProvider({ children }: { children: ReactNode }) {
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [sensorReadings, setSensorReadings] = useState<Record<string, TrafficData>>({});
  const [threatLevel, setThreatLevel] = useState<'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('SAFE');

  const handleMessage = useCallback((msg: any) => {
    if (msg.type === 'init') {
      setTrafficData(msg.data.traffic || []);
      setAlerts(msg.data.alerts || []);
      return;
    }

    if (msg.type === 'new_traffic') {
      setTrafficData(prev => {
        const next = [...prev, msg.data];
        return next.slice(-200); // keep last 200 readings in memory
      });
      setSensorReadings(prev => ({
        ...prev,
        [msg.data.sensor_id]: msg.data
      }));
    }

    if (msg.type === 'new_alert') {
      setAlerts(prev => [msg.data, ...prev].slice(0, 100));
      setThreatLevel(
        msg.data.severity === 'HIGH' ? 'CRITICAL' : 'HIGH'
      );
    }

    if (msg.type === 'new_prediction') {
      setPredictions(prev => ({
        ...prev,
        [msg.data.sensor_id]: msg.data
      }));
    }
  }, []);

  useWebSocket(handleMessage);

  return (
    <TrafficContext.Provider value={{
      trafficData,
      alerts,
      predictions,
      sensorReadings,
      threatLevel,
    }}>
      {children}
    </TrafficContext.Provider>
  );
}

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
};

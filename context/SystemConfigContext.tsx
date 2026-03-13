import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemConfig } from '../types';

const defaultConfig: SystemConfig = {
  hotelName: 'Dat Valoir Hotels',
  hotline: '+84 999 999 999',
  email: 'concierge@datvaloir.com',
  address: '123 Luxury Avenue, District 1, HCMC, Vietnam',
  maxGuestsPerRoom: 4,
  defaultServiceFee: 5,
  maintenanceMode: false,
  homepageNotification: 'Welcome to Dat Valoir - Experience Luxury Redefined',
  enableBooking: true,
};

interface SystemConfigContextType {
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
}

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export const SystemConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('systemConfig');
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem('systemConfig', JSON.stringify(config));
  }, [config]);

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <SystemConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
};

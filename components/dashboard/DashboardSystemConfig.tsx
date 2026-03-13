import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertTriangle, CheckCircle, Building, Settings, Bell, Power } from 'lucide-react';
import { useSystemConfig } from '../../context/SystemConfigContext';
import { SystemConfig } from '../../types';

const DashboardSystemConfig: React.FC = () => {
  const { config, updateConfig } = useSystemConfig();
  const [formData, setFormData] = useState<SystemConfig>(config);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sync local state with global config when config changes (e.g. from other tabs)
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (field: keyof SystemConfig, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(config));
      return updated;
    });
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate API delay
    setTimeout(() => {
      updateConfig(formData);
      setSaveStatus('saved');
      setIsDirty(false);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 800);
  };

  const handleReset = () => {
    setFormData(config);
    setIsDirty(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-[fadeIn_0.5s]">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-[#0a0a0a] p-4 rounded-xl border border-white/5 sticky top-0 z-20 backdrop-blur-md bg-opacity-80">
        <div>
          <h2 className="text-lg font-bold text-white">System Configuration</h2>
          <p className="text-xs text-gray-500">Manage global settings for the application.</p>
        </div>
        <div className="flex gap-3">
          {isDirty && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-sm transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!isDirty || saveStatus === 'saving'}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              saveStatus === 'saved' 
                ? 'bg-green-500/20 text-green-500 border border-green-500/50' 
                : isDirty 
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : saveStatus === 'saved' ? (
              <CheckCircle size={16} />
            ) : (
              <Save size={16} />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. General Information */}
        <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <Building size={18} className="text-yellow-500" />
            <h3 className="font-bold text-white">General Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Hotel Name</label>
              <input 
                type="text" 
                value={formData.hotelName}
                onChange={(e) => handleChange('hotelName', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Hotline</label>
                <input 
                  type="text" 
                  value={formData.hotline}
                  onChange={(e) => handleChange('hotline', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Address</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 2. Booking Configuration */}
        <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <Settings size={18} className="text-blue-500" />
            <h3 className="font-bold text-white">Booking Configuration</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5">
              <div>
                <div className="text-sm font-medium text-white">Enable Booking System</div>
                <div className="text-xs text-gray-500">Allow users to make new reservations</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.enableBooking}
                  onChange={(e) => handleChange('enableBooking', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Max Guests / Room</label>
                <input 
                  type="number" 
                  value={formData.maxGuestsPerRoom}
                  onChange={(e) => handleChange('maxGuestsPerRoom', parseInt(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Service Fee (%)</label>
                <input 
                  type="number" 
                  value={formData.defaultServiceFee}
                  onChange={(e) => handleChange('defaultServiceFee', parseFloat(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. System Status (Maintenance) */}
        <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <Power size={18} className="text-red-500" />
            <h3 className="font-bold text-white">System Status</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className={`p-4 rounded-lg border flex items-start gap-4 transition-colors ${formData.maintenanceMode ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/5 border-green-500/20'}`}>
              <div className={`mt-1 ${formData.maintenanceMode ? 'text-red-500' : 'text-green-500'}`}>
                {formData.maintenanceMode ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold ${formData.maintenanceMode ? 'text-red-400' : 'text-green-400'}`}>
                    {formData.maintenanceMode ? 'Maintenance Mode Active' : 'System Operational'}
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.maintenanceMode}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  When active, only Administrators and Staff can access the website. Regular users will see a "Under Maintenance" screen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Interface (Notifications) */}
        <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
            <Bell size={18} className="text-purple-500" />
            <h3 className="font-bold text-white">Interface & Notifications</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Homepage Notification Bar</label>
              <div className="flex gap-2">
                 <input 
                  type="text" 
                  value={formData.homepageNotification}
                  onChange={(e) => handleChange('homepageNotification', e.target.value)}
                  placeholder="Enter a message to display on top of homepage..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Leave empty to hide the notification bar.
              </p>
            </div>
            
            {/* Preview */}
            {formData.homepageNotification && (
               <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-400 mb-2">Preview</label>
                  <div className="bg-purple-900/20 border border-purple-500/30 text-purple-200 px-4 py-2 text-xs text-center rounded">
                    {formData.homepageNotification}
                  </div>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardSystemConfig;

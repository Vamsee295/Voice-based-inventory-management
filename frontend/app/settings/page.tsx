'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../home/components/Sidebar';
import AppHeader from '../home/components/AppHeader';
import { settingsApi, BusinessSettings } from '../../src/services/api/settingsApi';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsApi.updateSettings({
        currency: settings.currency,
        timezone: settings.timezone,
        voice_confirmation_required: settings.voice_confirmation_required,
        default_base_unit: settings.default_base_unit,
        low_stock_behavior: settings.low_stock_behavior
      });
      // Add a small success toast here in a real app
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen bg-[var(--background)] items-center justify-center text-[var(--text-muted)]">Loading...</div>;
  if (!settings) return null;

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AppHeader 
          title="Settings" 
          subtitle="Manage your VoiceMate workspace and operating preferences."
          icon={<Settings className="w-5 h-5 text-[var(--primary)]" />}
        />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* WORKSPACE SECTION */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">Workspace</h3>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-5">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">Business Name</label>
                    <input type="text" disabled value="Sri Balaji Wholesale" className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] opacity-70 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">Store / Terminal</label>
                    <input type="text" disabled value="Terminal #01" className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] opacity-70 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">Currency</label>
                    <select 
                      value={settings.currency} 
                      onChange={e => setSettings({...settings, currency: e.target.value})}
                      className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">Timezone</label>
                    <select 
                      value={settings.timezone} 
                      onChange={e => setSettings({...settings, timezone: e.target.value})}
                      className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

              </div>
            </section>

            {/* VOICE SECTION */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">Voice</h3>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-5">
                
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-[var(--text-primary)]">Supported Languages</label>
                  <p className="text-[12px] text-[var(--text-secondary)] mb-2">The pipeline will listen and adapt to these languages dynamically.</p>
                  <div className="flex gap-2">
                    {settings.voice_languages.map(lang => (
                      <span key={lang} className="px-3 py-1 bg-[var(--surface-low)] border border-[var(--border)] rounded-md text-[12px] text-[var(--text-primary)]">{lang}</span>
                    ))}
                  </div>
                </div>

                <hr className="border-[var(--divider)]" />

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[13px] font-medium text-[var(--text-primary)]">Voice Confirmation</label>
                    <p className="text-[12px] text-[var(--text-secondary)]">Require explicit confirmation for all stock-altering voice commands.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.voice_confirmation_required}
                      onChange={e => setSettings({...settings, voice_confirmation_required: e.target.checked})}
                    />
                    <div className="w-9 h-5 bg-[var(--surface-low)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                  </label>
                </div>

              </div>
            </section>

            {/* INVENTORY SECTION */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-semibold tracking-widest text-[var(--text-muted)] uppercase">Inventory</h3>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-5">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">Default Base Unit</label>
                    <select 
                      value={settings.default_base_unit} 
                      onChange={e => setSettings({...settings, default_base_unit: e.target.value})}
                      className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="l">Liters (l)</option>
                      <option value="pcs">Pieces (pcs)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[var(--text-secondary)]">Low Stock Behavior</label>
                    <select 
                      value={settings.low_stock_behavior} 
                      onChange={e => setSettings({...settings, low_stock_behavior: e.target.value})}
                      className="w-full bg-[var(--surface-low)] border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="Alert">Show Alert</option>
                      <option value="Block">Block Transaction</option>
                      <option value="Ignore">Ignore</option>
                    </select>
                  </div>
                </div>

              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[var(--primary)] text-white font-medium text-[13px] rounded-md hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

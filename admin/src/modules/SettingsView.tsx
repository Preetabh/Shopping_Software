import React, { useEffect, useState } from 'react';
import { Settings, Save, Store, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import { StoreSetting } from '../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<StoreSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      await apiClient.put('/settings', settings);
      alert('Store settings successfully updated!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Global Store & Platform Configuration</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Configure logistics rules, payment gateway credentials, delivery fees and top announcement banners
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Store Profile */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} color="#2874f0" /> Store Profile & Support Contact
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Store Marketplace Name
              </label>
              <input
                required
                type="text"
                className="input-control"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Customer Support Email
                </label>
                <input
                  required
                  type="email"
                  className="input-control"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Toll-Free Helpline Phone
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Configuration */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#2874f0" /> Shipping & Delivery Rules
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Free Shipping Minimum Order (₹)
              </label>
              <input
                required
                type="number"
                className="input-control"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Orders above this threshold receive 100% free delivery</span>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Standard Delivery Charge (₹)
              </label>
              <input
                required
                type="number"
                className="input-control"
                value={settings.standardDeliveryCharge}
                onChange={(e) => setSettings({ ...settings, standardDeliveryCharge: Number(e.target.value) })}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Standard fee charged for orders below threshold</span>
            </div>
          </div>
        </div>

        {/* Payments & Razorpay */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#2874f0" /> Payment Gateway & COD
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Razorpay Key ID
              </label>
              <input
                type="text"
                className="input-control"
                value={settings.razorpayKeyId}
                onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="codEnabled"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
              />
              <label htmlFor="codEnabled" style={{ fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                Enable Cash on Delivery (COD) Checkout for customers
              </label>
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Top Header Announcement Bar
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="annEnable"
                checked={settings.announcementBanner?.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcementBanner: { ...settings.announcementBanner, enabled: e.target.checked }
                  })
                }
              />
              <label htmlFor="annEnable" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Display Announcement Ticker Bar in Apps
              </label>
            </div>

            <input
              type="text"
              className="input-control"
              value={settings.announcementBanner?.text || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcementBanner: { ...settings.announcementBanner, text: e.target.value }
                })
              }
              placeholder="e.g. Big Billion Days Sale! Up to 80% Off..."
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px 24px', alignSelf: 'flex-start' }}>
          <Save size={16} /> {saving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </form>
    </div>
  );
};

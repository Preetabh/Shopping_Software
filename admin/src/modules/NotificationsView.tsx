import React, { useState } from 'react';
import { Bell, Send, CheckCircle, Megaphone, Smartphone } from 'lucide-react';
import { apiClient } from '../api/client';

export const NotificationsView: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('PROMOTION');
  const [sending, setSending] = useState(false);
  const [sentList, setSentList] = useState<any[]>([
    {
      id: '1',
      title: 'Mega Big Billion Days Sale Is LIVE!',
      message: 'Get up to 80% off on flagship smartphones, premium headphones and fashion styles!',
      type: 'PROMOTION',
      date: new Date().toLocaleDateString()
    },
    {
      id: '2',
      title: 'Flat ₹500 Off with Code WELCOME500',
      message: 'Exclusive discount on your favorite electronics items today.',
      type: 'PROMOTION',
      date: new Date().toLocaleDateString()
    }
  ]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSending(true);
      await apiClient.post('/notifications/broadcast', {
        title,
        message,
        type
      });

      setSentList([
        {
          id: Date.now().toString(),
          title,
          message,
          type,
          date: new Date().toLocaleDateString()
        },
        ...sentList
      ]);

      setTitle('');
      setMessage('');
      alert('Push notification broadcasted to all active mobile & web customer devices!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error broadcasting notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Push Notifications & Marketing Alerts</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Send high-priority promotional announcements and campaign alerts to all mobile app customers
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr', gap: '20px' }}>
        {/* Broadcast Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#eef5ff', color: '#2874f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Compose Broadcast Push</h3>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Delivered instantly to mobile notification trays</div>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Notification Title *
              </label>
              <input
                required
                type="text"
                className="input-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Flash Sale Starts Now!"
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Notification Type
              </label>
              <select className="input-control" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="PROMOTION">PROMOTIONAL OFFER</option>
                <option value="SYSTEM">SYSTEM / SERVICE UPDATE</option>
                <option value="ORDER">ORDER ALERT</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Message Body *
              </label>
              <textarea
                required
                rows={3}
                className="input-control"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter compelling promotional copy here..."
              />
            </div>

            <button type="submit" disabled={sending} className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Send size={15} /> {sending ? 'Broadcasting...' : 'Broadcast to All Customers'}
            </button>
          </form>
        </div>

        {/* History / Sent log */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={17} color="#2874f0" /> Recent Notification Dispatches
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sentList.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{item.title}</span>
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>{item.type}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '3px' }}>{item.message}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

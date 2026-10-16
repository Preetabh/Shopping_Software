import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { apiClient } from '../api/client';

interface LoginViewProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('superadmin@flipkart.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user, accessToken } = res.data.data;
        if (user.role === 'customer') {
          setError('Access denied: Customer accounts cannot log in to the Admin Operations Console.');
          setLoading(false);
          return;
        }
        localStorage.setItem('admin_token', accessToken);
        localStorage.setItem('admin_user', JSON.stringify(user));
        onLoginSuccess(user, accessToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0f172a 75%)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #8C7335 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A0A0E',
              fontWeight: 800,
              fontSize: '28px',
              boxShadow: '0 4px 14px rgba(212,175,55,0.4)',
              marginBottom: '14px',
              fontFamily: 'serif'
            }}
          >
            A
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', fontFamily: 'serif' }}>Aurelia Luxe Operations Console</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Haute Maison administration, order concierge & security control
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
              Staff Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                required
                type="email"
                className="input-control"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@flipkart.com"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                required
                type="password"
                className="input-control"
                style={{ paddingLeft: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 700 }}
          >
            <LogIn size={16} /> {loading ? 'Authenticating Staff...' : 'Sign In to Console'}
          </button>
        </form>

        {/* 1-Click Role Quickfills for Easy Pair-Programming Testing */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
            Quick Demo Accounts (1-Click Test)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('superadmin@flipkart.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px' }}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@flipkart.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px' }}
            >
              Store Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('products@flipkart.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px' }}
            >
              Product Mgr
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('orders@flipkart.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px' }}
            >
              Order Mgr
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('support@flipkart.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px' }}
            >
              Support Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

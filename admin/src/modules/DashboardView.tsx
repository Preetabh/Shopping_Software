import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { apiClient } from '../api/client';
import { Order, AuditLog } from '../types';

export const DashboardView: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    summary: {
      totalRevenue: number;
      estimatedProfit: number;
      totalOrders: number;
      pendingOrders: number;
      deliveredOrders: number;
      totalCustomers: number;
      totalProducts: number;
      lowStockProducts: number;
      openTickets: number;
    };
    salesTrends: { _id: string; orders: number; revenue: number }[];
    recentOrders: Order[];
    recentActivities: AuditLog[];
  } | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #2874f0', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: 500 }}>Loading Dashboard Intelligence...</p>
      </div>
    );
  }

  const { summary, salesTrends, recentOrders, recentActivities } = data;

  const chartData = salesTrends.map((item) => ({
    date: item._id.slice(5), // MM-DD
    revenue: item.revenue,
    orders: item.orders
  }));

  const statCards = [
    {
      title: 'Gross Revenue',
      value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`,
      subtitle: '+18.4% vs last month',
      icon: IndianRupee,
      color: '#2874f0',
      bgColor: '#eef5ff'
    },
    {
      title: 'Estimated Profit (22%)',
      value: `₹${summary.estimatedProfit.toLocaleString('en-IN')}`,
      subtitle: 'Healthy operating margin',
      icon: TrendingUp,
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    {
      title: 'Total Orders',
      value: summary.totalOrders,
      subtitle: `${summary.pendingOrders} awaiting delivery`,
      icon: ShoppingBag,
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    {
      title: 'Active Customers',
      value: summary.totalCustomers,
      subtitle: 'Registered shoppers',
      icon: Users,
      color: '#8b5cf6',
      bgColor: '#f5f3ff'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner / Store Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2874f0 100%)',
          borderRadius: '16px',
          padding: '24px 30px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 20px rgba(40,116,240,0.25)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>
              LIVE STORE ANALYTICS
            </span>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>All systems operational</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome to Aurelia Luxe Operations Center</h2>
          <p style={{ opacity: 0.9, fontSize: '13.5px', marginTop: '4px' }}>
            Live Maison business metrics, bespoke order fulfillment pipeline, and atelier inventory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onNavigate('orders')}
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#1e3a8a', fontWeight: 600 }}
          >
            <ShoppingBag size={15} /> View Orders ({summary.pendingOrders})
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="btn"
            style={{ backgroundColor: '#fb641b', color: '#ffffff', border: 'none', fontWeight: 600 }}
          >
            <AlertTriangle size={15} /> Low Stock ({summary.lowStockProducts})
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{card.title}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={13} /> {card.subtitle}
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: card.bgColor,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Trend Chart & Quick Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Recharts Area Chart */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Sales & Revenue Trends</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Daily revenue performance over recent orders</p>
            </div>
            <button onClick={() => onNavigate('reports')} className="btn btn-secondary btn-sm">
              Full Analytics <ExternalLink size={12} />
            </button>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length ? chartData : [{ date: 'Today', revenue: 0, orders: 0 }]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2874f0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2874f0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2874f0" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Fulfillment Snapshot</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Orders in Progress</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Packing & Transit</div>
                </div>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {summary.pendingOrders}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Delivered Orders</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Successfully completed</div>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {summary.deliveredOrders}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={18} color="#ef4444" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#b91c1c' }}>Low Stock SKUs</div>
                  <div style={{ fontSize: '11.5px', color: '#dc2626' }}>Need urgent reorder</div>
                </div>
              </div>
              <span className="badge badge-danger" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {summary.lowStockProducts}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="#2874f0" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Open Support Tickets</div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>Requires customer reply</div>
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '13px', padding: '4px 10px' }}>
                {summary.openTickets}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Live Activity Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '20px' }}>
        {/* Recent Orders Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Customer Orders</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Latest transactions placed across web and mobile</p>
            </div>
            <button onClick={() => onNavigate('orders')} className="btn btn-secondary btn-sm">
              All Orders
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => {
                    const statusColors: any = {
                      PLACED: 'badge-primary',
                      CONFIRMED: 'badge-primary',
                      SHIPPED: 'badge-warning',
                      DELIVERED: 'badge-success',
                      CANCELLED: 'badge-danger',
                      RETURN_REQUESTED: 'badge-warning'
                    };
                    return (
                      <tr key={ord._id}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#2874f0' }}>{ord.orderNumber}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{ord.shippingAddress?.fullName || 'Customer'}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{ord.shippingAddress?.city}</div>
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{ord.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${statusColors[ord.orderStatus] || 'badge-neutral'}`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              ord.payment?.status === 'PAID' ? 'badge-success' : 'badge-warning'
                            }`}
                          >
                            {ord.payment?.status} ({ord.payment?.method})
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Admin Activity Feed */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Live Activity Log</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>Real-time admin and system action audit</p>
            </div>
            <button onClick={() => onNavigate('logs')} className="btn btn-secondary btn-sm">
              View Logs
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
                No recent activity logged.
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#eef5ff',
                      color: '#2874f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {act.actor?.name?.charAt(0) || 'A'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                      {act.action?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      by <span style={{ fontWeight: 500, color: '#334155' }}>{act.actor?.name || 'System Admin'}</span> ({act.actorRole})
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

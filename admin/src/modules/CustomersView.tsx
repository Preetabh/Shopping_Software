import React, { useEffect, useState } from 'react';
import { Search, Eye, ShieldCheck, ShieldAlert, X, ShoppingBag, MessageSquare } from 'lucide-react';
import { apiClient } from '../api/client';
import { User, Order, SupportTicket } from '../types';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected customer details drawer
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerTickets, setCustomerTickets] = useState<SupportTicket[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.get('/admin/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
        if (res.data.meta) setTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomerDetail = async (c: User) => {
    setSelectedCustomer(c);
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/admin/customers/${c._id || c.id}`);
      if (res.data.success) {
        setCustomerOrders(res.data.data.orders);
        setCustomerTickets(res.data.data.tickets);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async (customer: User, newStatus: 'active' | 'suspended' | 'blocked') => {
    try {
      await apiClient.put(`/admin/customers/${customer._id || customer.id}/status`, { status: newStatus });
      fetchCustomers();
      if (selectedCustomer) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus });
      }
    } catch (err) {
      alert('Failed to update customer status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Customer Profiles & Accounts</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Registered shopper profiles, lifetime spend, order history and account security
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            className="input-control"
            style={{ paddingLeft: '36px' }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="input-control"
          style={{ width: '160px' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Lifetime Spend</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading customer records...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No customer accounts found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id || c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={c.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{c.totalOrders || 0}</span> orders
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.status === 'active'
                          ? 'badge-success'
                          : c.status === 'suspended'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button onClick={() => handleOpenCustomerDetail(c)} className="btn btn-secondary btn-sm">
                      <Eye size={13} /> View 360°
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '720px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={selectedCustomer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={selectedCustomer.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{selectedCustomer.name}</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedCustomer.email} • {selectedCustomer.phone}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Account Status Control */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Account Security Status</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Currently: <strong>{selectedCustomer.status}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedCustomer.status !== 'active' && (
                    <button onClick={() => handleToggleStatus(selectedCustomer, 'active')} className="btn btn-primary btn-sm">
                      Activate
                    </button>
                  )}
                  {selectedCustomer.status !== 'suspended' && (
                    <button onClick={() => handleToggleStatus(selectedCustomer, 'suspended')} className="btn btn-secondary btn-sm" style={{ color: '#d97706' }}>
                      Suspend
                    </button>
                  )}
                  {selectedCustomer.status !== 'blocked' && (
                    <button onClick={() => handleToggleStatus(selectedCustomer, 'blocked')} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                      Block
                    </button>
                  )}
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={16} /> Past Order History ({customerOrders.length})
                </h4>
                {customerOrders.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8', padding: '12px 0' }}>No orders placed yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {customerOrders.map((ord) => (
                      <div key={ord._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#2874f0' }}>{ord.orderNumber}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{new Date(ord.createdAt).toLocaleDateString()} • {ord.items?.length} items</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '13.5px' }}>₹{ord.pricing?.totalAmount?.toLocaleString('en-IN')}</div>
                          <span className="badge badge-primary" style={{ fontSize: '10px' }}>{ord.orderStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support History */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} /> Customer Support History ({customerTickets.length})
                </h4>
                {customerTickets.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8', padding: '12px 0' }}>No support inquiries on record.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {customerTickets.map((t) => (
                      <div key={t._id} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>{t.subject}</span>
                          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{t.status}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Ticket #{t.ticketNumber} • Category: {t.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

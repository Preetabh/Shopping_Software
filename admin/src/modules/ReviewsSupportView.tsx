import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Send,
  UserCheck,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Review, SupportTicket } from '../types';

export const ReviewsSupportView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'tickets'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Ticket Chat Drawer
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchTickets();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reviews/admin/all');
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await apiClient.get('/support/admin/all');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const handleModerateReview = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.put(`/reviews/admin/${reviewId}/status`, { status });
      fetchReviews();
    } catch (err) {
      alert('Failed to update review moderation status');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await apiClient.delete(`/reviews/admin/${reviewId}`);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const res = await apiClient.post(`/support/${selectedTicket._id}/messages`, {
        message: replyMessage
      });
      if (res.data.success) {
        setSelectedTicket(res.data.data);
        setReplyMessage('');
        fetchTickets();
      }
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await apiClient.put(`/support/admin/${ticketId}/status`, { status });
      if (res.data.success) {
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(res.data.data);
        }
        fetchTickets();
      }
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Reviews Moderation & Customer Care</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Moderate customer product feedback and respond to customer complaints in real-time
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'reviews' ? '#2874f0' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'reviews' ? '2px solid #2874f0' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Star size={16} /> Review Moderation ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'tickets' ? '#2874f0' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'tickets' ? '2px solid #2874f0' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={16} /> Customer Support Tickets ({tickets.length})
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Author & Rating</th>
                <th>Review Title & Comment</th>
                <th>Verified Purchase</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No reviews awaiting moderation.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={r.product?.thumbnail} alt={r.product?.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        <span style={{ fontWeight: 600, maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.product?.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.user?.name || 'Customer'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < r.rating ? '#f59e0b' : 'none'}
                            color={i < r.rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', maxWidth: '300px' }}>{r.comment}</div>
                    </td>
                    <td>
                      <span className={`badge ${r.isVerifiedPurchase ? 'badge-success' : 'badge-neutral'}`}>
                        {r.isVerifiedPurchase ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {r.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleModerateReview(r._id, 'APPROVED')}
                            className="btn btn-primary btn-sm"
                            title="Approve"
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                        {r.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleModerateReview(r._id, 'REJECTED')}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#d97706' }}
                            title="Reject"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Subject & Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2874f0' }}>{t.ticketNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.user?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{t.user?.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.subject}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Category: {t.category}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.priority === 'URGENT' || t.priority === 'HIGH'
                            ? 'badge-danger'
                            : 'badge-neutral'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === 'RESOLVED'
                            ? 'badge-success'
                            : t.status === 'OPEN'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="btn btn-primary btn-sm"
                      >
                        <MessageSquare size={13} /> Reply Thread ({t.messages?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Support Ticket Conversation Drawer / Modal */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '680px', height: '620px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                  Ticket #{selectedTicket.ticketNumber}: {selectedTicket.subject}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Customer: {selectedTicket.user?.name} ({selectedTicket.user?.email})
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  className="input-control"
                  style={{ width: '130px', padding: '4px 8px', fontSize: '12px' }}
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateTicketStatus(selectedTicket._id, e.target.value)}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc' }}>
              {selectedTicket.messages?.map((msg, i) => {
                const isCustomer = msg.senderRole === 'customer';
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isCustomer ? 'flex-start' : 'flex-end',
                      maxWidth: '80%',
                      backgroundColor: isCustomer ? '#ffffff' : '#2874f0',
                      color: isCustomer ? '#0f172a' : '#ffffff',
                      padding: '12px 16px',
                      borderRadius: isCustomer ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px', opacity: 0.8 }}>
                      {isCustomer ? `${selectedTicket.user?.name} (Customer)` : 'Aurelia Luxe Concierge'}
                    </div>
                    <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>{msg.message}</div>
                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendTicketReply} style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', backgroundColor: '#ffffff' }}>
              <input
                required
                type="text"
                placeholder="Type customer reply message here..."
                className="input-control"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
                <Send size={15} /> Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

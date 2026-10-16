import React, { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, Calendar, CheckCircle, XCircle, X } from 'lucide-react';
import { apiClient } from '../api/client';
import { Coupon } from '../types';

export const CouponsView: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(1000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(1500);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [usageLimit, setUsageLimit] = useState(1000);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/coupons', {
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        endDate: new Date(endDate),
        usageLimit: Number(usageLimit),
        isActive: true
      });
      setModalOpen(false);
      setCode('');
      setDescription('');
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await apiClient.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Promotional Offers & Coupons</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Manage discount vouchers, order thresholds, redemption caps and expiry dates
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Type & Value</th>
              <th>Min. Order Threshold</th>
              <th>Usage Analytics</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading coupon rules...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No coupons configured.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={15} color="#2874f0" />
                      <span style={{ fontWeight: 800, color: '#2874f0', letterSpacing: '0.04em' }}>{c.code}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{c.description}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </div>
                    {c.maxDiscount && (
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>Max Cap: ₹{c.maxDiscount}</div>
                    )}
                  </td>
                  <td>₹{c.minOrderAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {c.usageCount} / {c.usageLimit} redeemed
                    </div>
                    <div style={{ width: '100px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                      <div
                        style={{
                          width: `${Math.min(100, (c.usageCount / (c.usageLimit || 1)) * 100)}%`,
                          height: '100%',
                          backgroundColor: '#2874f0'
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
                      <Calendar size={13} color="#64748b" />
                      {new Date(c.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`badge ${c.isActive ? 'badge-success' : 'badge-neutral'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Create Discount Coupon</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Coupon Code (Uppercase) *
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AURELIA20"
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Offer Description *
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Get 20% instant discount up to ₹2000"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Discount Type *
                  </label>
                  <select
                    className="input-control"
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Discount Value *
                  </label>
                  <input
                    required
                    type="number"
                    className="input-control"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Min. Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    value={maxDiscount || ''}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Validity Expiry Date *
                  </label>
                  <input
                    required
                    type="date"
                    className="input-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, ArrowUpDown, History, Search, Edit3, X } from 'lucide-react';
import { apiClient } from '../api/client';
import { InventoryMovement } from '../types';

export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Adjustment Modal
  const [adjustModal, setAdjustModal] = useState<any | null>(null);
  const [newStockVal, setNewStockVal] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Physical inventory count audit');

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, [lowStockOnly, search]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (lowStockOnly) params.lowStockOnly = 'true';
      if (search) params.search = search;

      const res = await apiClient.get('/inventory', { params });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await apiClient.get('/inventory/movements');
      if (res.data.success) {
        setMovements(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal) return;

    try {
      await apiClient.post('/inventory/adjust', {
        productId: adjustModal._id,
        newStock: Number(newStockVal),
        reason: adjustReason
      });
      setAdjustModal(null);
      fetchInventory();
      fetchMovements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to adjust stock');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Inventory & Stock Ledger</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Monitor real-time warehouse stock, low threshold warnings, and audit trail logs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('stock')}
          style={{
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'stock' ? '#2874f0' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'stock' ? '2px solid #2874f0' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Boxes size={16} /> Warehouse Stock Ledger
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          style={{
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'movements' ? '#2874f0' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'movements' ? '2px solid #2874f0' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <History size={16} /> Stock Movement Audit Trail ({movements.length})
        </button>
      </div>

      {/* Stock Tab */}
      {activeTab === 'stock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters */}
          <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search SKU or product title..."
                className="input-control"
                style={{ paddingLeft: '32px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              Show Low-Stock Alerts Only
            </label>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product SKU & Title</th>
                  <th>Category</th>
                  <th>Selling Price</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      Loading inventory levels...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No stock records found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isLow = p.stock <= p.lowStockThreshold;
                    return (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={p.thumbnail} alt={p.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.title}</div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>SKU: {p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td>{p.category?.name || 'Category'}</td>
                        <td>₹{p.price?.toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ fontWeight: 800, fontSize: '15px', color: isLow ? '#dc2626' : '#0f172a' }}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>{p.lowStockThreshold} units</td>
                        <td>
                          <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                            {isLow ? 'LOW STOCK ALERT' : 'IN STOCK'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setAdjustModal(p);
                              setNewStockVal(p.stock);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit3 size={13} /> Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement Audit Trail Tab */}
      {activeTab === 'movements' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product SKU</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Previous → New</th>
                <th>Reason / Reference</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No stock movements recorded.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(m.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#2874f0' }}>{m.sku}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{m.product?.title || 'Product'}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{m.type}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{m.quantity} units</td>
                    <td>
                      <span style={{ color: '#64748b' }}>{m.previousStock}</span> →{' '}
                      <strong style={{ color: '#0f172a' }}>{m.newStock}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px' }}>{m.reason}</div>
                      {m.referenceOrder && (
                        <span style={{ fontSize: '11px', color: '#2874f0' }}>
                          Order: {m.referenceOrder.orderNumber}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>
                        {m.performedBy?.name || 'System Automation'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Adjust Warehouse Stock</h3>
              <button onClick={() => setAdjustModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{adjustModal.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>SKU: {adjustModal.sku} | Current: {adjustModal.stock} units</div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  New Stock Count *
                </label>
                <input
                  required
                  type="number"
                  className="input-control"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Reason for Adjustment (Audit Trail) *
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical stock count discrepancy, supplier batch arrival..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setAdjustModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

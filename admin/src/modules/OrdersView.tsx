import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  X
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Order } from '../types';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Status update in modal
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusLocation, setStatusLocation] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, search, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (search) params.search = search;

      const res = await apiClient.get('/orders/admin/all', { params });
      if (res.data.success) {
        setOrders(res.data.data);
        if (res.data.meta) setTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    try {
      const res = await apiClient.put(`/orders/admin/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus}`,
        location: statusLocation || 'Fulfillment Center',
        trackingNumber: trackingNumber || undefined
      });

      if (res.data.success) {
        setSelectedOrder(res.data.data);
        setStatusNote('');
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  const handleReturnDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedOrder) return;
    try {
      const res = await apiClient.post(`/orders/admin/${selectedOrder._id}/return-decision`, {
        decision,
        refundAmount: selectedOrder.pricing?.totalAmount
      });
      if (res.data.success) {
        setSelectedOrder(res.data.data);
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing return');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success">{status}</span>;
      case 'SHIPPED':
      case 'PACKED':
      case 'OUT_FOR_DELIVERY':
        return <span className="badge badge-warning">{status}</span>;
      case 'PLACED':
      case 'CONFIRMED':
        return <span className="badge badge-primary">{status}</span>;
      case 'CANCELLED':
      case 'RETURN_REJECTED':
        return <span className="badge badge-danger">{status}</span>;
      case 'RETURN_REQUESTED':
      case 'RETURN_APPROVED':
        return <span className="badge badge-warning">{status}</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Order Fulfillment & Tracking</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Monitor real-time customer purchases, courier shipments, and returns
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search order number, customer name or phone..."
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
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Fulfillment Status</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURN_REQUESTED">Return Requested</option>
        </select>

        <select
          className="input-control"
          style={{ width: '160px' }}
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID & Date</th>
              <th>Customer & Destination</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading order records...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#2874f0' }}>{ord.orderNumber}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.shippingAddress?.fullName}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{ord.items?.length || 0} items</span>
                      <span style={{ fontSize: '11.5px', color: '#64748b', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        ({ord.items?.[0]?.title})
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{ord.pricing?.totalAmount?.toLocaleString('en-IN')}
                    </div>
                    {ord.pricing?.couponDiscount > 0 && (
                      <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>
                        Coupon Saved ₹{ord.pricing.couponDiscount}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        ord.payment?.status === 'PAID'
                          ? 'badge-success'
                          : ord.payment?.status === 'REFUNDED'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {ord.payment?.status} ({ord.payment?.method})
                    </span>
                  </td>
                  <td>{getStatusBadge(ord.orderStatus)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.orderStatus);
                          setTrackingNumber(ord.tracking?.trackingNumber || '');
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Manage Order"
                      >
                        <Eye size={13} /> Details
                      </button>
                      <button
                        onClick={() => setInvoiceModalOrder(ord)}
                        className="btn btn-secondary btn-sm"
                        title="View Invoice"
                      >
                        <FileText size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', color: '#64748b' }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details & Workflow Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '780px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Order: {selectedOrder.orderNumber}</h3>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Return Requested Alert */}
              {selectedOrder.orderStatus === 'RETURN_REQUESTED' && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#92400e', fontSize: '14px' }}>
                      Customer Requested Return & Refund
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#b45309', marginTop: '2px' }}>
                      Reason: {selectedOrder.returnDetails?.reason || 'Product quality dissatisfaction'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleReturnDecision('APPROVE')} className="btn btn-primary btn-sm">
                      Approve & Refund (₹{selectedOrder.pricing?.totalAmount})
                    </button>
                    <button onClick={() => handleReturnDecision('REJECT')} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                      Reject Return
                    </button>
                  </div>
                </div>
              )}

              {/* Items Card */}
              <div className="card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Items in this Shipment</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={it.image} alt={it.title} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{it.title}</div>
                          {it.variantName && (
                            <div style={{ fontSize: '12px', color: '#2874f0' }}>Variant: {it.variantName}</div>
                          )}
                          <div style={{ fontSize: '12px', color: '#64748b' }}>₹{it.price?.toLocaleString('en-IN')} x {it.quantity} unit(s)</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>₹{it.itemTotal?.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.pricing?.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedOrder.pricing?.couponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                      <span>Coupon Discount ({selectedOrder.pricing?.couponCode}):</span>
                      <span>-₹{selectedOrder.pricing?.couponDiscount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Delivery Charge:</span>
                    <span>{selectedOrder.pricing?.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.pricing?.deliveryCharge}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', color: '#0f172a', marginTop: '6px' }}>
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Address & Tracking */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Delivery Address</h4>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>
                    <strong>{selectedOrder.shippingAddress?.fullName}</strong>
                    <div>{selectedOrder.shippingAddress?.addressLine}</div>
                    <div>{selectedOrder.shippingAddress?.locality}, {selectedOrder.shippingAddress?.city}</div>
                    <div>{selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</div>
                    <div style={{ color: '#64748b', marginTop: '4px' }}>Phone: {selectedOrder.shippingAddress?.phone}</div>
                  </div>
                </div>

                <div className="card" style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Ekart Shipping Info</h4>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>
                    <div><strong>Courier:</strong> {selectedOrder.tracking?.courierName || 'Ekart Logistics'}</div>
                    <div><strong>Tracking ID:</strong> {selectedOrder.tracking?.trackingNumber || 'Pending Generation'}</div>
                    <div>
                      <strong>Est. Delivery:</strong>{' '}
                      {selectedOrder.tracking?.estimatedDeliveryDate
                        ? new Date(selectedOrder.tracking.estimatedDeliveryDate).toLocaleDateString()
                        : '3 Business Days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Control Form */}
              <div className="card" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Update Order & Fulfillment Status</h4>
                <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Transition Status
                      </label>
                      <select
                        className="input-control"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. EKT9928312"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Location Milestone
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={statusLocation}
                        onChange={(e) => setStatusLocation(e.target.value)}
                        placeholder="e.g. Bengaluru Hub"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Public Status Note
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="e.g. Package inspected and dispatched"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '6px' }}>
                    <Truck size={14} /> Update Tracking Status
                  </button>
                </form>
              </div>

              {/* Status History Timeline */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Tracking Events Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrder.tracking?.statusUpdates?.map((upd, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2874f0', marginTop: '6px' }} />
                      <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e3a8a' }}>{upd.status}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(upd.timestamp).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{upd.note}</div>
                        {upd.location && <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {upd.location}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceModalOrder && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '650px', backgroundColor: '#ffffff', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #D4AF37', paddingBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0A0A0E', letterSpacing: '0.12em', fontFamily: 'serif' }}>AURELIA LUXE</div>
                <div style={{ fontSize: '11px', color: '#8c7335', letterSpacing: '0.08em', fontWeight: 600 }}>Maison Invoice / Certificate of Authenticity</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#475569' }}>
                <div>Invoice #: {invoiceModalOrder.invoiceNumber || 'INV-00123'}</div>
                <div>Date: {new Date(invoiceModalOrder.createdAt).toLocaleDateString()}</div>
                <div>Order #: {invoiceModalOrder.orderNumber}</div>
              </div>
            </div>

            <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <div>
                <strong>Billed To:</strong>
                <div>{invoiceModalOrder.shippingAddress?.fullName}</div>
                <div>{invoiceModalOrder.shippingAddress?.addressLine}</div>
                <div>{invoiceModalOrder.shippingAddress?.city}, {invoiceModalOrder.shippingAddress?.state} - {invoiceModalOrder.shippingAddress?.pincode}</div>
                <div>Phone: {invoiceModalOrder.shippingAddress?.phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Sold By:</strong>
                <div>Aurelia Luxe International Ltd.</div>
                <div>Atelier Place Vendôme, Luxury Boulevard</div>
                <div>Bengaluru, Karnataka - 560103</div>
                <div>GSTIN: 29ABCDE1234F1Z5</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceModalOrder.items?.map((it, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{it.title}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{it.price?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{it.itemTotal?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13px', marginBottom: '24px' }}>
              <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal:</span>
                  <span>₹{invoiceModalOrder.pricing?.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {invoiceModalOrder.pricing?.couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                    <span>Discount:</span>
                    <span>-₹{invoiceModalOrder.pricing?.couponDiscount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px', borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                  <span>Grand Total:</span>
                  <span>₹{invoiceModalOrder.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => window.print()} className="btn btn-primary btn-sm">
                <Printer size={14} /> Print Invoice
              </button>
              <button onClick={() => setInvoiceModalOrder(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

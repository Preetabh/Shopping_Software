import React, { useEffect, useState } from 'react';
import { CreditCard, IndianRupee, RefreshCw, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { apiClient } from '../api/client';

export const PaymentsView: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.get('/payments/admin/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.data);
        if (res.data.meta) setTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Payments & Financial Reconciliation</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Gateway settlement logs, Cash on Delivery accounts, and refund reconciliation
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
        <select
          className="input-control"
          style={{ width: '200px' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Transaction Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="REFUNDED">REFUNDED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Transaction ID & Date</th>
              <th>Order Reference</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Amount (INR)</th>
              <th>Status</th>
              <th>Gateway Ref</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading financial records...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No payment transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#2874f0' }}>{tx.transactionId || tx._id}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.order?.orderNumber || 'Order'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Status: {tx.order?.orderStatus}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{tx.user?.name || 'Customer'}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{tx.user?.phone}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{tx.method}</span>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    ₹{tx.amount?.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        tx.status === 'PAID'
                          ? 'badge-success'
                          : tx.status === 'REFUNDED'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace' }}>
                      {tx.razorpayPaymentId || tx.razorpayOrderId || 'N/A'}
                    </span>
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
    </div>
  );
};

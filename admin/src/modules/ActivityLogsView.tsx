import React, { useEffect, useState } from 'react';
import { History, Filter, User, Globe, Clock } from 'lucide-react';
import { apiClient } from '../api/client';
import { AuditLog } from '../types';

export const ActivityLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (moduleFilter) params.module = moduleFilter;

      const res = await apiClient.get('/admin/logs', { params });
      if (res.data.success) {
        setLogs(res.data.data);
        if (res.data.meta) setTotalPages(res.data.meta.totalPages);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>System Activity & Security Audit Logs</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Immutable timestamped record of administrative mutations, order changes and catalog updates
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
        <select
          className="input-control"
          style={{ width: '200px' }}
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Functional Modules</option>
          <option value="Product">Products</option>
          <option value="Order">Orders</option>
          <option value="Inventory">Inventory</option>
          <option value="Coupon">Coupons</option>
          <option value="Banner">Banners</option>
          <option value="Review">Reviews</option>
          <option value="User">Users & Customers</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action Executed</th>
              <th>Target Module</th>
              <th>Actor Identity</th>
              <th>Role</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading security audit trail...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No activity records logged.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{new Date(log.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.action}</span>
                  </td>
                  <td>
                    <span className="badge badge-primary">{log.module}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.actor?.name || 'Automated Service'}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>{log.actor?.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{log.actorRole}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>
                      {log.ipAddress || '127.0.0.1'}
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

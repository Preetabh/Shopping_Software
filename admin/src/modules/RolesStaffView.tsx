import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, ShieldAlert, Key, Check } from 'lucide-react';
import { apiClient } from '../api/client';

export const RolesStaffView: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffAndRoles();
  }, []);

  const fetchStaffAndRoles = async () => {
    try {
      setLoading(true);
      const [roleRes, staffRes] = await Promise.all([
        apiClient.get('/admin/roles'),
        apiClient.get('/admin/staff')
      ]);
      if (roleRes.data.success) setRoles(roleRes.data.data);
      if (staffRes.data.success) setStaff(staffRes.data.data);
    } catch (err) {
      console.error('Error fetching roles and staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.put(`/admin/staff/${userId}/role`, { role: newRole });
      fetchStaffAndRoles();
      alert('Staff role successfully updated!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating staff role');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Role-Based Access Control (RBAC)</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Enforce granular security policies across staff members, managers and system administrators
        </p>
      </div>

      {/* Staff Accounts Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={18} color="#2874f0" /> Internal Staff Members
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Email & Phone</th>
                <th>Assigned Role</th>
                <th>Role Permissions</th>
                <th>Reassign Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Loading staff directory...
                  </td>
                </tr>
              ) : (
                staff.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{u.email}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{u.phone}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {u.role === 'superadmin' ? 'Universal Full Access (*)' : `${u.roleRef?.permissions?.length || 4} granular privileges`}
                      </span>
                    </td>
                    <td>
                      <select
                        className="input-control"
                        style={{ width: '160px', padding: '5px 10px', fontSize: '12.5px' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u.role === 'superadmin'}
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Administrator</option>
                        <option value="product_manager">Product Manager</option>
                        <option value="order_manager">Order Manager</option>
                        <option value="support_agent">Support Agent</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Specifications Matrix */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} color="#2874f0" /> Configured Roles & Authorized Operations
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {roles.map((r) => (
            <div
              key={r._id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                backgroundColor: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{r.name}</h4>
                <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>{r.code}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 12px' }}>{r.description}</p>

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                Permissions ({r.permissions?.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {r.permissions?.slice(0, 6).map((perm: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: '#eef5ff',
                      color: '#2874f0',
                      fontSize: '11px',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}
                  >
                    {perm}
                  </span>
                ))}
                {r.permissions?.length > 6 && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', alignSelf: 'center' }}>
                    +{r.permissions.length - 6} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

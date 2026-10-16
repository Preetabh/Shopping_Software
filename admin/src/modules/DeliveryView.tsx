import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Search, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { apiClient } from '../api/client';
import { Order } from '../types';

export const DeliveryView: React.FC = () => {
  const [shipments, setShipments] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/orders/admin/all', {
        params: { status: 'SHIPPED', limit: 20 }
      });
      if (res.data.success) {
        setShipments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Delivery & Logistics Operations</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Ekart Logistics integration, live courier tracking and in-transit shipments
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Order #</th>
              <th>Destination Address</th>
              <th>Courier Partner</th>
              <th>Estimated Delivery</th>
              <th>Status</th>
              <th>Latest Milestone</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading active shipments...
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No active in-transit shipments right now.
                </td>
              </tr>
            ) : (
              shipments.map((s) => {
                const latest = s.tracking?.statusUpdates?.[s.tracking.statusUpdates.length - 1];
                return (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={16} color="#2874f0" />
                        <span style={{ fontWeight: 700, color: '#2874f0' }}>
                          {s.tracking?.trackingNumber || 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.shippingAddress?.fullName}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {s.shippingAddress?.city}, {s.shippingAddress?.state} - {s.shippingAddress?.pincode}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{s.tracking?.courierName || 'Ekart Logistics'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}>
                        <Calendar size={13} color="#64748b" />
                        {s.tracking?.estimatedDeliveryDate
                          ? new Date(s.tracking.estimatedDeliveryDate).toLocaleDateString()
                          : 'Within 3 days'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-warning">{s.orderStatus}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: 500 }}>{latest?.note || 'Dispatched'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {latest?.location || 'Transit Hub'}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

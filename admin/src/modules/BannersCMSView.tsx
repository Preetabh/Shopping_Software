import React, { useEffect, useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { apiClient } from '../api/client';
import { Banner } from '../types';

export const BannersCMSView: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetType, setTargetType] = useState('CATEGORY');
  const [targetValue, setTargetValue] = useState('mobiles');
  const [position, setPosition] = useState('HERO');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/banners', { params: { activeOnly: 'false' } });
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/banners', {
        title,
        subtitle,
        imageUrl,
        targetType,
        targetValue,
        position,
        isActive: true
      });
      setModalOpen(false);
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      fetchBanners();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating banner');
    }
  };

  const handleToggle = async (b: Banner) => {
    try {
      await apiClient.put(`/banners/${b._id}`, { isActive: !b.isActive });
      fetchBanners();
    } catch (err) {
      alert('Failed to update banner status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await apiClient.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Hero Banners & Visual CMS</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Control homepage carousels, campaign banners and promotional media across web and mobile
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Add Promotional Banner
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {banners.map((b) => (
          <div key={b._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '160px', position: 'relative', backgroundColor: '#e2e8f0' }}>
              <img
                src={b.imageUrl}
                alt={b.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className={`badge ${b.isActive ? 'badge-success' : 'badge-neutral'}`}
                style={{ position: 'absolute', top: '12px', right: '12px' }}
              >
                {b.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{b.title}</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{b.subtitle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#2874f0', fontWeight: 600 }}>
                  Position: {b.position} • Target: {b.targetValue}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleToggle(b)} className="btn btn-secondary btn-sm">
                    {b.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => handleDelete(b._id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Create Promotional Banner</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Banner Title *
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Big Billion Days 2026"
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Up to 80% off on smartphones"
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  High-Resolution Image URL *
                </label>
                <input
                  required
                  type="url"
                  className="input-control"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Banner Placement
                  </label>
                  <select className="input-control" value={position} onChange={(e) => setPosition(e.target.value)}>
                    <option value="HERO">HERO (Top Carousel)</option>
                    <option value="MIDDLE">MIDDLE (Deal Section)</option>
                    <option value="BOTTOM">BOTTOM (Promotions)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Target Category/Deal
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="mobiles, electronics, etc."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

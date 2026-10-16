import React, { useEffect, useState } from 'react';
import { Plus, FolderTree, Tag, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../api/client';
import { Category, Brand } from '../types';

export const CategoriesBrandsView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [categoryModal, setCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catParent, setCatParent] = useState('');
  const [catImage, setCatImage] = useState('');

  // Brand Modal
  const [brandModal, setBrandModal] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brandDesc, setBrandDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, brandRes] = await Promise.all([
        apiClient.get('/categories/tree'),
        apiClient.get('/brands')
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (brandRes.data.success) setBrands(brandRes.data.data);
    } catch (err) {
      console.error('Error fetching categories & brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/categories', {
        name: catName,
        parent: catParent || null,
        image: catImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80'
      });
      setCategoryModal(false);
      setCatName('');
      setCatParent('');
      setCatImage('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating category');
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/brands', {
        name: brandName,
        logo: brandLogo || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
        description: brandDesc
      });
      setBrandModal(false);
      setBrandName('');
      setBrandLogo('');
      setBrandDesc('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating brand');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await apiClient.delete(`/brands/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete brand');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Taxonomy & Brand Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Configure hierarchical product categories, subcategories, and verified brands
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'categories' ? (
            <button onClick={() => setCategoryModal(true)} className="btn btn-primary">
              <Plus size={16} /> Add Category
            </button>
          ) : (
            <button onClick={() => setBrandModal(true)} className="btn btn-primary">
              <Plus size={16} /> Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'categories' ? '#2874f0' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'categories' ? '2px solid #2874f0' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FolderTree size={16} /> Hierarchical Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          style={{
            padding: '10px 4px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeTab === 'brands' ? '#2874f0' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'brands' ? '2px solid #2874f0' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Tag size={16} /> Verified Brands ({brands.length})
        </button>
      </div>

      {/* Categories View */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.map((cat) => (
            <div key={cat._id} className="card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#eef5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2874f0' }}>
                      <FolderTree size={20} />
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a' }}>{cat.name}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Slug: /{cat.slug}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Subcategories list */}
              {cat.children && cat.children.length > 0 && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                    Subcategories ({cat.children.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {cat.children.map((sub) => (
                      <span
                        key={sub._id}
                        style={{
                          backgroundColor: '#f1f5f9',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          color: '#334155',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {sub.name}
                        <button
                          onClick={() => handleDeleteCategory(sub._id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Brands View */}
      {activeTab === 'brands' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {brands.map((b) => (
            <div key={b._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={b.logo}
                  alt={b.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{b.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>/{b.slug}</div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteBrand(b._id)}
                className="btn btn-secondary btn-sm"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {categoryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Category</h3>
              <button onClick={() => setCategoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Category Name *
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Smart Wearables"
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Parent Category (Optional - leave empty for root)
                </label>
                <select
                  className="input-control"
                  value={catParent}
                  onChange={(e) => setCatParent(e.target.value)}
                >
                  <option value="">None (Root Category)</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Category Image URL
                </label>
                <input
                  type="url"
                  className="input-control"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setCategoryModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {brandModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Verified Brand</h3>
              <button onClick={() => setBrandModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateBrand} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Brand Name *
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Dell"
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Brand Logo URL
                </label>
                <input
                  type="url"
                  className="input-control"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setBrandModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

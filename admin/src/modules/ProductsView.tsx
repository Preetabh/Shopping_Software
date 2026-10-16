import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Check,
  X,
  AlertCircle,
  PackagePlus,
  Boxes
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Product, Category, Brand } from '../types';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    category: '',
    subCategory: '',
    price: 0,
    mrp: 0,
    stock: 0,
    sku: '',
    thumbnail: '',
    imagesText: '',
    highlightsText: '',
    isPublished: true,
    isDealOfDay: false,
    isTrending: false,
    isFeatured: false
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, brandFilter, page]);

  const fetchMetadata = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/brands')
      ]);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (brandRes.data.success) setBrands(brandRes.data.data);
    } catch (err) {
      console.error('Error fetching categories/brands:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (brandFilter) params.brand = brandFilter;

      const res = await apiClient.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      brand: brands[0]?._id || '',
      category: categories[0]?._id || '',
      subCategory: '',
      price: 999,
      mrp: 1499,
      stock: 25,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      imagesText: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      highlightsText: '1 Year Manufacturer Warranty\nFast Delivery within 3 days\nGenuine Branded Product',
      isPublished: true,
      isDealOfDay: false,
      isTrending: false,
      isFeatured: false
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      description: p.description,
      brand: p.brand?._id || p.brand,
      category: p.category?._id || p.category,
      subCategory: p.subCategory?._id || '',
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      sku: p.sku,
      thumbnail: p.thumbnail,
      imagesText: p.images.join('\n'),
      highlightsText: p.highlights.join('\n'),
      isPublished: p.isPublished,
      isDealOfDay: p.isDealOfDay,
      isTrending: p.isTrending,
      isFeatured: p.isFeatured
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        stock: Number(formData.stock),
        images: formData.imagesText.split('\n').filter((url) => url.trim().length > 0),
        highlights: formData.highlightsText.split('\n').filter((h) => h.trim().length > 0)
      };

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, payload);
      } else {
        await apiClient.post('/products', payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleTogglePublish = async (p: Product) => {
    try {
      await apiClient.put(`/products/${p._id}`, { isPublished: !p.isPublished });
      fetchProducts();
    } catch (err) {
      alert('Failed to update publish state');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Product Inventory & Catalog</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Manage product descriptions, pricing, discounts, stock levels and visibility
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by title, SKU, or tags..."
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
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="input-control"
          style={{ width: '180px' }}
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category & Brand</th>
              <th>Price & MRP</th>
              <th>Stock Status</th>
              <th>Rating</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  Loading catalog products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No products found matching criteria.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLowStock = p.stock <= p.lowStockThreshold;
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          style={{
                            width: '46px',
                            height: '46px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            backgroundColor: '#f1f5f9',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span>SKU: {p.sku}</span>
                            {p.isDealOfDay && (
                              <span style={{ color: '#fb641b', fontWeight: 700 }}>• Deal of Day</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.category?.name || 'Category'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{p.brand?.name || 'Brand'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>₹{p.price?.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        <span style={{ textDecoration: 'line-through' }}>₹{p.mrp?.toLocaleString('en-IN')}</span>{' '}
                        <span style={{ color: '#10b981', fontWeight: 600 }}>({p.discountPercent}% off)</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                        {p.stock} units {isLowStock && '(Low)'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span>{p.rating?.average || 4.5}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>({p.rating?.count || 0})</span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`badge ${p.isPublished ? 'badge-success' : 'badge-neutral'}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {p.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                        {p.isPublished ? 'Published' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.title)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '680px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
                {editingProduct ? 'Edit Product Details' : 'Add New Marketplace Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Product Title *
                </label>
                <input
                  required
                  type="text"
                  className="input-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Category *
                  </label>
                  <select
                    required
                    className="input-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Brand *
                  </label>
                  <select
                    required
                    className="input-control"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  >
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    className="input-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Original MRP (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    className="input-control"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Stock Units *
                  </label>
                  <input
                    required
                    type="number"
                    className="input-control"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Thumbnail Image URL *
                </label>
                <input
                  required
                  type="url"
                  className="input-control"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Gallery Images (One URL per line)
                </label>
                <textarea
                  rows={2}
                  className="input-control"
                  value={formData.imagesText}
                  onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Key Highlights (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  className="input-control"
                  value={formData.highlightsText}
                  onChange={(e) => setFormData({ ...formData, highlightsText: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  className="input-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Promotional Flags */}
              <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isDealOfDay}
                    onChange={(e) => setFormData({ ...formData, isDealOfDay: e.target.checked })}
                  />
                  Deal of the Day
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  />
                  Trending Product
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  Featured Product
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

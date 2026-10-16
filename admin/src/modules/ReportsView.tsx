import React, { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Calendar, Package } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { apiClient } from '../api/client';

export const ReportsView: React.FC = () => {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<{
    salesReport: { _id: string; orderCount: number; revenue: number }[];
    topProducts: { _id: string; title: string; unitsSold: number; totalRevenue: number }[];
    categoryPerformance: { categoryName: string; productCount: number; avgPrice: number }[];
  } | null>(null);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/reports', { params: { period } });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    let csv = 'Date,Order Count,Revenue (INR)\n';
    reportData.salesReport.forEach((row) => {
      csv += `${row._id},${row.orderCount},${row.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aurelia_Luxe_Sales_Report_${period}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Business Analytics & Sales Intelligence</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Comprehensive performance indicators across revenue channels, categories, and top products
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="input-control"
            style={{ width: '150px' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={15} /> Export CSV Report
          </button>
        </div>
      </div>

      {loading || !reportData ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          Compiling business reports...
        </div>
      ) : (
        <>
          {/* Sales Revenue Chart */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Sales Revenue Volume (Period: {period})
            </h3>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData.salesReport.map((s) => ({ date: s._id.slice(5), revenue: s.revenue, orders: s.orderCount }))}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Gross Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products & Category Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr', gap: '20px' }}>
            {/* Top Products */}
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                Top Performing Products by Units Sold
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Units Sold</th>
                      <th>Total Sales Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          No sales data in this period.
                        </td>
                      </tr>
                    ) : (
                      reportData.topProducts.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{p.title}</td>
                          <td>
                            <span className="badge badge-primary">{p.unitsSold} units</span>
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{p.totalRevenue?.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Performance */}
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                Category Assortment & Average Ticket Size
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>SKUs</th>
                      <th>Avg. Selling Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categoryPerformance.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                        <td>{c.productCount} products</td>
                        <td style={{ fontWeight: 700, color: '#2874f0' }}>₹{c.avgPrice?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

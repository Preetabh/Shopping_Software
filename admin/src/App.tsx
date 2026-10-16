import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './modules/DashboardView';
import { ProductsView } from './modules/ProductsView';
import { CategoriesBrandsView } from './modules/CategoriesBrandsView';
import { OrdersView } from './modules/OrdersView';
import { CustomersView } from './modules/CustomersView';
import { InventoryView } from './modules/InventoryView';
import { CouponsView } from './modules/CouponsView';
import { PaymentsView } from './modules/PaymentsView';
import { DeliveryView } from './modules/DeliveryView';
import { ReviewsSupportView } from './modules/ReviewsSupportView';
import { BannersCMSView } from './modules/BannersCMSView';
import { NotificationsView } from './modules/NotificationsView';
import { ReportsView } from './modules/ReportsView';
import { SettingsView } from './modules/SettingsView';
import { ActivityLogsView } from './modules/ActivityLogsView';
import { RolesStaffView } from './modules/RolesStaffView';
import { Bell, Sparkles, ExternalLink } from 'lucide-react';
import { apiClient } from './api/client';

export function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    // Check saved session
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (err) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchBadgeCounters();
    }
  }, [currentUser, currentTab]);

  const fetchBadgeCounters = async () => {
    try {
      const res = await apiClient.get('/admin/dashboard');
      if (res.data.success && res.data.data?.summary) {
        setPendingOrdersCount(res.data.data.summary.pendingOrders || 0);
        setOpenTicketsCount(res.data.data.summary.openTickets || 0);
        setLowStockCount(res.data.data.summary.lowStockProducts || 0);
      }
    } catch (err) {
      // background badge refresh
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  const renderModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'products':
        return <ProductsView />;
      case 'categories':
        return <CategoriesBrandsView />;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'inventory':
        return <InventoryView />;
      case 'coupons':
        return <CouponsView />;
      case 'payments':
        return <PaymentsView />;
      case 'delivery':
        return <DeliveryView />;
      case 'support_reviews':
        return <ReviewsSupportView />;
      case 'banners':
        return <BannersCMSView />;
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'logs':
        return <ActivityLogsView />;
      case 'roles':
        return <RolesStaffView />;
      default:
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  const getModuleTitle = () => {
    const titles: Record<NavItemKey, string> = {
      dashboard: 'Operations Dashboard',
      products: 'Product Catalog & Inventory',
      categories: 'Categories & Brands Hierarchy',
      orders: 'Order Processing & Tracking',
      customers: 'Shopper CRM & Profiles',
      inventory: 'Warehouse Stock Ledger',
      coupons: 'Discounts & Coupon Rules',
      payments: 'Settlement & Finance Audit',
      delivery: 'Logistics & Shipment Management',
      support_reviews: 'Customer Care & Reviews Moderation',
      banners: 'Visual Content Management',
      notifications: 'Push Notifications Center',
      reports: 'Executive Reports & Analytics',
      settings: 'Marketplace Store Settings',
      logs: 'System Activity Trail',
      roles: 'Role-Based Access Control'
    };
    return titles[currentTab] || 'Dashboard';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        userRole={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
        pendingOrdersCount={pendingOrdersCount}
        openTicketsCount={openTicketsCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Panel Content Area */}
      <div className="admin-main">
        {/* Header Bar */}
        <header className="admin-header">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {getModuleTitle()}
            </h1>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Aurelia Luxe Maison Administration • Operations Console v1.0
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              API Server Online (Port 5050)
            </div>

            <button
              onClick={() => setCurrentTab('notifications')}
              className="btn btn-secondary btn-sm"
              title="Notifications"
            >
              <Bell size={15} />
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="admin-content">{renderModule()}</main>
      </div>
    </div>
  );
}

export default App;

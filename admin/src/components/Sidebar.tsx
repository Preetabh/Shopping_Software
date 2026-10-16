import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  CreditCard,
  Truck,
  MessageSquareText,
  Image as ImageIcon,
  Bell,
  BarChart3,
  Settings,
  History,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'coupons'
  | 'payments'
  | 'delivery'
  | 'support_reviews'
  | 'banners'
  | 'notifications'
  | 'reports'
  | 'settings'
  | 'logs'
  | 'roles';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  userRole?: string;
  userName?: string;
  onLogout: () => void;
  pendingOrdersCount?: number;
  openTicketsCount?: number;
  lowStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole = 'admin',
  userName = 'Admin',
  onLogout,
  pendingOrdersCount = 0,
  openTicketsCount = 0,
  lowStockCount = 0
}) => {
  const menuGroups = [
    {
      title: 'CORE COMMERCE',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'products', label: 'Products', icon: Package },
        { key: 'categories', label: 'Categories & Brands', icon: FolderTree },
        {
          key: 'orders',
          label: 'Orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: '#fb641b'
        },
        { key: 'customers', label: 'Customers', icon: Users },
        {
          key: 'inventory',
          label: 'Inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: '#ef4444'
        }
      ]
    },
    {
      title: 'MARKETING & SALES',
      items: [
        { key: 'coupons', label: 'Offers & Coupons', icon: Tag },
        { key: 'banners', label: 'Banners & CMS', icon: ImageIcon },
        { key: 'notifications', label: 'Push Notifications', icon: Bell }
      ]
    },
    {
      title: 'OPERATIONS & SUPPORT',
      items: [
        { key: 'payments', label: 'Payments & Finance', icon: CreditCard },
        { key: 'delivery', label: 'Delivery & Shipments', icon: Truck },
        {
          key: 'support_reviews',
          label: 'Reviews & Support',
          icon: MessageSquareText,
          badge: openTicketsCount > 0 ? openTicketsCount : undefined,
          badgeColor: '#2874f0'
        }
      ]
    },
    {
      title: 'SYSTEM & INSIGHTS',
      items: [
        { key: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { key: 'roles', label: 'Roles & Staff RBAC', icon: ShieldCheck },
        { key: 'logs', label: 'Activity Logs', icon: History },
        { key: 'settings', label: 'Store Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '22px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #8C7335 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0A0A0E',
            fontWeight: 800,
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(212,175,55,0.4)',
            fontFamily: 'serif'
          }}
        >
          A
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.12em', color: '#fff', fontFamily: 'serif' }}>
              AURELIA
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#D4AF37',
                backgroundColor: 'rgba(212,175,55,0.15)',
                padding: '2px 5px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                border: '1px solid rgba(212,175,55,0.3)'
              }}
            >
              LUXE
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} color="#D4AF37" /> Maison Control Center
          </span>
        </div>
      </div>

      {/* Nav Menu Groups */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {menuGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#64748b',
                padding: '4px 12px 8px',
                letterSpacing: '0.08em'
              }}
            >
              {group.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key as NavItemKey)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#2874f0' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.15s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#1e293b';
                        e.currentTarget.style.color = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <Icon size={17} color={isActive ? '#ffffff' : '#94a3b8'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        style={{
                          backgroundColor: item.badgeColor || '#2874f0',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: '999px',
                          lineHeight: 1.4
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#0b1120',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#2874f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              color: '#ffffff'
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap' }}>
              {userName}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.04em'
              }}
            >
              {userRole.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign Out"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

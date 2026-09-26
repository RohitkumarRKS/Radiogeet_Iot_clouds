import { useState } from 'react';
import {
  Home, AlertTriangle, LayoutDashboard, FileText, MonitorSmartphone, Building2,
  Eye, Network, Router, Smartphone, Users, User, ArrowRightLeft, RefreshCw,
  FunctionSquare, GitBranch, Hexagon, Package, Folder, Flag, Activity,
  PaintRoller, Shield, CreditCard, Settings, X, Save, CheckSquare, Square,
  Crown
} from 'lucide-react';

// All sidebar items that can be controlled
const ALL_SIDEBAR_ITEMS = [
  { path: '/', label: 'Home', icon: Home, category: 'Core' },
  { path: '/alarms', label: 'Alarms', icon: AlertTriangle, category: 'Core' },
  { path: '/dashboards', label: 'Dashboards', icon: LayoutDashboard, category: 'Core' },
  { path: '/reporting', label: 'Reporting', icon: FileText, category: 'Core' },
  { path: '/devices', label: 'Devices', icon: MonitorSmartphone, category: 'Entities' },
  { path: '/assets', label: 'Assets', icon: Building2, category: 'Entities' },
  { path: '/entity-views', label: 'Entity Views', icon: Eye, category: 'Entities' },
  { path: '/gateways', label: 'Gateways', icon: Network, category: 'Entities' },
  { path: '/emulators', label: 'Emulators', icon: Router, category: 'Entities' },
  { path: '/device-profiles', label: 'Device Profiles', icon: Smartphone, category: 'Profiles' },
  { path: '/asset-profiles', label: 'Asset Profiles', icon: Building2, category: 'Profiles' },
  { path: '/customers', label: 'Customers', icon: Users, category: 'Management' },
  { path: '/users', label: 'Users', icon: User, category: 'Management' },
  { path: '/integrations', label: 'Integrations', icon: ArrowRightLeft, category: 'Integrations' },
  { path: '/data-converters', label: 'Data Converters', icon: RefreshCw, category: 'Integrations' },
  { path: '/calculated-fields', label: 'Calculated Fields', icon: FunctionSquare, category: 'Advanced' },
  { path: '/rule-chains', label: 'Rule Chains', icon: GitBranch, category: 'Advanced' },
  { path: '/edge-instances', label: 'Edge Instances', icon: Network, category: 'Edge' },
  { path: '/edge-rule-chains', label: 'Edge Rule Chains', icon: GitBranch, category: 'Edge' },
  { path: '/trendz-analytics', label: 'Trendz Analytics', icon: Hexagon, category: 'Advanced' },
  { path: '/ota-updates', label: 'OTA Updates', icon: Package, category: 'Advanced' },
  { path: '/audit-logs', label: 'Audit Logs', icon: FileText, category: 'Advanced' },
  { path: '/resources-library', label: 'Resource Library', icon: Folder, category: 'Resources' },
  { path: '/notification-center', label: 'Notification Center', icon: Flag, category: 'Core' },
  { path: '/mobile-center', label: 'Mobile Center', icon: Smartphone, category: 'Resources' },
  { path: '/api-usage', label: 'API Usage', icon: Activity, category: 'Advanced' },
  { path: '/white-labeling', label: 'White Labeling', icon: PaintRoller, category: 'Advanced' },
  { path: '/settings', label: 'Settings', icon: Settings, category: 'Core' },
  { path: '/security-settings', label: 'Security Settings', icon: Shield, category: 'Advanced' },
  { path: '/plan-and-billing', label: 'Plan & Billing', icon: CreditCard, category: 'Core' },
];

const CATEGORIES = ['Core', 'Entities', 'Profiles', 'Management', 'Integrations', 'Advanced', 'Edge', 'Resources'];

const CATEGORY_COLORS = {
  Core: '#3b82f6',
  Entities: '#10b981',
  Profiles: '#f59e0b',
  Management: '#8b5cf6',
  Integrations: '#06b6d4',
  Advanced: '#ef4444',
  Edge: '#ec4899',
  Resources: '#14b8a6',
};

export default function SidebarPermissionEditor({ tenant, onSave, onClose }) {
  // If tenant has null allowedSidebarItems, default to all selected
  const [selected, setSelected] = useState(() => {
    if (tenant?.allowedSidebarItems && Array.isArray(tenant.allowedSidebarItems)) {
      return new Set(tenant.allowedSidebarItems);
    }
    return new Set(ALL_SIDEBAR_ITEMS.map(i => i.path));
  });

  const allSelected = selected.size === ALL_SIDEBAR_ITEMS.length;
  const noneSelected = selected.size === 0;

  const toggleItem = (path) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ALL_SIDEBAR_ITEMS.map(i => i.path)));
    }
  };

  const toggleCategory = (category) => {
    const categoryItems = ALL_SIDEBAR_ITEMS.filter(i => i.category === category);
    const allCategorySelected = categoryItems.every(i => selected.has(i.path));

    setSelected(prev => {
      const next = new Set(prev);
      categoryItems.forEach(i => {
        if (allCategorySelected) {
          next.delete(i.path);
        } else {
          next.add(i.path);
        }
      });
      return next;
    });
  };

  const handleSave = () => {
    if (allSelected) {
      onSave(null); // null means all allowed
    } else {
      onSave(Array.from(selected));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid rgba(148,163,184,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>
            Sidebar Permissions
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
            {tenant.name} — {selected.size} of {ALL_SIDEBAR_ITEMS.length} items enabled
          </p>
        </div>
        <button onClick={onClose}
          style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      {/* Select All Toggle */}
      <div style={{
        padding: '12px 24px', borderBottom: '1px solid rgba(148,163,184,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={toggleAll} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.2)',
          background: allSelected ? 'rgba(139,92,246,0.12)' : 'transparent',
          color: allSelected ? '#a78bfa' : '#94a3b8', fontSize: '12px',
          fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        }}>
          {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        {allSelected && (
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
            ✓ All items accessible
          </span>
        )}
      </div>

      {/* Items List - Grouped by Category */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px' }}>
        {CATEGORIES.map(category => {
          const categoryItems = ALL_SIDEBAR_ITEMS.filter(i => i.category === category);
          if (categoryItems.length === 0) return null;
          const allCategorySelected = categoryItems.every(i => selected.has(i.path));
          const someCategorySelected = categoryItems.some(i => selected.has(i.path));
          const catColor = CATEGORY_COLORS[category] || '#94a3b8';

          return (
            <div key={category} style={{ marginBottom: '16px' }}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  padding: '8px 10px', borderRadius: '8px', border: 'none',
                  background: `${catColor}08`, color: catColor,
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${catColor}15`}
                onMouseLeave={e => e.currentTarget.style.background = `${catColor}08`}
              >
                {allCategorySelected ? <CheckSquare size={13} /> : someCategorySelected ? <CheckSquare size={13} style={{ opacity: 0.5 }} /> : <Square size={13} />}
                {category}
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#64748b', fontWeight: 500, textTransform: 'none' }}>
                  {categoryItems.filter(i => selected.has(i.path)).length}/{categoryItems.length}
                </span>
              </button>

              {/* Category Items */}
              <div style={{ marginTop: '4px', paddingLeft: '6px' }}>
                {categoryItems.map(item => {
                  const Icon = item.icon;
                  const isSelected = selected.has(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => toggleItem(item.path)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '8px 10px', borderRadius: '6px', border: 'none',
                        background: isSelected ? 'rgba(139,92,246,0.06)' : 'transparent',
                        color: isSelected ? '#e2e8f0' : '#64748b',
                        fontSize: '13px', cursor: 'pointer',
                        transition: 'all 0.15s', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = isSelected ? 'rgba(139,92,246,0.1)' : 'rgba(148,163,184,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = isSelected ? 'rgba(139,92,246,0.06)' : 'transparent'}
                    >
                      {isSelected ? (
                        <CheckSquare size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                      ) : (
                        <Square size={14} style={{ color: '#475569', flexShrink: 0 }} />
                      )}
                      <Icon size={15} style={{ color: isSelected ? catColor : '#475569', flexShrink: 0 }} />
                      <span style={{ fontWeight: isSelected ? 500 : 400 }}>{item.label}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#475569', fontFamily: 'monospace' }}>
                        {item.path}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid rgba(148,163,184,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {selected.size === ALL_SIDEBAR_ITEMS.length
            ? 'All sidebar items will be visible'
            : `${selected.size} items will be visible, ${ALL_SIDEBAR_ITEMS.length - selected.size} hidden`
          }
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid rgba(148,163,184,0.15)', background: 'transparent',
              color: '#94a3b8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
            Cancel
          </button>
          <button onClick={handleSave}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            <Save size={14} />
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
}

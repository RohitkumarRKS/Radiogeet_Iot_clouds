import { useState, useEffect } from 'react';
import {
  Building, Search, Plus, Edit2, Trash2, Users, Cpu, LayoutDashboard,
  ChevronLeft, ChevronRight, X, Save, Crown, Shield
} from 'lucide-react';
import api from '../../api/axios';
import SidebarPermissionEditor from '../../components/Admin/SidebarPermissionEditor';

export default function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showSidebarEditor, setShowSidebarEditor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [form, setForm] = useState({ name: '', description: '', plan: 'FREE', country: '', city: '' });

  useEffect(() => {
    fetchTenants();
  }, [page, search]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/tenants', { params: { page, pageSize: 15, search: search || undefined } });
      setTenants(res.data.data);
      setTotal(res.data.totalElements);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/tenants', form);
      setShowCreateModal(false);
      setForm({ name: '', description: '', plan: 'FREE', country: '', city: '' });
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create tenant');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/admin/tenants/${editingTenant.id}`, form);
      setEditingTenant(null);
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update tenant');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/tenants/${id}`);
      setDeleteConfirm(null);
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  const handleSaveSidebarPermissions = async (tenantId, allowedItems) => {
    try {
      await api.put(`/admin/tenants/${tenantId}`, { allowedSidebarItems: allowedItems });
      setShowSidebarEditor(null);
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update sidebar permissions');
    }
  };

  const openEditModal = (tenant) => {
    setForm({
      name: tenant.name,
      description: tenant.description || '',
      plan: tenant.plan,
      country: tenant.country || '',
      city: tenant.city || '',
    });
    setEditingTenant(tenant);
  };

  const PLAN_COLORS = {
    FREE: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
    STARTER: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    PRO: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    ENTERPRISE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f1f5f9' }}>Tenant Management</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{total} tenant{total !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button
          onClick={() => { setForm({ name: '', description: '', plan: 'FREE', country: '', city: '' }); setShowCreateModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Plus size={16} />
          Create Tenant
        </button>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
      }}>
        <Search size={16} style={{ color: '#64748b' }} />
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#f1f5f9', fontSize: '14px',
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '14px', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
              {['Tenant Name', 'Plan', 'Users', 'Devices', 'Dashboards', 'Sidebar', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left', fontSize: '11px',
                  fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No tenants found</td></tr>
            ) : tenants.map(tenant => {
              const planStyle = PLAN_COLORS[tenant.plan] || PLAN_COLORS.FREE;
              return (
                <tr key={tenant.id} style={{
                  borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Building size={16} style={{ color: '#8b5cf6' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>{tenant.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{tenant.description || 'No description'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                      borderRadius: '6px', color: planStyle.color, background: planStyle.bg,
                      textTransform: 'uppercase', letterSpacing: '0.3px',
                    }}>{tenant.plan}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '14px' }}>
                      <Users size={14} style={{ color: '#3b82f6' }} />
                      {tenant.userCount || 0}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '14px' }}>
                      <Cpu size={14} style={{ color: '#10b981' }} />
                      {tenant.deviceCount || 0}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '14px' }}>
                      <LayoutDashboard size={14} style={{ color: '#f59e0b' }} />
                      {tenant.dashboardCount || 0}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => setShowSidebarEditor(tenant)}
                      style={{
                        padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.3)',
                        background: 'rgba(139,92,246,0.08)', color: '#a78bfa', fontSize: '11px',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                    >
                      <Shield size={12} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
                      {tenant.allowedSidebarItems ? `${tenant.allowedSidebarItems.length} items` : 'All'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(tenant)}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none',
                          background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                        title="Edit Tenant"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(tenant)}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        title="Delete Tenant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 15 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            padding: '12px', borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.15)', background: 'transparent', color: '#94a3b8', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Page {page + 1} of {Math.ceil(total / 15)}</span>
            <button disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.15)', background: 'transparent', color: '#94a3b8', cursor: (page + 1) * 15 >= total ? 'not-allowed' : 'pointer', opacity: (page + 1) * 15 >= total ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(showCreateModal || editingTenant) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => { setShowCreateModal(false); setEditingTenant(null); }}>
          <div style={{
            background: '#1e293b', borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '480px', border: '1px solid rgba(148,163,184,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
                {editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setEditingTenant(null); }}
                style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Tenant Name *', key: 'name', placeholder: 'Enter tenant name' },
                { label: 'Description', key: 'description', placeholder: 'Brief description' },
                { label: 'Country', key: 'country', placeholder: 'Country' },
                { label: 'City', key: 'city', placeholder: 'City' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>{field.label}</label>
                  <input
                    type="text"
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.5)',
                      color: '#f1f5f9', fontSize: '14px', outline: 'none',
                      transition: 'border-color 0.15s', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.15)'}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Plan</label>
                <select
                  value={form.plan}
                  onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.8)',
                    color: '#f1f5f9', fontSize: '14px', outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowCreateModal(false); setEditingTenant(null); }}
                style={{
                  padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)',
                  background: 'transparent', color: '#94a3b8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button onClick={editingTenant ? handleUpdate : handleCreate}
                disabled={!form.name.trim()}
                style={{
                  padding: '10px 18px', borderRadius: '8px', border: 'none',
                  background: form.name.trim() ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : '#334155',
                  color: '#fff', fontSize: '13px', fontWeight: 600, cursor: form.name.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                <Save size={14} />
                {editingTenant ? 'Save Changes' : 'Create Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setDeleteConfirm(null)}>
          <div style={{
            background: '#1e293b', borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '420px', border: '1px solid rgba(239,68,68,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(239,68,68,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <Trash2 size={24} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
                Delete Tenant?
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                This will permanently delete <strong style={{ color: '#f1f5f9' }}>{deleteConfirm.name}</strong> and all associated users, devices, dashboards, and data. This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: '1px solid rgba(148,163,184,0.15)', background: 'transparent',
                  color: '#94a3b8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                Delete Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Permission Editor Modal */}
      {showSidebarEditor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowSidebarEditor(null)}>
          <div style={{
            background: '#1e293b', borderRadius: '16px', padding: '0',
            width: '100%', maxWidth: '600px', maxHeight: '80vh',
            border: '1px solid rgba(148,163,184,0.15)', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            <SidebarPermissionEditor
              tenant={showSidebarEditor}
              onSave={(items) => handleSaveSidebarPermissions(showSidebarEditor.id, items)}
              onClose={() => setShowSidebarEditor(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

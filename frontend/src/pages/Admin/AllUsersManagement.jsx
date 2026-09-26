import { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Edit2, Trash2, Crown, Shield, User, UserCheck, UserX,
  ChevronLeft, ChevronRight, X, Save, Building, Filter, LayoutDashboard
} from 'lucide-react';
import api from '../../api/axios';

const ROLE_BADGES = {
  SYS_ADMIN: { label: 'Super Admin', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: Crown },
  TENANT_ADMIN: { label: 'Admin', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Shield },
  CUSTOMER_USER: { label: 'User', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: User },
};

export default function AllUsersManagement() {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filterRole, setFilterRole] = useState('');
  const [filterTenant, setFilterTenant] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    role: 'CUSTOMER_USER', tenantId: '', isActive: true,
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search, filterRole, filterTenant, filterActive]);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/admin/tenants', { params: { pageSize: 100 } });
      setTenants(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, pageSize: 15, search: search || undefined };
      if (filterRole) params.role = filterRole;
      if (filterTenant) params.tenantId = filterTenant;
      if (filterActive) params.isActive = filterActive;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data);
      setTotal(res.data.totalElements);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/users', form);
      setShowCreateModal(false);
      setForm({ email: '', password: '', firstName: '', lastName: '', role: 'CUSTOMER_USER', tenantId: '', isActive: true });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = { ...form };
      if (!updateData.password) delete updateData.password;
      await api.put(`/admin/users/${editingUser.id}`, updateData);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const openEditModal = (user) => {
    setForm({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName || '',
      role: user.role,
      tenantId: user.tenantId || '',
      isActive: user.isActive !== false,
    });
    setEditingUser(user);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f1f5f9' }}>All Users</h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{total} user{total !== 1 ? 's' : ''} across all tenants</p>
          </div>
        </div>
        <button
          onClick={() => { setForm({ email: '', password: '', firstName: '', lastName: '', role: 'CUSTOMER_USER', tenantId: tenants[0]?.id || '', isActive: true }); setShowCreateModal(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Plus size={16} />
          Create User
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '10px', padding: '10px 14px',
        }}>
          <Search size={16} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: '14px' }}
          />
        </div>

        <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(0); }}
          style={{
            padding: '10px 14px', borderRadius: '10px',
            border: '1px solid rgba(148,163,184,0.1)', background: 'rgba(30,41,59,0.5)',
            color: '#f1f5f9', fontSize: '13px', cursor: 'pointer', outline: 'none',
          }}>
          <option value="">All Roles</option>
          <option value="SYS_ADMIN">Super Admin</option>
          <option value="TENANT_ADMIN">Admin</option>
          <option value="CUSTOMER_USER">Customer User</option>
        </select>

        <select value={filterTenant} onChange={e => { setFilterTenant(e.target.value); setPage(0); }}
          style={{
            padding: '10px 14px', borderRadius: '10px',
            border: '1px solid rgba(148,163,184,0.1)', background: 'rgba(30,41,59,0.5)',
            color: '#f1f5f9', fontSize: '13px', cursor: 'pointer', outline: 'none', maxWidth: '200px',
          }}>
          <option value="">All Tenants</option>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <select value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(0); }}
          style={{
            padding: '10px 14px', borderRadius: '10px',
            border: '1px solid rgba(148,163,184,0.1)', background: 'rgba(30,41,59,0.5)',
            color: '#f1f5f9', fontSize: '13px', cursor: 'pointer', outline: 'none',
          }}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
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
              {['User', 'Email', 'Role', 'Tenant', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left', fontSize: '11px',
                  fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No users found</td></tr>
            ) : users.map(u => {
              const role = ROLE_BADGES[u.role] || ROLE_BADGES.CUSTOMER_USER;
              const RoleIcon = role.icon;
              return (
                <tr key={u.id} style={{
                  borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
                  transition: 'background 0.15s',
                  opacity: u.isActive === false ? 0.6 : 1,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: u.role === 'SYS_ADMIN'
                          ? 'linear-gradient(135deg, #ef4444, #f97316)'
                          : u.role === 'TENANT_ADMIN'
                            ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                            : 'linear-gradient(135deg, #475569, #64748b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, color: '#fff',
                      }}>
                        {(u.firstName?.[0] || '').toUpperCase()}{(u.lastName?.[0] || '').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          ID: {u.id?.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#cbd5e1', fontSize: '13px' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                      borderRadius: '6px', color: role.color, background: role.bg,
                      textTransform: 'uppercase', letterSpacing: '0.3px',
                    }}>
                      <RoleIcon size={11} />
                      {role.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' }}>
                      <Building size={13} style={{ color: '#8b5cf6' }} />
                      {u.Tenant?.name || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleToggleActive(u)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 700, padding: '4px 10px',
                        borderRadius: '6px', border: 'none', cursor: 'pointer',
                        color: u.isActive !== false ? '#10b981' : '#ef4444',
                        background: u.isActive !== false ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        transition: 'all 0.15s',
                      }}
                      title={u.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                    >
                      {u.isActive !== false ? <UserCheck size={12} /> : <UserX size={12} />}
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {u.role === 'CUSTOMER_USER' && (
                        <button
                          onClick={async () => {
                            if (confirm(`Promote "${u.firstName} ${u.lastName}" to Tenant Admin?`)) {
                              await api.put(`/admin/users/${u.id}`, { role: 'TENANT_ADMIN' });
                              fetchUsers();
                            }
                          }}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', border: 'none',
                            background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                          title="Promote to Tenant Admin"
                        >
                          <Shield size={12} /> Make Admin
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(u)}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none',
                          background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                        title="Edit User"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        style={{
                          padding: '6px', borderRadius: '6px', border: 'none',
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        title="Delete User"
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
      {(showCreateModal || editingUser) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => { setShowCreateModal(false); setEditingUser(null); }}>
          <div style={{
            background: '#1e293b', borderRadius: '16px', padding: '28px',
            width: '100%', maxWidth: '500px', border: '1px solid rgba(148,163,184,0.15)',
            maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button onClick={() => { setShowCreateModal(false); setEditingUser(null); }}
                style={{ padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>First Name *</label>
                  <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="First name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Last Name</label>
                  <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Last name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com" disabled={!!editingUser}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: editingUser ? 'rgba(15,23,42,0.3)' : 'rgba(15,23,42,0.5)', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box', opacity: editingUser ? 0.7 : 1 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.5)', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Role *</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                    <option value="SYS_ADMIN">Super Admin</option>
                    <option value="TENANT_ADMIN">Tenant Admin</option>
                    <option value="CUSTOMER_USER">Customer User</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Tenant *</label>
                  <select value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.8)', color: '#f1f5f9', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Select tenant...</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {editingUser && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      style={{ accentColor: '#8b5cf6' }}
                    />
                    <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Account Active</span>
                  </label>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowCreateModal(false); setEditingUser(null); }}
                style={{
                  padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)',
                  background: 'transparent', color: '#94a3b8', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                Cancel
              </button>
              <button onClick={editingUser ? handleUpdate : handleCreate}
                disabled={!form.firstName.trim() || !form.tenantId || (!editingUser && (!form.email.trim() || !form.password.trim()))}
                style={{
                  padding: '10px 18px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: (!form.firstName.trim() || !form.tenantId) ? 0.5 : 1,
                }}>
                <Save size={14} />
                {editingUser ? 'Save Changes' : 'Create User'}
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
                Delete User?
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Permanently delete <strong style={{ color: '#f1f5f9' }}>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong> ({deleteConfirm.email})?
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.15)', background: 'transparent', color: '#94a3b8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

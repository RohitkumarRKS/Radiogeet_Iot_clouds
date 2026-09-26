import { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Edit2, Trash2, Shield, UserCheck, UserX,
  LayoutDashboard, Check, X, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import api from '../../api/axios';
import SidebarPermissionEditor from '../../components/Admin/SidebarPermissionEditor';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CUSTOMER_USER',
    assignedDashboards: [],
    allowedSidebarItems: null,
  });

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'dashboards' | 'permissions'

  useEffect(() => {
    fetchUsers();
    fetchDashboards();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/api/users', { params });
      setUsers(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboards = async () => {
    try {
      const res = await api.get('/api/dashboards');
      setDashboards(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboards:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users', form);
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.put(`/api/users/${selectedUser.id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        isActive: form.isActive,
        assignedDashboards: form.assignedDashboards,
        allowedSidebarItems: form.allowedSidebarItems,
        ...(form.password ? { password: form.password } : {}),
      });
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to delete user "${user.email}"?`)) return;
    try {
      await api.delete(`/api/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/api/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive !== false,
      assignedDashboards: user.assignedDashboards || [],
      allowedSidebarItems: user.allowedSidebarItems || null,
    });
    setActiveTab('details');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'CUSTOMER_USER',
      assignedDashboards: [],
      allowedSidebarItems: null,
    });
    setActiveTab('details');
  };

  const toggleDashboardAssignment = (dashId) => {
    const current = form.assignedDashboards || [];
    if (current.includes(dashId)) {
      setForm({ ...form, assignedDashboards: current.filter(id => id !== dashId) });
    } else {
      setForm({ ...form, assignedDashboards: [...current, dashId] });
    }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 700 }}>
            <Users style={{ color: 'var(--color-primary, #6366f1)' }} /> Tenant Users Management
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--color-text-secondary, #94a3b8)', marginTop: 4 }}>
            Manage Customer Operators and Administrators within your organization
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={fetchUsers} title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="data-table-container">
        <div className="data-table-toolbar" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-secondary)' }} />
            <input
              className="search-input"
              style={{ width: '100%', paddingLeft: 36, height: 40, borderRadius: 8 }}
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 200, height: 40 }}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="TENANT_ADMIN">Tenant Admin</option>
            <option value="CUSTOMER_USER">Customer User</option>
          </select>
        </div>

        {/* Data Table */}
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Assigned Dashboards</th>
              <th>Created At</th>
              <th style={{ width: 140, minWidth: 140, textAlign: 'right', paddingRight: 20 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>Loading users...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-secondary)' }}>No users found.</td></tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'TENANT_ADMIN' ? 'badge-primary' : 'badge-info'}`}>
                      {u.role === 'TENANT_ADMIN' ? 'Tenant Admin' : 'Customer User'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.isActive !== false ? 'btn-ghost' : 'btn-danger'}`}
                      onClick={() => toggleStatus(u)}
                      title="Click to toggle account active status"
                      style={{ padding: '2px 8px', fontSize: 12 }}
                    >
                      {u.isActive !== false ? (
                        <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UserCheck size={14} /> Active
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UserX size={14} /> Disabled
                        </span>
                      )}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <LayoutDashboard size={14} style={{ color: 'var(--color-primary)' }} />
                      <span>{(u.assignedDashboards || []).length} assigned</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit User & Permissions">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(u)} title="Delete User">
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} /> Create New User
              </h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">First Name *</label>
                    <input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required autoFocus />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="user@company.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="CUSTOMER_USER">Customer User (Restricted access)</option>
                    <option value="TENANT_ADMIN">Tenant Administrator (Full tenant access)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (Details, Dashboards, Permissions) */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 650, width: '90%' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit2 size={18} /> Edit User — {selectedUser.email}
                </h2>
              </div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0 16px', gap: 16, background: 'var(--color-bg-secondary)' }}>
              <button
                className={`btn btn-ghost ${activeTab === 'details' ? 'active' : ''}`}
                style={{ borderRadius: 0, borderBottom: activeTab === 'details' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('details')}
              >
                User Details
              </button>
              {selectedUser.role === 'CUSTOMER_USER' && (
                <>
                  <button
                    className={`btn btn-ghost ${activeTab === 'dashboards' ? 'active' : ''}`}
                    style={{ borderRadius: 0, borderBottom: activeTab === 'dashboards' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                    onClick={() => setActiveTab('dashboards')}
                  >
                    Assigned Dashboards ({(form.assignedDashboards || []).length})
                  </button>
                  <button
                    className={`btn btn-ghost ${activeTab === 'permissions' ? 'active' : ''}`}
                    style={{ borderRadius: 0, borderBottom: activeTab === 'permissions' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                    onClick={() => setActiveTab('permissions')}
                  >
                    Sidebar Permissions
                  </button>
                </>
              )}
            </div>

            <form onSubmit={handleUpdate}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {activeTab === 'details' && (
                  <>
                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label className="form-label">First Name</label>
                        <input className="form-input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                      </div>
                      <div>
                        <label className="form-label">Last Name</label>
                        <input className="form-input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password (leave blank to keep unchanged)</label>
                      <input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} placeholder="••••••••" />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        type="checkbox"
                        id="user-active"
                        checked={form.isActive}
                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      />
                      <label htmlFor="user-active" style={{ cursor: 'pointer', fontWeight: 500 }}>
                        Account Active (uncheck to suspend user access)
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'dashboards' && (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                      Select which dashboards this customer user is allowed to view:
                    </p>
                    {dashboards.length === 0 ? (
                      <div style={{ color: 'var(--color-text-secondary)', padding: 16 }}>No dashboards available in tenant.</div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {dashboards.map(dash => {
                          const isAssigned = (form.assignedDashboards || []).includes(dash.id);
                          return (
                            <div
                              key={dash.id}
                              onClick={() => toggleDashboardAssignment(dash.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: 8,
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                background: isAssigned ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <LayoutDashboard size={18} style={{ color: isAssigned ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                                <div>
                                  <div style={{ fontWeight: 600 }}>{dash.title}</div>
                                  {dash.description && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{dash.description}</div>}
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => {}} // handled by parent div click
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div>
                    <SidebarPermissionEditor
                      value={form.allowedSidebarItems}
                      onChange={items => setForm({ ...form, allowedSidebarItems: items })}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

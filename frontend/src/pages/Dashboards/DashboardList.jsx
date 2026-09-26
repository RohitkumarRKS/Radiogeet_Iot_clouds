import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { LayoutDashboard, Plus, Trash2, Clock, RefreshCw, Search, Sparkles, Download, Edit2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDown, HelpCircle, X, Image as ImageIcon, Link, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardList() {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '', companyName: '' });
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [includeCustomers, setIncludeCustomers] = useState(true);
  const [hideInMobile, setHideInMobile] = useState(false);
  const navigate = useNavigate();

  // Search, pagination & selection state
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');

  const fetchDashboards = useCallback(() => {
    setLoading(true);
    api.get('/dashboards', { params: { page, pageSize, search: search || undefined } })
      .then(r => {
        setDashboards(r.data.data || []);
        setTotal(r.data.totalElements || r.data.data?.length || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, pageSize, search]);

  useEffect(() => { fetchDashboards(); }, [fetchDashboards]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        image: form.image,
        configuration: {
          logoUrl: form.image,
          companyName: form.companyName || form.title,
          widgets: [],
          gridSettings: { columns: 24, margin: 10 }
        }
      };
      const res = await api.post('/dashboards', payload);
      setShowModal(false);
      setForm({ title: '', description: '', image: '', companyName: '' });
      navigate(`/dashboards/${res.data.id}`);
    } catch (err) { alert(err.response?.data?.error || 'Failed to create dashboard'); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this dashboard?')) return;
    await api.delete(`/dashboards/${id}`);
    fetchDashboards();
  };

  const handleExportJson = (dashboard, e) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dashboard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dashboard_${dashboard.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected dashboards?`)) return;
    for (const id of selectedIds) {
      try { await api.delete(`/dashboards/${id}`); } catch { /* ignore */ }
    }
    setSelectedIds([]);
    fetchDashboards();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === dashboards.length && dashboards.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dashboards.map(d => d.id));
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const startItem = total > 0 ? page * pageSize + 1 : 0;
  const endItem = Math.min((page + 1) * pageSize, total);

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#FFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#334155', margin: 0 }}>Dashboards</h1>
          
          {/* Toggle include customer entities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setIncludeCustomers(!includeCustomers)}>
            <div style={{
              width: 36, height: 20, borderRadius: 10,
              background: includeCustomers ? '#F25C32' : '#CBD5E1',
              position: 'relative', transition: 'background 0.2s'
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', background: '#FFF',
                position: 'absolute', top: 2, left: includeCustomers ? 18 : 2,
                transition: 'left 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {includeCustomers && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F25C32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
            </div>
            <span style={{ fontSize: '14px', color: '#475569' }}>Include customer entities</span>
          </div>

          {/* Bulk actions when selected */}
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', borderLeft: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>{selectedIds.length} selected</span>
              <button style={{ background: '#EF4444', border: 'none', color: '#FFF', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }} onClick={handleBulkDelete}>
                <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Delete
              </button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={fetchDashboards} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', padding: '4px' }} title="Refresh">
            <RefreshCw size={20} />
          </button>
          
          {/* Search toggle */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSearchInput(!showSearchInput)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showSearchInput ? '#0D9488' : '#64748B', display: 'flex', alignItems: 'center', padding: '4px' }} title="Search">
              <Search size={20} />
            </button>
            {showSearchInput && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                <input
                  type="text"
                  placeholder="Search dashboards..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  autoFocus
                  style={{ border: 'none', outline: 'none', fontSize: '14px', width: 200, padding: '4px' }}
                />
                {search && (
                  <button onClick={() => { setSearch(''); setPage(0); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <button className="btn" style={{ background: '#0D9488', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px' }} onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add dashboard
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div style={{ flex: 1, background: '#FFF', display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', color: '#334155' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600 }}>
              <th style={{ padding: '16px 24px', width: '40px' }}>
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={toggleSelectAll}>
                  {selectedIds.length > 0 && selectedIds.length === dashboards.length ? (
                    <CheckSquare size={18} color="#0D9488" />
                  ) : (
                    <Square size={18} color="#94A3B8" />
                  )}
                </div>
              </th>
              <th style={{ padding: '16px 12px', cursor: 'pointer' }} onClick={() => { setSortDir(prev => prev === 'ASC' ? 'DESC' : 'ASC'); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Created time <ArrowDown size={14} style={{ transform: sortDir === 'ASC' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </th>
              <th style={{ padding: '16px 12px' }}>Title</th>
              <th style={{ padding: '16px 12px' }}>Customer name</th>
              <th style={{ padding: '16px 12px' }}>Groups</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>Loading...</td>
              </tr>
            ) : dashboards.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
                  {search ? `No dashboards matching "${search}"` : 'No dashboards found.'}
                </td>
              </tr>
            ) : (
              dashboards.map((d) => {
                const isSelected = selectedIds.includes(d.id);
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s', background: isSelected ? 'rgba(13, 148, 136, 0.05)' : undefined }} onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }} onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '16px 24px' }} onClick={(e) => toggleSelect(d.id, e)}>
                      <div style={{ cursor: 'pointer' }}>
                        {isSelected ? <CheckSquare size={18} color="#0D9488" /> : <Square size={18} color="#CBD5E1" />}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', color: '#475569' }}>
                      {new Date(d.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span onClick={() => navigate(`/dashboards/${d.id}`)} style={{ cursor: 'pointer', color: '#0F172A', fontWeight: 500 }}>
                        {d.title}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', color: '#64748B' }}>
                      {d.customerName || ''}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ background: '#E2E8F0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', color: '#475569' }}>
                        Customer dashboards
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', color: '#64748B' }}>
                        <Download size={18} style={{ cursor: 'pointer' }} onClick={(e) => handleExportJson(d, e)} title="Export JSON" />
                        <Edit2 size={18} style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboards/${d.id}`)} title="Edit" />
                        <Trash2 size={18} style={{ cursor: 'pointer', color: '#EF4444' }} onClick={(e) => handleDelete(e, d.id)} title="Delete" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Fill remaining space */}
        <div style={{ flex: 1, background: '#FFF' }}></div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid #E2E8F0', background: '#FFF', gap: '24px', fontSize: '13px', color: '#475569' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
              style={{ padding: '4px', border: '1px solid #CBD5E1', borderRadius: '4px', background: '#FFF', color: '#334155', cursor: 'pointer' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
          <div>
            {startItem} - {endItem} of {total}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setPage(0)} disabled={page === 0} style={{ background: 'none', border: 'none', cursor: page === 0 ? 'default' : 'pointer', color: page === 0 ? '#CBD5E1' : '#64748B', padding: 4 }} title="First page">
              <ChevronsLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ background: 'none', border: 'none', cursor: page === 0 ? 'default' : 'pointer', color: page === 0 ? '#CBD5E1' : '#64748B', padding: 4 }} title="Previous page">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ background: 'none', border: 'none', cursor: page >= totalPages - 1 ? 'default' : 'pointer', color: page >= totalPages - 1 ? '#CBD5E1' : '#64748B', padding: 4 }} title="Next page">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} style={{ background: 'none', border: 'none', cursor: page >= totalPages - 1 ? 'default' : 'pointer', color: page >= totalPages - 1 ? '#CBD5E1' : '#64748B', padding: 4 }} title="Last page">
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div className="modal" style={{ background: '#FFF', width: '100%', maxWidth: '680px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ background: '#0F1E36', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#FFF', flexShrink: 0 }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#FFF' }}>Add dashboard</h2>
              <div style={{ display: 'flex', gap: '16px', color: '#FFF', alignItems: 'center' }}>
                <HelpCircle size={20} style={{ cursor: 'pointer', opacity: 0.8 }} />
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
                
                {/* Title */}
                <div style={{ background: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  <input 
                    type="text" 
                    placeholder="Title*" 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    required 
                    autoFocus 
                    style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 16px', fontSize: '15px', color: '#0F172A', outline: 'none', fontWeight: 500 }}
                  />
                </div>

                {/* Description */}
                <div style={{ background: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  <textarea 
                    placeholder="Description" 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 16px', fontSize: '14px', color: '#0F172A', outline: 'none', resize: 'vertical', minHeight: '80px' }}
                  />
                </div>

                {/* Mobile Application Settings */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '18px', background: '#FFF' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Mobile application settings</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: 36, height: 16, background: hideInMobile ? '#2563EB' : '#CBD5E1', borderRadius: 8, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setHideInMobile(!hideInMobile)}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: hideInMobile ? '#1D4ED8' : '#64748B', position: 'absolute', top: -3, left: hideInMobile ? 18 : -2, boxShadow: '0 2px 4px rgba(0,0,0,0.3)', transition: 'left 0.2s' }}></div>
                    </div>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>Hide dashboard in mobile application</span>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Dashboard order in mobile application" 
                      style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 16px', fontSize: '14px', color: '#334155', outline: 'none' }}
                    />
                  </div>

                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px', fontWeight: 500 }}>
                    Company Logo / Dashboard Image (PNG / SVG)
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: 100, height: 100, border: form.image ? '1px solid #2563EB' : '1px dashed #CBD5E1', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '11px', textAlign: 'center', background: '#F8FAFC', overflow: 'hidden', padding: 4 }}>
                        {form.image ? (
                          <img src={form.image} alt="Company Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          'No logo selected'
                        )}
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                        <label style={{ flex: 1, border: '1px solid #DBEAFE', borderRadius: '6px', background: '#EFF6FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2563EB', fontWeight: 600, fontSize: '13px', cursor: 'pointer', gap: '4px', padding: '12px' }}>
                          <ImageIcon size={22} style={{ color: '#2563EB' }} />
                          Browse PNG / SVG
                          <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                        
                        <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} style={{ flex: 1, border: '1px solid #DBEAFE', borderRadius: '6px', background: '#EFF6FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2563EB', fontWeight: 600, fontSize: '13px', cursor: 'pointer', gap: '4px', padding: '12px' }}>
                          <Link size={22} style={{ color: '#2563EB' }} />
                          Set Link URL
                        </button>
                      </div>
                    </div>

                    {showUrlInput && (
                      <input
                        type="text"
                        placeholder="Paste Image URL (e.g. https://domain.com/logo.png)"
                        value={form.image}
                        onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', background: '#FFFFFF', outline: 'none' }}
                      />
                    )}
                  </div>
                </div>

                {/* Owner and groups */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '18px', background: '#FFF' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Owner and groups</div>
                  
                  <div style={{ background: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1', position: 'relative', marginBottom: '16px' }}>
                    <div style={{ position: 'absolute', top: 6, left: 14, fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Owner*</div>
                    <input 
                      type="text" 
                      defaultValue={user?.email || 'admin@radiogeet.com'}
                      style={{ width: '100%', background: 'transparent', border: 'none', padding: '22px 14px 6px 14px', fontSize: '14px', color: '#0F172A', outline: 'none', fontWeight: 500 }}
                    />
                    <X size={16} style={{ position: 'absolute', top: 18, right: 14, color: '#64748B', cursor: 'pointer' }} />
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <input 
                      type="text" 
                      placeholder="Groups"
                      style={{ width: '100%', background: 'transparent', border: 'none', padding: '12px 14px', fontSize: '14px', color: '#0F172A', outline: 'none' }}
                    />
                  </div>
                </div>

              </div>
              
              {/* Sticky Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', background: '#F8FAFC', flexShrink: 0 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#475569', fontWeight: 600, fontSize: '13px', padding: '8px 20px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#2563EB', border: 'none', borderRadius: '6px', color: '#FFF', fontWeight: 600, fontSize: '13px', padding: '8px 26px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', transition: 'all 0.2s' }}>
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

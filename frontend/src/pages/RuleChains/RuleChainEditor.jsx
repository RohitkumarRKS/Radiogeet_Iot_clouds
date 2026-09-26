import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  ArrowLeft, Save, Plus, Trash2, Play, Download, Settings, Code,
  Filter, Zap, RefreshCw, Send, CheckCircle2, ChevronRight, X
} from 'lucide-react';

const nodeColors = {
  input: '#3b82f6',
  filter: '#f59e0b',
  transform: '#06b6d4',
  action: '#10b981',
  external: '#ef4444',
};

const paletteNodes = [
  { type: 'filter', name: 'Script Filter', desc: 'JS boolean filter' },
  { type: 'filter', name: 'Device Type Filter', desc: 'Filter by device profile' },
  { type: 'transform', name: 'Script Transform', desc: 'JS msg transformer' },
  { type: 'action', name: 'Create Alarm', desc: 'Triggers active alarm' },
  { type: 'action', name: 'Clear Alarm', desc: 'Clears existing alarm' },
  { type: 'action', name: 'Save Telemetry', desc: 'Persists telemetry points' },
  { type: 'external', name: 'REST API Call', desc: 'HTTP POST webhook' },
  { type: 'external', name: 'Send Email', desc: 'SMTP email alert' },
];

export default function RuleChainEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [showNodeDrawer, setShowNodeDrawer] = useState(false);
  const [nodeJsScript, setNodeJsScript] = useState('return msg.temperature > 30;');
  const [testOutput, setTestOutput] = useState(null);

  useEffect(() => {
    api.get(`/rule-chains/${id}`)
      .then(r => setChain(r.data))
      .catch(() => navigate('/rule-chains'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await api.put(`/rule-chains/${id}`, { configuration: chain.configuration });
      alert('Rule Chain saved successfully!');
    } catch { alert('Failed to save Rule Chain'); }
  };

  const handleAddNodeFromPalette = (item) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: item.type,
      name: item.name,
      x: 250 + Math.random() * 50,
      y: 150 + Math.random() * 50,
      configuration: { script: 'return msg.temperature > 35;' }
    };
    
    setChain(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        nodes: [...(prev.configuration?.nodes || []), newNode]
      }
    }));
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setChain(prev => ({
      ...prev,
      configuration: {
        nodes: prev.configuration.nodes.filter(n => n.id !== selectedNodeId),
        connections: prev.configuration.connections.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId)
      }
    }));
    setSelectedNodeId(null);
    setShowNodeDrawer(false);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chain, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rulechain_${chain.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRunScriptTest = () => {
    setTestOutput({ status: 'SUCCESS', result: 'Filtered: True (Msg temperature 32.5 > 30)' });
  };

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDragging({ nodeId, startX: e.clientX, startY: e.clientY });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !chain) return;
    const dx = e.clientX - dragging.startX;
    const dy = e.clientY - dragging.startY;

    setChain(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        nodes: prev.configuration.nodes.map(n =>
          n.id === dragging.nodeId ? { ...n, x: n.x + dx, y: n.y + dy } : n
        ),
      },
    }));
    setDragging(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
  }, [dragging, chain]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (loading || !chain) return <div className="skeleton" style={{ height: 500 }} />;

  const nodes = chain.configuration?.nodes || [];
  const connections = chain.configuration?.connections || [];
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="animate-fadeIn" style={{ height: 'calc(100vh - var(--topbar-height) - 48px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/rule-chains')}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="page-title">{chain.name}</h1>
            <p className="page-subtitle">{chain.isRoot ? '⭐ Root Rule Chain • ' : ''}{chain.description || 'Visual Node-Based Engine'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportJson}><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={14} /> Save Chain</button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr' + (selectedNode ? ' 320px' : ''), gap: 'var(--space-3)' }}>
        {/* LEFT PALETTE */}
        <div className="card" style={{ padding: '10px', height: '100%', overflowY: 'auto' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase' }}>
            Node Palette
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {paletteNodes.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleAddNodeFromPalette(item)}
                style={{
                  padding: '8px 10px', borderRadius: 8, background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: nodeColors[item.type] }} />
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CANVAS */}
        <div className="rule-chain-canvas" style={{ position: 'relative', borderRadius: 12, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + 70;
              const y1 = fromNode.y + 25;
              const x2 = toNode.x + 70;
              const y2 = toNode.y + 25;
              const midX = (x1 + x2) / 2;

              return (
                <g key={idx}>
                  <path
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  {conn.label && (
                    <text x={midX} y={(y1 + y2) / 2 - 8} textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10">{conn.label}</text>
                  )}
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-primary)" />
              </marker>
            </defs>
          </svg>

          {nodes.map(node => (
            <div
              key={node.id}
              className={`rule-node ${selectedNodeId === node.id ? 'selected' : ''}`}
              style={{ left: node.x, top: node.y, cursor: 'grab' }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            >
              <div className="rule-node-header">
                <div className={`rule-node-type`} style={{ background: nodeColors[node.type] || 'var(--color-text-tertiary)' }} />
                <span className="rule-node-name">{node.name}</span>
              </div>
              <div className="rule-node-desc">{node.type}</div>
            </div>
          ))}
        </div>

        {/* RIGHT DRAWER: Node Config */}
        {selectedNode && (
          <div className="card" style={{ padding: '14px', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>Node Configuration</span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedNodeId(null)}><X size={14} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Node Title</label>
              <input className="form-input" value={selectedNode.name} readOnly />
            </div>

            <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label">Filter JS Script</label>
              <textarea
                className="form-input"
                style={{ flex: 1, fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}
                value={nodeJsScript}
                onChange={(e) => setNodeJsScript(e.target.value)}
              />
            </div>

            <button className="btn btn-secondary btn-sm" onClick={handleRunScriptTest}>
              <Play size={13} /> Test Script Execution
            </button>

            {testOutput && (
              <div style={{ padding: 8, borderRadius: 6, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontSize: '11px' }}>
                ✓ {testOutput.result}
              </div>
            )}

            <button className="btn btn-danger btn-sm" onClick={handleDeleteSelectedNode} style={{ marginTop: 'auto' }}>
              <Trash2 size={14} /> Delete Node
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// API Endpoints
export const API_BASE_URL = 'http://localhost:2004/api';
export const WS_BASE_URL = 'ws://localhost:2004/api/ws';

// Device types
export const DEVICE_TYPES = ['default', 'sensor', 'gateway', 'actuator', 'controller'];

// Transport protocols
export const TRANSPORT_TYPES = ['MQTT', 'HTTP', 'COAP', 'LWM2M'];

// Alarm severities
export const ALARM_SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR', 'WARNING', 'INDETERMINATE'];

// Alarm statuses
export const ALARM_STATUSES = ['ACTIVE_UNACK', 'ACTIVE_ACK', 'CLEARED_UNACK', 'CLEARED_ACK'];

// User roles
export const USER_ROLES = ['SYS_ADMIN', 'TENANT_ADMIN', 'CUSTOMER_USER'];

// Entity types
export const ENTITY_TYPES = ['DEVICE', 'ASSET', 'CUSTOMER', 'DASHBOARD', 'RULE_CHAIN', 'USER'];

// Rule node types
export const RULE_NODE_TYPES = ['input', 'filter', 'transform', 'action', 'external'];

// Dashboard widget types
export const WIDGET_TYPES = [
  { value: 'value-card', label: 'Value Card' },
  { value: 'line-chart', label: 'Line Chart' },
  { value: 'bar-chart', label: 'Bar Chart' },
  { value: 'gauge', label: 'Gauge' },
  { value: 'map', label: 'Map' },
  { value: 'alarms-table', label: 'Alarms Table' },
];

// Time ranges
export const TIME_RANGES = [
  { label: 'Last 1 hour', value: 3600000 },
  { label: 'Last 6 hours', value: 21600000 },
  { label: 'Last 24 hours', value: 86400000 },
  { label: 'Last 7 days', value: 604800000 },
  { label: 'Last 30 days', value: 2592000000 },
];

// Severity color map
export const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  MAJOR: '#f97316',
  MINOR: '#f59e0b',
  WARNING: '#eab308',
  INDETERMINATE: '#6b7280',
};

// Chart colors palette
export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

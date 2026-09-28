import { useState, useEffect } from 'react';
import {
  X, ArrowLeft, Search, Info, Upload, Check, Plus, BarChart2, TrendingUp,
  CreditCard, AlertTriangle, Table, Hash, MapPin, Compass, ToggleRight,
  Sliders, BatteryCharging, Box, Droplets, Zap, Shield, HelpCircle,
  FileText, Calendar, Terminal, Cpu, HardDrive, Layers, Globe, Clock, Code, Radio, RefreshCw,
  Settings, Trash2, Edit2, ChevronDown, Eye, Filter, Sparkles
} from 'lucide-react';

// Bundle definitions matching ThingsBoard standard widget library
export const WIDGET_BUNDLES = [
  {
    id: 'all',
    title: 'All widgets',
    badge: 'sys',
    description: 'Comprehensive widget collection across all categories',
    previewType: 'mix',
    items: [
      { id: 'time-series-chart', title: 'Time series chart', type: 'line-chart', badge: 'series' },
      { id: 'consumption-card', title: 'Consumption card', type: 'value-card', badge: 'sys' },
      { id: 'map-tracker', title: 'GPS Map Tracker', type: 'map', badge: 'sys' },
      { id: 'on-off-switch', title: 'ON/OFF Switch Button', type: 'button', badge: 'rpc' },
    ]
  },
  {
    id: 'charts',
    title: 'Charts',
    badge: 'sys',
    description: 'Line charts, bar charts, time-series, pie, doughnut, polar area, range charts, and radar graphs',
    previewType: 'chart-pack',
    items: [
      { id: 'time-series-chart', title: 'Time series chart', type: 'line-chart', badge: 'series', desc: 'Stacked bar & multi-line time-series telemetry chart' },
      { id: 'line-chart', title: 'Line chart', type: 'line-chart', badge: 'series', desc: 'Real-time multi-line trend telemetry chart' },
      { id: 'bar-chart', title: 'Bar chart', type: 'bar-chart', badge: 'series', desc: 'Vertical & grouped metric bar chart' },
      { id: 'point-chart', title: 'Point chart', type: 'point-chart', badge: 'series', desc: 'Scatter plot metric point distribution chart' },
      { id: 'state-chart', title: 'State chart', type: 'state-chart', badge: 'series', desc: 'Discrete state timeline step chart (A, B, C, D, E)' },
      { id: 'bar-chart-labels', title: 'Bar chart with labels', type: 'bar-chart', badge: 'series', desc: 'Grouped labeled bar chart with custom value labels' },
      { id: 'range-chart', title: 'Range chart', type: 'range-chart', badge: 'series', desc: 'Multi-band area range telemetry chart' },
      { id: 'value-chart-card', title: 'Value and chart card', type: 'value-card', badge: 'series', desc: 'Cold water usage card with inline sparkline' },
      { id: 'bars', title: 'Bars', type: 'bar-chart', badge: 'latest', desc: 'Categorical bar chart (A, B, C, D) for latest telemetry' },
      { id: 'pie', title: 'Pie', type: 'pie-chart', badge: 'latest', desc: 'Circular pie chart slice telemetry visualization' },
      { id: 'doughnut', title: 'Doughnut', type: 'doughnut-chart', badge: 'latest', desc: 'Ring doughnut gauge with Total count center text' },
      { id: 'horizontal-doughnut', title: 'Horizontal doughnut', type: 'doughnut-chart', badge: 'latest', desc: 'Doughnut ring chart with side legend (A 132, B 51)' },
      { id: 'polar-area', title: 'Polar area', type: 'polar-chart', badge: 'latest', desc: 'Concentric circular polar area diagram' },
      { id: 'radar', title: 'Radar', type: 'radar-chart', badge: 'latest', desc: 'Polygon web radar chart for multi-variable telemetry' },
    ]
  },
  {
    id: 'cards',
    title: 'Cards',
    badge: 'sys',
    description: 'Entity key cards, metric displays, QR codes, progress bars, and HTML cards',
    previewType: 'cards-pack',
    items: [
      { id: 'value-card', title: 'Value card', type: 'value-card', badge: 'latest', desc: 'Temperature 22°C value card with background image' },
      { id: 'horizontal-value-card', title: 'Horizontal value card', type: 'value-card', badge: 'latest', desc: 'Wide horizontal value card with background image' },
      { id: 'value-and-chart-card', title: 'Value and chart card', type: 'value-card', badge: 'series', desc: 'Cold water usage card with sparkline chart' },
      { id: 'simple-value-chart-card', title: 'Simple Value and chart card', type: 'value-card', badge: 'series', desc: 'Temperature 22°C card with green trend curve' },
      { id: 'label-card', title: 'Label card', type: 'value-card', badge: 'static', desc: 'Thermostat A1 minimal label card' },
      { id: 'label-value-card', title: 'Label & value card', type: 'value-card', badge: 'latest', desc: 'Minimal label and value card (Temperature 22°C)' },
      { id: 'progress-bar-card', title: 'Progress bar', type: 'value-card', badge: 'latest', desc: 'Progress bar card with 36% metric fill' },
      { id: 'label-widget-card', title: 'Label widget', type: 'value-card', badge: 'latest', desc: 'Background image label card with value box' },
      { id: 'dashboard-state-widget', title: 'Dashboard state widget', type: 'html', badge: 'static', desc: 'Multi-panel state widget with devices and telemetry history' },
      { id: 'qr-code-widget', title: 'QR Code', type: 'html', badge: 'latest', desc: 'Dynamic QR Code generator tile' },
      { id: 'mobile-app-qr-code', title: 'Mobile app QR code', type: 'html', badge: 'static', desc: 'Mobile app onboarding QR code' },
      { id: 'attributes-card', title: 'Attributes card', type: 'value-card', badge: 'latest', desc: 'Function attributes key-value evaluator table' },
      { id: 'html-card', title: 'HTML Card', type: 'html', badge: 'static', desc: 'Custom static HTML code card' },
      { id: 'html-value-card', title: 'HTML Value Card', type: 'html', badge: 'latest', desc: 'HTML value title and description text card' },
      { id: 'markdown-html-card', title: 'Markdown/HTML Card', type: 'html', badge: 'latest', desc: 'Rendered Markdown and HTML documentation card' },
      { id: 'unread-notifications-card', title: 'Unread notifications', type: 'html', badge: 'static', desc: 'System unread alarm & update notifications list' },
      { id: 'html-container', title: 'HTML Container', type: 'html', badge: 'static', desc: 'HTML, CSS, JavaScript, and external resources tile' },
    ]
  },
  {
    id: 'alarm-widgets',
    title: 'Alarm widgets',
    badge: 'sys',
    description: 'Active alarm summary cards, severity indicators, and actionable alarm tables',
    previewType: 'alarm-pack',
    items: [
      { id: 'alarms-table-widget', title: 'Alarms table', type: 'table', badge: 'alarm', desc: 'Actionable alarms list table with ACK & CLEAR' },
      { id: 'alarm-count-widget', title: 'Alarm count', type: 'value-card', badge: 'latest', desc: 'Alarm total metric counter with warning badge' },
    ]
  },
  {
    id: 'tables',
    title: 'Tables',
    badge: 'sys',
    description: 'Entities tables, alarms tables, time series heatmap tables, and persistent RPC logs',
    previewType: 'table-pack',
    items: [
      { id: 'entities-table-widget', title: 'Entities table', type: 'table', badge: 'latest', desc: 'Multi-entity telemetry overview table' },
      { id: 'alarms-table-in-tables', title: 'Alarms table', type: 'table', badge: 'alarm', desc: 'Actionable alarm severity list table' },
      { id: 'time-series-table-widget', title: 'Time series table', type: 'table', badge: 'series', desc: 'Telemetry log timestamp table with heatmap cells' },
      { id: 'persistent-rpc-table-widget', title: 'Persistent RPC table', type: 'table', badge: 'control', desc: 'RPC command status log table (Timeout, Failed, Delivered)' },
    ]
  },
  {
    id: 'count-widgets',
    title: 'Count widgets',
    badge: 'sys',
    description: 'Entity count metrics, device status counters, and active alarm summary badges',
    previewType: 'count-pack',
    items: [
      { id: 'alarm-count-card', title: 'Total Alarms Counter', type: 'value-card', badge: 'sys', desc: 'Critical alarm count badge' },
      { id: 'device-count-card', title: 'Device Fleet Count', type: 'value-card', badge: 'sys', desc: 'Total registered IoT devices count' },
    ]
  },
  {
    id: 'maps',
    title: 'Maps',
    badge: 'sys',
    description: 'OpenStreetMap GPS location tracking, image maps, trip playback, and route history',
    previewType: 'map-pack',
    items: [
      { id: 'map-widget', title: 'Map', type: 'map', badge: 'latest', desc: 'OpenStreetMap live location with pin markers' },
      { id: 'image-map-widget', title: 'Image Map', type: 'map', badge: 'latest', desc: 'Custom floorplan schematic map with pin markers' },
      { id: 'trip-map-widget', title: 'Trip Map', type: 'map', badge: 'series', desc: 'Vehicle trip route playback map with media controls' },
      { id: 'route-map-widget', title: 'Route Map', type: 'map', badge: 'series', desc: 'Vehicle route line history map with directional arrow' },
    ]
  },
  {
    id: 'analogue-gauges',
    title: 'Analogue gauges',
    badge: 'sys',
    description: 'Analog dials, temperature radial gauges, speedometer dials, radial meters, and compasses',
    previewType: 'analogue-pack',
    items: [
      { id: 'temperature-radial-gauge', title: 'Temperature radial gauge', type: 'gauge', badge: 'latest', desc: 'Half-circle arc dial (-60 to 60°C) with digital readout (-048.6)' },
      { id: 'thermometer-scale', title: 'Thermometer scale', type: 'gauge', badge: 'latest', desc: 'Horizontal mercury scale (-60 to 100°C) with cold blue & hot red bands' },
      { id: 'speed-gauge', title: 'Speed gauge', type: 'gauge', badge: 'latest', desc: 'Speedometer arc dial (0-180 MPH) with needle & 130 digital box' },
      { id: 'radial-gauge', title: 'Radial gauge', type: 'gauge', badge: 'latest', desc: 'Circular dial gauge (-100 to 100) with needle & 034 readout box' },
      { id: 'compass-widget', title: 'Compass', type: 'gauge', badge: 'latest', desc: 'Dark 360° direction compass dial with N/S/E/W markers' },
    ]
  },
  {
    id: 'buttons',
    title: 'Buttons',
    badge: 'sys',
    description: 'Action buttons, command buttons, toggle switches, value steppers, and power buttons',
    previewType: 'button-pack',
    items: [
      { id: 'action-button', title: 'Action button', type: 'button', badge: 'latest', desc: 'Teal outline button with home icon (🏠 Button)' },
      { id: 'command-button', title: 'Command button', type: 'button', badge: 'control', desc: 'Teal outline send button (↗ Send)' },
      { id: 'toggle-button', title: 'Toggle button', type: 'button', badge: 'control', desc: 'Dual state button (🔓 Opened / 🔒 Closed)' },
      { id: 'two-segment-button', title: 'Two-segment button', type: 'button', badge: 'latest', desc: 'Segmented toggle button (Traditional / Hi-Perf)' },
      { id: 'value-stepper', title: 'Value stepper', type: 'button', badge: 'control', desc: 'Numeric stepper controls (< 27.5 °C >)' },
      { id: 'power-button', title: 'Power button', type: 'button', badge: 'control', desc: 'Heavy circular ON power push button' },
    ]
  },
  {
    id: 'control-widgets',
    title: 'Control widgets',
    badge: 'sys',
    description: 'Knob dials, round switches, LED indicators, RPC debug terminals, and GPIO controls',
    previewType: 'control-pack',
    items: [
      { id: 'single-switch-ctrl', title: 'Single Switch', type: 'button', badge: 'control', desc: 'Toggle switch slider tile' },
      { id: 'command-button-ctrl', title: 'Command button', type: 'button', badge: 'control', desc: 'Teal outline send command button' },
      { id: 'toggle-button-ctrl', title: 'Toggle button', type: 'button', badge: 'control', desc: 'Dual state Opened / Closed button' },
      { id: 'two-segment-button-ctrl', title: 'Two-segment button', type: 'button', badge: 'latest', desc: 'Segmented toggle button (Traditional / Hi-Perf)' },
      { id: 'value-stepper-ctrl', title: 'Value stepper', type: 'button', badge: 'control', desc: 'Numeric stepper control tile (< 27.5 °C >)' },
      { id: 'power-button-ctrl', title: 'Power button', type: 'button', badge: 'control', desc: 'Heavy circular ON power push button' },
      { id: 'slider-control', title: 'Slider', type: 'button', badge: 'control', desc: 'Horizontal range slider meter (48%)' },
      { id: 'switch-control-widget', title: 'Switch Control', type: 'button', badge: 'control', desc: 'Dual switch toggle control (OFF state)' },
      { id: 'round-switch-ctrl', title: 'Round switch', type: 'button', badge: 'control', desc: 'Heavy 3D round switch dial with I/0 toggle' },
      { id: 'led-indicator-ctrl', title: 'Led indicator', type: 'value-card', badge: 'control', desc: 'Glowing circular LED status indicator bulb' },
      { id: 'rpc-button-ctrl', title: 'RPC Button', type: 'button', badge: 'control', desc: 'Send RPC command trigger button' },
      { id: 'knob-control-ctrl', title: 'Knob Control', type: 'gauge', badge: 'control', desc: 'Rotary knob control dial (50.00 value)' },
      { id: 'update-device-attribute-ctrl', title: 'Update device attribute', type: 'button', badge: 'control', desc: 'Update device attribute action card' },
      { id: 'persistent-rpc-table-ctrl', title: 'Persistent RPC table', type: 'table', badge: 'control', desc: 'RPC log status table (Timeout, Failed, Delivered)' },
      { id: 'rpc-debug-terminal-ctrl', title: 'RPC debug terminal', type: 'html', badge: 'control', desc: 'Black terminal screen RPC debug console' },
      { id: 'rpc-remote-shell-ctrl', title: 'RPC remote shell', type: 'html', badge: 'control', desc: 'Black terminal screen RPC remote shell console' },
      { id: 'basic-gpio-control-ctrl', title: 'Basic GPIO Control', type: 'button', badge: 'control', desc: 'GPIO pin switch control tile' },
      { id: 'raspberry-pi-gpio-ctrl', title: 'Raspberry Pi GPIO', type: 'html', badge: 'control', desc: 'Raspberry Pi GPIO header pin matrix control' },
    ]
  },
  {
    id: 'status-indicators',
    title: 'Status indicators',
    badge: 'sys',
    description: 'Battery level indicators, WiFi RSSI signal strength bars, and status widgets',
    previewType: 'status-pack',
    items: [
      { id: 'battery-level-widget', title: 'Battery level', type: 'value-card', badge: 'latest', desc: 'Battery status card (100 %) with full green battery icon' },
      { id: 'signal-strength-widget', title: 'Signal strength', type: 'value-card', badge: 'latest', desc: 'WiFi RSSI signal strength card with green arc bars' },
      { id: 'progress-bar-status', title: 'Progress bar', type: 'value-card', badge: 'latest', desc: 'Horizontal progress bar status (36%)' },
      { id: 'status-widget-control', title: 'Status widget', type: 'button', badge: 'control', desc: 'Status widget dark tile (Window left corner OPENED)' },
    ]
  },
  {
    id: 'scada-symbols',
    title: 'SCADA symbols',
    badge: 'sys',
    description: 'SCADA vector symbols and industrial assets',
    previewType: 'scada-symbols-pack',
    items: [
      { id: 'scada-symbol-svg', title: 'SCADA symbol', type: 'html', badge: 'control', desc: 'SCADA vector symbol (SVG file icon)' },
    ]
  },
  {
    id: 'traditional-scada-fluid',
    title: 'Traditional SCADA fluid system',
    badge: 'sys',
    description: 'Pipes, fluid tanks, pumps, valves, and flow indicators',
    previewType: 'scada-fluid-pack',
    items: [
      { id: 'horizontal-pipe', title: 'Horizontal pipe', type: 'html', badge: 'control', desc: 'Thick metallic horizontal pipe segment' },
      { id: 'long-horizontal-pipe', title: 'Long horizontal pipe', type: 'html', badge: 'control', desc: 'Longer metallic horizontal pipe' },
      { id: 'extra-long-horizontal-pipe', title: 'Extra long horizontal pipe', type: 'html', badge: 'control', desc: 'Thin extra long horizontal pipe' },
      { id: 'vertical-pipe', title: 'Vertical pipe', type: 'html', badge: 'control', desc: 'Thick metallic vertical pipe segment' },
      { id: 'long-vertical-pipe', title: 'Long vertical pipe', type: 'html', badge: 'control', desc: 'Longer metallic vertical pipe' },
      { id: 'extra-long-vertical-pipe', title: 'Extra long vertical pipe', type: 'html', badge: 'control', desc: 'Thin extra long vertical pipe' },
      { id: 'left-bottom-elbow-pipe', title: 'Left bottom elbow pipe', type: 'html', badge: 'control', desc: '90-degree elbow connecting left and bottom' },
      { id: 'bottom-right-elbow-pipe', title: 'Bottom right elbow pipe', type: 'html', badge: 'control', desc: '90-degree elbow connecting bottom and right' },
      { id: 'top-right-elbow-pipe', title: 'Top right elbow pipe', type: 'html', badge: 'control', desc: '90-degree elbow connecting top and right' },
      { id: 'left-top-elbow-pipe', title: 'Left top elbow pipe', type: 'html', badge: 'control', desc: '90-degree elbow connecting left and top' },
      { id: 'cross-pipe', title: 'Cross pipe', type: 'html', badge: 'control', desc: '4-way cross pipe fitting' },
      { id: 'left-tee-pipe', title: 'Left tee pipe', type: 'html', badge: 'control', desc: 'T-junction pointing left' },
      { id: 'bottom-tee-pipe', title: 'Bottom tee pipe', type: 'html', badge: 'control', desc: 'T-junction pointing bottom' },
      { id: 'right-tee-pipe', title: 'Right tee pipe', type: 'html', badge: 'control', desc: 'T-junction pointing right' },
      { id: 'top-tee-pipe', title: 'Top tee pipe', type: 'html', badge: 'control', desc: 'T-junction pointing top' },
      { id: 'right-elbow-drain-pipe', title: 'Right elbow drain pipe', type: 'html', badge: 'control', desc: 'Right-facing pipe elbow spilling fluid' },
      { id: 'left-elbow-drain-pipe', title: 'Left elbow drain pipe', type: 'html', badge: 'control', desc: 'Left elbow pipe spilling fluid' },
      { id: 'left-drain-pipe', title: 'Left drain pipe', type: 'html', badge: 'control', desc: 'Left-facing pipe spilling fluid' },
      { id: 'right-drain-pipe', title: 'Right drain pipe', type: 'html', badge: 'control', desc: 'Right-facing pipe spilling fluid' },
      { id: 'short-left-drain-pipe', title: 'Short left drain pipe', type: 'html', badge: 'control', desc: 'Short left-facing pipe spilling fluid' },
      { id: 'short-right-drain-pipe', title: 'Short right drain pipe', type: 'html', badge: 'control', desc: 'Short right-facing pipe spilling fluid' },
      { id: 'horizontal-broken-pipe', title: 'Horizontal broken pipe', type: 'html', badge: 'control', desc: 'Broken horizontal pipe segment' },
      { id: 'vertical-broken-pipe', title: 'Vertical broken pipe', type: 'html', badge: 'control', desc: 'Broken vertical pipe segment' },
      { id: 'long-horizontal-broken-pipe', title: 'Long horizontal broken pipe', type: 'html', badge: 'control', desc: 'Long broken horizontal pipe segment' },
      { id: 'long-vertical-broken-pipe', title: 'Long vertical broken pipe', type: 'html', badge: 'control', desc: 'Long broken vertical pipe segment' },
      { id: 'top-flow-meter', title: 'Top flow meter', type: 'html', badge: 'control', desc: 'Flow meter mounted on top of pipe' },
      { id: 'right-flow-meter', title: 'Right flow meter', type: 'html', badge: 'control', desc: 'Flow meter mounted on right of pipe' },
      { id: 'bottom-flow-meter', title: 'Bottom flow meter', type: 'html', badge: 'control', desc: 'Flow meter mounted on bottom of pipe' },
      { id: 'left-flow-meter', title: 'Left flow meter', type: 'html', badge: 'control', desc: 'Flow meter mounted on left of pipe' },
      { id: 'horizontal-inline-flow-meter', title: 'Horizontal inline flow meter', type: 'html', badge: 'control', desc: 'Inline flow meter on horizontal pipe' },
      { id: 'vertical-inline-flow-meter', title: 'Vertical inline flow meter', type: 'html', badge: 'control', desc: 'Inline flow meter on vertical pipe' },
      { id: 'left-analog-water-level-meter', title: 'Left analog water level meter', type: 'html', badge: 'control', desc: 'Analog dial water level meter (Left mount)' },
      { id: 'right-analog-water-level-meter', title: 'Right analog water level meter', type: 'html', badge: 'control', desc: 'Analog dial water level meter (Right mount)' },
      { id: 'meter', title: 'Meter', type: 'html', badge: 'control', desc: 'Tall vertical fluid thermometer scale' },
      { id: 'small-meter', title: 'Small meter', type: 'html', badge: 'control', desc: 'Small vertical fluid thermometer scale' },
      { id: 'small-right-meter', title: 'Small right meter', type: 'html', badge: 'control', desc: 'Small right-mounted thermometer scale' },
      { id: 'small-left-meter', title: 'Small left meter', type: 'html', badge: 'control', desc: 'Small left-mounted thermometer scale' },
      { id: 'leak-sensor', title: 'Leak sensor', type: 'html', badge: 'control', desc: 'Square leak sensor tile with green water drop' },
      { id: 'centrifugal-pump', title: 'Centrifugal pump', type: 'html', badge: 'control', desc: 'Round centrifugal fluid pump casing' },
      { id: 'small-right-motor-pump', title: 'Small right motor pump', type: 'html', badge: 'control', desc: 'Green electric motor pump facing right' },
      { id: 'small-left-motor-pump', title: 'Small left motor pump', type: 'html', badge: 'control', desc: 'Green electric motor pump facing left' },
      { id: 'right-motor-pump', title: 'Right motor pump', type: 'html', badge: 'control', desc: 'Large green electric motor pump facing right' },
      { id: 'left-motor-pump', title: 'Left motor pump', type: 'html', badge: 'control', desc: 'Large green electric motor pump facing left' },
      { id: 'right-heat-pump', title: 'Right heat pump', type: 'html', badge: 'control', desc: 'Heat pump unit facing right' },
      { id: 'left-heat-pump', title: 'Left heat pump', type: 'html', badge: 'control', desc: 'Heat pump unit facing left' },
      { id: 'short-bottom-filter', title: 'Short bottom filter', type: 'html', badge: 'control', desc: 'Short inline fluid filter pointing down' },
      { id: 'long-bottom-filter', title: 'Long bottom filter', type: 'html', badge: 'control', desc: 'Long inline fluid filter pointing down' },
      { id: 'short-top-filter', title: 'Short top filter', type: 'html', badge: 'control', desc: 'Short inline fluid filter pointing up' },
      { id: 'long-top-filter', title: 'Long top filter', type: 'html', badge: 'control', desc: 'Long inline fluid filter pointing up' },
      { id: 'sand-filter', title: 'Sand filter', type: 'html', badge: 'control', desc: 'Large industrial sand filter tank' },
      { id: 'horizontal-wheel-valve', title: 'Horizontal wheel valve', type: 'html', badge: 'control', desc: 'Green horizontal pipe valve with handwheel' },
      { id: 'vertical-wheel-valve', title: 'Vertical wheel valve', type: 'html', badge: 'control', desc: 'Green vertical pipe valve with handwheel' },
      { id: 'horizontal-ball-valve', title: 'Horizontal ball valve', type: 'html', badge: 'control', desc: 'Green horizontal pipe with ball valve' },
      { id: 'vertical-ball-valve', title: 'Vertical ball valve', type: 'html', badge: 'control', desc: 'Green vertical pipe with ball valve' },
      { id: 'water-stop', title: 'Water stop', type: 'html', badge: 'control', desc: 'Horizontal pipe with green motorized stop valve' },
      { id: 'vertical-tank', title: 'Vertical tank', type: 'html', badge: 'control', desc: 'Vertical fluid storage tank with capacity meter' },
    ]
  },
  {
    id: 'scada-general',
    title: 'General high-performance SCADA...',
    badge: 'sys',
    description: 'Heat pump control system, temperature scales, and HVAC schematics',
    previewType: 'scada-general-pack',
    items: [
      { id: 'heat-pump-schematic', title: 'Heat Pump Control Schematic', type: 'html', badge: 'sys', desc: 'HVAC thermal control diagram' },
    ]
  },
  {
    id: 'scada-oil-gas',
    title: 'High-performance SCADA oil & gas',
    badge: 'sys',
    description: 'Oil rig derricks, valves, pressure vessels, and drilling telemetry',
    previewType: 'scada-oil-pack',
    items: [
      { id: 'oil-derrick-monitor', title: 'Oil Rig Drilling Schematic', type: 'html', badge: 'sys', desc: 'Pressure & flow oil derrick monitor' },
    ]
  },
  {
    id: 'scada-energy',
    title: 'High-performance SCADA energy system',
    badge: 'sys',
    description: 'Wind turbines, solar farms, transformers, and electrical grid monitors',
    previewType: 'scada-energy-pack',
    items: [
      { id: 'wind-turbine-grid', title: 'Wind & Transformer Substation', type: 'html', badge: 'sys', desc: 'Renewable power grid schematic' },
    ]
  },
  {
    id: 'high-perf-scada-fluid',
    title: 'High-performance SCADA fluid system',
    badge: 'sys',
    description: 'Fluid tanks, motorized valves, centrifugal blowers, and flow meters',
    previewType: 'high-perf-fluid-pack',
    items: [
      { id: 'blower-valve-system', title: 'Blower & Valve Tank Monitor', type: 'html', badge: 'sys', desc: 'Industrial water treatment schematic' },
    ]
  },
  {
    id: 'liquid-level',
    title: 'Liquid level',
    badge: 'sys',
    description: 'Vertical liquid tanks, horizontal pressure vessels, and storage cylinders',
    previewType: 'liquid-level-pack',
    items: [
      { id: 'vertical-cylinder-tank', title: 'Vertical cylinder tank', type: 'gauge', badge: 'latest', desc: 'Vertical cylinder liquid level tank' },
      { id: 'rectangle-tank', title: 'Rectangle tank', type: 'gauge', badge: 'latest', desc: 'Rectangular liquid level tank' },
      { id: 'horizontal-cylinder-tank', title: 'Horizontal cylinder tank', type: 'gauge', badge: 'latest', desc: 'Horizontal cylinder liquid level tank' },
      { id: 'horizontal-ellipse-tank', title: 'Horizontal ellipse tank', type: 'gauge', badge: 'latest', desc: 'Horizontal ellipse liquid level tank' },
      { id: 'horizontal-oval-tank', title: 'Horizontal oval tank', type: 'gauge', badge: 'latest', desc: 'Horizontal oval liquid level tank' },
      { id: 'vertical-oval-tank', title: 'Vertical oval tank', type: 'gauge', badge: 'latest', desc: 'Vertical oval liquid level tank' },
      { id: 'horizontal-capsule-tank', title: 'Horizontal capsule tank', type: 'gauge', badge: 'latest', desc: 'Horizontal capsule liquid level tank' },
      { id: 'vertical-capsule-tank', title: 'Vertical capsule tank', type: 'gauge', badge: 'latest', desc: 'Vertical capsule liquid level tank' },
      { id: 'horizontal-elliptical-tank', title: 'Horizontal 2:1 elliptical tank', type: 'gauge', badge: 'latest', desc: 'Horizontal 2:1 elliptical liquid level tank' },
      { id: 'horizontal-dish-ends-tank', title: 'Horizontal dish ends tank', type: 'gauge', badge: 'latest', desc: 'Horizontal dish ends liquid level tank' },
    ]
  },
  {
    id: 'digital-gauges',
    title: 'Digital gauges',
    badge: 'sys',
    description: 'Digital speedometer arc dials, LED counters, and progress bar gauges',
    previewType: 'digital-gauges-pack',
    items: [
      { id: 'simple-gauge', title: 'Simple gauge', type: 'gauge', badge: 'latest', desc: 'Simple circular gauge' },
      { id: 'vertical-bar', title: 'Vertical bar', type: 'gauge', badge: 'latest', desc: 'Vertical bar gauge' },
      { id: 'horizontal-bar', title: 'Horizontal bar', type: 'gauge', badge: 'latest', desc: 'Horizontal bar gauge' },
      { id: 'gauge', title: 'Gauge', type: 'gauge', badge: 'latest', desc: 'Semi-circle gauge' },
      { id: 'mini-gauge', title: 'Mini gauge', type: 'gauge', badge: 'latest', desc: 'Mini circular gauge' },
      { id: 'digital-thermometer', title: 'Digital thermometer', type: 'gauge', badge: 'latest', desc: 'Digital thermometer gauge' },
      { id: 'digital-speedometer', title: 'Digital speedometer', type: 'gauge', badge: 'latest', desc: 'Digital speedometer gauge' },
      { id: 'digital-vertical-bar', title: 'Digital vertical bar', type: 'gauge', badge: 'latest', desc: 'Digital vertical bar gauge' },
      { id: 'digital-horizontal-bar', title: 'Digital horizontal bar', type: 'gauge', badge: 'latest', desc: 'Digital horizontal bar gauge' },
      { id: 'simple-neon-gauge', title: 'Simple neon gauge', type: 'gauge', badge: 'latest', desc: 'Simple neon circular gauge' },
      { id: 'neon-gauge', title: 'Neon gauge', type: 'gauge', badge: 'latest', desc: 'Neon arc gauge' },
      { id: 'lcd-gauge', title: 'LCD gauge', type: 'gauge', badge: 'latest', desc: 'LCD arc gauge' },
      { id: 'lcd-bar-gauge', title: 'LCD bar gauge', type: 'gauge', badge: 'latest', desc: 'LCD vertical bar gauge' },
    ]
  },
  {
    id: 'entity-admin-widgets',
    title: 'Entity admin widgets',
    badge: 'sys',
    description: 'Asset management tables, device administration tables, and quick provisioning',
    previewType: 'entity-admin-pack',
    items: [
      { id: 'device-admin-table', title: 'Device admin table', type: 'table', badge: 'latest', desc: 'Manage IoT devices list & access keys' },
      { id: 'asset-admin-table', title: 'Asset admin table', type: 'table', badge: 'latest', desc: 'Manage assets with add/edit/delete actions' },
    ]
  },
  {
    id: 'input-widgets',
    title: 'Input widgets',
    badge: 'sys',
    description: 'Toggle switches, date/time pickers, GPS coordinate inputs, and photo uploaders',
    previewType: 'input-pack',
    items: [
      { id: 'update-multiple-attributes', title: 'Update Multiple Attributes', type: 'html', badge: 'latest', desc: 'Send mail toggle and datetime picker' },
      { id: 'device-claiming-widget', title: 'Device claiming widget', type: 'html', badge: 'static', desc: 'Device name and secret key form' },
      { id: 'photo-camera-input', title: 'Photo camera input', type: 'html', badge: 'latest', desc: 'Photo camera input form' },
      { id: 'update-server-image', title: 'Update server image attribute', type: 'html', badge: 'latest', desc: 'Image upload drag and drop' },
      { id: 'update-shared-image', title: 'Update shared image attribute', type: 'html', badge: 'latest', desc: 'Image upload drag and drop' },
      { id: 'update-server-location', title: 'Update server location attribute', type: 'html', badge: 'latest', desc: 'Latitude longitude inputs' },
      { id: 'update-shared-location', title: 'Update shared location attribute', type: 'html', badge: 'latest', desc: 'Latitude longitude inputs' },
      { id: 'update-location-time-series', title: 'Update location time series', type: 'html', badge: 'latest', desc: 'Latitude longitude inputs' },
    ]
  },
  {
    id: 'gateway-widgets',
    title: 'Gateway widgets',
    badge: 'sys',
    description: 'Storage selectors, gateway status monitors, and real-time logs inspector',
    previewType: 'gateway-pack',
    items: [
      { id: 'gateway-configuration', title: 'Gateway Configuration', type: 'html', badge: 'static', desc: 'Gateway configuration' },
      { id: 'gateway-events', title: 'Gateway events', type: 'table', badge: 'latest', desc: 'Gateway events log' },
      { id: 'gateway-general-config', title: 'Gateway general configuration', type: 'html', badge: 'latest', desc: 'General Gateway Configuration' },
      { id: 'gateway-config-ext', title: 'Gateway configuration...', type: 'html', badge: 'latest', desc: 'Gateway configuration extension' },
      { id: 'gateway-connectors', title: 'Gateway connectors', type: 'table', badge: 'latest', desc: 'Gateway connectors table' },
      { id: 'gateway-logs', title: 'Gateway logs', type: 'table', badge: 'series', desc: 'Gateway system logs' },
      { id: 'gateway-custom-stats', title: 'Gateway custom statistics', type: 'table', badge: 'series', desc: 'Gateway custom stats' },
      { id: 'gateway-general-chart', title: 'Gateway general chart statistics', type: 'chart', badge: 'series', desc: 'Gateway general chart' },
      { id: 'service-rpc', title: 'Service RPC', type: 'control', badge: 'control', desc: 'Service RPC form' },
      { id: 'gateway-status', title: 'Gateway status', type: 'html', badge: 'latest', desc: 'Gateway status display' },
      { id: 'gateway-markdown', title: 'Gateway Markdown/HTML...', type: 'html', badge: 'latest', desc: 'Gateway markdown renderer' },
    ]
  },
  {
    id: 'edge-widgets',
    title: 'Edge widgets',
    badge: 'sys',
    description: 'Edge instances hierarchy tree, edge assignments, and rule chain synchronization',
    previewType: 'edge-pack',
    items: [
      { id: 'edge-quick-overview', title: 'Edge Quick Overview', type: 'html', badge: 'latest', desc: 'Edge Quick Overview tree' },
    ]
  },
  {
    id: 'entity-widgets',
    title: 'Entity widgets',
    badge: 'sys',
    description: 'Customer entity tree hierarchy, tenant asset tree, and device telemetry list',
    previewType: 'entity-pack',
    items: [
      { id: 'entities-table', title: 'Entities table', type: 'table', badge: 'latest', desc: 'Entities table view' },
      { id: 'entity-count', title: 'Entity count', type: 'html', badge: 'latest', desc: 'Entity count' },
      { id: 'entities-hierarchy', title: 'Entities hierarchy', type: 'html', badge: 'latest', desc: 'Entities hierarchy tree' },
    ]
  },
  {
    id: 'home-page-widgets',
    title: 'Home page widgets',
    badge: 'sys',
    description: 'Getting started onboarding steps, quick link tiles, and platform documentation',
    previewType: 'home-pack',
    items: [
      { id: 'home-getting-started', title: 'Getting started', type: 'html', badge: 'static', desc: 'Getting started guide' },
      { id: 'home-quick-links', title: 'Quick links', type: 'html', badge: 'static', desc: 'Quick links' },
      { id: 'home-documentation', title: 'Documentation links', type: 'html', badge: 'static', desc: 'Documentation links' },
      { id: 'home-dashboards', title: 'Dashboards', type: 'html', badge: 'static', desc: 'Dashboards list' },
      { id: 'home-usage-info', title: 'Usage info', type: 'html', badge: 'static', desc: 'Usage info' },
      { id: 'home-solution-templates', title: 'Solution templates', type: 'html', badge: 'static', desc: 'Solution templates' },
      { id: 'home-api-usage', title: 'API Usage', type: 'html', badge: 'latest', desc: 'API Usage metrics' },
      { id: 'home-iot-hub', title: 'IoT Hub', type: 'html', badge: 'static', desc: 'IoT Hub link' },
    ]
  },
  {
    id: 'navigation-widgets',
    title: 'Navigation widgets',
    badge: 'sys',
    description: 'Large quick-jump tiles for Devices, Rule Chains, and Customer Management',
    previewType: 'nav-pack',
    items: [
      { id: 'nav-cards', title: 'Navigation cards', type: 'html', badge: 'static', desc: 'Navigation cards' },
      { id: 'nav-card', title: 'Navigation card', type: 'html', badge: 'static', desc: 'Navigation card' },
      { id: 'nav-quick-links', title: 'Quick links', type: 'html', badge: 'static', desc: 'Quick links' },
      { id: 'nav-documentation', title: 'Documentation links', type: 'html', badge: 'static', desc: 'Documentation links' },
      { id: 'nav-dashboards', title: 'Dashboards', type: 'html', badge: 'static', desc: 'Dashboards' },
    ]
  },
  {
    id: 'date-widgets',
    title: 'Date',
    badge: 'sys',
    description: 'Date-range-navigator picker, timeframe step size controls, and interval selectors',
    previewType: 'date-pack',
    items: [
      { id: 'date-range-navigator', title: 'Date-range-navigator', type: 'html', badge: 'static', desc: 'Date picker with Day/Week/Month step size' },
    ]
  },
  {
    id: 'html-widgets',
    title: 'HTML widgets',
    badge: 'sys',
    description: 'Markdown document viewers, custom HTML/CSS editors, and iframe embeds',
    previewType: 'html-pack',
    items: [
      { id: 'html-card', title: 'HTML Card', type: 'html', badge: 'static', desc: 'HTML code here' },
      { id: 'html-value-card', title: 'HTML Value Card', type: 'html', badge: 'latest', desc: 'Value title and description' },
      { id: 'markdown-html-card', title: 'Markdown/HTML Card', type: 'html', badge: 'latest', desc: 'Markdown widget' },
      { id: 'html-container', title: 'HTML Container', type: 'html', badge: 'static', desc: 'HTML, CSS, JS, External Resources' },
    ]
  },
  {
    id: 'gpio-widgets',
    title: 'GPIO widgets',
    badge: 'sys',
    description: 'Raspberry Pi & ESP32 GPIO pin LED status indicators and switch matrix',
    previewType: 'gpio-pack',
    items: [
      { id: 'basic-gpio-control', title: 'Basic GPIO Control', type: 'html', badge: 'control', desc: 'Basic GPIO Control' },
      { id: 'basic-gpio-panel', title: 'Basic GPIO Panel', type: 'html', badge: 'latest', desc: 'Basic GPIO Panel' },
      { id: 'raspberry-pi-gpio-panel', title: 'Raspberry Pi GPIO Panel', type: 'html', badge: 'latest', desc: 'Raspberry Pi GPIO Panel' },
      { id: 'raspberry-pi-gpio-control', title: 'Raspberry Pi GPIO Control', type: 'html', badge: 'control', desc: 'Raspberry Pi GPIO Control' },
    ]
  },
  {
    id: 'device-emulator',
    title: 'Device Emulator',
    badge: 'sys',
    description: 'Virtual IoT telemetry simulator and synthetic data generator',
    previewType: 'emulator-pack',
    items: [
      { id: 'emulator-instance-control', title: 'Emulator Instance Control', type: 'html', badge: 'latest', desc: 'Emulator Instance Control' },
      { id: 'emulator-profile-catalog', title: 'Emulator Profile Catalog', type: 'html', badge: 'static', desc: 'Emulator Profile Catalog' },
    ]
  },
  {
    id: 'files-widgets',
    title: 'Files',
    badge: 'sys',
    description: 'Generated PDF reports download list, telemetry files export, and cloud attachments',
    previewType: 'files-pack',
    items: [
      { id: 'files', title: 'Files', type: 'html', badge: 'static', desc: 'Files' },
      { id: 'dashboard-reports', title: 'Dashboard reports', type: 'html', badge: 'static', desc: 'Dashboard reports' },
    ]
  },
  {
    id: 'scheduling-widgets',
    title: 'Scheduling',
    badge: 'sys',
    description: 'Automated report scheduler events, RPC command calendars, and task timelines',
    previewType: 'scheduling-pack',
    items: [
      { id: 'scheduler-events', title: 'Scheduler events', type: 'html', badge: 'static', desc: 'Scheduler events' },
      { id: 'reports-schedule', title: 'Reports schedule', type: 'html', badge: 'static', desc: 'Reports schedule' },
    ]
  },
];

export default function WidgetLibraryModal({ isOpen, onClose, onSelectWidget, devices = [] }) {
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubWidget, setSelectedSubWidget] = useState(null);

  // Configuration Mode: 'basic' | 'advanced'
  const [configMode, setConfigMode] = useState('basic');

  // Time Window State
  const [timeWindowMode, setTimeWindowMode] = useState('dashboard'); // 'dashboard' | 'widget'
  const [displayTimeWindow, setDisplayTimeWindow] = useState(false);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('Realtime - last 1 hour');

  // Datasource State
  const [datasourceMode, setDatasourceMode] = useState('device'); // 'device' | 'entity-alias'
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Series Tab State
  const [seriesTabMode, setSeriesTabMode] = useState('series'); // 'series' | 'comparison'
  const [seriesList, setSeriesList] = useState([]);

  // Y Axes State
  const [yAxesList, setYAxesList] = useState([
    {
      id: 'default',
      show: true,
      label: 'Set',
      position: 'Left',
      min: 'Auto',
      max: 'Auto',
      units: 'Set',
      decimals: 0
    }
  ]);

  // Thresholds State
  const [thresholdsList, setThresholdsList] = useState([]);

  // Appearance State
  const [showTitle, setShowTitle] = useState(true);
  const [widgetTitle, setWidgetTitle] = useState('');
  const [titleColor, setTitleColor] = useState('#000000');
  const [showCardIcon, setShowCardIcon] = useState(false);
  const [cardIconSize, setCardIconSize] = useState(0);

  // Chart Options State
  const [dataZoom, setDataZoom] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [stackMode, setStackMode] = useState(false);

  // X Axis State
  const [showXAxis, setShowXAxis] = useState(true);

  // Bar Width Strategy State
  const [barWidthStrategy, setBarWidthStrategy] = useState('group'); // 'group' | 'separate'
  const [barGroupWidthUnit, setBarGroupWidthUnit] = useState('Percentage of time window');
  const [barGroupWidthVal, setBarGroupWidthVal] = useState(2);

  // Legend State
  const [showLegend, setShowLegend] = useState(true);
  const [legendLabelColor, setLegendLabelColor] = useState('#000000');
  const [legendValueColor, setLegendValueColor] = useState('#000000');
  const [legendColumnTitleColor, setLegendColumnTitleColor] = useState('#808080');
  const [legendPosition, setLegendPosition] = useState('Top');
  const [legendShowValues, setLegendShowValues] = useState(['Average']);
  const [sortDatakeysInLegend, setSortDatakeysInLegend] = useState(false);

  // Tooltip State
  const [showTooltip, setShowTooltip] = useState(true);
  const [tooltipTrigger, setTooltipTrigger] = useState('Axis'); // 'Axis' | 'Point'
  const [tooltipLabelColor, setTooltipLabelColor] = useState('#000000');
  const [tooltipValueColor, setTooltipValueColor] = useState('#000000');
  const [showTooltipDate, setShowTooltipDate] = useState(true);
  const [tooltipDateFormat, setTooltipDateFormat] = useState('Auto');
  const [showTooltipInterval, setShowTooltipInterval] = useState(true);
  const [hideZeroValues, setHideZeroValues] = useState(false);
  const [showTotalInStackMode, setShowTotalInStackMode] = useState(false);
  const [tooltipBgColor, setTooltipBgColor] = useState('#FFFFFF');
  const [tooltipBgBlur, setTooltipBgBlur] = useState(4);

  // Animation State
  const [enableAnimation, setEnableAnimation] = useState(true);

  // Card Appearance State
  const [cardBackground, setCardBackground] = useState('#FFFFFF');
  const [cardButtons, setCardButtons] = useState(['Data export', 'Fullscreen']);
  const [cardBorderRadius, setCardBorderRadius] = useState('0px');
  const [cardPadding, setCardPadding] = useState('12px');

  // Actions State
  const [actionsList, setActionsList] = useState([]);

  const toggleLegendValue = (val) => {
    setLegendShowValues(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const toggleCardButton = (btn) => {
    setCardButtons(prev =>
      prev.includes(btn) ? prev.filter(b => b !== btn) : [...prev, btn]
    );
  };

  useEffect(() => {
    if (devices && devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices]);

  if (!isOpen) return null;

  const handleBundleClick = (bundle) => {
    setSelectedBundle(bundle);
  };

  const handleSubWidgetClick = (item) => {
    setSelectedSubWidget(item);
    setWidgetTitle(item.title);

    const initialKey = item.id.includes('temp') ? 'temperature' :
                       item.id.includes('humidity') ? 'humidity' :
                       item.id.includes('power') || item.id.includes('consumption') ? 'power' :
                       item.id.includes('voltage') ? 'voltage' : 'temperature';

    const initialLabel = item.id.includes('temp') ? 'Temperature' :
                         item.id.includes('humidity') ? 'Humidity' :
                         item.id.includes('power') || item.id.includes('consumption') ? 'Power' :
                         item.id.includes('voltage') ? 'Voltage' : item.title;

    const initialUnit = item.id.includes('temp') ? '°C' :
                        item.id.includes('humidity') ? '%' :
                        item.id.includes('power') ? 'kW' :
                        item.id.includes('voltage') ? 'V' : '°C';

    setSeriesList([
      {
        id: `s-${Date.now()}`,
        key: initialKey,
        label: initialLabel,
        type: item.type === 'bar-chart' ? 'bar-chart' : 'line-chart',
        yAxis: 'default',
        color: '#1E88E5',
        units: initialUnit,
        decimals: 0
      }
    ]);
  };

  const handleAddSeries = () => {
    const keys = ['humidity', 'voltage', 'power', 'current', 'pressure', 'speed'];
    const units = ['%', 'V', 'kW', 'A', 'psi', 'km/h'];
    const colors = ['#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#E91E63'];

    const nextIdx = seriesList.length;
    const key = keys[nextIdx % keys.length];
    const unit = units[nextIdx % units.length];
    const color = colors[nextIdx % colors.length];

    setSeriesList(prev => [
      ...prev,
      {
        id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        key: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: selectedSubWidget?.type === 'bar-chart' ? 'bar-chart' : 'line-chart',
        yAxis: 'default',
        color: color,
        units: unit,
        decimals: 0
      }
    ]);
  };

  const handleDeleteSeries = (id) => {
    setSeriesList(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSeries = (id, field, value) => {
    setSeriesList(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddYAxis = () => {
    const nextNum = yAxesList.length + 1;
    setYAxesList(prev => [
      ...prev,
      {
        id: `axis-${nextNum}`,
        show: true,
        label: `Y Axis ${nextNum}`,
        position: 'Right',
        min: 'Auto',
        max: 'Auto',
        units: 'Set',
        decimals: 0
      }
    ]);
  };

  const handleDeleteYAxis = (id) => {
    if (yAxesList.length <= 1) return;
    setYAxesList(prev => prev.filter(y => y.id !== id));
  };

  const handleAddThreshold = () => {
    setThresholdsList(prev => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        source: 'Value',
        keyVal: '80',
        yAxis: 'default',
        color: '#E53935',
        units: '°C',
        decimals: 0
      }
    ]);
  };

  const handleDeleteThreshold = (id) => {
    setThresholdsList(prev => prev.filter(t => t.id !== id));
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedSubWidget) return;

    const targetDevice = devices.find(d => String(d.id) === String(selectedDeviceId)) || devices[0];

    onSelectWidget({
      type: selectedSubWidget.type,
      title: widgetTitle || selectedSubWidget.title,
      config: {
        entityId: selectedDeviceId || (targetDevice?.id || null),
        deviceName: targetDevice?.name || 'Device',
        key: seriesList[0]?.key || 'temperature',
        keys: seriesList.map(s => s.key),
        unit: seriesList[0]?.units || '°C',
        series: seriesList,
        yAxes: yAxesList,
        thresholds: thresholdsList,
        timeWindow: {
          useDashboard: timeWindowMode === 'dashboard',
          display: displayTimeWindow,
          window: selectedTimeWindow
        },
        appearance: {
          showTitle,
          title: widgetTitle,
          titleColor,
          showCardIcon,
          cardIconSize
        },
        chartOptions: {
          dataZoom,
          grid: showGrid,
          stackMode,
          showXAxis
        },
        barWidthStrategy: {
          strategy: barWidthStrategy,
          unit: barGroupWidthUnit,
          val: barGroupWidthVal
        },
        legend: {
          show: showLegend,
          labelColor: legendLabelColor,
          valueColor: legendValueColor,
          columnTitleColor: legendColumnTitleColor,
          position: legendPosition,
          showValues: legendShowValues,
          sortDatakeys: sortDatakeysInLegend
        },
        tooltip: {
          show: showTooltip,
          trigger: tooltipTrigger,
          labelColor: tooltipLabelColor,
          valueColor: tooltipValueColor,
          showDate: showTooltipDate,
          dateFormat: tooltipDateFormat,
          showInterval: showTooltipInterval,
          hideZero: hideZeroValues,
          showTotalStack: showTotalInStackMode,
          bgColor: tooltipBgColor,
          bgBlur: tooltipBgBlur
        },
        animation: {
          enabled: enableAnimation
        },
        cardAppearance: {
          bg: cardBackground,
          buttons: cardButtons,
          borderRadius: cardBorderRadius,
          padding: cardPadding
        },
        actions: actionsList
      },
    });

    onClose();
    setSelectedBundle(null);
    setSelectedSubWidget(null);
  };

  const filteredBundles = WIDGET_BUNDLES.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItems = selectedBundle ? selectedBundle.items.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.desc && i.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '94vw',
          maxWidth: '1240px',
          height: '92vh',
          maxHeight: '900px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          background: selectedSubWidget ? '#F1F5F9' : '#F8FAFC',
        }}
      >
        {/* Top Header Bar matching RadioGeet Deep Navy Header Style */}
        <div style={{
          background: '#0F1E36',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          borderBottom: '1px solid #1E293B',
          transition: 'background 0.2s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {(selectedBundle || selectedSubWidget) && (
              <button
                onClick={() => {
                  if (selectedSubWidget) {
                    setSelectedSubWidget(null);
                  } else {
                    setSelectedBundle(null);
                  }
                }}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFF', width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#FFF' }}>
                {selectedSubWidget ? `Add widget: ${selectedSubWidget.title}` : selectedBundle ? selectedBundle.title : 'Select widget bundle'}
              </h2>
              {!selectedSubWidget && (
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {selectedBundle ? `${selectedBundle.items.length} customizable widgets in bundle` : `${WIDGET_BUNDLES.length} widget category bundles`}
                </span>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {selectedSubWidget ? (
              <>
                {/* Basic / Advanced Pill Switch */}
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 20,
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <button
                    type="button"
                    onClick={() => setConfigMode('basic')}
                    style={{
                      background: configMode === 'basic' ? '#FFFFFF' : 'transparent',
                      color: configMode === 'basic' ? '#2563EB' : '#FFFFFF',
                      border: 'none',
                      borderRadius: 18,
                      padding: '4px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfigMode('advanced')}
                    style={{
                      background: configMode === 'advanced' ? '#FFFFFF' : 'transparent',
                      color: configMode === 'advanced' ? '#2563EB' : 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: 18,
                      padding: '4px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Advanced
                  </button>
                </div>

                <HelpCircle size={20} style={{ cursor: 'pointer', opacity: 0.9 }} title="Help documentation" />
                <X size={22} style={{ cursor: 'pointer', opacity: 0.9 }} onClick={onClose} title="Close" />
              </>
            ) : (
              <>
                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder={selectedBundle ? "Search widgets..." : "Search widget bundles..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 12px 6px 32px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFF',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </div>
                <button
                  onClick={onClose}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Main Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: selectedSubWidget ? '20px' : '24px' }}>
          {selectedSubWidget ? (
            /* LEVEL 3: EXACT THINGSBOARD "ADD WIDGET" CONFIGURATION INTERFACE */
            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* CARD 1: Time Window */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Time window</h3>
                  
                  {/* Segmented Pill Selector */}
                  <div style={{ border: '1px solid #00695C', borderRadius: 20, padding: 2, display: 'inline-flex' }}>
                    <button
                      type="button"
                      onClick={() => setTimeWindowMode('dashboard')}
                      style={{
                        background: timeWindowMode === 'dashboard' ? 'transparent' : 'transparent',
                        color: timeWindowMode === 'dashboard' ? '#00695C' : '#64748B',
                        border: timeWindowMode === 'dashboard' ? '1px solid #00695C' : 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Use dashboard time window
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeWindowMode('widget')}
                      style={{
                        background: timeWindowMode === 'widget' ? '#00695C' : 'transparent',
                        color: timeWindowMode === 'widget' ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Use widget time window
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      onClick={() => setDisplayTimeWindow(!displayTimeWindow)}
                      style={{
                        width: 38,
                        height: 20,
                        borderRadius: 12,
                        background: displayTimeWindow ? '#FF5722' : '#CBD5E1',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFF',
                        position: 'absolute',
                        left: displayTimeWindow ? 20 : 2,
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', color: timeWindowMode === 'dashboard' ? '#94A3B8' : '#334155' }}>
                      Display time window
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: '13px',
                    color: '#64748B',
                    background: '#F8FAFC'
                  }}>
                    <Clock size={15} />
                    <span>Realtime - last 1 hour</span>
                  </div>

                  <button type="button" style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#64748B', cursor: 'pointer', marginLeft: 'auto' }}>
                    <Filter size={15} />
                  </button>
                </div>
              </div>

              {/* CARD 2: Datasource */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Datasource</h3>
                  
                  <div style={{ border: '1px solid #00695C', borderRadius: 20, padding: 2, display: 'inline-flex' }}>
                    <button
                      type="button"
                      onClick={() => setDatasourceMode('device')}
                      style={{
                        background: datasourceMode === 'device' ? 'transparent' : 'transparent',
                        color: datasourceMode === 'device' ? '#00695C' : '#64748B',
                        border: datasourceMode === 'device' ? '1px solid #00695C' : 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setDatasourceMode('entity-alias')}
                      style={{
                        background: datasourceMode === 'entity-alias' ? '#00695C' : 'transparent',
                        color: datasourceMode === 'entity-alias' ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Entity alias
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Device*
                  </label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      color: '#0F172A',
                      outline: 'none',
                      background: '#FFF'
                    }}
                  >
                    {devices && devices.length > 0 ? (
                      devices.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.type || 'Device'})</option>
                      ))
                    ) : (
                      <option value="">Thermostat A1 (Demo Device)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* CARD 3: Series */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Series</h3>
                  
                  <div style={{ border: '1px solid #00695C', borderRadius: 20, padding: 2, display: 'inline-flex' }}>
                    <button
                      type="button"
                      onClick={() => setSeriesTabMode('series')}
                      style={{
                        background: seriesTabMode === 'series' ? 'transparent' : 'transparent',
                        color: seriesTabMode === 'series' ? '#00695C' : '#64748B',
                        border: seriesTabMode === 'series' ? '1px solid #00695C' : 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Series
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeriesTabMode('comparison')}
                      style={{
                        background: seriesTabMode === 'comparison' ? '#00695C' : 'transparent',
                        color: seriesTabMode === 'comparison' ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Comparison
                    </button>
                  </div>
                </div>

                {/* Series Table */}
                <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '180px' }}>Key</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500 }}>Label</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '90px' }}>Type</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '110px' }}>Y axis</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '60px' }}>Color</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '90px' }}>Units</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '70px' }}>Decimals</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '70px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seriesList.map((s, idx) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 8px' }}>
                            <div style={{ background: '#E2E8F0', borderRadius: 16, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#334155' }}>
                              <span>📈 {s.key}</span>
                              <Edit2 size={12} style={{ cursor: 'pointer', opacity: 0.7 }} />
                              <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => handleDeleteSeries(s.id)} />
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="text"
                              value={s.label}
                              onChange={(e) => handleUpdateSeries(s.id, 'label', e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <select
                              value={s.type}
                              onChange={(e) => handleUpdateSeries(s.id, 'type', e.target.value)}
                              style={{ width: '100%', padding: '6px 6px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            >
                              <option value="line-chart">Line</option>
                              <option value="bar-chart">Bar</option>
                              <option value="point-chart">Point</option>
                            </select>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <select
                              value={s.yAxis}
                              onChange={(e) => handleUpdateSeries(s.id, 'yAxis', e.target.value)}
                              style={{ width: '100%', padding: '6px 6px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            >
                              {yAxesList.map(y => (
                                <option key={y.id} value={y.id}>{y.id}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="color"
                              value={s.color}
                              onChange={(e) => handleUpdateSeries(s.id, 'color', e.target.value)}
                              style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="text"
                              value={s.units}
                              onChange={(e) => handleUpdateSeries(s.id, 'units', e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="number"
                              value={s.decimals}
                              onChange={(e) => handleUpdateSeries(s.id, 'decimals', Number(e.target.value))}
                              style={{ width: '100%', padding: '6px 6px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              <Settings size={15} style={{ color: '#64748B', cursor: 'pointer' }} />
                              <Trash2 size={15} style={{ color: '#64748B', cursor: 'pointer' }} onClick={() => handleDeleteSeries(s.id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleAddSeries}
                  style={{
                    border: '1px solid #00695C',
                    color: '#00695C',
                    background: '#FFF',
                    padding: '6px 16px',
                    borderRadius: 6,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Add series
                </button>
              </div>

              {/* CARD 4: Y axes */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>Y axes</h3>

                <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '100px' }}>Id</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '60px' }}>Show</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500 }}>Label</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '100px' }}>Position</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '80px' }}>Min</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '80px' }}>Max</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '90px' }}>Units</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '70px' }}>Decimals</th>
                        <th style={{ padding: '8px 10px', fontWeight: 500, width: '50px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yAxesList.map((y) => (
                        <tr key={y.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 600, color: '#334155' }}>{y.id}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="checkbox"
                              checked={y.show}
                              onChange={(e) => setYAxesList(prev => prev.map(item => item.id === y.id ? { ...item, show: e.target.checked } : item))}
                              style={{ accentColor: '#FF5722', width: 16, height: 16, cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="text"
                              value={y.label}
                              onChange={(e) => setYAxesList(prev => prev.map(item => item.id === y.id ? { ...item, label: e.target.value } : item))}
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <select
                              value={y.position}
                              onChange={(e) => setYAxesList(prev => prev.map(item => item.id === y.id ? { ...item, position: e.target.value } : item))}
                              style={{ width: '100%', padding: '6px 6px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            >
                              <option value="Left">Left</option>
                              <option value="Right">Right</option>
                            </select>
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="text"
                              value={y.min}
                              onChange={(e) => setYAxesList(prev => prev.map(item => item.id === y.id ? { ...item, min: e.target.value } : item))}
                              style={{ width: '100%', padding: '6px 6px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="text"
                              value={y.max}
                              onChange={(e) => setYAxesList(prev => prev.map(item => item.id === y.id ? { ...item, max: e.target.value } : item))}
                              style={{ width: '100%', padding: '6px 6px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="text"
                              value={y.units}
                              onChange={(e) => setYAxesList(prev => prev.map(item => item.id === y.id ? { ...item, units: e.target.value } : item))}
                              style={{ width: '100%', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <input
                              type="number"
                              value={y.decimals}
                              onChange={(e) => setYAxesList(prev => prev.map(item => item.id === y.id ? { ...item, decimals: Number(e.target.value) } : item))}
                              style={{ width: '100%', padding: '6px 6px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '12px' }}
                            />
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <Settings size={15} style={{ color: '#64748B', cursor: 'pointer' }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={handleAddYAxis}
                  style={{
                    border: '1px solid #00695C',
                    color: '#00695C',
                    background: '#FFF',
                    padding: '6px 16px',
                    borderRadius: 6,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Add Y axis
                </button>
              </div>

              {/* CARD 5: Thresholds */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>Thresholds</h3>

                {thresholdsList.length === 0 ? (
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px', marginBottom: 14 }}>
                    No thresholds configured
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', marginBottom: 14 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                          <th style={{ padding: '8px 10px', fontWeight: 500 }}>Source</th>
                          <th style={{ padding: '8px 10px', fontWeight: 500 }}>Key / Value</th>
                          <th style={{ padding: '8px 10px', fontWeight: 500 }}>Y axis</th>
                          <th style={{ padding: '8px 10px', fontWeight: 500 }}>Color</th>
                          <th style={{ padding: '8px 10px', fontWeight: 500 }}>Units</th>
                          <th style={{ padding: '8px 10px', fontWeight: 500 }}>Decimals</th>
                          <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {thresholdsList.map(t => (
                          <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 8px' }}>{t.source}</td>
                            <td style={{ padding: '10px 8px' }}>{t.keyVal}</td>
                            <td style={{ padding: '10px 8px' }}>{t.yAxis}</td>
                            <td style={{ padding: '10px 8px' }}><input type="color" value={t.color} readOnly style={{ width: 24, height: 24, border: 'none' }} /></td>
                            <td style={{ padding: '10px 8px' }}>{t.units}</td>
                            <td style={{ padding: '10px 8px' }}>{t.decimals}</td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <Trash2 size={15} style={{ color: '#64748B', cursor: 'pointer' }} onClick={() => handleDeleteThreshold(t.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddThreshold}
                  style={{
                    border: '1px solid #00695C',
                    color: '#00695C',
                    background: '#FFF',
                    padding: '6px 16px',
                    borderRadius: 6,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Add threshold
                </button>
              </div>

              {/* CARD 6: Appearance */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>Appearance</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Title switch */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 120 }}>
                      <div
                        onClick={() => setShowTitle(!showTitle)}
                        style={{
                          width: 38,
                          height: 20,
                          borderRadius: 12,
                          background: showTitle ? '#FF5722' : '#CBD5E1',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#FFF',
                          position: 'absolute',
                          left: showTitle ? 20 : 2,
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Title</span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={widgetTitle}
                        onChange={(e) => setWidgetTitle(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px' }}
                      />
                      <button type="button" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, width: 36, height: 36, fontWeight: 700 }}>A</button>
                      <input type="color" value={titleColor} onChange={(e) => setTitleColor(e.target.value)} style={{ width: 36, height: 36, border: 'none', cursor: 'pointer' }} />
                    </div>
                  </div>

                  {/* Card Icon switch */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 120 }}>
                      <div
                        onClick={() => setShowCardIcon(!showCardIcon)}
                        style={{
                          width: 38,
                          height: 20,
                          borderRadius: 12,
                          background: showCardIcon ? '#FF5722' : '#CBD5E1',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: '#FFF',
                          position: 'absolute',
                          left: showCardIcon ? 20 : 2,
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Card icon</span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        value={cardIconSize}
                        onChange={(e) => setCardIconSize(Number(e.target.value))}
                        style={{ width: 80, padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px' }}
                      />
                      <select style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px' }}>
                        <option>px</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 7: Chart */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>Chart</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Data zoom */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      onClick={() => setDataZoom(!dataZoom)}
                      style={{
                        width: 38,
                        height: 20,
                        borderRadius: 12,
                        background: dataZoom ? '#FF5722' : '#CBD5E1',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFF',
                        position: 'absolute',
                        left: dataZoom ? 20 : 2,
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Data zoom</span>
                  </div>

                  {/* Grid */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      onClick={() => setShowGrid(!showGrid)}
                      style={{
                        width: 38,
                        height: 20,
                        borderRadius: 12,
                        background: showGrid ? '#FF5722' : '#CBD5E1',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFF',
                        position: 'absolute',
                        left: showGrid ? 20 : 2,
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Grid</span>
                  </div>

                  {/* Stack mode */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      onClick={() => setStackMode(!stackMode)}
                      style={{
                        width: 38,
                        height: 20,
                        borderRadius: 12,
                        background: stackMode ? '#FF5722' : '#CBD5E1',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFF',
                        position: 'absolute',
                        left: stackMode ? 20 : 2,
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Stack mode <Info size={14} style={{ color: '#94A3B8' }} />
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 8: X axis */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>X axis</h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      onClick={() => setShowXAxis(!showXAxis)}
                      style={{
                        width: 38,
                        height: 20,
                        borderRadius: 12,
                        background: showXAxis ? '#FF5722' : '#CBD5E1',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFF',
                        position: 'absolute',
                        left: showXAxis ? 20 : 2,
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Show</span>
                  </div>

                  <select style={{ padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px', background: '#FFF' }}>
                    <option>Default position</option>
                  </select>
                </div>
              </div>

              {/* CARD 9: Bar width strategy for non-aggregated data */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Bar width strategy for non-aggregated data</h3>
                  <div style={{ border: '1px solid #00695C', borderRadius: 20, padding: 2, display: 'inline-flex' }}>
                    <button
                      type="button"
                      onClick={() => setBarWidthStrategy('group')}
                      style={{
                        background: barWidthStrategy === 'group' ? 'transparent' : 'transparent',
                        color: barWidthStrategy === 'group' ? '#00695C' : '#64748B',
                        border: barWidthStrategy === 'group' ? '1px solid #00695C' : 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Group
                    </button>
                    <button
                      type="button"
                      onClick={() => setBarWidthStrategy('separate')}
                      style={{
                        background: barWidthStrategy === 'separate' ? '#00695C' : 'transparent',
                        color: barWidthStrategy === 'separate' ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        borderRadius: 16,
                        padding: '4px 14px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Separate
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#334155' }}>Bar group width</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      value={barGroupWidthUnit}
                      onChange={(e) => setBarGroupWidthUnit(e.target.value)}
                      style={{ padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px', background: '#FFF' }}
                    >
                      <option>Percentage of time window</option>
                      <option>Fixed pixels</option>
                    </select>
                    <input
                      type="number"
                      value={barGroupWidthVal}
                      onChange={(e) => setBarGroupWidthVal(Number(e.target.value))}
                      style={{ width: 60, padding: '6px 8px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#64748B' }}>%</span>
                  </div>
                </div>
              </div>

              {/* CARD 10: Legend */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showLegend ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      onClick={() => setShowLegend(!showLegend)}
                      style={{
                        width: 38,
                        height: 20,
                        borderRadius: 12,
                        background: showLegend ? '#FF5722' : '#CBD5E1',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFF',
                        position: 'absolute',
                        left: showLegend ? 20 : 2,
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Legend</h3>
                  </div>
                  <ChevronDown size={18} style={{ color: '#64748B', transform: showLegend ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {showLegend && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Label</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button type="button" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, width: 32, height: 32, fontWeight: 700 }}>A</button>
                        <input type="color" value={legendLabelColor} onChange={(e) => setLegendLabelColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Value</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button type="button" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, width: 32, height: 32, fontWeight: 700 }}>A</button>
                        <input type="color" value={legendValueColor} onChange={(e) => setLegendValueColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Column title</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button type="button" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, width: 32, height: 32, fontWeight: 700 }}>A</button>
                        <input type="color" value={legendColumnTitleColor} onChange={(e) => setLegendColumnTitleColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Position</span>
                      <select value={legendPosition} onChange={(e) => setLegendPosition(e.target.value)} style={{ width: 160, padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px', background: '#FFF' }}>
                        <option value="Top">Top</option>
                        <option value="Bottom">Bottom</option>
                        <option value="Left">Left</option>
                        <option value="Right">Right</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Show values</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {['Min', 'Max', 'Average', 'Total', 'Latest'].map(v => {
                          const active = legendShowValues.includes(v);
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => toggleLegendValue(v)}
                              style={{
                                background: active ? '#00695C' : '#F1F5F9',
                                color: active ? '#FFFFFF' : '#475569',
                                border: active ? 'none' : '1px solid #CBD5E1',
                                borderRadius: 16,
                                padding: '4px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              {active && <Check size={13} />} {v}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <div onClick={() => setSortDatakeysInLegend(!sortDatakeysInLegend)} style={{ width: 38, height: 20, borderRadius: 12, background: sortDatakeysInLegend ? '#FF5722' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFF', position: 'absolute', left: sortDatakeysInLegend ? 20 : 2, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Sort datakeys in legend</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 11: Tooltip */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showTooltip ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div onClick={() => setShowTooltip(!showTooltip)} style={{ width: 38, height: 20, borderRadius: 12, background: showTooltip ? '#FF5722' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFF', position: 'absolute', left: showTooltip ? 20 : 2, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Tooltip</h3>
                  </div>
                  <ChevronDown size={18} style={{ color: '#64748B', transform: showTooltip ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {showTooltip && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Trigger</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => setTooltipTrigger('Point')} style={{ background: tooltipTrigger === 'Point' ? '#00695C' : '#F1F5F9', color: tooltipTrigger === 'Point' ? '#FFF' : '#475569', border: 'none', borderRadius: 16, padding: '4px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Point</button>
                        <button type="button" onClick={() => setTooltipTrigger('Axis')} style={{ background: tooltipTrigger === 'Axis' ? '#00695C' : '#F1F5F9', color: tooltipTrigger === 'Axis' ? '#FFF' : '#475569', border: 'none', borderRadius: 16, padding: '4px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={13} /> Axis</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Label</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button type="button" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, width: 32, height: 32, fontWeight: 700 }}>A</button>
                        <input type="color" value={tooltipLabelColor} onChange={(e) => setTooltipLabelColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Value</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button type="button" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, width: 32, height: 32, fontWeight: 700 }}>A</button>
                        <input type="color" value={tooltipValueColor} onChange={(e) => setTooltipValueColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div onClick={() => setShowTooltipDate(!showTooltipDate)} style={{ width: 38, height: 20, borderRadius: 12, background: showTooltipDate ? '#FF5722' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFF', position: 'absolute', left: showTooltipDate ? 20 : 2, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                        </div>
                        <span style={{ fontSize: '13px', color: '#334155' }}>Date</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select value={tooltipDateFormat} onChange={(e) => setTooltipDateFormat(e.target.value)} style={{ width: 160, padding: '6px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px', background: '#FFF' }}>
                          <option>Auto</option>
                        </select>
                        <Edit2 size={14} style={{ cursor: 'pointer', color: '#64748B' }} />
                        <button type="button" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 6, width: 32, height: 32, fontWeight: 700 }}>A</button>
                        <input type="color" value="#000000" readOnly style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div onClick={() => setShowTooltipInterval(!showTooltipInterval)} style={{ width: 38, height: 20, borderRadius: 12, background: showTooltipInterval ? '#FF5722' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFF', position: 'absolute', left: showTooltipInterval ? 20 : 2, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Show date time interval <Info size={14} style={{ color: '#94A3B8' }} />
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div onClick={() => setHideZeroValues(!hideZeroValues)} style={{ width: 38, height: 20, borderRadius: 12, background: hideZeroValues ? '#FF5722' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFF', position: 'absolute', left: hideZeroValues ? 20 : 2, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Hide zero values</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.6 }}>
                      <div style={{ width: 38, height: 20, borderRadius: 12, background: '#CBD5E1', position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFF', position: 'absolute', left: 2 }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>Show total value in stack mode</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Background color</span>
                      <input type="color" value={tooltipBgColor} onChange={(e) => setTooltipBgColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>Background blur</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="number" value={tooltipBgBlur} onChange={(e) => setTooltipBgBlur(Number(e.target.value))} style={{ width: 80, padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px' }} />
                        <span style={{ fontSize: '12px', color: '#64748B' }}>px</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 12: Animation */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div onClick={() => setEnableAnimation(!enableAnimation)} style={{ width: 38, height: 20, borderRadius: 12, background: enableAnimation ? '#FF5722' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFF', position: 'absolute', left: enableAnimation ? 20 : 2, transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Animation</h3>
                  </div>
                  <ChevronDown size={18} style={{ color: '#64748B' }} />
                </div>
              </div>

              {/* CARD 13: Card appearance */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', color: '#1E293B' }}>Card appearance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Background</span>
                    <input type="color" value={cardBackground} onChange={(e) => setCardBackground(e.target.value)} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Show card buttons</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['Data export', 'Fullscreen'].map(btn => {
                        const active = cardButtons.includes(btn);
                        return (
                          <button key={btn} type="button" onClick={() => toggleCardButton(btn)} style={{ background: active ? '#00695C' : '#F1F5F9', color: active ? '#FFF' : '#475569', border: 'none', borderRadius: 16, padding: '4px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {active && <Check size={13} />} {btn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Card border radius</span>
                    <input type="text" value={cardBorderRadius} onChange={(e) => setCardBorderRadius(e.target.value)} style={{ width: 120, padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Card padding</span>
                    <input type="text" value={cardPadding} onChange={(e) => setCardPadding(e.target.value)} style={{ width: 120, padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '13px' }} />
                  </div>
                </div>
              </div>

              {/* CARD 14: Actions */}
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1E293B' }}>Actions</h3>
                  <button type="button" style={{ border: '1px solid #00695C', color: '#00695C', background: '#FFF', padding: '6px 16px', borderRadius: 6, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Add action
                  </button>
                </div>
              </div>

            </div>
          ) : selectedBundle ? (
            /* LEVEL 2: Sub-Widgets inside Bundle */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSubWidgetClick(item)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      minHeight: 220,
                    }}
                    className="widget-card-hover"
                  >
                    {/* Header line with badge & info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#F1F5F9', color: '#64748B' }}>
                          {item.badge || 'series'}
                        </span>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0D94881A', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                          i
                        </div>
                      </div>
                    </div>

                    {/* High Fidelity Vector Preview Graphic */}
                    <div style={{
                      flex: 1,
                      background: '#F8FAFC',
                      borderRadius: 8,
                      border: '1px dashed #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 12,
                      marginBottom: 8,
                    }}>
                      <RenderWidgetPreview type={item.id} category={selectedBundle.id} />
                    </div>

                    <div style={{ fontSize: 11, color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.desc || 'Customizable IoT Widget'}</span>
                      <Plus size={14} style={{ color: '#2563EB' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* LEVEL 1: Category Bundles Grid matching ThingsBoard Screenshot */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filteredBundles.map(bundle => (
                <div
                  key={bundle.id}
                  onClick={() => handleBundleClick(bundle)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 230,
                  }}
                  className="widget-card-hover"
                >
                  {/* Top Bundle Header: Title + sys badge + info icon */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{bundle.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#E2E8F0', color: '#475569' }}>
                        {bundle.badge}
                      </span>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0D9488', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        i
                      </div>
                    </div>
                  </div>

                  {/* Bundle Vector Preview Graphic matching screenshot visuals */}
                  <div style={{
                    flex: 1,
                    background: '#F8FAFC',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    overflow: 'hidden',
                  }}>
                    <RenderBundlePreview bundleId={bundle.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Modal Bottom Action Footer Bar matching ThingsBoard screenshot */}
        {selectedSubWidget && (
          <div style={{
            background: '#FFFFFF',
            borderTop: '1px solid #CBD5E1',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            zIndex: 10
          }}>
            <button
              type="button"
              onClick={() => setSelectedSubWidget(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00695C',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                style={{
                  background: '#00695C',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '8px 24px',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Visual Preview Graphic Component for Category Bundles
function RenderBundlePreview({ bundleId }) {
  switch (bundleId) {
    case 'all':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, width: '100%', height: '100%', padding: 4 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <div style={{ width: '20%', height: '40%', background: '#EAB308' }} />
            <div style={{ width: '20%', height: '80%', background: '#22C55E' }} />
            <div style={{ width: '20%', height: '60%', background: '#3B82F6' }} />
            <div style={{ width: '20%', height: '50%', background: '#EAB308' }} />
            <div style={{ width: '20%', height: '90%', background: '#3B82F6' }} />
          </div>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 6, color: '#64748B' }}>Consumption</span>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', flex: 1 }}>
              <span style={{ fontSize: 14, color: '#3B82F6' }}>1</span><span style={{ fontSize: 8, color: '#3B82F6' }}>kW</span>
              <span style={{ fontSize: 5, color: '#64748B', marginLeft: 4 }}>↓ -16%</span>
            </div>
            <svg width="100%" height="20" viewBox="0 0 100 20">
              <polyline points="0,15 20,10 40,18 60,5 80,12 100,2" fill="none" stroke="#3B82F6" strokeWidth="1" />
            </svg>
          </div>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, position: 'relative', overflow: 'hidden', background: '#F1F5F9' }}>
            <div style={{ position: 'absolute', top: 4, left: 4, width: 8, height: 16, background: '#FFF', border: '1px solid #CBD5E1', borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 8 }}>
              ▲
            </div>
            <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
              <path d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60 M0,80 L100,80 M20,0 L20,100 M40,0 L40,100 M60,0 L60,100 M80,0 L80,100" stroke="#CBD5E1" strokeWidth="1" opacity="0.5" />
              <polyline points="30,80 30,30 80,30" fill="none" stroke="#EF4444" strokeWidth="2" />
            </svg>
          </div>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0F766E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
               ON
             </div>
          </div>
        </div>
      );

    case 'charts':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: 4 }}>
          <div style={{ display: 'flex', gap: 8, flex: 1, padding: 4 }}>
            <svg width="60%" height="100%" viewBox="0 0 100 50">
              <polygon points="0,50 0,30 20,10 40,40 60,15 80,45 100,20 100,50" fill="#22C55E" />
              <polygon points="0,30 0,20 20,5 40,20 60,10 80,25 100,10 100,20 80,45 60,15 40,40 20,10" fill="#EAB308" />
              <polygon points="0,20 0,10 20,0 40,10 60,5 80,15 100,0 100,10 80,25 60,10 40,20 20,5" fill="#F97316" />
              <polygon points="0,10 0,0 20,0 40,0 60,0 80,0 100,0 100,0 80,15 60,5 40,10 20,0" fill="#EF4444" />
            </svg>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="60 100" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-60" />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 6, color: '#64748B' }}>Total</span>
                <span style={{ fontSize: 10, color: '#0F172A', fontWeight: 700 }}>183</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <svg width="100%" height="100%" viewBox="0 0 160 50">
              <rect x="10" y="25" width="12" height="25" fill="#3B82F6" />
              <rect x="35" y="30" width="12" height="20" fill="#3B82F6" />
              <rect x="60" y="15" width="12" height="35" fill="#3B82F6" />
              <rect x="85" y="40" width="12" height="10" fill="#3B82F6" />
              <rect x="110" y="20" width="12" height="30" fill="#3B82F6" />
              <rect x="135" y="35" width="12" height="15" fill="#3B82F6" />
              
              <polyline points="10,25 35,20 60,10 85,30 110,15 135,25" fill="none" stroke="#EAB308" strokeWidth="2" />
              <circle cx="10" cy="25" r="2" fill="#FFF" stroke="#EAB308" strokeWidth="1" />
              <circle cx="35" cy="20" r="2" fill="#FFF" stroke="#EAB308" strokeWidth="1" />
              <circle cx="60" cy="10" r="2" fill="#FFF" stroke="#EAB308" strokeWidth="1" />
              <circle cx="85" cy="30" r="2" fill="#FFF" stroke="#EAB308" strokeWidth="1" />
              <circle cx="110" cy="15" r="2" fill="#FFF" stroke="#EAB308" strokeWidth="1" />
              <circle cx="135" cy="25" r="2" fill="#FFF" stroke="#EAB308" strokeWidth="1" />
              
              <polyline points="10,40 35,45 60,35 85,45 110,40 135,45" fill="none" stroke="#22C55E" strokeWidth="2" />
              <circle cx="10" cy="40" r="2" fill="#FFF" stroke="#22C55E" strokeWidth="1" />
              <circle cx="35" cy="45" r="2" fill="#FFF" stroke="#22C55E" strokeWidth="1" />
              <circle cx="60" cy="35" r="2" fill="#FFF" stroke="#22C55E" strokeWidth="1" />
              <circle cx="85" cy="45" r="2" fill="#FFF" stroke="#22C55E" strokeWidth="1" />
              <circle cx="110" cy="40" r="2" fill="#FFF" stroke="#22C55E" strokeWidth="1" />
              <circle cx="135" cy="45" r="2" fill="#FFF" stroke="#22C55E" strokeWidth="1" />
            </svg>
          </div>
        </div>
      );

    case 'cards':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%', padding: 4 }}>
          <div style={{ background: '#FFF', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0', height: 45 }}>
            <span style={{ fontSize: 7, color: '#64748B' }}>Temperature</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>🌡️ 22°C</div>
          </div>
          <div style={{ background: '#FFF', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0', height: 45 }}>
            <span style={{ fontSize: 7, color: '#64748B' }}>Cold water usage</span>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'flex', justifyContent: 'center' }}>21 m³</div>
            <svg width="100%" height="10" viewBox="0 0 100 10">
              <polyline points="0,8 20,5 40,9 60,2 80,6 100,1" fill="none" stroke="#94A3B8" strokeWidth="1" />
            </svg>
          </div>
          <div style={{ background: '#FFF', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 45 }}>
            <div style={{ width: 28, height: 28, background: `repeating-linear-gradient(45deg, #0F172A 0, #0F172A 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, #0F172A 0, #0F172A 2px, transparent 2px, transparent 4px)`, borderRadius: 2 }} />
          </div>
          <div style={{ background: '#FFF', padding: 6, borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 7, color: '#475569', height: 45 }}>
            <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Function</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Random</span><span>-19.21</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sin</span><span>-9.17</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cos</span><span>15.43</span></div>
          </div>
        </div>
      );

    case 'alarm-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
          <div style={{ background: '#FFF', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 24, height: 24, background: '#EF4444', borderRadius: 4, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>⚠️</div>
            <div>
              <div style={{ fontSize: 9, color: '#64748B' }}>Total</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>3</div>
            </div>
          </div>
          <div style={{ background: '#FFF', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 7, flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Alarms</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', borderBottom: '1px solid #F1F5F9', paddingBottom: 2 }}>
              <span style={{ width: 10 }}>□</span><span style={{ flex: 1 }}>Type ↑</span><span style={{ flex: 1 }}>Severity</span><span style={{ flex: 1 }}>Status</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A', padding: '3px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ width: 10 }}>□</span><span style={{ flex: 1 }}>Temperature</span><span style={{ flex: 1, color: '#EAB308', fontWeight: 700 }}>Major</span><span style={{ flex: 1 }}>Cleared</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A', padding: '3px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ width: 10 }}>□</span><span style={{ flex: 1 }}>Temperature</span><span style={{ flex: 1, color: '#EF4444', fontWeight: 700 }}>Critical</span><span style={{ flex: 1 }}>Cleared</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0F172A', padding: '3px 0' }}>
              <span style={{ width: 10 }}>□</span><span style={{ flex: 1 }}>Low Hu..</span><span style={{ flex: 1, color: '#22C55E', fontWeight: 700 }}>Warning</span><span style={{ flex: 1 }}>Active</span>
            </div>
          </div>
        </div>
      );

    case 'tables':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 6, padding: '4px 6px' }}>
            <div style={{ display: 'flex', color: '#64748B', fontWeight: 700, paddingBottom: 2, borderBottom: '1px solid #F1F5F9' }}>
               <span style={{flex:1}}>□ Type ↓</span><span style={{flex:1}}>Severity</span><span style={{flex:1}}>Name</span><span style={{flex:1}}>Type</span><span style={{flex:1}}>Random</span>
            </div>
            <div style={{ display: 'flex', color: '#0F172A', paddingTop: 2 }}>
               <span style={{flex:1}}>□ Tempera..</span><span style={{flex:1, color: '#EAB308', fontWeight:700}}>Major</span><span style={{flex:1}}>WM452</span><span style={{flex:1}}>Device</span><span style={{flex:1}}>89.56</span>
            </div>
            <div style={{ display: 'flex', color: '#0F172A', paddingTop: 2 }}>
               <span style={{flex:1}}>□ Tempera..</span><span style={{flex:1, color: '#EF4444', fontWeight:700}}>Critical</span><span style={{flex:1}}>KL514</span><span style={{flex:1}}>Device</span><span style={{flex:1}}>79.24</span>
            </div>
            <div style={{ display: 'flex', color: '#0F172A', paddingTop: 2 }}>
               <span style={{flex:1}}>□ Low Hu..</span><span style={{flex:1, color: '#22C55E', fontWeight:700}}>Warning</span><span style={{flex:1}}>A31</span><span style={{flex:1}}>Building</span><span style={{flex:1}}>21.47</span>
            </div>
          </div>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 6, overflow: 'hidden' }}>
            <div style={{ display: 'flex', color: '#64748B', fontWeight: 700, padding: '4px 6px' }}>
               <span style={{flex:1}}>Time</span><span style={{flex:1}}>Humidity</span><span style={{flex:1}}>Temperature</span>
            </div>
            <div style={{ display: 'flex', color: '#FFF' }}>
               <span style={{flex:1, padding: '4px 6px', color:'#0F172A'}}>10:48:15</span><span style={{flex:1, padding: '4px 6px', background: '#1E3A8A'}}>59.3</span><span style={{flex:1, padding: '4px 6px', background: '#EA580C'}}>45.6</span>
            </div>
            <div style={{ display: 'flex', color: '#FFF' }}>
               <span style={{flex:1, padding: '4px 6px', color:'#0F172A'}}>10:48:14</span><span style={{flex:1, padding: '4px 6px', background: '#1E3A8A'}}>61.2</span><span style={{flex:1, padding: '4px 6px', background: '#F97316'}}>52</span>
            </div>
            <div style={{ display: 'flex', color: '#FFF' }}>
               <span style={{flex:1, padding: '4px 6px', color:'#0F172A'}}>10:48:13</span><span style={{flex:1, padding: '4px 6px', background: '#1E3A8A'}}>64.5</span><span style={{flex:1, padding: '4px 6px', background: '#FB923C'}}>37</span>
            </div>
          </div>
        </div>
      );

    case 'count-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 8, justifyContent: 'center' }}>
          <div style={{ background: '#FFF', padding: '12px 16px', borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 28, height: 28, background: '#EF4444', borderRadius: 4, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>⚠️</div>
            <div>
              <div style={{ fontSize: 9, color: '#64748B' }}>Total</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>3</div>
            </div>
          </div>
          <div style={{ background: '#FFF', padding: '12px 16px', borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 28, height: 28, background: '#F97316', borderRadius: 4, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>💻</div>
            <div>
              <div style={{ fontSize: 9, color: '#64748B' }}>Device</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>296</div>
            </div>
          </div>
        </div>
      );

    case 'maps':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, width: '100%', height: '100%', padding: 4 }}>
          {/* Map 1 */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
             <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
               <path d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60" stroke="#CBD5E1" strokeWidth="1" />
               <path d="M20,0 L20,100 M40,0 L40,100 M60,0 L60,100" stroke="#CBD5E1" strokeWidth="1" />
             </svg>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 24, color: '#3B82F6', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>📍</div>
          </div>
          {/* Map 2 */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
             <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
               <path d="M0,30 L100,30 M0,50 L100,50 M30,0 L30,100 M50,0 L50,100" stroke="#CBD5E1" strokeWidth="1" />
             </svg>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 24, color: '#EF4444', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>📍</div>
          </div>
          {/* Map 3 */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
             <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
               <polyline points="20,80 20,40 60,40" fill="none" stroke="#22C55E" strokeWidth="3" />
               <circle cx="20" cy="80" r="4" fill="#22C55E" />
             </svg>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, background: '#22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 10 }}>▶</div>
          </div>
          {/* Map 4 */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
             <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
               <polyline points="20,80 20,40 80,40 80,80" fill="none" stroke="#F59E0B" strokeWidth="3" />
             </svg>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, background: '#F59E0B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 14 }}>↑</div>
          </div>
        </div>
      );

    case 'analogue-gauges':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: 4, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <svg width="60" height="60" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#FFF" stroke="#E2E8F0" strokeWidth="2" />
              <path d="M 20 50 A 30 30 0 0 1 80 50" fill="none" stroke="#F97316" strokeWidth="8" />
              <path d="M 20 50 A 30 30 0 0 0 80 50" fill="none" stroke="#E2E8F0" strokeWidth="8" />
              <line x1="50" y1="50" x2="30" y2="30" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="50" r="4" fill="#0F172A" />
              <rect x="35" y="70" width="30" height="15" fill="#FFF" stroke="#E2E8F0" strokeWidth="1" />
              <text x="50" y="81" textAnchor="middle" fontSize="10" fill="#0F172A">034</text>
            </svg>
            <svg width="60" height="60" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#0F172A" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1E293B" strokeWidth="2" strokeDasharray="2 4" />
              <text x="50" y="20" textAnchor="middle" fontSize="12" fill="#FFF">N</text>
              <text x="50" y="90" textAnchor="middle" fontSize="12" fill="#FFF">S</text>
              <text x="85" y="55" textAnchor="middle" fontSize="12" fill="#FFF">E</text>
              <text x="15" y="55" textAnchor="middle" fontSize="12" fill="#FFF">W</text>
              <path d="M 50 25 L 55 50 L 50 75 L 45 50 Z" fill="#FFF" />
              <path d="M 50 25 L 55 50 L 50 50 Z" fill="#94A3B8" />
            </svg>
          </div>
          <div style={{ width: '90%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: '100%', height: 12, background: 'linear-gradient(90deg, #93C5FD, #3B82F6, #EF4444)', borderRadius: 6, position: 'relative' }}>
               <div style={{ position: 'absolute', top: -2, bottom: -2, left: '60%', width: 4, background: '#0F172A', borderRadius: 2 }} />
            </div>
            <div style={{ width: '100%', height: 12, background: 'linear-gradient(90deg, #93C5FD, #E2E8F0, #EF4444)', borderRadius: 6, position: 'relative' }}>
               <div style={{ position: 'absolute', top: -2, bottom: -2, left: '40%', width: 4, background: '#0F172A', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      );

    case 'buttons':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '80%', padding: '12px', background: '#FFF', border: '2px solid #0D9488', borderRadius: 6, color: '#0D9488', fontWeight: 700, fontSize: 16, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>🏠</span> Button
          </div>
          <div style={{ width: '80%', padding: '12px', background: '#FFF', border: '2px solid #0D9488', borderRadius: 6, color: '#0D9488', fontWeight: 700, fontSize: 16, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>↗</span> Send
          </div>
        </div>
      );

    case 'control-widgets':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', height: '100%' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '6px solid #E2E8F0', background: '#F8FAFC', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#334155', position: 'relative' }}>
            50.00
            <div style={{ position: 'absolute', top: -6, left: 26, width: 4, height: 10, background: '#3B82F6', borderRadius: 2 }} />
          </div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #E2E8F0, #CBD5E1)', border: '2px solid #94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#0F172A', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            I/O
          </div>
        </div>
      );

    case 'status-indicators':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', height: '100%', padding: 4 }}>
          <div style={{ background: '#FFF', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 28 }}>🔋</span>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>100%</div>
          </div>
          <div style={{ background: '#FFF', padding: 8, borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 }}>
               <div style={{ width: 6, height: 10, background: '#10B981', borderRadius: 2 }} />
               <div style={{ width: 6, height: 16, background: '#10B981', borderRadius: 2 }} />
               <div style={{ width: 6, height: 22, background: '#10B981', borderRadius: 2 }} />
               <div style={{ width: 6, height: 28, background: '#10B981', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>Signal</div>
          </div>
        </div>
      );

    case 'scada-symbols':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 6, border: '1px dashed #CBD5E1' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748B' }}>
            <svg width="48" height="48" viewBox="0 0 100 100">
               <polygon points="50,10 90,30 50,50 10,30" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
               <polygon points="10,30 50,50 50,90 10,70" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
               <polygon points="90,30 50,50 50,90 90,70" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
               <polyline points="50,50 50,90" fill="none" stroke="#94A3B8" strokeWidth="2" />
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>Resources</span>
          </div>
        </div>
      );

    case 'traditional-scada-fluid':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
             <div style={{ width: 40, height: 24, background: '#94A3B8', borderRadius: 4, position: 'relative' }}>
               <div style={{ position: 'absolute', top: 4, bottom: 4, left: 0, right: 0, background: '#CBD5E1' }} />
             </div>
             <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22C55E', border: '2px solid #16A34A' }} />
             <div style={{ width: 40, height: 24, background: '#94A3B8', borderRadius: 4, position: 'relative' }}>
               <div style={{ position: 'absolute', top: 4, bottom: 4, left: 0, right: 0, background: '#CBD5E1' }} />
             </div>
          </div>
        </div>
      );

    case 'scada-general':
    case 'scada-oil-gas':
    case 'scada-energy':
    case 'high-perf-scada-fluid':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ border: '2px solid #334155', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #3B82F6', borderRadius: '50%' }} />
          </div>
          <div style={{ width: 40, height: 8, background: '#334155' }} />
          <div style={{ width: 30, height: 40, background: '#94A3B8', borderRadius: 4 }} />
        </div>
      );

    case 'liquid-level':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, width: '100%', height: '100%', padding: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 32, border: '1px solid #3B82F6', borderRadius: 2, background: '#FFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: '#3B82F6' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 16, border: '1px solid #3B82F6', borderRadius: 2, background: '#FFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: '#3B82F6' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 32, border: '1px solid #3B82F6', borderRadius: 8, background: '#FFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: '#3B82F6' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 16, border: '1px solid #3B82F6', borderRadius: 8, background: '#FFF', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: '#3B82F6' }} />
            </div>
          </div>
        </div>
      );

    case 'digital-gauges':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: 6, width: '100%', color: '#10B981', fontFamily: 'monospace', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>76.25</div>
            <div style={{ fontSize: 9, color: '#94A3B8' }}>MPH<br/>DIGITAL</div>
          </div>
          <div style={{ background: '#0F172A', padding: '6px', borderRadius: 6, width: '100%', color: '#3B82F6', fontFamily: 'monospace', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
             <div style={{ fontSize: 16, fontWeight: 800 }}>9.98</div>
          </div>
        </div>
      );

    case 'entity-admin-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
             <div style={{ fontSize: 7, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Device admin</div>
             <div style={{ height: 12, background: '#F1F5F9', borderRadius: 2, marginBottom: 2 }} />
             <div style={{ height: 12, background: '#F1F5F9', borderRadius: 2 }} />
          </div>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
             <div style={{ fontSize: 7, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Asset admin</div>
             <div style={{ height: 12, background: '#F1F5F9', borderRadius: 2, marginBottom: 2 }} />
             <div style={{ height: 12, background: '#F1F5F9', borderRadius: 2 }} />
          </div>
        </div>
      );

    case 'input-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', gap: 6, padding: 4 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
               <div style={{ width: '100%', height: 12, border: '1px solid #CBD5E1', borderRadius: 2, marginBottom: 2 }} />
               <div style={{ width: '80%', height: 12, border: '1px solid #CBD5E1', borderRadius: 2 }} />
            </div>
            <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28 }}>
               <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#CBD5E1' }} />
            </div>
          </div>
          <div style={{ flex: 1, background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
             <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 100 100">
               <path d="M0,20 L100,20 M0,40 L100,40 M0,60 L100,60" stroke="#CBD5E1" strokeWidth="1" />
               <path d="M20,0 L20,100 M40,0 L40,100 M60,0 L60,100" stroke="#CBD5E1" strokeWidth="1" />
             </svg>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 12, background: '#FFF', border: '1px solid #CBD5E1', borderRadius: 2 }} />
          </div>
        </div>
      );

    case 'gateway-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
          <div style={{ width: '90%', background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
             <div style={{ fontSize: 6, fontWeight: 700, color: '#64748B' }}>RADIOGEET STORAGE</div>
             <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ flex: 1, height: 10, border: '1px solid #CBD5E1', borderRadius: 2 }} />
                <div style={{ flex: 1, height: 10, border: '1px solid #CBD5E1', borderRadius: 2 }} />
             </div>
             <div style={{ width: '100%', height: 16, background: '#10B981', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 6 }}>
                SAVE
             </div>
          </div>
        </div>
      );

    case 'edge-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
          <div style={{ width: '90%', height: '90%', background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
               <span style={{ fontSize: 10 }}>▼</span><span style={{ fontSize: 12 }}>🌩️</span><span style={{ fontSize: 8, fontWeight: 700 }}>Edge #1</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
               <span style={{ fontSize: 10 }}>▶</span><span style={{ fontSize: 12 }}>📦</span><span style={{ fontSize: 8 }}>Assets</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
               <span style={{ fontSize: 10 }}>▼</span><span style={{ fontSize: 12 }}>💻</span><span style={{ fontSize: 8 }}>Devices</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 24 }}>
               <span style={{ fontSize: 12 }}>💻</span><span style={{ fontSize: 8 }}>Thermometer A1</span>
             </div>
          </div>
        </div>
      );

    case 'entity-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', gap: 6, padding: 4 }}>
          <div style={{ flex: 1, background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <span style={{ fontSize: 8 }}>▼</span><span style={{ fontSize: 8, fontWeight: 700 }}>Tenant</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 6 }}>
               <span style={{ fontSize: 8 }}>▶</span><span style={{ fontSize: 8 }}>Customer A</span>
             </div>
          </div>
          <div style={{ flex: 1, background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
             <div style={{ fontSize: 5, fontWeight: 700, color: '#64748B', borderBottom: '1px solid #F1F5F9', paddingBottom: 2, marginBottom: 2 }}>Entities</div>
             <div style={{ height: 8, background: '#F1F5F9', borderRadius: 2, marginBottom: 2 }} />
             <div style={{ height: 8, background: '#F1F5F9', borderRadius: 2 }} />
          </div>
        </div>
      );

    case 'home-page-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
             <div style={{ flex: 1, background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Get started</div>
                <div style={{ fontSize: 6, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 2 }}><span style={{fontSize:8}}>+</span> Create device</div>
             </div>
             <div style={{ flex: 1, background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>Documentation</div>
                <div style={{ fontSize: 6, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 2 }}>📖 Read docs</div>
             </div>
          </div>
        </div>
      );

    case 'navigation-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', gap: 4, padding: 4 }}>
           <div style={{ flex: 1, background: '#3B82F6', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <span style={{ fontSize: 16 }}>💻</span>
              <span style={{ fontSize: 6, fontWeight: 700, marginTop: 2 }}>Devices</span>
           </div>
           <div style={{ flex: 1, background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <span style={{ fontSize: 16 }}>⛓️</span>
              <span style={{ fontSize: 6, fontWeight: 700, marginTop: 2 }}>Rule chains</span>
           </div>
           <div style={{ flex: 1, background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <span style={{ fontSize: 16 }}>👥</span>
              <span style={{ fontSize: 6, fontWeight: 700, marginTop: 2 }}>Customers</span>
           </div>
        </div>
      );

    case 'date-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
          <div style={{ display: 'flex', gap: 2, background: '#FFF', border: '1px solid #CBD5E1', borderRadius: 4, padding: 4 }}>
            <div style={{ fontSize: 8, padding: '2px 4px', borderRight: '1px solid #E2E8F0' }}>📅 2026-09-22</div>
            <div style={{ fontSize: 8, padding: '2px 4px', borderRight: '1px solid #E2E8F0' }}>Interval</div>
            <div style={{ fontSize: 8, padding: '2px 4px', color: '#3B82F6' }}>1 Day</div>
          </div>
        </div>
      );

    case 'html-widgets':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, width: '100%', height: '100%', padding: 4 }}>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4, fontSize: 5, color: '#334155' }}>
            <span style={{fontWeight: 700, fontSize: 6}}>HTML Code</span><br/>
            &lt;div class="box"&gt;<br/>
            &nbsp;&nbsp;&lt;h1&gt;Hello&lt;/h1&gt;<br/>
            &lt;/div&gt;
          </div>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4, fontSize: 7, fontWeight: 700, color: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            HTML code here
          </div>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
            <span style={{ fontSize: 6, color: '#64748B' }}>VALUE TITLE</span>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>2.44 units</div>
          </div>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: 16, background: '#F1F5F9', borderRadius: 2 }} />
          </div>
        </div>
      );

    case 'gpio-widgets':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%', height: '100%', padding: 4 }}>
          <div style={{ background: '#166534', borderRadius: 6, padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
             <div style={{ display: 'flex', gap: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FACC15' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FACC15' }} />
             </div>
             <div style={{ display: 'flex', gap: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FACC15' }} />
             </div>
             <div style={{ fontSize: 6, color: '#FFF', fontWeight: 700, marginTop: 'auto' }}>Raspberry Pi</div>
          </div>
          <div style={{ background: '#166534', borderRadius: 6, padding: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
             <div style={{ display: 'flex', gap: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
             </div>
             <div style={{ display: 'flex', gap: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FACC15' }} />
             </div>
             <div style={{ fontSize: 6, color: '#FFF', fontWeight: 700, marginTop: 'auto' }}>Control</div>
          </div>
        </div>
      );

    case 'device-emulator':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%', height: '100%', padding: 4 }}>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
            <span style={{ fontSize: 16 }}>🚫</span>
            <span style={{ fontSize: 7, marginTop: 4 }}>No image preview</span>
          </div>
          <div style={{ background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
            <span style={{ fontSize: 16 }}>🚫</span>
            <span style={{ fontSize: 7, marginTop: 4 }}>No image preview</span>
          </div>
        </div>
      );

    case 'files-widgets':
    case 'scheduling-widgets':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', gap: 6, padding: 4 }}>
          <div style={{ flex: 1, background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
             <div style={{ fontSize: 7, fontWeight: 700, color: '#0F172A', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, marginBottom: 2 }}>Name</div>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #F1F5F9' }}>
               <span style={{ fontSize: 6, color: '#0F172A' }}>report-2020-07-27.pdf</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
               <span style={{ fontSize: 6, color: '#0F172A' }}>report-2020-07-28.pdf</span>
             </div>
          </div>
          <div style={{ flex: 1, background: '#FFF', borderRadius: 6, border: '1px solid #E2E8F0', padding: 4 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, marginBottom: 2 }}>
               <span style={{ fontSize: 7, fontWeight: 700, color: '#0F172A' }}>Name</span>
               <span style={{ fontSize: 7, fontWeight: 700, color: '#0F172A' }}>Type</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid #F1F5F9' }}>
               <span style={{ fontSize: 6, color: '#0F172A' }}>Weekly reports</span>
               <span style={{ fontSize: 6, color: '#0F172A' }}>Report</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
               <span style={{ fontSize: 6, color: '#0F172A' }}>Daily reports</span>
               <span style={{ fontSize: 6, color: '#0F172A' }}>Report</span>
             </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#64748B', fontSize: 11 }}>
          <Box size={24} style={{ color: '#2563EB' }} />
          <span>Widget Bundle</span>
        </div>
      );
  }
}

// Visual Preview Graphic Component for Individual Sub-Widgets
function RenderWidgetPreview({ type, category }) {
  // 14 Exact Chart Previews matching user screenshots
  switch (type) {
    case 'time-series-chart':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <rect x="15" y="45" width="12" height="35" fill="#10B981" rx="2" />
          <rect x="40" y="35" width="12" height="45" fill="#10B981" rx="2" />
          <rect x="65" y="40" width="12" height="40" fill="#10B981" rx="2" />
          <rect x="90" y="25" width="12" height="55" fill="#10B981" rx="2" />
          <rect x="115" y="50" width="12" height="30" fill="#10B981" rx="2" />
          <polyline points="10,70 30,35 60,55 90,20 120,25 145,65" stroke="#3B82F6" strokeWidth="2.5" fill="none" />
          <polyline points="10,65 40,25 70,45 100,38 130,12 145,30" stroke="#EAB308" strokeWidth="2.5" fill="none" />
        </svg>
      );

    case 'line-chart':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <polyline points="10,70 25,35 50,30 85,15 120,40 145,20" stroke="#3B82F6" strokeWidth="2.5" fill="none" />
          <polyline points="10,65 40,30 70,50 110,35 145,15" stroke="#EAB308" strokeWidth="2.5" fill="none" />
          <polyline points="10,80 35,50 65,65 100,55 125,75 145,50" stroke="#10B981" strokeWidth="2.5" fill="none" />
        </svg>
      );

    case 'bar-chart':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <rect x="20" y="30" width="16" height="50" fill="#F59E0B" rx="2" />
          <rect x="40" y="45" width="16" height="35" fill="#10B981" rx="2" />
          <rect x="60" y="38" width="16" height="42" fill="#3B82F6" rx="2" />
          <rect x="100" y="35" width="16" height="45" fill="#F59E0B" rx="2" />
          <rect x="120" y="22" width="16" height="58" fill="#10B981" rx="2" />
          <rect x="140" y="15" width="16" height="65" fill="#3B82F6" rx="2" />
        </svg>
      );

    case 'point-chart':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <circle cx="20" cy="70" r="4" fill="#3B82F6" />
          <circle cx="45" cy="50" r="4" fill="#3B82F6" />
          <circle cx="70" cy="30" r="4" fill="#3B82F6" />
          <circle cx="95" cy="40" r="4" fill="#3B82F6" />
          <circle cx="120" cy="25" r="4" fill="#3B82F6" />
          <circle cx="145" cy="35" r="4" fill="#3B82F6" />

          <circle cx="20" cy="50" r="4" fill="#EAB308" />
          <circle cx="45" cy="40" r="4" fill="#EAB308" />
          <circle cx="70" cy="55" r="4" fill="#EAB308" />
          <circle cx="95" cy="45" r="4" fill="#EAB308" />
          <circle cx="120" cy="35" r="4" fill="#EAB308" />

          <circle cx="20" cy="80" r="4" fill="#10B981" />
          <circle cx="45" cy="65" r="4" fill="#10B981" />
          <circle cx="70" cy="60" r="4" fill="#10B981" />
          <circle cx="95" cy="70" r="4" fill="#10B981" />
          <circle cx="120" cy="80" r="4" fill="#10B981" />
        </svg>
      );

    case 'state-chart':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <path d="M 10 20 H 40 V 30 H 80 V 20 H 120 V 35 H 150" stroke="#EAB308" strokeWidth="2" fill="none" />
          <path d="M 10 50 H 30 V 40 H 60 V 45 H 110 V 60 H 150" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <path d="M 10 75 H 50 V 65 H 90 V 75 H 130 V 68 H 150" stroke="#10B981" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'bar-chart-labels':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <rect x="20" y="20" width="14" height="60" fill="#8B5CF6" rx="2" />
          <rect x="36" y="35" width="14" height="45" fill="#EC4899" rx="2" />
          <rect x="52" y="30" width="14" height="50" fill="#EF4444" rx="2" />
          <rect x="68" y="45" width="14" height="35" fill="#EAB308" rx="2" />

          <rect x="100" y="25" width="14" height="55" fill="#8B5CF6" rx="2" />
          <rect x="116" y="40" width="14" height="40" fill="#EC4899" rx="2" />
          <rect x="132" y="30" width="14" height="50" fill="#EF4444" rx="2" />
          <rect x="148" y="50" width="14" height="30" fill="#EAB308" rx="2" />
        </svg>
      );

    case 'range-chart':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <polygon points="10,75 35,50 60,20 85,75 110,60 135,30 150,75" fill="#EF4444" opacity="0.8" />
          <polygon points="10,75 35,60 60,35 85,75 110,68 135,45 150,75" fill="#F97316" opacity="0.8" />
          <polygon points="10,75 35,70 60,50 85,75 110,72 135,60 150,75" fill="#3B82F6" opacity="0.8" />
        </svg>
      );

    case 'value-chart-card':
      return (
        <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 8, width: '100%' }}>
          <div style={{ fontSize: 9, color: '#64748B' }}>💧 Cold water usage</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '2px 0' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>21 m³</span>
            <span style={{ fontSize: 9, color: '#10B981', fontWeight: 700 }}>-16%</span>
          </div>
          <svg width="100%" height="30" viewBox="0 0 120 30" fill="none">
            <polyline points="0,20 20,25 40,15 60,22 80,10 100,18 120,12" stroke="#475569" strokeWidth="2" fill="none" />
          </svg>
        </div>
      );

    case 'bars':
      return (
        <svg width="100%" height="90" viewBox="0 0 160 90" fill="none">
          <rect x="20" y="15" width="25" height="65" fill="#10B981" rx="3" />
          <rect x="55" y="35" width="25" height="45" fill="#3B82F6" rx="3" />
          <rect x="90" y="45" width="25" height="35" fill="#EF4444" rx="3" />
          <rect x="125" y="30" width="25" height="50" fill="#F59E0B" rx="3" />
          <text x="32" y="12" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F172A">A</text>
          <text x="67" y="32" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F172A">B</text>
          <text x="102" y="42" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F172A">C</text>
          <text x="137" y="27" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F172A">D</text>
        </svg>
      );

    case 'pie':
      return (
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <path d="M 50 50 L 50 5 A 45 45 0 1 1 5 60 Z" fill="#10B981" />
          <path d="M 50 50 L 5 60 A 45 45 0 0 1 50 5 Z" fill="#EF4444" />
          <path d="M 50 50 L 50 5 A 45 45 0 0 1 80 85 Z" fill="#EAB308" opacity="0" />
        </svg>
      );

    case 'doughnut':
      return (
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="38" stroke="#EF4444" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="8" strokeDasharray="180 80" fill="none" />
          <text x="50" y="45" textAnchor="middle" fontSize="9" fill="#94A3B8">Total</text>
          <text x="50" y="60" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0F172A">183</text>
        </svg>
      );

    case 'horizontal-doughnut':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="38" stroke="#EF4444" strokeWidth="8" fill="none" />
            <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="8" strokeDasharray="180 80" fill="none" />
            <text x="50" y="45" textAnchor="middle" fontSize="9" fill="#94A3B8">Total</text>
            <text x="50" y="60" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0F172A">183</text>
          </svg>
          <div style={{ fontSize: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> A 132</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} /> B 51</div>
          </div>
        </div>
      );

    case 'polar-area':
      return (
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="42" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="50" cy="50" r="28" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M 50 50 L 50 10 A 40 40 0 0 1 85 65 Z" fill="#EF4444" opacity="0.85" />
          <path d="M 50 50 L 85 65 A 40 40 0 0 1 15 75 Z" fill="#3B82F6" opacity="0.85" />
          <path d="M 50 50 L 15 75 A 40 40 0 0 1 50 10 Z" fill="#10B981" opacity="0.85" />
        </svg>
      );

    case 'radar':
      return (
        <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 90,80 10,80" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
          <polygon points="50,30 75,70 25,70" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
          <polygon points="50,20 80,75 20,65" stroke="#0D9488" strokeWidth="2" fill="rgba(13, 148, 136, 0.2)" />
          <circle cx="50" cy="20" r="3" fill="#0D9488" />
          <circle cx="80" cy="75" r="3" fill="#0D9488" />
          <circle cx="20" cy="65" r="3" fill="#0D9488" />
        </svg>
      );

    case 'battery-level-widget':
      return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 50, border: '3px solid #10B981', borderRadius: 4, padding: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -6, left: 8, width: 8, height: 4, background: '#10B981', borderRadius: '2px 2px 0 0' }} />
            <div style={{ width: '100%', height: '22%', background: '#10B981', borderRadius: 1, marginTop: 1 }} />
            <div style={{ width: '100%', height: '22%', background: '#10B981', borderRadius: 1, marginTop: 2 }} />
            <div style={{ width: '100%', height: '22%', background: '#10B981', borderRadius: 1, marginTop: 2 }} />
            <div style={{ width: '100%', height: '22%', background: '#10B981', borderRadius: 1, marginTop: 2 }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>100 %</div>
        </div>
      );

    case 'signal-strength-widget':
      return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
          <div style={{ width: 8, height: '20%', background: '#10B981', borderRadius: 2 }} />
          <div style={{ width: 8, height: '40%', background: '#10B981', borderRadius: 2 }} />
          <div style={{ width: 8, height: '60%', background: '#10B981', borderRadius: 2 }} />
          <div style={{ width: 8, height: '80%', background: '#10B981', borderRadius: 2 }} />
          <div style={{ width: 8, height: '100%', background: '#10B981', borderRadius: 2 }} />
        </div>
      );

    case 'progress-bar-status':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '0 10px' }}>
          <div style={{ width: '100%', height: 16, background: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: '36%', height: '100%', background: '#10B981' }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>36 %</div>
        </div>
      );

    case 'status-widget-control':
      return (
        <div style={{ background: '#0F172A', padding: 12, borderRadius: 8, width: '100%', color: '#FFF' }}>
          <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>Window left corner</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            OPENED
          </div>
        </div>
      );

    case 'scada-symbol-svg':
      return (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <polyline points="9 15 12 18 15 15"></polyline>
          <text x="7" y="10" fontSize="4" strokeWidth="0.5" fill="#0D9488">SVG</text>
        </svg>
      );

    case 'horizontal-pipe':
      return <div style={{ width: 80, height: 24, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B' }} />;
    
    case 'long-horizontal-pipe':
      return <div style={{ width: 120, height: 24, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B' }} />;
    
    case 'extra-long-horizontal-pipe':
      return <div style={{ width: 160, height: 16, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '1.5px solid #64748B', borderBottom: '1.5px solid #64748B' }} />;
    
    case 'vertical-pipe':
      return <div style={{ width: 24, height: 80, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '2px solid #64748B', borderRight: '2px solid #64748B' }} />;
    
    case 'long-vertical-pipe':
      return <div style={{ width: 24, height: 120, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '2px solid #64748B', borderRight: '2px solid #64748B' }} />;
    
    case 'extra-long-vertical-pipe':
      return <div style={{ width: 16, height: 160, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '1.5px solid #64748B', borderRight: '1.5px solid #64748B' }} />;

    case 'left-bottom-elbow-pipe':
      return (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M0 20 Q40 20 40 60 L16 60 Q16 44 0 44 Z" fill="url(#pipeGradELB)" stroke="#64748B" strokeWidth="2" />
          <defs><linearGradient id="pipeGradELB" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );
    
    case 'bottom-right-elbow-pipe':
      return (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M20 60 Q20 20 60 20 L60 44 Q44 44 44 60 Z" fill="url(#pipeGradBR)" stroke="#64748B" strokeWidth="2" />
          <defs><linearGradient id="pipeGradBR" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'top-right-elbow-pipe':
      return (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M20 0 Q20 40 60 40 L60 16 Q44 16 44 0 Z" fill="url(#pipeGradTR)" stroke="#64748B" strokeWidth="2" />
          <defs><linearGradient id="pipeGradTR" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'left-top-elbow-pipe':
      return (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M0 40 Q40 40 40 0 L16 0 Q16 16 0 16 Z" fill="url(#pipeGradLT)" stroke="#64748B" strokeWidth="2" />
          <defs><linearGradient id="pipeGradLT" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'cross-pipe':
      return (
        <div style={{ position: 'relative', width: 60, height: 60 }}>
          <div style={{ position: 'absolute', top: 20, left: 0, width: 60, height: 20, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B' }} />
          <div style={{ position: 'absolute', top: 0, left: 20, width: 20, height: 60, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '2px solid #64748B', borderRight: '2px solid #64748B' }} />
        </div>
      );

    case 'left-tee-pipe':
      return (
        <div style={{ position: 'relative', width: 40, height: 60, marginLeft: 20 }}>
          <div style={{ position: 'absolute', top: 0, left: 20, width: 20, height: 60, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '2px solid #64748B', borderRight: '2px solid #64748B' }} />
          <div style={{ position: 'absolute', top: 20, left: 0, width: 20, height: 20, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B' }} />
        </div>
      );

    case 'bottom-tee-pipe':
      return (
        <div style={{ position: 'relative', width: 60, height: 40, marginBottom: 20 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 60, height: 20, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B' }} />
          <div style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '2px solid #64748B', borderRight: '2px solid #64748B' }} />
        </div>
      );

    case 'right-tee-pipe':
      return (
        <div style={{ position: 'relative', width: 40, height: 60, marginRight: 20 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 60, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '2px solid #64748B', borderRight: '2px solid #64748B' }} />
          <div style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B' }} />
        </div>
      );

    case 'top-tee-pipe':
      return (
        <div style={{ position: 'relative', width: 60, height: 40, marginTop: 20 }}>
          <div style={{ position: 'absolute', top: 20, left: 0, width: 60, height: 20, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B' }} />
          <div style={{ position: 'absolute', top: 0, left: 20, width: 20, height: 20, background: 'linear-gradient(to right, #94A3B8, #F1F5F9, #94A3B8)', borderLeft: '2px solid #64748B', borderRight: '2px solid #64748B' }} />
        </div>
      );

    case 'right-elbow-drain-pipe':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M0 20 Q40 20 40 60 L16 60 Q16 44 0 44 Z" fill="url(#pipeGradELBD)" stroke="#64748B" strokeWidth="2" />
          <path d="M40 60 Q50 70 45 80 L20 80 Q15 65 16 60 Z" fill="#0D9488" opacity="0.8" />
          <defs><linearGradient id="pipeGradELBD" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'left-elbow-drain-pipe':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M80 20 Q40 20 40 60 L64 60 Q64 44 80 44 Z" fill="url(#pipeGradELBDL)" stroke="#64748B" strokeWidth="2" />
          <path d="M40 60 Q30 70 35 80 L60 80 Q65 65 64 60 Z" fill="#0D9488" opacity="0.8" />
          <defs><linearGradient id="pipeGradELBDL" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'left-drain-pipe':
      return (
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
          <path d="M40 20 L100 20 L100 44 L40 44 Z" fill="url(#pipeGradHL)" stroke="#64748B" strokeWidth="2" />
          <path d="M40 44 Q30 54 35 60 L10 60 Q20 44 40 44 Z" fill="#0D9488" opacity="0.8" />
          <defs><linearGradient id="pipeGradHL" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'right-drain-pipe':
      return (
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
          <path d="M0 20 L60 20 L60 44 L0 44 Z" fill="url(#pipeGradHR)" stroke="#64748B" strokeWidth="2" />
          <path d="M60 44 Q70 54 65 60 L90 60 Q80 44 60 44 Z" fill="#0D9488" opacity="0.8" />
          <defs><linearGradient id="pipeGradHR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'short-left-drain-pipe':
      return (
        <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
          <path d="M40 20 L70 20 L70 44 L40 44 Z" fill="url(#pipeGradHL)" stroke="#64748B" strokeWidth="2" />
          <path d="M40 44 Q30 54 35 60 L10 60 Q20 44 40 44 Z" fill="#0D9488" opacity="0.8" />
        </svg>
      );

    case 'short-right-drain-pipe':
      return (
        <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
          <path d="M0 20 L30 20 L30 44 L0 44 Z" fill="url(#pipeGradHR)" stroke="#64748B" strokeWidth="2" />
          <path d="M30 44 Q40 54 35 60 L60 60 Q50 44 30 44 Z" fill="#0D9488" opacity="0.8" />
        </svg>
      );

    case 'horizontal-broken-pipe':
    case 'long-horizontal-broken-pipe':
      return (
        <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
          <path d="M0 10 L40 10 L35 20 L45 30 L40 34 L0 34 Z" fill="url(#pipeGradHB)" stroke="#64748B" strokeWidth="2" />
          <path d="M100 10 L60 10 L65 20 L55 30 L60 34 L100 34 Z" fill="url(#pipeGradHB)" stroke="#64748B" strokeWidth="2" />
          <defs><linearGradient id="pipeGradHB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'vertical-broken-pipe':
    case 'long-vertical-broken-pipe':
      return (
        <svg width="40" height="100" viewBox="0 0 40 100" fill="none">
          <path d="M10 0 L10 40 L20 35 L30 45 L34 40 L34 0 Z" fill="url(#pipeGradVB)" stroke="#64748B" strokeWidth="2" />
          <path d="M10 100 L10 60 L20 65 L30 55 L34 60 L34 100 Z" fill="url(#pipeGradVB)" stroke="#64748B" strokeWidth="2" />
          <defs><linearGradient id="pipeGradVB" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'top-flow-meter':
    case 'right-flow-meter':
    case 'bottom-flow-meter':
    case 'left-flow-meter':
    case 'horizontal-inline-flow-meter':
    case 'vertical-inline-flow-meter':
      return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 80, height: 20, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B', position: 'absolute' }} />
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FFF', border: '5px solid #64748B', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />
            </div>
            <div style={{ border: '1px solid #CBD5E1', padding: '0 8px', fontSize: 10, fontWeight: 700 }}>0</div>
            <div style={{ fontSize: 7, color: '#64748B' }}>m³/hr</div>
          </div>
        </div>
      );

    case 'left-analog-water-level-meter':
    case 'right-analog-water-level-meter':
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 8, height: 60, background: '#64748B' }} />
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#FFF', border: '5px solid #10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '70%', marginTop: 25, fontSize: 10, fontWeight: 700 }}><span>E</span><span>F</span></div>
            <div style={{ fontSize: 9, position: 'absolute', bottom: 10 }}>Water ≈</div>
            <div style={{ width: 2, height: 25, background: '#F97316', position: 'absolute', top: 35, left: 35, transformOrigin: 'top', transform: 'rotate(-45deg)' }} />
          </div>
        </div>
      );

    case 'meter':
    case 'small-meter':
    case 'small-right-meter':
    case 'small-left-meter':
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 24, height: 70, background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 4, position: 'relative', padding: 2 }}>
            <div style={{ width: 6, height: '100%', background: '#E2E8F0', position: 'absolute', right: 4, bottom: 2 }}>
              <div style={{ width: '100%', height: '37%', background: '#3B82F6', position: 'absolute', bottom: 0 }} />
            </div>
            <div style={{ fontSize: 5, color: '#64748B', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'absolute', left: 2 }}>
              <span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
            </div>
          </div>
        </div>
      );

    case 'leak-sensor':
      return (
        <div style={{ width: 60, height: 60, background: '#FFF', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.5)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
          </svg>
        </div>
      );

    case 'centrifugal-pump':
      return (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <rect x="20" y="80" width="60" height="10" fill="#94A3B8" />
          <circle cx="50" cy="50" r="40" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="50" cy="50" r="25" fill="#FFF" />
          <path d="M50 50 L50 25 M50 50 L75 50 M50 50 L50 75 M50 50 L25 50 M50 50 L68 32 M50 50 L68 68 M50 50 L32 68 M50 50 L32 32" stroke="#10B981" strokeWidth="8" />
          <circle cx="50" cy="50" r="10" fill="#10B981" />
          <rect x="0" y="40" width="10" height="20" fill="#94A3B8" />
        </svg>
      );

    case 'small-right-motor-pump':
    case 'small-left-motor-pump':
    case 'right-motor-pump':
    case 'left-motor-pump':
      return (
        <svg width="80" height="60" viewBox="0 0 100 60" fill="none">
          <rect x="15" y="55" width="70" height="5" fill="#15803D" />
          <rect x="20" y="20" width="50" height="35" fill="#16A34A" rx="4" />
          <line x1="20" y1="25" x2="70" y2="25" stroke="#15803D" strokeWidth="2" />
          <line x1="20" y1="30" x2="70" y2="30" stroke="#15803D" strokeWidth="2" />
          <line x1="20" y1="35" x2="70" y2="35" stroke="#15803D" strokeWidth="2" />
          <line x1="20" y1="40" x2="70" y2="40" stroke="#15803D" strokeWidth="2" />
          <line x1="20" y1="45" x2="70" y2="45" stroke="#15803D" strokeWidth="2" />
          <line x1="20" y1="50" x2="70" y2="50" stroke="#15803D" strokeWidth="2" />
          <path d="M70 20 Q90 20 90 35 Q90 55 70 55 Z" fill="#16A34A" />
          <rect x="80" y="5" width="20" height="15" fill="#16A34A" rx="2" />
          <rect x="90" y="35" width="10" height="15" fill="#94A3B8" />
        </svg>
      );

    case 'right-heat-pump':
    case 'left-heat-pump':
      return (
        <div style={{ width: 90, height: 60, background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 4, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ marginLeft: 10, width: 40, height: 40, borderRadius: '50%', border: '2px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1l14.2-14.2"/></svg>
          </div>
          <div style={{ position: 'absolute', top: 5, right: 10, background: '#FFF', padding: '2px 6px', fontSize: 10, border: '1px solid #CBD5E1', borderRadius: 2 }}>27</div>
          <div style={{ position: 'absolute', bottom: 5, right: 15, width: 12, height: 12, borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6 }}>⏻</div>
        </div>
      );

    case 'short-bottom-filter':
    case 'long-bottom-filter':
    case 'short-top-filter':
    case 'long-top-filter':
      return (
        <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
          <rect x="0" y="20" width="10" height="10" fill="#94A3B8" />
          <rect x="30" y="20" width="10" height="10" fill="#94A3B8" />
          <path d="M10 10 Q10 0 20 0 Q30 0 30 10 L30 70 Q30 80 20 80 Q10 80 10 70 Z" fill="url(#filterGrad)" />
          <rect x="8" y="30" width="24" height="4" fill="#E2E8F0" />
          <defs><linearGradient id="filterGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#64748B"/><stop offset="50%" stopColor="#CBD5E1"/><stop offset="100%" stopColor="#64748B"/></linearGradient></defs>
        </svg>
      );

    case 'sand-filter':
      return (
        <svg width="70" height="80" viewBox="0 0 80 100" fill="none">
          <path d="M10 40 Q10 10 40 10 Q70 10 70 40 L70 80 Q70 100 40 100 Q10 100 10 80 Z" fill="url(#sandGrad)" />
          <rect x="25" y="40" width="30" height="40" fill="#FFF" rx="2" />
          <rect x="28" y="43" width="10" height="6" fill="#E2E8F0" rx="1" />
          <rect x="42" y="43" width="10" height="6" fill="#E2E8F0" rx="1" />
          <rect x="28" y="52" width="10" height="6" fill="#E2E8F0" rx="1" />
          <rect x="42" y="52" width="10" height="6" fill="#E2E8F0" rx="1" />
          <rect x="28" y="61" width="10" height="6" fill="#E2E8F0" rx="1" />
          <rect x="42" y="61" width="10" height="6" fill="#E2E8F0" rx="1" />
          <rect x="30" y="0" width="20" height="10" fill="#94A3B8" />
          <rect x="10" y="5" width="60" height="5" fill="#64748B" />
          <defs><linearGradient id="sandGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'horizontal-wheel-valve':
    case 'vertical-wheel-valve':
    case 'horizontal-ball-valve':
    case 'vertical-ball-valve':
      return (
        <svg width="80" height="50" viewBox="0 0 100 60" fill="none">
          <rect x="0" y="20" width="100" height="20" fill="#16A34A" />
          <path d="M30 15 Q50 5 70 15 L70 45 Q50 55 30 45 Z" fill="#15803D" />
          <circle cx="50" cy="30" r="25" stroke="#CBD5E1" strokeWidth="4" fill="none" />
          <circle cx="50" cy="30" r="12" fill="#16A34A" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M50 5 L50 18 M50 42 L50 55 M25 30 L38 30 M62 30 L75 30" stroke="#CBD5E1" strokeWidth="4" />
          <circle cx="50" cy="30" r="4" fill="#FFF" />
        </svg>
      );

    case 'water-stop':
      return (
        <div style={{ position: 'relative', width: 80, height: 50 }}>
          <div style={{ width: 80, height: 24, background: 'linear-gradient(to bottom, #94A3B8, #F1F5F9, #94A3B8)', borderTop: '2px solid #64748B', borderBottom: '2px solid #64748B', position: 'absolute', bottom: 10 }} />
          <div style={{ width: 30, height: 25, background: '#16A34A', borderRadius: 4, position: 'absolute', top: 5, left: 25, borderBottom: '4px solid #475569' }} />
        </div>
      );

    case 'vertical-tank':
      return (
        <svg width="60" height="80" viewBox="0 0 60 100" fill="none">
          <path d="M0 20 Q30 -10 60 20 L60 100 L0 100 Z" fill="url(#tankGrad)" />
          <rect x="45" y="30" width="6" height="60" fill="#CBD5E1" />
          <rect x="45" y="70" width="6" height="20" fill="#3B82F6" />
          <rect x="15" y="15" width="30" height="10" fill="#E2E8F0" rx="2" />
          <text x="30" y="22" fontSize="5" textAnchor="middle" fill="#64748B">1660 gal</text>
          <defs><linearGradient id="tankGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#94A3B8"/><stop offset="50%" stopColor="#F1F5F9"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        </svg>
      );

    case 'temperature-radial-gauge':
    case 'speed-gauge':
    case 'radial-gauge':
      return (
        <div style={{ position: 'relative', width: 80, height: 40, overflow: 'hidden', margin: '0 auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '8px solid #E2E8F0', borderTopColor: '#3B82F6', borderRightColor: '#3B82F6', transform: 'rotate(-45deg)', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>22.5</div>
        </div>
      );
      
    case 'thermometer-scale':
      return (
        <div style={{ width: '100%', padding: '0 10px', display: 'flex', alignItems: 'center', height: '100%' }}>
          <div style={{ width: '100%', height: 16, background: 'linear-gradient(to right, #3B82F6, #EF4444)', borderRadius: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', left: '60%', top: -4, bottom: -4, width: 4, background: '#FFF', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', borderRadius: 2 }} />
          </div>
        </div>
      );

    case 'compass-widget':
      return (
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1E293B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, position: 'relative', margin: '0 auto' }}>
          <span style={{ position: 'absolute', top: 4 }}>N</span>
          <span style={{ position: 'absolute', bottom: 4 }}>S</span>
          <span style={{ position: 'absolute', left: 4 }}>W</span>
          <span style={{ position: 'absolute', right: 4 }}>E</span>
          <div style={{ width: 2, height: 20, background: '#EF4444', position: 'absolute', top: 10, borderRadius: 1 }} />
        </div>
      );

    case 'value-card':
    case 'horizontal-value-card':
    case 'label-card':
    case 'label-value-card':
    case 'simple-card':
    case 'label-widget-card':
    case 'html-value-card':
    case 'markdown-value-card':
    case 'dashboard-state-widget':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>22.5</div>
          <div style={{ fontSize: 10, color: '#64748B' }}>Temperature °C</div>
        </div>
      );

    case 'value-and-chart-card':
    case 'simple-value-chart-card':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0 10px', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>4,250</div>
          <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: 4 }}>
            <path d="M0 25 L20 15 L40 20 L60 5 L80 15 L100 0" fill="none" stroke="#10B981" strokeWidth="2" />
            <path d="M0 25 L20 15 L40 20 L60 5 L80 15 L100 0 L100 30 L0 30 Z" fill="#10B981" opacity="0.1" />
          </svg>
        </div>
      );

    case 'progress-bar-card':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: '0 10px', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>36 %</div>
          <div style={{ width: '100%', height: 12, background: '#E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ width: '36%', height: '100%', background: '#3B82F6' }} />
          </div>
        </div>
      );

    case 'qr-code-widget':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <svg width="60" height="60" viewBox="0 0 50 50" fill="#0F172A">
            <rect x="5" y="5" width="15" height="15" fill="none" stroke="#0F172A" strokeWidth="3" rx="1" />
            <rect x="30" y="5" width="15" height="15" fill="none" stroke="#0F172A" strokeWidth="3" rx="1" />
            <rect x="5" y="30" width="15" height="15" fill="none" stroke="#0F172A" strokeWidth="3" rx="1" />
            <rect x="10" y="10" width="5" height="5" rx="1" />
            <rect x="35" y="10" width="5" height="5" rx="1" />
            <rect x="10" y="35" width="5" height="5" rx="1" />
            <rect x="30" y="30" width="5" height="5" rx="1" />
            <rect x="40" y="35" width="5" height="5" rx="1" />
            <rect x="30" y="40" width="15" height="5" rx="1" />
            <rect x="23" y="5" width="4" height="40" fill="#E2E8F0" />
            <rect x="5" y="23" width="40" height="4" fill="#E2E8F0" />
          </svg>
        </div>
      );

    case 'attributes-card':
    case 'multiple-attributes-card':
    case 'multiple-values-card':
    case 'timeseries-table-card':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: '0 10px', justifyContent: 'center', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 4 }}>
            <span style={{ fontSize: 9, color: '#64748B' }}>Firmware version</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#0F172A' }}>v2.4.1</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 4 }}>
            <span style={{ fontSize: 9, color: '#64748B' }}>Battery level</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#0F172A' }}>86 %</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: '#64748B' }}>Device status</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#10B981' }}>Active</span>
          </div>
        </div>
      );

    case 'entities-table-widget':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '0 8px', height: '100%', justifyContent: 'center', fontSize: 7 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px', fontWeight: 700, color: '#475569' }}>
              <div style={{ flex: 1 }}>Name</div>
              <div style={{ flex: 1 }}>Type</div>
              <div style={{ flex: 1 }}>Random</div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px', color: '#64748B' }}>
              <div style={{ flex: 1 }}>WM452</div>
              <div style={{ flex: 1 }}>Device</div>
              <div style={{ flex: 1 }}>89.56</div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px', color: '#64748B' }}>
              <div style={{ flex: 1 }}>KL514</div>
              <div style={{ flex: 1 }}>Device</div>
              <div style={{ flex: 1 }}>79.24</div>
            </div>
            <div style={{ display: 'flex', padding: '6px', color: '#64748B' }}>
              <div style={{ flex: 1 }}>A31</div>
              <div style={{ flex: 1 }}>Building</div>
              <div style={{ flex: 1 }}>21.47</div>
            </div>
          </div>
        </div>
      );

    case 'alarms-table-widget':
    case 'alarms-table-in-tables':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '0 8px', height: '100%', justifyContent: 'center', fontSize: 7 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E2E8F0', padding: '6px', fontWeight: 700, color: '#475569' }}>
              <div style={{ width: 16 }}><div style={{ width: 8, height: 8, border: '1px solid #94A3B8', borderRadius: 1 }}></div></div>
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 2 }}>Type <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
              <div style={{ flex: 1 }}>Severity</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E2E8F0', padding: '6px', color: '#64748B' }}>
              <div style={{ width: 16 }}><div style={{ width: 8, height: 8, border: '1px solid #94A3B8', borderRadius: 1 }}></div></div>
              <div style={{ flex: 2 }}>Temperature</div>
              <div style={{ flex: 1, color: '#F59E0B', fontWeight: 600 }}>Major</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E2E8F0', padding: '6px', color: '#64748B' }}>
              <div style={{ width: 16 }}><div style={{ width: 8, height: 8, border: '1px solid #94A3B8', borderRadius: 1 }}></div></div>
              <div style={{ flex: 2 }}>Temperature</div>
              <div style={{ flex: 1, color: '#EF4444', fontWeight: 600 }}>Critical</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px', color: '#64748B' }}>
              <div style={{ width: 16 }}><div style={{ width: 8, height: 8, border: '1px solid #94A3B8', borderRadius: 1 }}></div></div>
              <div style={{ flex: 2 }}>Low Humidity</div>
              <div style={{ flex: 1, color: '#22C55E', fontWeight: 600 }}>Warning</div>
            </div>
          </div>
        </div>
      );

    case 'time-series-table-widget':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '0 8px', height: '100%', justifyContent: 'center', fontSize: 7 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px', fontWeight: 700, color: '#475569' }}>
              <div style={{ flex: 1.5 }}>Time</div>
              <div style={{ flex: 1 }}>Humidity</div>
              <div style={{ flex: 1 }}>Temper..</div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ flex: 1.5, padding: '6px', color: '#64748B' }}>10:48:15</div>
              <div style={{ flex: 1, padding: '6px', backgroundColor: '#6366F1', color: '#FFF' }}>59.3</div>
              <div style={{ flex: 1, padding: '6px', backgroundColor: '#FB7185', color: '#FFF' }}>45.6</div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ flex: 1.5, padding: '6px', color: '#64748B' }}>10:48:14</div>
              <div style={{ flex: 1, padding: '6px', backgroundColor: '#4F46E5', color: '#FFF' }}>61.2</div>
              <div style={{ flex: 1, padding: '6px', backgroundColor: '#F87171', color: '#FFF' }}>52</div>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1.5, padding: '6px', color: '#64748B' }}>10:48:13</div>
              <div style={{ flex: 1, padding: '6px', backgroundColor: '#4338CA', color: '#FFF' }}>64.5</div>
              <div style={{ flex: 1, padding: '6px', backgroundColor: '#E11D48', color: '#FFF' }}>37</div>
            </div>
          </div>
        </div>
      );

    case 'persistent-rpc-table-widget':
    case 'persistent-rpc-table-ctrl':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '0 8px', height: '100%', justifyContent: 'center', fontSize: 7 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px', fontWeight: 700, color: '#475569' }}>
              <div style={{ flex: 1 }}>RPC ID</div>
              <div style={{ flex: 1.5 }}>Message type</div>
              <div style={{ flex: 1 }}>Status</div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px', color: '#64748B' }}>
              <div style={{ flex: 1 }}>..co4ju</div>
              <div style={{ flex: 1.5 }}>Two-way</div>
              <div style={{ flex: 1, color: '#F59E0B', fontWeight: 600 }}>Timeout</div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '6px', color: '#64748B' }}>
              <div style={{ flex: 1 }}>..o3drn</div>
              <div style={{ flex: 1.5 }}>One-way</div>
              <div style={{ flex: 1, color: '#EF4444', fontWeight: 600 }}>Failed</div>
            </div>
            <div style={{ display: 'flex', padding: '6px', color: '#64748B' }}>
              <div style={{ flex: 1 }}>..rv9ke</div>
              <div style={{ flex: 1.5 }}>One-way</div>
              <div style={{ flex: 1, color: '#22C55E', fontWeight: 600 }}>Delivered</div>
            </div>
          </div>
        </div>
      );

    case 'alarm-count-widget':
    case 'alarm-count-card':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: '100%' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#EF4444' }}>14</div>
        </div>
      );

    case 'device-count-card':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: '100%' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DBEAFE', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>1,248</div>
        </div>
      );

    case 'action-button':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ padding: '10px 24px', border: '2px solid #0D9488', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, color: '#0D9488', fontWeight: 600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Button
          </div>
        </div>
      );

    case 'command-button':
    case 'command-button-ctrl':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ padding: '10px 32px', border: '2px solid #0D9488', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, color: '#0D9488', fontWeight: 600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            Send
          </div>
        </div>
      );

    case 'toggle-button':
    case 'toggle-button-ctrl':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, height: '100%' }}>
          <div style={{ width: '80%', padding: '8px 0', border: '2px solid #16A34A', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#16A34A', fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
            Opened
          </div>
          <div style={{ width: '80%', padding: '10px 0', background: '#DC2626', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#FFF', fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Closed
          </div>
        </div>
      );

    case 'two-segment-button':
    case 'two-segment-button-ctrl':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ display: 'flex', width: '80%', border: '1px solid #0D9488', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '8px 0', background: '#0D9488', color: '#FFF', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>Traditional</div>
            <div style={{ flex: 1, padding: '8px 0', background: '#FFF', color: '#0D9488', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>Hi-Perf</div>
          </div>
        </div>
      );

    case 'value-stepper':
    case 'value-stepper-ctrl':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '2px solid #0D9488', borderRadius: 4 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0D9488', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </div>
            <div style={{ padding: '4px 12px', border: '1px solid #94A3B8', borderRadius: 2, fontSize: 14, fontWeight: 600, color: '#0F172A' }}>27.5 °C</div>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0D9488', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        </div>
      );

    case 'power-button':
    case 'power-button-ctrl':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #F8FAFC, #CBD5E1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#0F766E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, boxShadow: 'inset 0 4px 4px rgba(0,0,0,0.2)' }}>
              ON
            </div>
          </div>
        </div>
      );

    case 'mobile-app-qr-code':
    case 'qr-code-widget':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <svg width="60" height="60" viewBox="0 0 50 50" fill="#0F172A">
            <rect x="5" y="5" width="15" height="15" fill="none" stroke="#0F172A" strokeWidth="3" rx="1" />
            <rect x="30" y="5" width="15" height="15" fill="none" stroke="#0F172A" strokeWidth="3" rx="1" />
            <rect x="5" y="30" width="15" height="15" fill="none" stroke="#0F172A" strokeWidth="3" rx="1" />
            <rect x="10" y="10" width="5" height="5" rx="1" />
            <rect x="35" y="10" width="5" height="5" rx="1" />
            <rect x="10" y="35" width="5" height="5" rx="1" />
            <rect x="30" y="30" width="5" height="5" rx="1" />
            <rect x="40" y="35" width="5" height="5" rx="1" />
            <rect x="30" y="40" width="15" height="5" rx="1" />
            <rect x="23" y="5" width="4" height="40" fill="#E2E8F0" />
            <rect x="5" y="23" width="40" height="4" fill="#E2E8F0" />
          </svg>
        </div>
      );

    case 'html-card':
    case 'html-container':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px', justifyContent: 'center', height: '100%' }}>
          <div style={{ width: '100%', height: 14, background: '#E2E8F0', borderRadius: 4 }} />
          <div style={{ width: '80%', height: 14, background: '#E2E8F0', borderRadius: 4 }} />
          <div style={{ width: '60%', height: 14, background: '#E2E8F0', borderRadius: 4 }} />
        </div>
      );

    case 'markdown-html-card':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px', justifyContent: 'center', height: '100%' }}>
          <div style={{ width: '60%', height: 20, background: '#94A3B8', borderRadius: 4 }} />
          <div style={{ width: '100%', height: 10, background: '#E2E8F0', borderRadius: 2 }} />
          <div style={{ width: '90%', height: 10, background: '#E2E8F0', borderRadius: 2 }} />
        </div>
      );

    case 'unread-notifications-card':
      return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px', justifyContent: 'center', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E2E8F0', paddingBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ flex: 1, height: 8, background: '#E2E8F0', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ flex: 1, height: 8, background: '#E2E8F0', borderRadius: 2 }} />
          </div>
        </div>
      );

    case 'map-widget':
      return (
        <div style={{ width: '100%', height: '100%', background: '#D4F0D4', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 4, top: 4, width: 16, background: '#FFF', borderRadius: 4, border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10, fontWeight: 700, color: '#64748B' }}>
            <div style={{ padding: '2px 0', borderBottom: '1px solid #CBD5E1', width: '100%', textAlign: 'center' }}>+</div>
            <div style={{ padding: '2px 0', width: '100%', textAlign: 'center' }}>-</div>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#22C55E" style={{ position: 'absolute', top: 15, left: 40 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#FFF"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6" style={{ position: 'absolute', top: 25, left: 80 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#FFF"/></svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" style={{ position: 'absolute', top: 55, left: 50 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#FFF"/></svg>
        </div>
      );

    case 'image-map-widget':
      return (
        <div style={{ width: '100%', height: '100%', background: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 4, top: 4, width: 16, background: '#FFF', borderRadius: 4, border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10, fontWeight: 700, color: '#64748B', zIndex: 2 }}>
            <div style={{ padding: '2px 0', borderBottom: '1px solid #CBD5E1', width: '100%', textAlign: 'center' }}>+</div>
            <div style={{ padding: '2px 0', width: '100%', textAlign: 'center' }}>-</div>
          </div>
          <svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 1 }}>
            <path d="M20 0 L20 100 M60 0 L60 100 M0 30 L100 30 M0 70 L100 70 M20 30 L60 70" stroke="#CBD5E1" strokeWidth="2" fill="none" />
          </svg>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#EF4444" style={{ position: 'absolute', top: 40, left: 40, zIndex: 2 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="3" fill="#FFF"/></svg>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#F59E0B" style={{ position: 'absolute', top: 20, left: 70, zIndex: 2 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="3" fill="#FFF"/></svg>
        </div>
      );

    case 'trip-map-widget':
      return (
        <div style={{ width: '100%', height: '100%', background: '#E2E8F0', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 1 }}>
            <path d="M10 20 L90 20 M10 40 L90 40 M10 60 L90 60 M40 0 L40 100 M60 0 L60 100" stroke="#CBD5E1" strokeWidth="2" fill="none" />
            <path d="M20 20 L20 60 L70 60 L70 20 Z" stroke="#16A34A" strokeWidth="3" fill="none" />
          </svg>
          <div style={{ position: 'absolute', left: 4, top: 4, width: 16, background: '#FFF', borderRadius: 4, border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10, fontWeight: 700, color: '#64748B', zIndex: 2 }}>
            <div style={{ padding: '2px 0', borderBottom: '1px solid #CBD5E1', width: '100%', textAlign: 'center' }}>+</div>
            <div style={{ padding: '2px 0', width: '100%', textAlign: 'center' }}>-</div>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16A34A', position: 'absolute', top: 48, left: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', zIndex: 2 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <div style={{ position: 'absolute', bottom: 4, width: '80%', left: '10%', background: '#FFF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 2 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
          </div>
        </div>
      );

    case 'route-map-widget':
      return (
        <div style={{ width: '100%', height: '100%', background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 1 }}>
            <path d="M10 30 L90 30 M30 10 L30 80 M70 10 L70 80 M10 50 L90 50" stroke="#CBD5E1" strokeWidth="2" fill="none" />
            <path d="M30 70 L30 30 L70 30 L70 10" stroke="#3B82F6" strokeWidth="3" fill="none" />
          </svg>
          <div style={{ position: 'absolute', left: 4, top: 4, width: 16, background: '#FFF', borderRadius: 4, border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 10, fontWeight: 700, color: '#64748B', zIndex: 2 }}>
            <div style={{ padding: '2px 0', borderBottom: '1px solid #CBD5E1', width: '100%', textAlign: 'center' }}>+</div>
            <div style={{ padding: '2px 0', width: '100%', textAlign: 'center' }}>-</div>
          </div>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#3B82F6', position: 'absolute', top: 40, left: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', border: '2px solid #FFF', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 4 4 20 12 16 20 20 12 4"></polygon></svg>
          </div>
        </div>
      );

    case 'single-switch-ctrl':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 24, background: '#0F766E', borderRadius: 12, position: 'relative' }}>
              <div style={{ width: 20, height: 20, background: '#FFF', borderRadius: '50%', position: 'absolute', top: 2, left: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Switch</div>
          </div>
        </div>
      );

    case 'slider-control':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '0 20px' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>48%</div>
            <div style={{ width: '100%', height: 4, background: '#E2E8F0', borderRadius: 2, position: 'relative' }}>
              <div style={{ width: '48%', height: '100%', background: '#0F766E', borderRadius: 2 }} />
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#0F766E', position: 'absolute', top: -6, left: '48%', marginLeft: -8, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 4, fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
              <span>0</span><span>100</span>
            </div>
          </div>
        </div>
      );

    case 'switch-control-widget':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Switch control</div>
          <div style={{ width: 120, height: 48, background: '#94A3B8', borderRadius: 8, padding: 4, display: 'flex', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
            <div style={{ flex: 1, background: '#FFF', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #E2E8F0' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#64748B' }} />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#CBD5E1', marginTop: 8 }}>OFF</div>
        </div>
      );

    case 'round-switch-ctrl':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Round switch</div>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #F8FAFC, #94A3B8)', padding: 6, boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #E2E8F0, #F1F5F9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#475569', marginBottom: 2 }}>I</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#475569', marginTop: 2 }}>0</div>
            </div>
          </div>
        </div>
      );

    case 'led-indicator-ctrl':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 12 }}>Led indicator</div>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 20px rgba(34, 197, 94, 0.6), inset 0 4px 10px rgba(255,255,255,0.4)' }} />
        </div>
      );

    case 'rpc-button-ctrl':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '0 20px' }}>
          <div style={{ width: '100%', padding: '12px 0', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            Send RPC
          </div>
        </div>
      );

    case 'update-device-attribute-ctrl':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '0 20px' }}>
          <div style={{ width: '100%', padding: '12px 0', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            Update device attribute
          </div>
        </div>
      );

    case 'knob-control-ctrl':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ width: 100, height: 100, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100" height="100" style={{ position: 'absolute' }}>
              <path d="M 20 80 A 40 40 0 1 1 80 80" stroke="#E2E8F0" strokeWidth="8" strokeDasharray="4 4" fill="none" />
              <path d="M 20 80 A 40 40 0 0 1 50 10" stroke="#FBBF24" strokeWidth="8" strokeDasharray="4 4" fill="none" />
            </svg>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)' }}>
              <div style={{ position: 'absolute', top: 4, width: 6, height: 6, borderRadius: '50%', background: '#FBBF24' }} />
              <div style={{ color: '#FBBF24', fontWeight: 700, fontSize: 12, marginTop: 10 }}>50.00</div>
            </div>
            <div style={{ position: 'absolute', bottom: -10, left: 10, fontSize: 9, color: '#94A3B8' }}>min</div>
            <div style={{ position: 'absolute', bottom: -10, right: 10, fontSize: 9, color: '#94A3B8' }}>max</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 16 }}>Knob control</div>
        </div>
      );

    case 'rpc-debug-terminal-ctrl':
      return (
        <div style={{ width: '100%', height: '100%', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '80%', background: '#000', borderRadius: 4, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: 9 }}>
            <div style={{ color: '#FFF', fontWeight: 700, fontSize: 11 }}>RPC debug terminal</div>
            <div style={{ color: '#94A3B8' }}>Welcome to RadioGeet<br/>RPC debug terminal.</div>
            <div style={{ color: '#EF4444', fontWeight: 700 }}>No RPC target detected!</div>
          </div>
        </div>
      );

    case 'rpc-remote-shell-ctrl':
      return (
        <div style={{ width: '100%', height: '100%', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '80%', background: '#000', borderRadius: 4, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: 9 }}>
            <div style={{ color: '#FFF', fontWeight: 700, fontSize: 11 }}>RPC remote shell</div>
            <div style={{ color: '#94A3B8' }}>Welcome to RadioGeet<br/>RPC remote shell.</div>
            <div style={{ color: '#EF4444', fontWeight: 700 }}>Target device is not<br/>set!</div>
          </div>
        </div>
      );

    case 'basic-gpio-control-ctrl':
      return (
        <div style={{ width: '100%', height: '100%', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '80%', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 9, fontWeight: 600, color: '#0F172A' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>GPIO 1</div>
              <div>GPIO 3</div>
            </div>
            <div style={{ width: 60, height: '60%', background: '#B91C1C', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', color: '#FCA5A5' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FCA5A5' }} />
                <span>2</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', color: '#FCA5A5' }}>
                <span>3</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7F1D1D' }} />
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div>GPIO 2</div>
            </div>
          </div>
        </div>
      );

    case 'raspberry-pi-gpio-ctrl':
      return (
        <div style={{ width: '100%', height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '90%', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 600, color: '#0F172A' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', marginRight: 4 }}>
              <div>GPIO 4 (GPCLK0)</div>
              <div>GPIO 17</div>
              <div>GPIO 27</div>
              <div>GPIO 22</div>
              <div style={{ marginTop: 12 }}>GPIO 9</div>
            </div>
            <div style={{ width: 30, height: '90%', background: '#16A34A', display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0', alignItems: 'center', color: '#FFF' }}>
              <div style={{ display: 'flex', gap: 6 }}><span>1</span><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FFF' }}/></div>
              <div style={{ display: 'flex', gap: 6 }}><span>1</span><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FFF' }}/></div>
              <div style={{ display: 'flex', gap: 6 }}><span>1</span><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FFF' }}/></div>
              <div style={{ display: 'flex', gap: 6 }}><span>1</span><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FFF' }}/></div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}><span>1</span><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FFF' }}/></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', marginLeft: 4 }}>
              <div>GPIO 18</div>
              <div style={{ marginTop: 8 }}>GPIO 23</div>
              <div>GPIO 24</div>
              <div style={{ marginTop: 8 }}>GPIO 25</div>
            </div>
          </div>
        </div>
      );

    case 'vertical-cylinder-tank':
    case 'rectangle-tank':
    case 'horizontal-cylinder-tank':
    case 'horizontal-ellipse-tank':
    case 'horizontal-oval-tank':
    case 'vertical-oval-tank':
    case 'horizontal-capsule-tank':
    case 'vertical-capsule-tank':
    case 'horizontal-elliptical-tank':
    case 'horizontal-dish-ends-tank': {
      let tankSvg = null;
      const stroke = '#5A6BA7';
      const fill = '#7A8BFF';
      const neck = <path d="M45 25 L45 20 L55 20 L55 25 Z" fill="#FFF" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />;
      const textOverlay = (y) => (
        <g transform={`translate(50, ${y})`}>
          <rect x="-16" y="-8" width="32" height="16" fill="rgba(255,255,255,0.8)" rx="2" />
          <text x="0" y="3" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="#1E293B">40 %</text>
        </g>
      );

      switch (type) {
        case 'vertical-cylinder-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <path d="M25 35 L25 75 A 25 10 0 0 0 75 75 L75 35" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M25 60 L25 75 A 25 10 0 0 0 75 75 L75 60 A 25 10 0 0 1 25 60 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              <ellipse cx="50" cy="35" rx="25" ry="10" fill="none" stroke={stroke} strokeWidth="2" />
              {textOverlay(68)}
            </svg>
          );
          break;
        case 'rectangle-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <rect x="25" y="25" width="50" height="50" fill="none" stroke={stroke} strokeWidth="2" rx="2" />
              <rect x="25" y="55" width="50" height="20" fill={fill} stroke={stroke} strokeWidth="2" rx="2" />
              <line x1="70" y1="25" x2="70" y2="75" stroke={stroke} strokeWidth="2" />
              {textOverlay(65)}
            </svg>
          );
          break;
        case 'horizontal-cylinder-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <path d="M25 25 L75 25 A 10 25 0 0 1 75 75 L25 75 A 10 25 0 0 1 25 25 Z" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M25 55 L75 55 A 10 25 0 0 1 75 75 L25 75 A 10 25 0 0 1 25 55 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              <ellipse cx="25" cy="50" rx="10" ry="25" fill="none" stroke={stroke} strokeWidth="2" />
              {textOverlay(65)}
            </svg>
          );
          break;
        case 'horizontal-ellipse-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <ellipse cx="50" cy="50" rx="45" ry="25" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M 9.5 60 A 45 25 0 0 0 90.5 60 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              <ellipse cx="50" cy="50" rx="25" ry="25" fill="none" stroke={stroke} strokeWidth="1" opacity="0.3"/>
              {textOverlay(65)}
            </svg>
          );
          break;
        case 'horizontal-oval-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <ellipse cx="50" cy="50" rx="40" ry="25" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M 13.5 60 A 40 25 0 0 0 86.5 60 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              {textOverlay(65)}
            </svg>
          );
          break;
        case 'vertical-oval-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <ellipse cx="50" cy="55" rx="30" ry="35" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M 22 68 A 30 35 0 0 0 78 68 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              {textOverlay(75)}
            </svg>
          );
          break;
        case 'horizontal-capsule-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <rect x="20" y="25" width="60" height="50" rx="25" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M 23 55 L 77 55 A 25 25 0 0 1 75 75 L 25 75 A 25 25 0 0 1 23 55 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              {textOverlay(65)}
            </svg>
          );
          break;
        case 'vertical-capsule-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <rect x="30" y="25" width="40" height="65" rx="20" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M 30 65 L 70 65 L 70 70 A 20 20 0 0 1 30 70 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              {textOverlay(75)}
            </svg>
          );
          break;
        case 'horizontal-elliptical-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <path d="M25 25 L75 25 A 15 25 0 0 1 75 75 L25 75 A 15 25 0 0 1 25 25 Z" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M25 55 L75 55 A 15 25 0 0 1 75 75 L25 75 A 15 25 0 0 1 25 55 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              <ellipse cx="25" cy="50" rx="15" ry="25" fill="none" stroke={stroke} strokeWidth="2" />
              {textOverlay(65)}
            </svg>
          );
          break;
        case 'horizontal-dish-ends-tank':
          tankSvg = (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {neck}
              <path d="M25 25 L75 25 A 5 25 0 0 1 75 75 L25 75 A 5 25 0 0 1 25 25 Z" fill="none" stroke={stroke} strokeWidth="2" />
              <path d="M25 55 L75 55 A 5 25 0 0 1 75 75 L25 75 A 5 25 0 0 1 25 55 Z" fill={fill} stroke={stroke} strokeWidth="2" />
              <ellipse cx="25" cy="50" rx="5" ry="25" fill="none" stroke={stroke} strokeWidth="2" />
              {textOverlay(65)}
            </svg>
          );
          break;
      }

      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', padding: '12px 14px', position: 'absolute', top: 0, left: 0, zIndex: 2 }}>Liquid level</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
            <div style={{ width: 140, height: 100 }}>
              {tankSvg}
            </div>
          </div>
        </div>
      );
    }

    case 'simple-gauge':
    case 'vertical-bar':
    case 'horizontal-bar':
    case 'gauge':
    case 'mini-gauge':
    case 'digital-thermometer':
    case 'digital-speedometer':
    case 'digital-vertical-bar':
    case 'digital-horizontal-bar':
    case 'simple-neon-gauge':
    case 'neon-gauge':
    case 'lcd-gauge':
    case 'lcd-bar-gauge': {
      switch (type) {
        case 'simple-gauge':
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#F1F5F9" strokeWidth="12" />
              <path d="M 50 15 A 35 35 0 0 1 85 50" fill="none" stroke="#F97316" strokeWidth="12" />
              <text x="50" y="60" textAnchor="middle" fontSize="28" fill="#475569">9</text>
            </svg>
          );
        case 'vertical-bar':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' }}>
              <div style={{ fontSize: 16, color: '#475569', marginBottom: 6 }}>46</div>
              <div style={{ display: 'flex', gap: 6, height: 50 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2, width: 30 }}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} style={{ height: 3, background: i < 7 ? '#F97316' : '#E2E8F0' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', height: 50 }}>
                  <span>100</span><span>0</span>
                </div>
              </div>
            </div>
          );
        case 'horizontal-bar':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' }}>
              <div style={{ fontSize: 14, color: '#94A3B8', fontWeight: 'bold' }}>TEMP</div>
              <div style={{ fontSize: 24, color: '#475569', marginBottom: 8 }}>38</div>
              <div style={{ display: 'flex', width: '80%', height: 20 }}>
                <div style={{ width: '40%', height: '100%', background: '#EF4444' }}/>
                <div style={{ width: '60%', height: '100%', background: '#E2E8F0' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                <span>0</span><span>100</span>
              </div>
            </div>
          );
        case 'gauge':
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <text x="50" y="25" textAnchor="middle" fontSize="12" fill="#94A3B8" fontWeight="bold">TEMP</text>
              <path d="M 15 70 A 35 35 0 0 1 85 70" fill="none" stroke="#E2E8F0" strokeWidth="15" strokeLinecap="butt" />
              <path d="M 15 70 A 35 35 0 0 1 35 40" fill="none" stroke="#3B82F6" strokeWidth="15" strokeLinecap="butt" />
              <text x="50" y="70" textAnchor="middle" fontSize="24" fill="#475569">10</text>
              <text x="15" y="85" textAnchor="middle" fontSize="10" fill="#94A3B8">0</text>
              <text x="85" y="85" textAnchor="middle" fontSize="10" fill="#94A3B8">100</text>
            </svg>
          );
        case 'mini-gauge':
          return (
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#ECFCCB" strokeWidth="15" />
              <path d="M 35 18 A 35 35 0 0 1 65 18" fill="none" stroke="#65A30D" strokeWidth="15" strokeLinecap="round" />
              <text x="50" y="60" textAnchor="middle" fontSize="30" fill="#65A30D">9</text>
            </svg>
          );
        case 'digital-thermometer':
          return (
            <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {[...Array(40)].map((_, i) => (
                  <line key={i} x1="50" y1="10" x2="50" y2="20" stroke="#F472B6" strokeWidth="2.5" transform={`rotate(${i*9} 50 50)`} />
                ))}
                <text x="50" y="55" textAnchor="middle" fontSize="16" fill="#22D3EE" fontFamily="monospace">30.45</text>
              </svg>
            </div>
          );
        case 'digital-speedometer':
          return (
            <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {[...Array(21)].map((_, i) => (
                  <line key={i} x1="50" y1="15" x2="50" y2="25" stroke="#FDE047" strokeWidth="2.5" transform={`rotate(${i*9 - 90} 50 50)`} />
                ))}
                <text x="50" y="65" textAnchor="middle" fontSize="20" fill="#22D3EE" fontFamily="monospace">76.25</text>
                <text x="50" y="80" textAnchor="middle" fontSize="10" fill="#22D3EE" fontFamily="monospace">MPH</text>
                <text x="15" y="80" textAnchor="middle" fontSize="10" fill="#94A3B8">0</text>
                <text x="85" y="80" textAnchor="middle" fontSize="10" fill="#94A3B8">100</text>
              </svg>
            </div>
          );
        case 'digital-vertical-bar':
          return (
            <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ color: '#22D3EE', fontFamily: 'monospace', fontSize: 14, marginBottom: 4 }}>17.73</div>
                <div style={{ display: 'flex', gap: 6, height: 40 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2, width: 30 }}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} style={{ height: 2, background: i > 5 ? '#334155' : '#F472B6' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: '#94A3B8', height: 40 }}>
                    <span>60</span><span>-60</span>
                  </div>
                </div>
                <div style={{ color: '#22D3EE', fontFamily: 'monospace', fontSize: 10, marginTop: 4 }}>TEMP</div>
              </div>
            </div>
          );
        case 'digital-horizontal-bar':
          return (
            <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ color: '#22D3EE', fontFamily: 'monospace', fontSize: 16, marginBottom: 8 }}>105.77</div>
                <div style={{ display: 'flex', width: '80%', height: 20, gap: 2 }}>
                  {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '100%', background: i < 12 ? '#FDE047' : '#334155' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                  <span>0</span><span style={{ color: '#22D3EE' }}>MPH</span><span>180</span>
                </div>
              </div>
            </div>
          );
        case 'simple-neon-gauge':
          return (
            <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {[...Array(40)].map((_, i) => (
                  <line key={i} x1="50" y1="10" x2="50" y2={i < 8 ? "25" : "15"} stroke={i < 8 ? "#4ADE80" : "#064E3B"} strokeWidth="2.5" transform={`rotate(${i*9} 50 50)`} />
                ))}
                <text x="50" y="55" textAnchor="middle" fontSize="16" fill="#4ADE80" fontFamily="monospace">9.98</text>
              </svg>
            </div>
          );
        case 'neon-gauge':
          return (
            <div style={{ background: '#000', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {[...Array(21)].map((_, i) => (
                  <line key={i} x1="50" y1="15" x2="50" y2="25" stroke={i < 10 ? "#E0F2FE" : "#0C4A6E"} strokeWidth="2.5" transform={`rotate(${i*9 - 90} 50 50)`} />
                ))}
                <text x="50" y="65" textAnchor="middle" fontSize="20" fill="#FFF" fontFamily="monospace">49.51</text>
                <text x="15" y="80" textAnchor="middle" fontSize="10" fill="#FFF">0</text>
                <text x="85" y="80" textAnchor="middle" fontSize="10" fill="#FFF">100</text>
              </svg>
            </div>
          );
        case 'lcd-gauge':
          return (
            <div style={{ background: '#D6D3D1', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {[...Array(21)].map((_, i) => (
                  <line key={i} x1="50" y1="15" x2="50" y2="25" stroke={i < 11 ? "#44403C" : "#A8A29E"} strokeWidth="2.5" transform={`rotate(${i*9 - 90} 50 50)`} />
                ))}
                <text x="50" y="65" textAnchor="middle" fontSize="24" fill="#44403C" fontFamily="monospace">99</text>
                <text x="50" y="80" textAnchor="middle" fontSize="10" fill="#44403C" fontFamily="monospace">MPH</text>
                <text x="15" y="80" textAnchor="middle" fontSize="10" fill="#44403C">0</text>
                <text x="85" y="80" textAnchor="middle" fontSize="10" fill="#44403C">180</text>
              </svg>
            </div>
          );
        case 'lcd-bar-gauge':
          return (
            <div style={{ background: '#D6D3D1', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ color: '#44403C', fontFamily: 'monospace', fontSize: 14, marginBottom: 4 }}>57%</div>
                <div style={{ display: 'flex', gap: 6, height: 40 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2, width: 30 }}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} style={{ height: 2, background: i < 7 ? '#44403C' : '#A8A29E' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: '#44403C', height: 40 }}>
                    <span>100</span><span>0</span>
                  </div>
                </div>
                <div style={{ color: '#44403C', fontFamily: 'monospace', fontSize: 9, marginTop: 4 }}>HUMIDITY</div>
              </div>
            </div>
          );
      }
    }

    case 'device-admin-table':
    case 'asset-admin-table': {
      const isDevice = type === 'device-admin-table';
      const title = isDevice ? 'Device admin table' : 'Asset admin table';
      const row1Name = isDevice ? '42JKR' : 'YR-23';
      const row1Type = isDevice ? 'Device' : 'Building';
      const row2Name = isDevice ? 'IC-34' : 'NR24s';
      const row2Type = isDevice ? 'Device' : 'Group';
      
      const EditIcon = <svg width="12" height="12" viewBox="0 0 24 24" fill="#64748B"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
      const DeleteIcon = <svg width="12" height="12" viewBox="0 0 24 24" fill="#64748B"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;

      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>{title}</span>
            <span style={{ fontSize: 16, color: '#64748B', fontWeight: 300, lineHeight: '14px' }}>+</span>
          </div>
          <div style={{ display: 'flex', padding: '12px 12px 8px', fontSize: 9, fontWeight: 700, color: '#475569' }}>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ flex: 1 }}>Type</div>
            <div style={{ width: 30 }} />
          </div>
          <div style={{ display: 'flex', padding: '10px 12px', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', fontSize: 9, color: '#475569', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>{row1Name}</div>
            <div style={{ flex: 1 }}>{row1Type}</div>
            <div style={{ width: 34, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               {EditIcon}{DeleteIcon}
            </div>
          </div>
          <div style={{ display: 'flex', padding: '10px 12px', fontSize: 9, color: '#475569', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>{row2Name}</div>
            <div style={{ flex: 1 }}>{row2Type}</div>
            <div style={{ width: 34, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               {EditIcon}{DeleteIcon}
            </div>
          </div>
        </div>
      );
    }

    case 'update-multiple-attributes':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 34, height: 16, background: '#CBD5E1', borderRadius: 8, position: 'relative' }}>
              <div style={{ width: 20, height: 20, background: '#FFF', borderRadius: '50%', position: 'absolute', left: 0, top: -2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
            <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>Send mail</span>
          </div>
          <div style={{ fontSize: 9, color: '#64748B', marginBottom: 4 }}>Date &amp; Time *</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #94A3B8', paddingBottom: 4, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span style={{ fontSize: 11, color: '#334155', fontWeight: 600 }}>02/10/2021, 02:30</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 'auto' }}>
            <div style={{ fontSize: 11, color: '#1E40AF', fontWeight: 700, padding: '6px 8px' }}>Undo</div>
            <div style={{ fontSize: 11, color: '#FFF', background: '#284E7B', fontWeight: 700, padding: '6px 16px', borderRadius: 4 }}>Save</div>
          </div>
        </div>
      );

    case 'device-claiming-widget':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, borderBottom: '1px solid #CBD5E1', paddingBottom: 4, marginBottom: 16, marginTop: 8 }}>Device name *</div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, borderBottom: '1px solid #CBD5E1', paddingBottom: 4, marginBottom: 16 }}>Secret key *</div>
          <div style={{ alignSelf: 'flex-end', fontSize: 11, color: '#FFF', background: '#284E7B', fontWeight: 700, padding: '8px 16px', borderRadius: 4, marginTop: 'auto' }}>Claim device</div>
        </div>
      );

    case 'photo-camera-input':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', flex: 1, border: '1.5px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontWeight: 700, fontSize: 12, marginBottom: 12, borderRadius: 2 }}>No image</div>
          <div style={{ fontSize: 11, color: '#FFF', background: '#284E7B', fontWeight: 700, padding: '8px 16px', borderRadius: 4 }}>Take photo</div>
        </div>
      );

    case 'update-server-image':
    case 'update-shared-image':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px' }}>
          <div style={{ width: '100%', height: '70%', display: 'flex', gap: 6 }}>
            <div style={{ width: '35%', height: '100%', border: '1.5px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#475569', fontSize: 8, fontWeight: 700, borderRadius: 2 }}>No image<br/>selected</div>
            <div style={{ flex: 1, height: '100%', border: '1.5px dashed #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#475569', fontSize: 8, fontWeight: 700, borderRadius: 2 }}>Drop an image or click<br/>to select a file to upload</div>
          </div>
        </div>
      );

    case 'update-server-location':
    case 'update-shared-location':
    case 'update-location-time-series':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 12px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ fontSize: 9, color: '#64748B', marginBottom: 2 }}>Latitude *</div>
          <div style={{ fontSize: 13, color: '#334155', borderBottom: '1px solid #CBD5E1', paddingBottom: 2, marginBottom: 12, width: '70%' }}>50.23456</div>
          <div style={{ fontSize: 9, color: '#64748B', marginBottom: 2 }}>Longitude *</div>
          <div style={{ fontSize: 13, color: '#334155', borderBottom: '1px solid #CBD5E1', paddingBottom: 2, width: '70%' }}>30.273029994</div>
          <div style={{ position: 'absolute', right: 16, bottom: 24, display: 'flex', gap: 10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        </div>
      );

    case 'gateway-configuration':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '1px solid #CBD5E1', padding: '8px 10px', fontSize: 11, color: '#475569', fontWeight: 600, display: 'flex', justifyContent: 'space-between', borderRadius: 4, marginBottom: 12 }}>
            RADIOGEET <span style={{fontSize:9}}>▼</span>
          </div>
          <div style={{ borderBottom: '1px solid #94A3B8', paddingBottom: 4, fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Gateway name</div>
          <div style={{ alignSelf: 'flex-end', fontSize: 11, color: '#FFF', background: '#284E7B', fontWeight: 700, padding: '6px 16px', borderRadius: 2, marginTop: 'auto' }}>Save</div>
        </div>
      );
      
    case 'gateway-events':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', border: '1px solid #E2E8F0', padding: '4px 6px', fontSize: 9 }}>
            <div style={{ width: 50, color: '#475569', fontWeight: 600 }}>INFO</div><div style={{ color: '#64748B' }}>Gateway started</div>
          </div>
          <div style={{ display: 'flex', border: '1px solid #E2E8F0', padding: '4px 6px', fontSize: 9 }}>
            <div style={{ width: 50, color: '#475569', fontWeight: 600 }}>INFO</div><div style={{ color: '#64748B' }}>connection SUCCESS</div>
          </div>
          <div style={{ display: 'flex', border: '1px solid #E2E8F0', padding: '4px 6px', fontSize: 9 }}>
            <div style={{ width: 50, color: '#475569', fontWeight: 600 }}>DEBUG</div><div style={{ color: '#64748B' }}>Received data: {'{}'}</div>
          </div>
          <div style={{ display: 'flex', border: '1px solid #E2E8F0', padding: '4px 6px', fontSize: 9 }}>
            <div style={{ width: 50, color: '#475569', fontWeight: 600 }}>ERROR</div><div style={{ color: '#64748B' }}>Parse error: 'config'</div>
          </div>
        </div>
      );

    case 'gateway-general-config':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', padding: '12px 16px 0', borderBottom: '1px solid #E2E8F0', fontSize: 10, fontWeight: 700, color: '#94A3B8', gap: 20 }}>
             <div style={{ color: '#0D9488', borderBottom: '2px solid #0D9488', paddingBottom: 6 }}>General</div>
             <div style={{ paddingBottom: 6 }}>Logs</div>
             <div style={{ paddingBottom: 6 }}>Storage</div>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 26, height: 14, background: '#0D9488', borderRadius: 8, position: 'relative' }}>
                  <div style={{ width: 10, height: 10, background: '#FFF', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }} />
                </div>
                <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>Remove Configuration</span>
             </div>
             <div style={{ fontSize: 11, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>Security</div>
             <div style={{ display: 'flex', border: '1px solid #CBD5E1', borderRadius: 16, overflow: 'hidden', width: '100%', fontSize: 9, fontWeight: 600 }}>
                <div style={{ padding: '6px 10px', color: '#0D9488', borderRight: '1px solid #CBD5E1' }}>Access Token</div>
                <div style={{ padding: '6px 10px', color: '#94A3B8', background: '#F8FAFC' }}>TLS + Access Toke</div>
             </div>
          </div>
        </div>
      );

    case 'gateway-config-ext':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '1px solid #CBD5E1', padding: '6px 8px', fontSize: 11, color: '#475569', fontWeight: 600, display: 'flex', justifyContent: 'space-between', borderRadius: 4, marginBottom: 8 }}>
            RADIOGEET <span style={{fontSize:9}}>▼</span>
          </div>
          <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 2 }}>Gateway name *</div>
          <div style={{ borderBottom: '1px solid #94A3B8', paddingBottom: 2, fontSize: 13, color: '#334155', display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span>router 3.1</span><span style={{color:'#64748B'}}>✕</span>
          </div>
          <div style={{ alignSelf: 'flex-end', fontSize: 11, color: '#FFF', background: '#284E7B', fontWeight: 700, padding: '6px 16px', borderRadius: 2, marginTop: 'auto' }}>Save</div>
        </div>
      );

    case 'gateway-connectors':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#1E293B', paddingLeft: 4, marginBottom: 8 }}>Connectors</div>
          <div style={{ display: 'flex', fontSize: 8, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
            <div style={{ width: 40 }}>Enabled</div><div style={{ flex: 1 }}>Name ↑</div><div style={{ width: 30 }}>Type</div><div style={{ width: 50, textAlign: 'center' }}>Severity</div>
          </div>
          {[1,2,3,4].map(num => (
            <div key={num} style={{ display: 'flex', fontSize: 8, color: '#64748B', alignItems: 'center', borderBottom: '1px solid #F1F5F9', padding: '4px 0' }}>
              <div style={{ width: 40 }}><div style={{ width: 16, height: 8, background: '#CBD5E1', borderRadius: 4, position: 'relative' }}><div style={{ width: 6, height: 6, background: '#94A3B8', borderRadius: '50%', position: 'absolute', left: 1, top: 1 }}/></div></div>
              <div style={{ flex: 1 }}>Connector {num}</div>
              <div style={{ width: 30 }}>MQTT</div>
              <div style={{ width: 50, textAlign: 'center' }}><span style={{ color: '#EF4444', fontSize: 7, border: '1px solid #FCA5A5', borderRadius: 8, padding: '2px 4px', lineHeight: '8px', display: 'inline-block' }}>OUT OF<br/>SYNC</span></div>
            </div>
          ))}
        </div>
      );

    case 'gateway-logs':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { level: 'INFO', color: '#475569', bg: '#E2E8F0' },
            { level: 'INFO', color: '#475569', bg: '#E2E8F0' },
            { level: 'EXCEPTION', color: '#EF4444', bg: '#FEE2E2' },
            { level: 'WARNING', color: '#F59E0B', bg: '#FEF3C7' },
            { level: 'INFO', color: '#475569', bg: '#E2E8F0' }
          ].map((log, i) => (
            <div key={i} style={{ display: 'flex', border: '1px solid #E2E8F0', padding: '4px 6px', fontSize: 8, alignItems: 'center', gap: 12 }}>
              <div style={{ color: log.color, background: log.bg, padding: '2px 6px', borderRadius: 2, fontWeight: 700, width: 60, textAlign: 'center' }}>{log.level}</div>
              <div style={{ color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>[mqtt_connector.py] - mqtt_o...</div>
            </div>
          ))}
        </div>
      );

    case 'gateway-custom-stats':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 8, color: '#94A3B8', marginBottom: 2 }}>Statistic</div>
          <div style={{ background: '#F1F5F9', padding: '6px 8px', fontSize: 9, color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: 12, borderRadius: 2 }}>
             <span>allBytesSentToDevice</span><span style={{fontSize: 7}}>▼</span>
          </div>
          <div style={{ background: '#F1F5F9', padding: '6px 8px', fontSize: 9, color: '#94A3B8', marginBottom: 12, borderRadius: 2 }}>Command</div>
          <div style={{ display: 'flex', fontSize: 8, fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: 6, marginBottom: 6 }}>
             <div style={{ flex: 1 }}>Timestamp ↑</div><div style={{ flex: 1 }}>Message</div>
          </div>
          <div style={{ display: 'flex', fontSize: 8, color: '#64748B', borderBottom: '1px solid #F1F5F9', paddingBottom: 6, marginBottom: 6 }}>
             <div style={{ flex: 1 }}>2023-06-02 21:29:13</div><div style={{ flex: 1 }}>582.0</div>
          </div>
          <div style={{ display: 'flex', fontSize: 8, color: '#64748B', borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
             <div style={{ flex: 1 }}>2023-06-02 21:27:43</div><div style={{ flex: 1 }}>922.0</div>
          </div>
        </div>
      );

    case 'gateway-general-chart':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid #94A3B8', borderBottom: '1px solid #94A3B8', marginLeft: 16, marginBottom: 10 }}>
            <div style={{ position: 'absolute', left: -16, top: 0, fontSize: 8, color: '#64748B' }}>75</div>
            <div style={{ position: 'absolute', left: -16, top: '33%', fontSize: 8, color: '#64748B' }}>50</div>
            <div style={{ position: 'absolute', left: -16, top: '66%', fontSize: 8, color: '#64748B' }}>25</div>
            <div style={{ position: 'absolute', left: -10, bottom: -4, fontSize: 8, color: '#64748B' }}>0</div>
            
            <div style={{ position: 'absolute', left: '20%', bottom: -14, fontSize: 8, color: '#64748B' }}>8</div>
            <div style={{ position: 'absolute', left: '40%', bottom: -14, fontSize: 8, color: '#64748B' }}>16</div>
            <div style={{ position: 'absolute', left: '60%', bottom: -14, fontSize: 8, color: '#64748B' }}>24</div>
            <div style={{ position: 'absolute', left: '80%', bottom: -14, fontSize: 8, color: '#64748B' }}>32</div>

            {/* Grid lines */}
            <div style={{ position: 'absolute', left: 0, top: '33%', width: '100%', height: 1, background: '#F1F5F9' }} />
            <div style={{ position: 'absolute', left: 0, top: '66%', width: '100%', height: 1, background: '#F1F5F9' }} />
            <div style={{ position: 'absolute', left: '20%', top: 0, width: 1, height: '100%', background: '#F1F5F9' }} />
            <div style={{ position: 'absolute', left: '40%', top: 0, width: 1, height: '100%', background: '#F1F5F9' }} />
            <div style={{ position: 'absolute', left: '60%', top: 0, width: 1, height: '100%', background: '#F1F5F9' }} />
            <div style={{ position: 'absolute', left: '80%', top: 0, width: 1, height: '100%', background: '#F1F5F9' }} />

            {/* Blue line + area */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:'absolute', inset:0}}>
              <polygon points="0,60 10,40 20,60 30,30 40,30 50,25 60,15 70,40 80,30 90,40 100,30 100,100 0,100" fill="rgba(59,130,246,0.2)" />
              <polyline points="0,60 10,40 20,60 30,30 40,30 50,25 60,15 70,40 80,30 90,40 100,30" fill="none" stroke="#3B82F6" strokeWidth="2.5" />
            </svg>
            
            {/* Yellow line */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
              <polyline points="0,65 10,50 20,55 30,55 40,65 50,55 60,65 70,55 80,60 90,50 100,45" fill="none" stroke="#EAB308" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      );

    case 'service-rpc':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, background: '#F8FAFC', padding: '4px 6px', borderRadius: 2, fontSize: 8, color: '#475569', border: '1px solid #E2E8F0' }}>
               <span style={{ color: '#94A3B8', fontSize: 7 }}>Command *</span><br/>Ping <span style={{float:'right', fontSize: 6, color: '#94A3B8'}}>▼</span>
            </div>
            <div style={{ flex: 1, background: '#F8FAFC', padding: '4px 6px', borderRadius: 2, fontSize: 8, color: '#475569', border: '1px solid #E2E8F0' }}>
               <span style={{ color: '#94A3B8', fontSize: 7 }}>Timeout (in ms) *</span><br/>60
            </div>
            <div style={{ background: '#0D9488', color: '#FFF', fontSize: 9, padding: '6px 12px', borderRadius: 2, fontWeight: 700 }}>Send</div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#1E293B', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             Result <span style={{ color: '#94A3B8', fontSize: 12 }}>⤢</span>
          </div>
          <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex' }}>
             <div style={{ width: 16, background: '#E2E8F0', color: '#94A3B8', fontSize: 8, textAlign: 'center', padding: '4px 0', borderRight: '1px solid #CBD5E1' }}>1</div>
          </div>
        </div>
      );

    case 'gateway-status':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16 }}>
          <div style={{ width: '100%', height: '100%', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>No image<br/>preview</div>
        </div>
      );

    case 'gateway-markdown':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4, padding: '8px 10px', fontSize: 9, fontFamily: 'monospace', color: '#334155', lineHeight: '14px' }}>
            <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', marginRight: 8 }}>1</span> ### Markdown widget</div>
            <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', marginRight: 8 }}>2</span> </div>
            <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', marginRight: 8 }}>3</span> **Markdown** is a</div>
            <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', marginRight: 8 }}>4</span> [lightweight markup</div>
            <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', marginRight: 8 }}>5</span> language](https://thingsboa</div>
            <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', marginRight: 8 }}>6</span> rd.io/docs/)</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1E293B' }}>Markdown widget</div>
          <div style={{ fontSize: 9, color: '#475569', lineHeight: '14px' }}>
             <strong>Markdown</strong> is a <span style={{ color: '#3B82F6', textDecoration: 'underline' }}>lightweight<br/>markup language</span>
          </div>
        </div>
      );

    case 'edge-quick-overview':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> Edge #1 Quick Overview
            </div>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>⤢</span>
          </div>
          <div style={{ fontSize: 9, color: '#94A3B8', marginBottom: 16 }}>Assigned to: Customer A</div>
          <div style={{ paddingLeft: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
             <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#CBD5E1', fontSize: 11, border: '1px solid #CBD5E1', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, lineHeight: 1 }}>+</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span style={{ fontWeight: 700 }}>Assets</span>
             </div>
             <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#CBD5E1', fontSize: 11, border: '1px solid #CBD5E1', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, lineHeight: 1 }}>+</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <span style={{ fontWeight: 700 }}>Devices</span>
             </div>
             <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#CBD5E1', fontSize: 11, border: '1px solid #CBD5E1', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, lineHeight: 1 }}>+</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                <span style={{ fontWeight: 700 }}>Entity Views</span>
             </div>
             <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#CBD5E1', fontSize: 11, border: '1px solid #CBD5E1', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, lineHeight: 1 }}>+</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span style={{ fontWeight: 700 }}>Dashboards</span>
             </div>
             <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#CBD5E1', fontSize: 11, border: '1px solid #CBD5E1', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, lineHeight: 1 }}>+</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <span style={{ fontWeight: 700 }}>Rule chains</span>
             </div>
          </div>
        </div>
      );

    case 'entities-table':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 10, fontWeight: 700, color: '#475569', paddingBottom: 8, borderBottom: '1px solid #E2E8F0', marginBottom: 8 }}>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ flex: 1 }}>Type</div>
            <div style={{ flex: 1 }}>Random</div>
          </div>
          <div style={{ display: 'flex', fontSize: 9, color: '#64748B', paddingBottom: 8, borderBottom: '1px solid #F1F5F9', marginBottom: 8 }}>
            <div style={{ flex: 1, fontWeight: 700 }}>WM452</div>
            <div style={{ flex: 1 }}>Device</div>
            <div style={{ flex: 1 }}>89.56</div>
          </div>
          <div style={{ display: 'flex', fontSize: 9, color: '#64748B', paddingBottom: 8, borderBottom: '1px solid #F1F5F9', marginBottom: 8 }}>
            <div style={{ flex: 1, fontWeight: 700 }}>KL514</div>
            <div style={{ flex: 1 }}>Device</div>
            <div style={{ flex: 1 }}>79.24</div>
          </div>
          <div style={{ display: 'flex', fontSize: 9, color: '#64748B', paddingBottom: 8 }}>
            <div style={{ flex: 1, fontWeight: 700 }}>A31</div>
            <div style={{ flex: 1 }}>Building</div>
            <div style={{ flex: 1 }}>21.47</div>
          </div>
        </div>
      );

    case 'entity-count':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ background: '#F97316', width: 36, height: 36, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: 9, color: '#94A3B8' }}>Device</span>
               <span style={{ fontSize: 18, fontWeight: 700, color: '#334155' }}>296</span>
            </div>
          </div>
        </div>
      );

    case 'entities-hierarchy':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#CBD5E1', fontSize: 11, border: '1px solid #CBD5E1', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, lineHeight: 1 }}>-</span>
                <span style={{ fontSize: 12 }}>👥</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Customer A</span>
             </div>
             <div style={{ paddingLeft: 12, borderLeft: '1px solid #E2E8F0', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                   <div style={{ width: 10, height: 1, background: '#E2E8F0', position: 'absolute', left: -12 }} />
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                   <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Device WM452</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                   <div style={{ width: 10, height: 1, background: '#E2E8F0', position: 'absolute', left: -12 }} />
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                   <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Device KL514</span>
                </div>
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ color: '#CBD5E1', fontSize: 11, border: '1px solid #CBD5E1', width: 10, height: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, lineHeight: 1 }}>-</span>
                <span style={{ fontSize: 12 }}>👥</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Customer B</span>
             </div>
             <div style={{ paddingLeft: 12, borderLeft: '1px solid #E2E8F0', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                   <div style={{ width: 10, height: 1, background: '#E2E8F0', position: 'absolute', left: -12 }} />
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                   <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Device BD-34</span>
                </div>
             </div>
          </div>
        </div>
      );

    case 'home-getting-started':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Get started</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8, fontWeight: 700, color: '#475569' }}>
                 <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0D9488', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>1</div> Create device
               </div>
               <span style={{ fontSize: 8, color: '#0D9488', fontWeight: 700 }}>Devices</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8, fontWeight: 700, color: '#475569' }}>
                 <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0D9488', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>2</div> Connect device
               </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8, fontWeight: 700, color: '#0F172A' }}>
                 <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#0D9488', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>3</div> Create dashboard
               </div>
               <span style={{ fontSize: 8, color: '#0D9488', fontWeight: 700 }}>Dashboards</span>
            </div>
          </div>
          <div style={{ fontSize: 6, color: '#94A3B8', lineHeight: '8px', marginBottom: 8 }}>Create a dashboard to visualize data from entities<br/>such as assets, devices, etc.</div>
          <div style={{ fontSize: 6, color: '#94A3B8', marginBottom: 8 }}>Follow the documentation on how to do it:</div>
          <div style={{ border: '1px solid #0D9488', color: '#0D9488', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0', borderRadius: 2, gap: 4 }}>
             📄 How to create Dashboard
          </div>
        </div>
      );

    case 'home-quick-links':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8' }}>Quick links</span>
             <span style={{ fontSize: 10, color: '#94A3B8' }}>✏️</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ width: 14, height: 14, background: '#0D9488', borderRadius: 2, color: '#FFF', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>D</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Device profiles</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ width: 14, height: 14, background: '#0D9488', borderRadius: 2, color: '#FFF', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Asset profiles</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ color: '#0D9488', fontSize: 10, fontWeight: 700 }}>↔</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Rule chain</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8, textAlign: 'center', color: '#CBD5E1', fontSize: 14 }}>+</div>
        </div>
      );

    case 'home-documentation':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8' }}>Documentation ↗</span>
             <span style={{ fontSize: 10, color: '#94A3B8' }}>✏️</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ color: '#0D9488', fontSize: 12 }}>⛰️</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Get started</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ color: '#0D9488', fontSize: 12 }}>🎛️</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Dashboards</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ width: 14, height: 14, background: '#0D9488', borderRadius: 2, color: '#FFF', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>D</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Device profiles</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8, textAlign: 'center', color: '#CBD5E1', fontSize: 14 }}>+</div>
        </div>
      );

    case 'home-dashboards':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Dashboards ↗</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
             <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 2, fontSize: 8, fontWeight: 700 }}>
                <div style={{ background: '#FFF', color: '#0D9488', padding: '2px 8px', borderRadius: 10, border: '1px solid #0D9488' }}>Last viewed</div>
                <div style={{ color: '#94A3B8', padding: '2px 8px' }}>Starred</div>
             </div>
             <div style={{ background: '#0D9488', color: '#FFF', fontSize: 8, fontWeight: 700, padding: '4px 10px', borderRadius: 4 }}>Add</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, color: '#94A3B8', marginBottom: 6, padding: '0 8px' }}>
             <span>Name</span><span>Last viewed ↓</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>⭐ Air Quality Monitoring Admin</span><span style={{color:'#94A3B8', fontWeight:400}}>5 min ago</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>☆ Smart Supermarket Administ</span><span style={{color:'#94A3B8', fontWeight:400}}>12 min ago</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>☆ Water Metering Tenant Dash</span><span style={{color:'#94A3B8', fontWeight:400}}>18 min ago</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>☆ Water Metering Dashboard</span><span style={{color:'#94A3B8', fontWeight:400}}>3 h ago</span>
             </div>
          </div>
        </div>
      );

    case 'home-usage-info':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Usage ↗</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
             <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 2, fontSize: 8, fontWeight: 700 }}>
                <div style={{ background: '#FFF', color: '#0D9488', padding: '2px 8px', borderRadius: 10, border: '1px solid #0D9488' }}>Entities</div>
                <div style={{ color: '#94A3B8', padding: '2px 8px' }}>API calls</div>
             </div>
             <div style={{ border: '1px solid #0D9488', color: '#0D9488', fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>Upgrade</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
             {[
               { name: 'Devices:', val: '80 / 100', color: '#334155', pct: 80, bar: '#0D9488' },
               { name: 'Assets:', val: '98 / 100', color: '#EF4444', pct: 98, bar: '#EF4444' },
               { name: 'Users:', val: '35 / 50', color: '#94A3B8', pct: 70, bar: '#0D9488' },
               { name: 'Dashboards:', val: '12 / 100', color: '#94A3B8', pct: 12, bar: '#0D9488' },
               { name: 'Customers:', val: '7 / 20', color: '#94A3B8', pct: 35, bar: '#0D9488' },
               { name: 'Messages:', val: '1 000 000 / 60 sec', color: '#94A3B8', pct: 60, bar: '#0D9488' },
             ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7 }}>
                   <div style={{ color: row.color, width: 50 }}>{row.name}</div>
                   <div style={{ color: row.color, fontWeight: 600, flex: 1, textAlign: 'right', paddingRight: 8 }}>{row.val}</div>
                   <div style={{ width: 30, height: 4, background: '#E2E8F0', borderRadius: 2, position: 'relative' }}>
                      <div style={{ width: `${row.pct}%`, height: '100%', background: row.bar, borderRadius: 2 }} />
                   </div>
                </div>
             ))}
          </div>
        </div>
      );

    case 'home-solution-templates':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8' }}>Solution templates ↗</span>
             <span style={{ fontSize: 10, color: '#CBD5E1' }}>&lt; &gt;</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
             <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', padding: 6, alignItems: 'center', gap: 8, position: 'relative' }}>
                <div style={{ position: 'absolute', right: 4, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✓</div>
                <div style={{ width: 60, height: '100%', background: '#F1F5F9', borderRadius: 4 }} />
                <div style={{ fontSize: 8, fontWeight: 700, color: '#334155' }}>Temperature &amp; Humi...</div>
             </div>
             <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 6, display: 'flex', padding: 6, alignItems: 'center', gap: 8 }}>
                <div style={{ width: 60, height: '100%', background: '#F1F5F9', borderRadius: 4 }} />
                <div style={{ fontSize: 8, fontWeight: 700, color: '#334155' }}>Smart office</div>
             </div>
          </div>
        </div>
      );

    case 'home-api-usage':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Transport messages', val: '11M / 50M', pct: 22 },
            { name: 'Transport data\npoints', val: '6M / 100M', pct: 6 },
            { name: 'Rule engine\nexecutions', val: '102M / 250M', pct: 40 },
            { name: 'JavaScript function\nexecutions', val: '0 / 10M', pct: 0 },
          ].map((row, i) => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 60, fontSize: 8, fontWeight: 700, color: '#0D9488', whiteSpace: 'pre-wrap', lineHeight: '10px' }}>{row.name}</div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#94A3B8', fontWeight: 600 }}>
                      <span>{row.val}</span><span style={{color:'#10B981'}}>Enabled</span>
                   </div>
                   <div style={{ width: '100%', height: 4, background: '#E2E8F0', borderRadius: 2 }}>
                      <div style={{ width: `${row.pct}%`, height: '100%', background: '#10B981', borderRadius: 2 }} />
                   </div>
                </div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>✓</div>
             </div>
          ))}
        </div>
      );

    case 'home-iot-hub':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
             <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Solution Templates ↗</div>
             <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
                <div style={{ position: 'absolute', right: 4, bottom: 20, width: 12, height: 12, borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, zIndex: 10 }}>✓</div>
                <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 2 }} />
                <div style={{ fontSize: 7, color: '#475569', textAlign: 'center' }}>Temperature &amp; Humi...</div>
             </div>
             <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 2 }} />
                <div style={{ fontSize: 7, color: '#475569', textAlign: 'center' }}>Mine Site Monitoring</div>
             </div>
          </div>
          <div style={{ width: 1, background: '#F1F5F9' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
             <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Device Library ↗</div>
             <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, background: '#E2E8F0', borderRadius: 4, marginTop: 4 }} />
                <div style={{ fontSize: 7, color: '#475569', textAlign: 'center', marginTop: 'auto' }}>Cat-1 Badge Tracker</div>
             </div>
             <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 4, padding: 4, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, alignItems: 'center' }}>
                <div style={{ width: 40, height: 20, background: '#334155', borderRadius: 2, marginTop: 8 }} />
                <div style={{ fontSize: 7, color: '#475569', textAlign: 'center', marginTop: 'auto' }}>ESP Dev Kit v1</div>
             </div>
          </div>
        </div>
      );

    case 'nav-cards':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
               <div style={{ fontSize: 7, fontWeight: 700, color: '#475569', padding: '4px 6px', borderBottom: '1px solid #E2E8F0' }}>Rules managment</div>
               <div style={{ flex: 1, background: '#284E7B', margin: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <div style={{ fontSize: 16 }}>↔</div>
                  <div style={{ fontSize: 8, fontWeight: 600, marginTop: 4 }}>Rule chains</div>
               </div>
            </div>
            <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
               <div style={{ fontSize: 7, fontWeight: 700, color: '#475569', padding: '4px 6px', borderBottom: '1px solid #E2E8F0' }}>Customer managment</div>
               <div style={{ flex: 1, background: '#284E7B', margin: 4, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <div style={{ fontSize: 14 }}>👥</div>
                  <div style={{ fontSize: 8, fontWeight: 600, marginTop: 4 }}>Customers</div>
               </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
               <div style={{ fontSize: 7, fontWeight: 700, color: '#475569', padding: '4px 6px', borderBottom: '1px solid #E2E8F0' }}>Dashboard management</div>
               <div style={{ display: 'flex', gap: 4, padding: 4 }}>
                  <div style={{ flex: 1, height: 40, background: '#284E7B', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                     <div style={{ fontSize: 12 }}>🧩</div>
                     <div style={{ fontSize: 6, fontWeight: 600, textAlign: 'center', marginTop: 2 }}>Widgets Library</div>
                  </div>
                  <div style={{ flex: 1, height: 40, background: '#284E7B', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                     <div style={{ fontSize: 12 }}>🎛️</div>
                     <div style={{ fontSize: 6, fontWeight: 600, textAlign: 'center', marginTop: 2 }}>Dashboards</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      );

    case 'nav-card':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16 }}>
          <div style={{ width: '100%', height: '100%', background: '#284E7B', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Devices</span>
          </div>
        </div>
      );

    case 'nav-quick-links':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8' }}>Quick links</span>
             <span style={{ fontSize: 10, color: '#94A3B8' }}>✏️</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ width: 14, height: 14, background: '#0D9488', borderRadius: 2, color: '#FFF', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>D</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Device profiles</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ width: 14, height: 14, background: '#0D9488', borderRadius: 2, color: '#FFF', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Asset profiles</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ color: '#0D9488', fontSize: 10, fontWeight: 700 }}>↔</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Rule chain</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8, textAlign: 'center', color: '#CBD5E1', fontSize: 14 }}>+</div>
        </div>
      );

    case 'nav-documentation':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
             <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8' }}>Documentation ↗</span>
             <span style={{ fontSize: 10, color: '#94A3B8' }}>✏️</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ color: '#0D9488', fontSize: 12 }}>⛰️</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Get started</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ color: '#0D9488', fontSize: 12 }}>🎛️</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Dashboards</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '6px 8px', borderRadius: 4 }}>
                <div style={{ width: 14, height: 14, background: '#0D9488', borderRadius: 2, color: '#FFF', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>D</div>
                <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>Device profiles</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8, textAlign: 'center', color: '#CBD5E1', fontSize: 14 }}>+</div>
        </div>
      );

    case 'nav-dashboards':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>Dashboards ↗</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
             <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 2, fontSize: 8, fontWeight: 700 }}>
                <div style={{ background: '#FFF', color: '#0D9488', padding: '2px 8px', borderRadius: 10, border: '1px solid #0D9488' }}>Last viewed</div>
                <div style={{ color: '#94A3B8', padding: '2px 8px' }}>Starred</div>
             </div>
             <div style={{ background: '#0D9488', color: '#FFF', fontSize: 8, fontWeight: 700, padding: '4px 10px', borderRadius: 4 }}>Add</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, color: '#94A3B8', marginBottom: 6, padding: '0 8px' }}>
             <span>Name</span><span>Last viewed ↓</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>⭐ Air Quality Monitoring Admin</span><span style={{color:'#94A3B8', fontWeight:400}}>5 min ago</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>☆ Smart Supermarket Administ</span><span style={{color:'#94A3B8', fontWeight:400}}>12 min ago</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>☆ Water Metering Tenant Dash</span><span style={{color:'#94A3B8', fontWeight:400}}>18 min ago</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569', fontWeight: 600 }}>
                <span>☆ Water Metering Dashboard</span><span style={{color:'#94A3B8', fontWeight:400}}>3 h ago</span>
             </div>
          </div>
        </div>
      );

    case 'date-range-navigator':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 7, color: '#94A3B8', fontWeight: 600 }}>Date picker</span>
                <div style={{ borderBottom: '1px solid #94A3B8', display: 'flex', justifyContent: 'space-between', paddingBottom: 2, fontSize: 10, color: '#334155', fontWeight: 600 }}>
                   <span>16-23 Feb 2021</span><span style={{ fontSize: 8 }}>▼</span>
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 7, color: '#94A3B8', fontWeight: 600 }}>Interval</span>
                <div style={{ borderBottom: '1px solid #94A3B8', display: 'flex', justifyContent: 'space-between', paddingBottom: 2, fontSize: 10, color: '#334155', fontWeight: 600 }}>
                   <span>Week</span><span style={{ fontSize: 8 }}>▼</span>
                </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 4 }}>
                <span style={{ color: '#475569', fontSize: 12, fontWeight: 700 }}>&lt;</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                   <span style={{ fontSize: 7, color: '#94A3B8', fontWeight: 600, paddingLeft: 12 }}>Step size</span>
                   <div style={{ borderBottom: '1px solid #94A3B8', display: 'flex', justifyContent: 'space-between', paddingBottom: 2, fontSize: 10, color: '#334155', fontWeight: 600 }}>
                      <span style={{ paddingLeft: 12 }}>Day</span><span style={{ fontSize: 8 }}>▼</span>
                   </div>
                </div>
                <span style={{ color: '#475569', fontSize: 12, fontWeight: 700 }}>&gt;</span>
             </div>
          </div>
        </div>
      );

    case 'html-card':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ fontSize: 24, fontWeight: 700, color: '#94A3B8', textAlign: 'center', lineHeight: 1.2 }}>HTML code<br/>here</div>
        </div>
      );

    case 'html-value-card':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
           <div style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8' }}>VALUE TITLE</div>
           <div style={{ fontSize: 32, fontWeight: 400, color: '#64748B' }}>2.44 <span style={{ fontSize: 24 }}>units.</span></div>
           <div style={{ fontSize: 12, color: '#94A3B8' }}>Value description text</div>
        </div>
      );

    case 'markdown-html-card':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', display: 'flex', flexDirection: 'column' }}>
           <div style={{ padding: 12, fontSize: 10, fontFamily: 'monospace', color: '#475569', lineHeight: 1.4, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', width: 20 }}>1</span>### Markdown widget</div>
              <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', width: 20 }}>2</span></div>
              <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', width: 20 }}>3</span>**Markdown** is a</div>
              <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', width: 20 }}>4</span>[lightweight markup</div>
              <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', width: 20 }}>5</span>language](https://thingsboa</div>
              <div style={{ display: 'flex' }}><span style={{ color: '#94A3B8', width: 20 }}>6</span>rd.io/docs/)</div>
           </div>
           <div style={{ padding: 12, fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: 8 }}>Markdown widget</div>
              <div style={{ color: '#475569' }}><strong>Markdown</strong> is a <a href="#" style={{ color: '#2563EB', textDecoration: 'none' }}>lightweight markup language</a></div>
           </div>
        </div>
      );

    case 'html-container':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 8 }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0', borderRadius: 4 }}>
             <div style={{ flex: 1, display: 'flex' }}>
                <div style={{ flex: 1, borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#64748B' }}>
                   <div style={{ fontSize: 24, fontWeight: 700 }}>&lt;&gt;</div>
                   <div style={{ fontSize: 8, fontWeight: 600 }}>HTML</div>
                </div>
                <div style={{ flex: 1, borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#64748B' }}>
                   <div style={{ fontSize: 24, fontWeight: 700 }}>{`{}`}</div>
                   <div style={{ fontSize: 8, fontWeight: 600 }}>CSS</div>
                </div>
             </div>
             <div style={{ flex: 1, display: 'flex' }}>
                <div style={{ flex: 1, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#64748B' }}>
                   <div style={{ fontSize: 24, fontWeight: 700 }}>JS</div>
                   <div style={{ fontSize: 8, fontWeight: 600 }}>JavaScript</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#64748B' }}>
                   <div style={{ fontSize: 24 }}>☁️</div>
                   <div style={{ fontSize: 8, fontWeight: 600 }}>External Resources</div>
                </div>
             </div>
          </div>
        </div>
      );

    case 'basic-gpio-control':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', fontWeight: 600, color: '#475569', fontSize: 12 }}>
              <span>GPIO 1</span>
              <span>GPIO 3</span>
           </div>
           <div style={{ width: 80, height: 50, background: '#B91C1C', borderRadius: 2, display: 'flex', flexDirection: 'column', padding: 8, gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: 8, color: '#FFF' }}>1</span>
                 <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F87171' }} />
                 <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F87171' }} />
                 <span style={{ fontSize: 8, color: '#FFF' }}>2</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: 8, color: '#FFF' }}>3</span>
                 <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F87171' }} />
                 <div style={{ width: 12 }} />
                 <span style={{ fontSize: 8, color: '#B91C1C' }}></span>
              </div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', fontWeight: 600, color: '#475569', fontSize: 12 }}>
              <span>GPIO 2</span>
              <span style={{ visibility: 'hidden' }}>GPIO</span>
           </div>
        </div>
      );

    case 'basic-gpio-panel':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', fontWeight: 600, color: '#475569', fontSize: 12 }}>
              <span>GPIO 1</span>
              <span>GPIO 3</span>
           </div>
           <div style={{ width: 80, height: 50, background: '#B91C1C', borderRadius: 2, display: 'flex', flexDirection: 'column', padding: 8, gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: 8, color: '#FFF' }}>1</span>
                 <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#15803D' }} />
                 <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EAB308' }} />
                 <span style={{ fontSize: 8, color: '#FFF' }}>2</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: 8, color: '#FFF' }}>3</span>
                 <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#9333EA' }} />
                 <div style={{ width: 12 }} />
                 <span style={{ fontSize: 8, color: '#B91C1C' }}></span>
              </div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', fontWeight: 600, color: '#475569', fontSize: 12 }}>
              <span>GPIO 2</span>
              <span style={{ visibility: 'hidden' }}>GPIO</span>
           </div>
        </div>
      );

    case 'raspberry-pi-gpio-panel':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '12px 16px', display: 'flex', justifyContent: 'center' }}>
           <div style={{ display: 'flex', gap: 4, height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end', fontSize: 5, color: '#475569', width: 60 }}>
                 <span>3.3V</span>
                 <span>GPIO 2 (I2C1_SDA)</span>
                 <span>GPIO 3 (I2C1_SCL)</span>
                 <span>GPIO 4 (GPCLK0)</span>
                 <span>GND</span>
                 <span>GPIO 17</span>
                 <span>GPIO 27</span>
                 <span>GPIO 22</span>
                 <span>3.3V</span>
                 <span>GPIO 10 (SPI_MOSI)</span>
                 <span>GPIO 9 (SPI_MISO)</span>
              </div>
              <div style={{ width: 24, height: '100%', background: '#15803D', display: 'flex', padding: '2px 0' }}>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 4, color: '#FFF' }}>1</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>3</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>5</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>7</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>9</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>11</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>13</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>15</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>17</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>19</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>21</span>
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F87171' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3B82F6' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#EAB308' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#000' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F87171' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#A855F7' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#A855F7' }} />
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F87171' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F87171' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#000' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#14B8A6' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#14B8A6' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#000' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#000' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 4, color: '#FFF' }}>2</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>4</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>6</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>8</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>10</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>12</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>14</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>16</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>18</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>20</span>
                    <span style={{ fontSize: 4, color: '#FFF' }}>22</span>
                 </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', fontSize: 5, color: '#475569', width: 60 }}>
                 <span>5V</span>
                 <span>5V</span>
                 <span>GND</span>
                 <span>GPIO 14 (UART_TXD)</span>
                 <span>GPIO 15 (UART_RXD)</span>
                 <span>GPIO 18</span>
                 <span>GND</span>
                 <span>GPIO 23</span>
                 <span>GPIO 24</span>
                 <span>GND</span>
                 <span>GPIO 25</span>
              </div>
           </div>
        </div>
      );

    case 'raspberry-pi-gpio-control':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '16px 16px', display: 'flex', justifyContent: 'center' }}>
           <div style={{ display: 'flex', gap: 4, height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 7, color: '#475569', width: 60 }}>
                 <div style={{flex: 3}}/>
                 <span>GPIO 4 (GPCLK0)</span>
                 <div style={{flex: 1}}/>
                 <span>GPIO 17</span>
                 <span>GPIO 27</span>
                 <span>GPIO 22</span>
                 <div style={{flex: 2}}/>
                 <span>GPIO 5</span>
              </div>
              <div style={{ width: 40, height: '100%', background: '#15803D', display: 'flex', padding: '8px 0', borderRadius: 2 }}>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{flex: 3}}/>
                    <span style={{ fontSize: 6, color: '#FFF' }}>7</span>
                    <div style={{flex: 1}}/>
                    <span style={{ fontSize: 6, color: '#FFF' }}>11</span>
                    <span style={{ fontSize: 6, color: '#FFF' }}>13</span>
                    <span style={{ fontSize: 6, color: '#FFF' }}>15</span>
                    <div style={{flex: 2}}/>
                    <span style={{ fontSize: 6, color: '#FFF' }}>29</span>
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{flex: 3}}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                    <div style={{flex: 1}}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                    <div style={{flex: 2}}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{flex: 5}}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                    <div style={{flex: 1}}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                    <div style={{flex: 1}}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{flex: 5}}/>
                    <span style={{ fontSize: 6, color: '#FFF' }}>12</span>
                    <div style={{flex: 1}}/>
                    <span style={{ fontSize: 6, color: '#FFF' }}>16</span>
                    <span style={{ fontSize: 6, color: '#FFF' }}>18</span>
                    <div style={{flex: 1}}/>
                    <span style={{ fontSize: 6, color: '#FFF' }}>22</span>
                 </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 7, color: '#475569', width: 60 }}>
                 <div style={{flex: 5}}/>
                 <span>GPIO 18</span>
                 <div style={{flex: 1}}/>
                 <span>GPIO 23</span>
                 <span>GPIO 24</span>
                 <div style={{flex: 1}}/>
                 <span>GPIO 25</span>
              </div>
           </div>
        </div>
      );

    case 'emulator-instance-control':
    case 'emulator-profile-catalog':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center' }}>No image<br/>preview</div>
        </div>
      );

    case 'files':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
             <span style={{ fontSize: 12, color: '#334155' }}>Files</span>
             <div style={{ background: '#0F766E', color: '#FFF', fontSize: 7, fontWeight: 600, padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                🕒 Last day
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, fontWeight: 700, color: '#475569', marginBottom: 8, paddingRight: 32 }}>
             <span>Name</span><span>Type</span>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>report-20..7.pdf</span>
             <span style={{ marginLeft: 16 }}>Report</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B' }}>
                <span>⬇️</span><span>🗑️</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>report-20..7.pdf</span>
             <span style={{ marginLeft: 16 }}>Report</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B' }}>
                <span>⬇️</span><span>🗑️</span>
             </div>
          </div>
        </div>
      );

    case 'dashboard-reports':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
             <span style={{ fontSize: 12, color: '#334155' }}>Reports</span>
             <div style={{ background: '#0F766E', color: '#FFF', fontSize: 7, fontWeight: 600, padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                🕒 Last day
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, fontWeight: 700, color: '#475569', marginBottom: 8, paddingRight: 32 }}>
             <span>Name</span>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>report-2020-07-27.pdf</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B' }}>
                <span>⬇️</span><span>🗑️</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>report-2020-07-27.pdf</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B' }}>
                <span>⬇️</span><span>🗑️</span>
             </div>
          </div>
        </div>
      );

    case 'scheduler-events':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <span style={{ fontSize: 14, color: '#334155' }}>Scheduler events</span>
             <div style={{ display: 'flex', gap: 8, color: '#64748B', alignItems: 'center' }}>
                <div style={{ color: '#F97316', borderBottom: '2px solid #F97316' }}>🗂️</div>
                <div>📅</div>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, fontWeight: 700, color: '#475569', marginBottom: 8, paddingRight: 32 }}>
             <span>Name</span><span>Type</span>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>Temperature</span>
             <span style={{ marginLeft: 16 }}>Update</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B', fontSize: 10 }}>
                <span>✏️</span><span>🗑️</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>Humidity</span>
             <span style={{ marginLeft: 16 }}>Send RPC</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B', fontSize: 10 }}>
                <span>✏️</span><span>🗑️</span>
             </div>
          </div>
        </div>
      );

    case 'reports-schedule':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF', padding: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <span style={{ fontSize: 14, color: '#334155' }}>Reports schedule</span>
             <div style={{ display: 'flex', gap: 8, color: '#64748B', alignItems: 'center' }}>
                <div style={{ color: '#F97316', borderBottom: '2px solid #F97316' }}>🗂️</div>
                <div>📅</div>
             </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, fontWeight: 700, color: '#475569', marginBottom: 8, paddingRight: 32 }}>
             <span>Name</span>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>Weekly reports</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B', fontSize: 10 }}>
                <span>✏️</span><span>🗑️</span>
             </div>
          </div>
          <div style={{ borderTop: '1px solid #E2E8F0', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 7, color: '#475569' }}>
             <span>Daily reports</span>
             <div style={{ display: 'flex', gap: 6, color: '#64748B', fontSize: 10 }}>
                <span>✏️</span><span>🗑️</span>
             </div>
          </div>
        </div>
      );

    default:
      return (
        <div style={{ width: '100%', height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart2 size={24} style={{ color: '#2563EB' }} />
        </div>
      );
  }
}


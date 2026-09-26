import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ToastProvider } from './context/ToastContext';
import { AuthModalProvider } from './components/Common/AuthModal';
import ErrorBoundary from './components/Common/ErrorBoundary';
import MainLayout from './components/Layout/MainLayout';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Main pages
import HomePage from './pages/Home/HomePage';
import DeviceList from './pages/Devices/DeviceList';
import DeviceDetail from './pages/Devices/DeviceDetail';
import AssetList from './pages/Assets/AssetList';
import AlarmList from './pages/Alarms/AlarmList';
import DashboardList from './pages/Dashboards/DashboardList';
import DashboardView from './pages/Dashboards/DashboardView';
import RuleChainList from './pages/RuleChains/RuleChainList';
import RuleChainEditor from './pages/RuleChains/RuleChainEditor';
import CustomerList from './pages/Customers/CustomerList';
import EntityViewList from './pages/EntityViews/EntityViewList';
import NotificationCenter from './pages/Notifications/NotificationCenter';
import OTAUpdateList from './pages/OTAUpdates/OTAUpdateList';
import AuditLogList from './pages/AuditLogs/AuditLogList';
import ProfileSettings from './pages/Settings/ProfileSettings';

// Extended feature pages
import GatewayList from './pages/Gateways/GatewayList';
import TelemetryEmulator from './pages/Emulators/TelemetryEmulator';
import DeviceProfileList from './pages/Profiles/DeviceProfileList';
import AssetProfileList from './pages/Profiles/AssetProfileList';
import UserList from './pages/Users/UserList';
import IntegrationList from './pages/Integrations/IntegrationList';
import DataConverterList from './pages/Integrations/DataConverterList';
import CalculatedFieldList from './pages/CalculatedFields/CalculatedFieldList';
import EdgeInstanceList from './pages/Edge/EdgeInstanceList';
import TrendzAnalytics from './pages/Trendz/TrendzAnalytics';
import ResourceLibrary from './pages/Resources/ResourceLibrary';
import MobileCenter from './pages/Mobile/MobileCenter';
import ApiUsage from './pages/ApiUsage/ApiUsage';
import WhiteLabeling from './pages/WhiteLabeling/WhiteLabeling';
import SecuritySettings from './pages/Security/SecuritySettings';
import ReportingPage from './pages/Reporting/ReportingPage';
import PlanAndBilling from './pages/Billing/PlanAndBilling';

// Admin pages (Super Admin)
import TenantManagement from './pages/Admin/TenantManagement';
import AllUsersManagement from './pages/Admin/AllUsersManagement';
import PlatformStats from './pages/Admin/PlatformStats';
import SuperAdminPortal from './pages/Admin/SuperAdminPortal';

// Protected Route wrapper for role-based access control
function ProtectedRoute({ children, roles, redirectTo = '/' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: 'var(--color-text-secondary)'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AuthModalProvider>
            <WebSocketProvider>
              <ToastProvider>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Super Admin Standalone Portal — completely independent from MainLayout */}
                  <Route path="/superadmin-portal" element={<SuperAdminPortal />} />

                  {/* Layout Routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/devices" element={<DeviceList />} />
                    <Route path="/devices/:id" element={<DeviceDetail />} />
                    <Route path="/assets" element={<AssetList />} />
                    <Route path="/alarms" element={<AlarmList />} />
                    <Route path="/dashboards" element={<DashboardList />} />
                    <Route path="/dashboards/:id" element={<DashboardView />} />
                    <Route path="/rule-chains" element={<RuleChainList />} />
                    <Route path="/rules" element={<Navigate to="/rule-chains" replace />} />
                    <Route path="/rule-chains/:id" element={<RuleChainEditor />} />
                    <Route path="/customers" element={<CustomerList />} />
                    <Route path="/entity-views" element={<EntityViewList />} />
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/notification-center" element={<NotificationCenter />} />
                    <Route path="/ota-updates" element={<OTAUpdateList />} />
                    <Route path="/audit-logs" element={<AuditLogList />} />
                    <Route path="/settings" element={<ProfileSettings />} />
                    <Route path="/account" element={<ProfileSettings />} />

                    {/* Extended Feature Routes */}
                    <Route path="/gateways" element={<GatewayList />} />
                    <Route path="/emulators" element={<TelemetryEmulator />} />
                    <Route path="/device-profiles" element={<DeviceProfileList />} />
                    <Route path="/asset-profiles" element={<AssetProfileList />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="/integrations" element={<IntegrationList />} />
                    <Route path="/data-converters" element={<DataConverterList />} />
                    <Route path="/calculated-fields" element={<CalculatedFieldList />} />
                    <Route path="/edge-instances" element={<EdgeInstanceList />} />
                    <Route path="/edge-rule-chains" element={<RuleChainList />} />
                    <Route path="/trendz-analytics" element={<TrendzAnalytics />} />
                    <Route path="/resources-library" element={<ResourceLibrary />} />
                    <Route path="/mobile-center" element={<MobileCenter />} />
                    <Route path="/api-usage" element={<ApiUsage />} />
                    <Route path="/white-labeling" element={<WhiteLabeling />} />
                    <Route path="/security-settings" element={<SecuritySettings />} />
                    <Route path="/reporting" element={<ReportingPage />} />
                    <Route path="/plan-and-billing" element={<PlanAndBilling />} />

                    {/* Super Admin Routes */}
                    <Route path="/admin/tenants" element={
                      <ProtectedRoute roles={['SYS_ADMIN']}>
                        <TenantManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <ProtectedRoute roles={['SYS_ADMIN']}>
                        <AllUsersManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/stats" element={
                      <ProtectedRoute roles={['SYS_ADMIN']}>
                        <PlatformStats />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ToastProvider>
            </WebSocketProvider>
          </AuthModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

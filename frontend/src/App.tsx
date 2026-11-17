import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/ui/Toast';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { MedicineDetailPage } from './pages/MedicineDetailPage';
// New Feature Pages
import { AddressesPage } from './pages/AddressesPage';
import { HealthProfilePage } from './pages/HealthProfilePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import MembershipPage from './pages/MembershipPage';
import RewardsPage from './pages/RewardsPage';
import EmergencyPage from './pages/EmergencyPage';
import RemindersPage from './pages/RemindersPage';
import DoctorsPage from './pages/DoctorsPage';
import MyConsultationsPage from './pages/MyConsultationsPage';
import VideoCallPage from './pages/VideoCallPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { SubstituteModal } from './components/cart/SubstituteModal';
import { ChatBot } from './components/chat/ChatBot';
import { useAuthStore } from './store/authStore';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardPage as AdminDashboardPage } from './pages/admin/DashboardPage';
import { PrescriptionsPage as AdminPrescriptionsPage } from './pages/admin/PrescriptionsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminUsersPage } from './pages/admin/UsersPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { SubscriptionPlansPage } from './pages/admin/SubscriptionPlansPage';
import { ReviewsPage } from './pages/admin/ReviewsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    console.log('AdminRoute: Not authenticated');
    return <Navigate to="/admin/login" replace />;
  }

  const allowedRoles = ['admin', 'super_admin', 'order_manager', 'inventory_manager'];
  console.log('AdminRoute Check:', { userRole: user?.role, allowed: allowedRoles });

  if (!user?.role || !allowedRoles.includes(user.role)) {
    console.log('AdminRoute: Role mismatch');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastContainer />
        <SubstituteModal />
        <ChatBot />
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/logout" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/medicine/:id" element={<Layout><MedicineDetailPage /></Layout>} />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />

          {/* Protected routes */}
          <Route path="/checkout" element={
            <ProtectedRoute><Layout><CheckoutPage /></Layout></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute><Layout><OrderTrackingPage /></Layout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
          } />
          <Route path="/prescriptions" element={
            <ProtectedRoute><Layout><PrescriptionsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/addresses" element={
            <ProtectedRoute><Layout><AddressesPage /></Layout></ProtectedRoute>
          } />

          <Route path="/addresses" element={
            <ProtectedRoute><Layout><AddressesPage /></Layout></ProtectedRoute>
          } />
          <Route path="/health-profile" element={
            <ProtectedRoute><Layout><HealthProfilePage /></Layout></ProtectedRoute>
          } />
          <Route path="/privacy" element={
            <ProtectedRoute><Layout><PrivacyPage /></Layout></ProtectedRoute>
          } />
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
          <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
          <Route path="/refund-policy" element={<Layout><RefundPolicyPage /></Layout>} />

          {/* New Feature Routes */}
          <Route path="/membership" element={<Layout><MembershipPage /></Layout>} />
          <Route path="/rewards" element={
            <ProtectedRoute><Layout><RewardsPage /></Layout></ProtectedRoute>
          } />
          <Route path="/emergency" element={<Layout><EmergencyPage /></Layout>} />
          <Route path="/reminders" element={
            <ProtectedRoute><Layout><RemindersPage /></Layout></ProtectedRoute>
          } />
          <Route path="/doctors" element={<Layout><DoctorsPage /></Layout>} />
          <Route path="/consultations/my" element={<ProtectedRoute><Layout><MyConsultationsPage /></Layout></ProtectedRoute>} />
          <Route path="/consultations/video/:id" element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />
          <Route path="/consultations/video/:id" element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />
          <Route path="/symptom-checker" element={<Layout><SymptomCheckerPage /></Layout>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/prescriptions" element={
            <AdminRoute><AdminLayout><AdminPrescriptionsPage /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute><AdminLayout><AdminOrdersPage /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/inventory" element={
            <AdminRoute><AdminLayout><InventoryPage /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/subscriptions" element={
            <AdminRoute><AdminLayout><SubscriptionPlansPage /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/reviews" element={
            <AdminRoute><AdminLayout><ReviewsPage /></AdminLayout></AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute><AdminLayout><SettingsPage /></AdminLayout></AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

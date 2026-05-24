import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import InvoicePage from './pages/InvoicePage';
import ChatPage from './pages/ChatPage';
import WorkersPage from './pages/WorkersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Layout
import DashboardLayout from './pages/dashboards/DashboardLayout';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import WorkerDashboard from './pages/dashboards/WorkerDashboard';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminServices from './pages/admin/AdminServices';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReviews from './pages/admin/AdminReviews';

// Worker Pages
import WorkerAssignments from './pages/worker/WorkerAssignments';
import WorkerSchedule from './pages/worker/WorkerSchedule';
import WorkerServices from './pages/worker/WorkerServices';
import WorkerEarnings from './pages/worker/WorkerEarnings';
import WorkerSettings from './pages/worker/WorkerSettings';
import AdminSettings from './pages/admin/AdminSettings';
import CustomerSettings from './pages/dashboards/CustomerSettings';

// Layout wrapper for public pages (Navbar + Footer)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* Public Routes with Navbar/Footer */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
            <Route path="/services/:id" element={<PublicLayout><ServiceDetailPage /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
            <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
            <Route path="/workers" element={<PublicLayout><WorkersPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/reviews" element={<PublicLayout><ReviewsPage /></PublicLayout>} />
            <Route path="/unauthorized" element={<PublicLayout><UnauthorizedPage /></PublicLayout>} />

            {/* Protected Public Pages */}
            <Route path="/cart" element={<ProtectedRoute><PublicLayout><CartPage /></PublicLayout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><PublicLayout><OrdersPage /></PublicLayout></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><PublicLayout><OrderDetailPage /></PublicLayout></ProtectedRoute>} />
            <Route path="/invoice/:id" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
            <Route path="/checkout/:orderId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><PublicLayout><ChatPage /></PublicLayout></ProtectedRoute>} />
            <Route path="/chat/:userId" element={<ProtectedRoute><PublicLayout><ChatPage /></PublicLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><PublicLayout><NotificationsPage /></PublicLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PublicLayout><ProfilePage /></PublicLayout></ProtectedRoute>} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Worker Dashboard Routes */}
            <Route path="/worker" element={<ProtectedRoute roles={['Worker']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<WorkerDashboard />} />
              <Route path="assignments" element={<WorkerAssignments />} />
              <Route path="schedule" element={<WorkerSchedule />} />
              <Route path="services" element={<WorkerServices />} />
              <Route path="earnings" element={<WorkerEarnings />} />
              <Route path="settings" element={<WorkerSettings />} />
            </Route>

            {/* Customer Dashboard Routes */}
            <Route path="/customer" element={<ProtectedRoute roles={['Customer']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<CustomerDashboard />} />
              <Route path="settings" element={<CustomerSettings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

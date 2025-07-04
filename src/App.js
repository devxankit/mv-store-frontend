import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VendorRegistration from './pages/VendorRegistration';
import ProtectedRoute from './components/common/ProtectedRoute';
import Chat from './pages/Chat';
import { getCurrentUser } from './redux/slices/authSlice';
import Wishlist from './pages/Wishlist';
import { fetchCart } from './redux/slices/cartSlice';
import Categories from './pages/Categories';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
    if (token) {
      dispatch(fetchCart());
    }
  }, [dispatch, token, user]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className={`flex-grow ${location.pathname === '/chat' ? 'bg-white' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vendor-registration" element={<VendorRegistration />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Protected Routes */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Seller Routes */}
            <Route path="/seller/*" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/chat" element={<Chat />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </main>
        {location.pathname !== '/chat' && <Footer />}
      </div>
    </>
  );
}

export default App; 
import React, { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaDollarSign, FaChartLine, FaEdit, FaTrash, FaEye, FaPlus, FaStore, FaCheck, FaTimes, FaImage } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import sellerAPI from '../api/sellerAPI';
import productAPI from '../api/productAPI';
import axiosInstance from '../api/axiosConfig';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorActionLoading, setVendorActionLoading] = useState(null); // vendorId or null
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    totalVendors: 0,
    pendingVendors: 0
  });

  const [editModal, setEditModal] = useState({ open: false, product: null });
  const [rejectModal, setRejectModal] = useState({ open: false, product: null });
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [editUserModal, setEditUserModal] = useState({ open: false, user: null });
  const [editUserForm, setEditUserForm] = useState({});
  const [editUserError, setEditUserError] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image: null });
  const [categoryError, setCategoryError] = useState('');

  const [selectedMainCat, setSelectedMainCat] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'rejected':
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      case 'pending':
      case 'Processing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-100';
      case 'seller':
        return 'text-blue-600 bg-blue-100';
      case 'customer':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  useEffect(() => {
    // Fetch users
    axiosInstance.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
    // Fetch orders
    axiosInstance.get('/admin/orders')
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]));
    // Fetch stats/analytics
    axiosInstance.get('/admin/analytics')
      .then(res => setStats(res.data))
      .catch(() => setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalSales: 0,
        totalOrders: 0,
        totalVendors: 0,
        pendingVendors: 0
      }));
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoadingVendors(true);
      try {
        const res = await sellerAPI.getAllSellers();
        setVendors(res.data);
      } catch (err) {
        // Optionally show error
      } finally {
        setLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    productAPI.getProducts()
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    setLoadingCategories(true);
    productAPI.getCategories()
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleVendorAction = async (vendorId, action) => {
    setVendorActionLoading(vendorId + action);
    try {
      if (action === 'approve') {
        await sellerAPI.approveSeller(vendorId);
      } else if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason:') || 'Rejected by admin';
        await sellerAPI.rejectSeller(vendorId, reason);
      }
      // Refresh vendor list
      const res = await sellerAPI.getAllSellers();
      setVendors(res.data);
    } catch (err) {
      // Optionally show error
    } finally {
      setVendorActionLoading(null);
    }
  };

  // Approve product
  const handleApprove = async (id) => {
    setActionLoading(id + 'approve');
    try {
      const res = await productAPI.approveProduct(id);
      setProducts(products.map(p => p._id === id ? res.data : p));
    } finally {
      setActionLoading(null);
    }
  };
  // Reject product
  const handleReject = async (id, reason) => {
    setActionLoading(id + 'reject');
    try {
      const res = await productAPI.rejectProduct(id, reason);
      setProducts(products.map(p => p._id === id ? res.data : p));
      setRejectModal({ open: false, product: null });
      setRejectReason('');
    } finally {
      setActionLoading(null);
    }
  };
  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setActionLoading(id + 'delete');
    try {
      await productAPI.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } finally {
      setActionLoading(null);
    }
  };
  // Edit product
  const handleEdit = (product) => {
    setEditForm({ ...product, price: product.price || '', stock: product.stock || '' });
    setEditModal({ open: true, product });
    setEditError('');
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setActionLoading(editModal.product._id + 'edit');
    try {
      const res = await productAPI.editProduct(editModal.product._id, editForm);
      setProducts(products.map(p => p._id === editModal.product._id ? res.data : p));
      setEditModal({ open: false, product: null });
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setActionLoading(null);
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditUserForm({ ...user });
    setEditUserModal({ open: true, user });
    setEditUserError('');
  };
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditUserError('');
    setUserActionLoading(editUserModal.user._id + 'edit');
    try {
      const res = await axiosInstance.put(`/admin/users/${editUserModal.user._id}`, editUserForm);
      setUsers(users.map(u => u._id === editUserModal.user._id ? res.data : u));
      setEditUserModal({ open: false, user: null });
    } catch (err) {
      setEditUserError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUserActionLoading(null);
    }
  };
  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setUserActionLoading(id + 'delete');
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };
  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleOpenCategoryModal = (category = null) => {
    setCategoryForm(category ? { ...category, image: null } : { name: '', slug: '', description: '', image: null });
    setCategoryModal({ open: true, category });
    setCategoryError('');
  };
  const handleCategoryFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setCategoryForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setCategoryForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();
    setCategoryError('');
    const formData = new FormData();
    formData.append('name', categoryForm.name);
    formData.append('slug', categoryForm.slug);
    formData.append('description', categoryForm.description);
    if (categoryForm.image) formData.append('image', categoryForm.image);
    try {
      if (categoryModal.category) {
        await productAPI.updateCategory(categoryModal.category._id, formData);
      } else {
        await productAPI.createCategory(formData);
      }
      // Refresh categories
      setLoadingCategories(true);
      const res = await productAPI.getCategories();
      setCategories(res.data);
      setCategoryModal({ open: false, category: null });
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoadingCategories(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, vendors, products, and platform analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{typeof stats.totalUsers === 'number' ? stats.totalUsers.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaStore className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-800">{typeof stats.totalVendors === 'number' ? stats.totalVendors.toLocaleString() : '0'}</p>
              <p className="text-xs text-yellow-600">{typeof stats.pendingVendors === 'number' ? stats.pendingVendors.toLocaleString() : '0'} pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaDollarSign className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">{formatINR(typeof stats.totalSales === 'number' ? stats.totalSales * 83 : 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <FaChartLine className="text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{typeof stats.totalOrders === 'number' ? stats.totalOrders.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vendors
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Vendors</h3>
                  <div className="space-y-3">
                    {(Array.isArray(vendors) ? vendors : []).slice(0, 3).map((vendor) => (
                      <div key={vendor._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{vendor.shopName}</p>
                          <p className="text-sm text-gray-600">{vendor.userId?.name || '-'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.isApproved ? 'approved' : vendor.rejectionReason ? 'rejected' : 'pending')}`}>
                            {vendor.isApproved ? 'Approved' : vendor.rejectionReason ? 'Rejected' : 'Pending'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {(Array.isArray(orders) ? orders : []).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">${order.total}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Analytics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Analytics dashboard coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {/* Vendors Tab */}
          {activeTab === 'vendors' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Vendor Management</h3>
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <FaCheck />
                    Approve All Pending
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <FaPlus />
                    Add Vendor
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Vendors</h2>
                {loadingVendors ? (
                  <div>Loading vendors...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border">Business Name</th>
                          <th className="px-4 py-2 border">Owner</th>
                          <th className="px-4 py-2 border">Email</th>
                          <th className="px-4 py-2 border">Phone</th>
                          <th className="px-4 py-2 border">Business Type</th>
                          <th className="px-4 py-2 border">Status</th>
                          <th className="px-4 py-2 border">Applied</th>
                          <th className="px-4 py-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Array.isArray(vendors) ? vendors : []).map((vendor) => (
                          <tr key={vendor._id}>
                            <td className="px-4 py-2 border">{vendor.shopName}</td>
                            <td className="px-4 py-2 border">{vendor.userId?.name || '-'}</td>
                            <td className="px-4 py-2 border">{vendor.email}</td>
                            <td className="px-4 py-2 border">{vendor.phone}</td>
                            <td className="px-4 py-2 border">{vendor.businessInfo?.businessType || '-'}</td>
                            <td className={`px-4 py-2 border ${getStatusColor(vendor.isApproved ? 'approved' : vendor.rejectionReason ? 'rejected' : 'pending')}`}>{vendor.isApproved ? 'Approved' : vendor.rejectionReason ? 'Rejected' : 'Pending'}</td>
                            <td className="px-4 py-2 border">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 border">
                              {!vendor.isApproved && !vendor.rejectionReason && (
                                <>
                                  <button
                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2 disabled:opacity-50"
                                    onClick={() => handleVendorAction(vendor._id, 'approve')}
                                    disabled={vendorActionLoading === vendor._id + 'approve'}
                                  >
                                    {vendorActionLoading === vendor._id + 'approve' ? 'Approving...' : 'Approve'}
                                  </button>
                                  <button
                                    className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
                                    onClick={() => handleVendorAction(vendor._id, 'reject')}
                                    disabled={vendorActionLoading === vendor._id + 'reject'}
                                  >
                                    {vendorActionLoading === vendor._id + 'reject' ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {vendor.rejectionReason && (
                                <span title={vendor.rejectionReason} className="text-xs text-red-600">Rejected</span>
                              )}
                              {vendor.isApproved && (
                                <span className="text-xs text-green-600">Approved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <FaPlus />
                  Add User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Join Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(users) ? users : []).map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>{user.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>{user.status}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-800" onClick={() => handleEditUser(user)} disabled={userActionLoading === user._id + 'edit'}><FaEdit /></button>
                            <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteUser(user._id)} disabled={userActionLoading === user._id + 'delete'}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit User Modal */}
              {editUserModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditUserModal({ open: false, user: null })}>&times;</button>
                    <h2 className="text-xl font-bold mb-4">Edit User</h2>
                    {editUserError && <div className="text-red-500 mb-2">{editUserError}</div>}
                    <form onSubmit={handleEditUserSubmit} className="space-y-4">
                      <input type="text" className="form-input" placeholder="Name" value={editUserForm.name || ''} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} required />
                      <input type="email" className="form-input" placeholder="Email" value={editUserForm.email || ''} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} required />
                      <select className="form-input" value={editUserForm.role || ''} onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })} required>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="seller">Seller</option>
                        <option value="customer">Customer</option>
                      </select>
                      <select className="form-input" value={editUserForm.status || ''} onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value })} required>
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button type="submit" className="btn-primary w-full">Update User</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">All Products</h3>
              {loadingProducts ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Seller</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(products) ? products : []).map((product) => (
                        <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img
                                src={product.images && product.images[0] ? product.images[0].url : '/product-images/default.webp'}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded mr-3"
                              />
                              <span className="font-medium text-gray-800">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{product.seller?.shopName || product.seller || 'N/A'}</td>
                          <td className="py-3 px-4 font-medium">{formatINR(product.price)}</td>
                          <td className="py-3 px-4">{product.stock}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{product.category || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              {!product.isApproved && (
                                <>
                                  <button
                                    className="text-green-600 hover:text-green-800"
                                    disabled={actionLoading === product._id + 'approve'}
                                    onClick={() => handleApprove(product._id)}
                                  >
                                    {actionLoading === product._id + 'approve' ? '...' : <FaCheck />}
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800"
                                    disabled={actionLoading === product._id + 'reject'}
                                    onClick={() => setRejectModal({ open: true, product })}
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              )}
                              <button
                                className="text-green-600 hover:text-green-800"
                                onClick={() => handleEdit(product)}
                                disabled={actionLoading === product._id + 'edit'}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(product._id)}
                                disabled={actionLoading === product._id + 'delete'}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Order #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Seller</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(orders) ? orders : []).map((order) => (
                      <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-blue-600">{order.orderNumber || order._id}</td>
                        <td className="py-3 px-4">{order.user?.name} <span className="text-xs text-gray-500">{order.user?.email}</span></td>
                        <td className="py-3 px-4">{order.seller?.shopName || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{order.orderItems?.map(item => `${item.product?.name || item.name} (x${item.quantity})`).join(', ')}</td>
                        <td className="py-3 px-4 font-medium">{formatINR(order.totalPrice)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800" onClick={() => handleViewOrder(order)}><FaEye /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Order Details Modal */}
              {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-2 relative overflow-y-auto max-h-[90vh]">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={handleCloseOrderModal}>&times;</button>
                    <h2 className="text-2xl font-bold mb-2">Order Details</h2>
                    <div className="mb-2 text-sm text-gray-600">Order #: <span className="font-mono">{selectedOrder.orderNumber || selectedOrder._id}</span></div>
                    <div className="mb-2 text-sm text-gray-600">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    <div className="mb-2 text-sm text-gray-600">Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span></div>
                    <div className="mb-2 text-sm text-gray-600">Customer: {selectedOrder.user?.name} ({selectedOrder.user?.email})</div>
                    <div className="mb-2 text-sm text-gray-600">Seller: {selectedOrder.seller?.shopName}</div>
                    <div className="mb-2 text-sm text-gray-600">Payment: {selectedOrder.paymentMethod}</div>
                    <div className="mb-2 text-sm text-gray-600">Shipping: {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}</div>
                    <div className="mb-2 text-sm text-gray-600">Items:</div>
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="py-2 px-2 text-left">Image</th>
                            <th className="py-2 px-2 text-left">Name</th>
                            <th className="py-2 px-2 text-left">Price</th>
                            <th className="py-2 px-2 text-left">Qty</th>
                            <th className="py-2 px-2 text-left">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.orderItems?.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-2">
                                <img src={item.product?.images?.[0]?.url || item.image || '/product-images/default.webp'} alt={item.product?.name || item.name} className="w-12 h-12 object-cover rounded" />
                              </td>
                              <td className="py-2 px-2">{item.product?.name || item.name}</td>
                              <td className="py-2 px-2">{formatINR(item.price)}</td>
                              <td className="py-2 px-2">{item.quantity}</td>
                              <td className="py-2 px-2">{formatINR(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-right font-bold text-lg">Total: {formatINR(selectedOrder.totalPrice)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Category Management</h3>
                {!selectedMainCat && (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => handleOpenCategoryModal()}
                  >
                    <FaPlus /> Add Main Category
                  </button>
                )}
                {selectedMainCat && (
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    onClick={() => setSelectedMainCat('')}
                  >
                    &larr; Back to Main Categories
                  </button>
                )}
              </div>
              {loadingCategories ? (
                <div>Loading categories...</div>
              ) : !selectedMainCat ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {categories.filter(cat => !cat.parentCategory).map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedMainCat(cat._id)}
                      className="group w-full"
                    >
                      <div className="relative bg-gray-100 rounded-lg p-6 text-center hover:bg-primary-50 transition-colors overflow-hidden h-40 flex flex-col justify-end items-center">
                        <div className="relative z-10">
                          <h3 className="font-semibold mb-2 group-hover:text-primary-600 text-gray-800 text-lg">
                            {cat.name || 'Unnamed Category'}
                          </h3>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">Subcategories of {categories.find(cat => cat._id === selectedMainCat)?.name}</h4>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                      onClick={() => handleOpenCategoryModal({ parentCategory: selectedMainCat })}
                    >
                      <FaPlus /> Add Subcategory
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {categories.filter(cat => cat.parentCategory === selectedMainCat).map(subcat => (
                      <div key={subcat._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center min-w-[160px]">
                        <span className="font-semibold mb-2">{subcat.name}</span>
                        <span className="text-xs text-gray-500 mb-2">{subcat.productCount || 0} products</span>
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleOpenCategoryModal(subcat)}
                            title="Edit Subcategory"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={async () => {
                              if (window.confirm('Delete this subcategory?')) {
                                await productAPI.deleteCategory(subcat._id);
                                setLoadingCategories(true);
                                const res = await productAPI.getCategories();
                                setCategories(res.data);
                                setLoadingCategories(false);
                              }
                            }}
                            title="Delete Subcategory"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                    {categories.filter(cat => cat.parentCategory === selectedMainCat).length === 0 && <span className="text-gray-400">No subcategories found.</span>}
                  </div>
                </>
              )}
              {/* Category Modal */}
              {categoryModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setCategoryModal({ open: false, category: null })}>&times;</button>
                    <h2 className="text-xl font-bold mb-4">{categoryModal.category && categoryModal.category._id ? 'Edit Category' : 'Add Category'}</h2>
                    <form onSubmit={handleCategoryFormSubmit}>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Name</label>
                        <input type="text" name="name" value={categoryForm.name} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Slug</label>
                        <input type="text" name="slug" value={categoryForm.slug} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2" required />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Description</label>
                        <textarea name="description" value={categoryForm.description} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Image</label>
                        <input type="file" name="image" accept="image/*" onChange={handleCategoryFormChange} className="w-full" />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Parent Category</label>
                        <select name="parentCategory" value={categoryForm.parentCategory || ''} onChange={handleCategoryFormChange} className="w-full border rounded px-3 py-2">
                          <option value="">None (Main Category)</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      {categoryError && <div className="text-red-600 mb-2">{categoryError}</div>}
                      <div className="flex justify-end gap-2">
                        <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => setCategoryModal({ open: false, category: null })}>Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditModal({ open: false, product: null })}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            {editError && <div className="text-red-500 mb-2">{editError}</div>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input type="text" className="form-input" placeholder="Product Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              <textarea className="form-input" placeholder="Description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required />
              <input type="number" className="form-input" placeholder="Price" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required min="0" />
              <input type="number" className="form-input" placeholder="Stock" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} required min="0" />
              <input type="text" className="form-input" placeholder="Brand" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} required />
              <input type="text" className="form-input" placeholder="SKU" value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} required />
              <div className="flex gap-2">
                <select
                  className="form-input"
                  value={editForm.category || ''}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value, subCategory: '' })}
                  required
                >
                  <option value="">Select Main Category</option>
                  {categories.filter(cat => !cat.parentCategory).map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  className="form-input"
                  value={editForm.subCategory || ''}
                  onChange={e => setEditForm({ ...editForm, subCategory: e.target.value })}
                  required
                  disabled={!editForm.category}
                >
                  <option value="">Select Subcategory</option>
                  {categories.filter(cat => cat.parentCategory === editForm.category).map(subcat => (
                    <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
                  ))}
                </select>
              </div>
              <input type="text" className="form-input" placeholder="Image URL" value={editForm.images && editForm.images[0] ? editForm.images[0].url : ''} onChange={e => setEditForm({ ...editForm, images: [{ url: e.target.value }] })} required />
              <button type="submit" className="btn-primary w-full">Update Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Reject Product Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setRejectModal({ open: false, product: null })}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Reject Product</h2>
            <form onSubmit={e => { e.preventDefault(); handleReject(rejectModal.product._id, rejectReason); }} className="space-y-4">
              <textarea className="form-input" placeholder="Rejection Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} required />
              <button type="submit" className="btn-primary w-full">Reject</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 
import axiosInstance from './axiosConfig';

const productAPI = {
  // Get all products with filters
  getProducts: (params = {}) => {
    return axiosInstance.get('/products', { params });
  },

  // Get product by ID
  getProductById: (id) => {
    return axiosInstance.get(`/products/${id}`);
  },

  // Search products
  searchProducts: (searchTerm, params = {}) => {
    return axiosInstance.get('/products/search', {
      params: { q: searchTerm, ...params }
    });
  },

  // Get featured products
  getFeaturedProducts: () => {
    return axiosInstance.get('/products/featured');
  },

  // Get products by category
  getProductsByCategory: (categoryId, params = {}) => {
    return axiosInstance.get(`/products/category/${categoryId}`, { params });
  },

  // Add product review
  addReview: (productId, reviewData) => {
    return axiosInstance.post(`/products/${productId}/reviews`, reviewData);
  },

  // Get categories
  getCategories: () => {
    return axiosInstance.get('/categories');
  },

  // Get category by ID
  getCategoryById: (id) => {
    return axiosInstance.get(`/categories/${id}`);
  },

  // Approve product
  approveProduct: (id) => {
    return axiosInstance.put(`/products/${id}/approve`);
  },

  // Reject product
  rejectProduct: (id, reason) => {
    return axiosInstance.put(`/products/${id}/reject`, { reason });
  },

  // Edit product
  editProduct: (id, data) => {
    return axiosInstance.put(`/products/${id}`, data);
  },

  // Delete product
  deleteProduct: (id) => {
    return axiosInstance.delete(`/products/${id}`);
  },

  // Get all reviews for a product
  getReviews: (productId) => {
    return axiosInstance.get(`/products/${productId}/reviews`);
  },

  // Update a review
  updateReview: (productId, reviewData) => {
    return axiosInstance.patch(`/products/${productId}/reviews`, reviewData);
  },

  // Delete a review
  deleteReview: (productId) => {
    return axiosInstance.delete(`/products/${productId}/reviews`);
  },
};

export default productAPI; 
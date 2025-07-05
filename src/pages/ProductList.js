import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, loadCart } from '../redux/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { useStore } from 'react-redux';
import productAPI from '../api/productAPI';
import { toast } from 'react-toastify';
import { setLoading } from '../redux/slices/authSlice';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const store = useStore();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Load cart from localStorage on mount
  useLayoutEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        dispatch(loadCart(JSON.parse(cartData)));
      } catch {}
    }
  }, [dispatch]);

  // Save cart to localStorage on every change
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      localStorage.setItem('cart', JSON.stringify(state.cart));
    });
    return unsubscribe;
  }, []);

  // Fetch wishlist on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch categories from backend
  useEffect(() => {
    productAPI.getCategories().then(res => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  // Pre-select category from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) setCategory(cat);
  }, [location.search]);

  // Fetch products (optionally by category)
  useEffect(() => {
    setLoading(true);
    const fetch = category && category !== 'all'
      ? productAPI.getProductsByCategory(category)
      : productAPI.getProducts();
    fetch.then(res => {
      setProducts(res.data);
      setLoading(false);
      console.log('Fetched products from API:', res.data);
    }).catch((err) => {
      setLoading(false);
      console.error('Error fetching products:', err);
    });
  }, [category]);

  // Helper to slugify product name
  const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // Helper to get image for product (try local, fallback to unsplash)
  const getProductImage = (name) => {
    const localPath = `/product-images/${slugify(name)}.webp`;
    return localPath;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === 'all' ||
      String(product.category) === String(category) ||
      (product.subCategory && String(product.subCategory) === String(category));
    return matchesSearch && matchesCategory;
  });
  console.log('Filtered products:', filteredProducts);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });
  console.log('Sorted products:', sortedProducts);

  // Add to Cart handler
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to your cart.');
      navigate('/login');
      return;
    }
    console.log('Dispatching addToCartAsync:', addToCartAsync, product);
    dispatch(addToCartAsync({ product: product._id, quantity: 1 }));
  };

  // Wishlist handler
  const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);
  const handleWishlist = (product) => {
    if (!isAuthenticated) {
      toast.info('Please login to use wishlist!');
      navigate('/login');
      return;
    }
    if (isInWishlist(product._id)) {
      console.log('Dispatching removeFromWishlist:', removeFromWishlist, product._id);
      dispatch(removeFromWishlist(product._id));
    } else {
      console.log('Dispatching addToWishlist:', addToWishlist, product._id);
      dispatch(addToWishlist(product._id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Products</h1>
        <p className="text-gray-600">Discover amazing products at great prices</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => !cat.parentCategory).map(main => (
                <React.Fragment key={main._id}>
                  <option disabled style={{ fontWeight: 'bold', background: '#f3f4f6' }}>{main.name}</option>
                  {categories.filter(sub => sub.parentCategory === main._id).map(sub => (
                    <option key={sub._id} value={sub._id} style={{ paddingLeft: 20 }}>
                      &nbsp;&nbsp;› {sub.name}
                    </option>
                  ))}
                </React.Fragment>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {sortedProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col relative">
              <div className="absolute top-3 right-3 z-10">
                <button
                  className={`bg-white/80 rounded-full p-2 shadow transition ${isInWishlist(product._id) ? 'text-pink-500' : 'text-gray-400 hover:bg-pink-100 hover:text-pink-500'}`}
                  onClick={() => handleWishlist(product)}
                  aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FaHeart className={`text-xl ${isInWishlist(product._id) ? '' : 'stroke-2'}`} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <Link to={`/products/${product._id}`} className="block overflow-hidden">
                <img
                  src={product.images && product.images[0] ? product.images[0].url : '/product-images/default.webp'}
                  alt={product.name}
                  className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80`; }}
                />
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">
                        {i < Math.floor(product.rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({Array.isArray(product.reviews) ? product.reviews.length : 0} reviews)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto gap-3">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatINR(product.price)}
                  </span>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
                    onClick={() => handleAddToCart({ ...product, _id: product._id })}
                  >
                    <FaShoppingCart />
                    <span className="hidden xs:inline">Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList; 
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaStar, 
  FaShoppingCart, 
  FaHeart,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaCreditCard
} from 'react-icons/fa';
import { fetchFeaturedProducts, fetchProducts } from '../redux/slices/productSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { formatINR } from '../utils/formatCurrency';
import productAPI from '../api/productAPI';
import CategoriesGrid from '../components/common/CategoriesGrid';
import HeroCarousel from '../components/common/HeroCarousel';
import EventBanner from '../components/common/EventBanner';
import BrandMarquee from '../components/common/BrandMarquee';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, loading, products } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchProducts());
    productAPI.getCategories().then(res => setCategories(res.data)).catch(() => setCategories([]));
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCartAsync({ product, quantity: 1 }));
  };

  const features = [
    {
      icon: <FaTruck className="text-3xl" />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹500'
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: <FaHeadset className="text-3xl" />,
      title: '24/7 Support',
      description: 'Round the clock customer support'
    },
    {
      icon: <FaCreditCard className="text-3xl" />,
      title: 'Easy Returns',
      description: '30-day money back guarantee'
    }
  ];

  // Helper to slugify product name
  const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // Helper to get image for product
  const getProductImage = (name) => `/product-images/${slugify(name)}.jpg`;

  // Filter only main categories (no parentCategory)
  const mainCategories = categories.filter(cat => !cat.parentCategory).slice(0, 6);

  // Helper to get 8 random products
  const getRandomProducts = () => {
    if (!Array.isArray(products) || products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  };
  const randomProducts = getRandomProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroCarousel />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-center w-full md:w-auto">Shop by Category</h2>
            <Link
              to="/categories"
              className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-semibold ml-4"
              style={{ whiteSpace: 'nowrap' }}
            >
              View All Categories <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <CategoriesGrid categories={mainCategories} />
          <div className="flex justify-center mt-8 md:hidden">
            <Link
              to="/categories"
              className="flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg"
            >
              View All Categories <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              View All
              <FaArrowRight className="ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Array.isArray(featuredProducts) ? featuredProducts : []).slice(0, 8).map((product) => (
                <div key={product._id} className="product-card">
                  <div className="relative">
                    <img
                      src={product.images && product.images[0]?.url && product.images[0]?.url !== '' ? product.images[0].url : getProductImage(product.name)}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${encodeURIComponent(product.name)}/400/300`; }}
                    />
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                      <FaHeart className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < Math.floor(product.ratings || 0) ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.numReviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {formatINR(product.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Event Banner Section */}
      <EventBanner />

      {/* Random Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Discover More Products</h2>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              View All Products
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {randomProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-transform duration-300 transform hover:scale-105 p-4 h-full"
              >
                <img
                  src={product.images && product.images[0]?.url ? product.images[0].url : '/product-images/default.webp'}
                  alt={product.name}
                  className="w-full h-40 object-contain mb-4 rounded"
                />
                <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                <div className="text-primary-600 font-bold text-lg">₹{product.price}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Marquee Section */}
      <BrandMarquee />

      {/* Discover More Products Section (Again) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Products You Might Like</h2>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              View All Products
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {randomProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-transform duration-300 transform hover:scale-105 p-4 h-full"
              >
                <img
                  src={product.images && product.images[0]?.url ? product.images[0].url : '/product-images/default.webp'}
                  alt={product.name}
                  className="w-full h-40 object-contain mb-4 rounded"
                />
                <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                <div className="text-primary-600 font-bold text-lg">₹{product.price}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of vendors and start your e-commerce journey today.
          </p>
          <Link
            to="/vendor-registration"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Become a Vendor
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 
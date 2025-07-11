import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';

const ProductCard = ({
  product,
  isInWishlist,
  handleWishlist,
  handleAddToCart,
  showWishlist = true,
  showAddToCart = true,
  showRating = true,
  showPrice = true,
  className = '',
}) => {
  const navigate = useNavigate();
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col relative transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 max-w-xs w-full mx-auto ${className}`}
      style={{ aspectRatio: '4/5', minHeight: '220px' }}
    >
      {showWishlist && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
          <button
            className={`bg-white/50 border border-grey-300 rounded-full p-1 shadow-md flex items-center justify-center transition-all duration-200
              ${isInWishlist?.(product._id)
                ? 'text-pink-500 bg-pink-100 border-pink-300'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-500'}
            `}
            style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.07)' }}
            onClick={() => handleWishlist?.(product)}
            aria-label={isInWishlist?.(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FaHeart
              className={`text-xl sm:text-2xl transition-all duration-200 ${isInWishlist?.(product._id) ? 'fill-current' : ''} stroke-black stroke-[6]`}
              fill={isInWishlist?.(product._id) ? 'currentColor' : 'none'}
              style={{ strokeWidth: 3 }}
            />
          </button>
        </div>
      )}
      {/* Image section: 40% height on mobile, default on desktop */}
      <Link to={`/products/${product._id}`} className="block flex-[2] sm:flex-none h-[40%] sm:h-40 overflow-hidden rounded-t-2xl">
        <img
          src={product.images && product.images[0] ? product.images[0].url : '/product-images/default.webp'}
          alt={product.name}
          className="w-full h-full object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80`;
          }}
        />
      </Link>
      {/* Details section: 60% height on mobile, default on desktop */}
      <div className="flex-[3] sm:flex-none p-2 sm:p-4 flex flex-col flex-1">
        <Link to={`/products/${product._id}`}> 
          <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-0.5 sm:mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {showRating && (
          <div className="flex items-center mb-0.5 sm:mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-sm sm:text-lg">
                  {i < Math.floor(product.rating || product.ratings || 0) ? '\u2605' : '\u2606'}
                </span>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
              ({Array.isArray(product.reviews) ? product.reviews.length : product.numReviews || 0} reviews)
            </span>
          </div>
        )}
        {product.description && (
          <div className="text-gray-500 text-xs sm:text-sm mb-0.5 sm:mb-2 line-clamp-2">
            {product.description}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto gap-1 sm:gap-3">
          {showPrice && (
            <span className="text-sm sm:text-xl font-bold text-blue-600">
              {product.price ? (product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })) : ''}
            </span>
          )}
          {showAddToCart && (
            <button
              className="bg-blue-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-md w-full sm:w-auto justify-center text-xs sm:text-base"
              onClick={() => handleAddToCart?.(product)}
            >
              <FaShoppingCart />
              <span className="hidden xs:inline">Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 
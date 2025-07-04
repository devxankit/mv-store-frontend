import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaLock } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import {
  fetchCart,
  updateCartQuantityAsync,
  removeFromCartAsync
} from '../redux/slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const { items: cartItems, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartQuantityAsync({ productId, quantity: newQuantity }));
  };

  const removeItem = (productId) => {
    dispatch(removeFromCartAsync(productId));
  };

  // Only show available items (in stock)
  const availableItems = cartItems.filter(item => item.product && item.product.stock > 0);
  const unavailableItems = cartItems.filter(item => item.product && item.product.stock <= 0);

  const subtotal = availableItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link to="/products" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <FaArrowLeft />
            Continue Shopping
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Available Items */}
            {availableItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Items</h2>
                <div className="space-y-4">
                  {availableItems.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.product.images && item.product.images[0] ? item.product.images[0].url : '/product-images/default.webp'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                        <p className="text-blue-600 font-bold">
                          {formatINR(item.product.price)}
                        </p>
                        <div className="text-sm text-green-600">In Stock</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {formatINR(item.product.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                        >
                          <FaTrash />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unavailable Items */}
            {unavailableItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Unavailable Items</h2>
                <div className="space-y-4">
                  {unavailableItems.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <img
                        src={item.product.images && item.product.images[0] ? item.product.images[0].url : '/product-images/default.webp'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg opacity-50"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                        <p className="text-blue-600 font-bold">
                          {formatINR(item.product.price)}
                        </p>
                        <div className="text-sm text-red-600">Out of Stock</div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {formatINR(item.product.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                        >
                          <FaTrash />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatINR(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    {formatINR(tax)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>
              </div>
              {availableItems.length > 0 ? (
                <Link
                  to="/checkout"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaLock />
                  Proceed to Checkout
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg cursor-not-allowed"
                >
                  No Items Available
                </button>
              )}
              {unavailableItems.length > 0 && (
                <p className="text-sm text-red-600 mt-3 text-center">
                  Some items are out of stock and have been removed from checkout
                </p>
              )}
              <div className="mt-6 text-sm text-gray-600">
                <p className="mb-2">✓ Free shipping on orders over $100</p>
                <p className="mb-2">✓ 30-day return policy</p>
                <p>✓ Secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 
import React, { useEffect, useState } from 'react';
import productAPI from '../api/productAPI';
import CategoriesGrid from '../components/common/CategoriesGrid';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getCategories().then(res => {
      setCategories(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">All Categories</h2>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
        ) : (
          <CategoriesGrid categories={categories} />
        )}
      </div>
    </div>
  );
};

export default Categories; 
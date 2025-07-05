import React, { useEffect, useState } from 'react';
import productAPI from '../api/productAPI';
import { Link } from 'react-router-dom';

const normalize = name =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const demoImageMap = {
  phone: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  clothes: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
  electronics: 'https://images.unsplash.com/photo-1519121782439-2c5f2c2a3b8a?auto=format&fit=crop&w=400&q=80',
  clothingandfashion: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  homeandgarden: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  sportsandoutdoors: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
  booksandmedia: 'https://images.unsplash.com/photo-1519121782439-2c5f2c2a3b8a?auto=format&fit=crop&w=400&q=80',
  healthandbeauty: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  toysandgames: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  automotive: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  foodandbeverages: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
  jewelryandwatches: 'https://images.unsplash.com/photo-1519121782439-2c5f2c2a3b8a?auto=format&fit=crop&w=400&q=80',
  petsupplies: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80',
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMain, setSelectedMain] = useState(null);

  useEffect(() => {
    productAPI.getCategories().then(res => {
      setCategories(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const mainCategories = categories.filter(cat => !cat.parentCategory);
  const subcategories = selectedMain ? categories.filter(cat => cat.parentCategory === selectedMain) : [];

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">{selectedMain ? 'Select a Subcategory' : 'All Categories'}</h2>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
        ) : selectedMain ? (
          <>
            <button onClick={() => setSelectedMain(null)} className="mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">&larr; Back to Categories</button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {subcategories && subcategories.length > 0 ? subcategories.map((subcat) => (
                <Link
                  key={subcat._id}
                  to={`/products?category=${subcat._id}`}
                  className="group"
                >
                  <div className="relative bg-gray-100 rounded-lg p-6 text-center hover:bg-primary-50 transition-colors overflow-hidden h-48 flex flex-col justify-end items-center">
                    <img
                      src={
                        subcat.image ||
                        demoImageMap[normalize(subcat.name)] ||
                        '/default-category.png'
                      }
                      alt={subcat.name || 'Subcategory'}
                      onError={e => {
                        if (!e.target.src.endsWith('/default-category.png')) {
                          e.target.src = '/default-category.png';
                        }
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 z-0"
                      style={{ filter: 'brightness(0.7)' }}
                    />
                    <div className="relative z-10">
                      <h3 className="font-semibold mb-2 group-hover:text-primary-600 text-white text-lg drop-shadow-lg">
                        {subcat.name || 'Unnamed Subcategory'}
                      </h3>
                    </div>
                  </div>
                </Link>
              )) : <div className="col-span-full text-center text-gray-500">No subcategories found.</div>}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mainCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedMain(cat._id)}
                className="group w-full"
              >
                <div className="relative bg-gray-100 rounded-lg p-6 text-center hover:bg-primary-50 transition-colors overflow-hidden h-48 flex flex-col justify-end items-center">
                  <img
                    src={
                      cat.image ||
                      demoImageMap[normalize(cat.name)] ||
                      '/default-category.png'
                    }
                    alt={cat.name || 'Category'}
                    onError={e => {
                      if (!e.target.src.endsWith('/default-category.png')) {
                        e.target.src = '/default-category.png';
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 z-0"
                    style={{ filter: 'brightness(0.7)' }}
                  />
                  <div className="relative z-10">
                    <h3 className="font-semibold mb-2 group-hover:text-primary-600 text-white text-lg drop-shadow-lg">
                      {cat.name || 'Unnamed Category'}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 
import React from 'react';
import { Link } from 'react-router-dom';

const CategoriesGrid = ({ categories }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
    {categories.map((category, index) => (
      <Link
        key={category._id}
        to={`/products?category=${category._id}`}
        className="group"
      >
        <div className="bg-gray-100 rounded-lg p-6 text-center hover:bg-primary-50 transition-colors">
          <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <span className="text-2xl font-bold text-primary-600">
              {category.name.charAt(0)}
            </span>
          </div>
          <h3 className="font-semibold mb-2 group-hover:text-primary-600">
            {category.name}
          </h3>
          {category.count !== undefined && (
            <p className="text-sm text-gray-600">{category.count} products</p>
          )}
        </div>
      </Link>
    ))}
  </div>
);

export default CategoriesGrid; 
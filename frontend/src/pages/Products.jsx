import React, { useState } from 'react';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './Products.css';

// Mock Data
const allProducts = [
  { id: 1, name: 'Sony WH-1000XM5', price: 398.00, rating: 4.8, category: 'Electronics', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Apple Watch Series 8', price: 399.00, rating: 4.9, category: 'Electronics', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Nike Air Max 270', price: 150.00, rating: 4.7, category: 'Fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Minimalist Desk Lamp', price: 85.00, rating: 4.6, category: 'Home', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Logitech MX Master 3', price: 99.99, rating: 4.9, category: 'Electronics', image: 'https://images.unsplash.com/photo-1527814050087-1524316d80ff?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Yeti Rambler 20 oz', price: 35.00, rating: 4.8, category: 'Sports', image: 'https://images.unsplash.com/photo-1606822293816-0158498263eb?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Organic Cotton T-Shirt', price: 28.00, rating: 4.5, category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Ceramic Coffee Mug', price: 18.50, rating: 4.7, category: 'Home', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80' },
];

const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports'];

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(500);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesPrice = product.price <= priceRange;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">All Products</h1>
          <p className="page-subtitle">Discover our curated collection of premium products.</p>
        </div>
      </div>

      <div className="container products-container">
        <aside className="sidebar-filters glass">
          <div className="filter-group">
            <h3 className="filter-title"><Filter size={18} className="mr-2" /> Filters</h3>
          </div>

          <div className="filter-group">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-subtitle">Categories</h4>
            <ul className="category-list">
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h4 className="filter-subtitle flex justify-between">
              <span>Price Range</span>
              <span>${priceRange}</span>
            </h4>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="range-slider"
            />
            <div className="range-labels">
              <span>$0</span>
              <span>$1000</span>
            </div>
          </div>
        </aside>

        <main className="products-main">
          <div className="products-controls">
            <div className="results-count">Showing {filteredProducts.length} results</div>
            <div className="sort-dropdown">
              <SlidersHorizontal size={16} className="mr-2" />
              <select className="select-field">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query.</p>
              <button 
                className="btn-secondary mt-4"
                onClick={() => { setActiveCategory('All'); setPriceRange(1000); setSearchQuery(''); }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

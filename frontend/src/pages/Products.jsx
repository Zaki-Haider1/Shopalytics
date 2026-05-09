import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';
import './Products.css';

const categories = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports'];

const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(50000); // Higher max for seed data
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesPrice = (product.price || 0) <= priceRange;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  if (loading) return <div className="loading-state">Loading premium products...</div>;

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
              max="50000" 
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="range-slider"
            />
            <div className="range-labels">
              <span>$0</span>
              <span>$50,000</span>
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

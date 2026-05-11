import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isShowingAll, setIsShowingAll] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedRatings, setSelectedRatings] = useState([0, 1, 2, 3, 4, 5]);
  const [stockStatus, setStockStatus] = useState({ inStock: true, outOfStock: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const productsPerPage = 20;

  // Handle URL Search Params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category) {
      setActiveCategory(category);
      setIsShowingAll(false);
    } else {
      setIsShowingAll(true);
    }

    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsRes = await getProducts();
        if (productsRes.success) {
          setProducts(productsRes.products);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRatingCount = (rating) => {
    return products.filter(p => {
      const matchesCategory = isShowingAll || activeCategory === 'All' || p.category === activeCategory;
      return matchesCategory && Math.floor(p.ratings_avg || 0) === rating;
    }).length;
  };

  const getStockCount = (inStockRequested) => {
    return products.filter(p => {
      const matchesCategory = isShowingAll || activeCategory === 'All' || p.category === activeCategory;
      const isInStock = (p.stock_quantity || p.stock || 0) > 0;
      return matchesCategory && (inStockRequested ? isInStock : !isInStock);
    }).length;
  };

  const toggleRating = (rating) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(100000);
    setSelectedRatings([0, 1, 2, 3, 4, 5]);
    setStockStatus({inStock: true, outOfStock: true});
    setSearchQuery('');
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = isShowingAll || activeCategory === 'All' || product.category === activeCategory;
    const price = product.price || 0;
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = selectedRatings.includes(Math.floor(product.ratings_avg || 0)) || (selectedRatings.length === 0);
    const isInStock = (product.stock_quantity || product.stock || 0) > 0;
    const matchesStock = (stockStatus.inStock && isInStock) || (stockStatus.outOfStock && !isInStock);
    
    return matchesCategory && matchesPrice && matchesSearch && matchesRating && matchesStock;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.ratings_avg - a.ratings_avg;
      case 'popularity': return b.views_count - a.views_count;
      case 'newest': return new Date(b.created_at) - new Date(a.created_at);
      default: return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, isShowingAll, minPrice, maxPrice, searchQuery, sortBy, selectedRatings, stockStatus]);

  const handleShowAllToggle = () => {
    if (!isShowingAll) {
      // Logic: If checking "Show All", reset all filters
      setIsShowingAll(true);
      resetFilters();
    } else {
      // Logic: If unchecking "Show All", return to category filter
      setIsShowingAll(false);
      // If we don't have a category, default to 'All' which acts normally
    }
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loader"></div>
        <p>Loading premium collection...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">{isShowingAll ? 'All Products' : `${activeCategory} Products`}</h1>
          <p className="page-subtitle">Discover our curated collection of {filteredProducts.length} premium products.</p>
        </div>
      </div>

      <div className="container products-container">
        <aside className={`sidebar-filters glass ${showFilters ? 'active' : 'hidden'}`}>
          <div className="filter-group flex justify-between items-center">
            <h3 className="filter-title"><Filter size={18} className="mr-2" /> Filters</h3>
            <button className="text-btn-xs" onClick={resetFilters}>Reset</button>
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
            <label className="checkbox-label show-all-box">
              <input 
                type="checkbox" 
                checked={isShowingAll} 
                onChange={handleShowAllToggle}
              />
              <span className="ml-2 font-bold">Show All Products</span>
            </label>
            {!isShowingAll && activeCategory !== 'All' && (
              <div className="active-filter-tag mt-2">
                Filtering by: <strong>{activeCategory}</strong>
              </div>
            )}
          </div>

          <div className="filter-group">
            <h4 className="filter-subtitle">Ratings</h4>
            <div className="rating-filter-list">
              {[5, 4, 3, 2, 1, 0].map(star => (
                <label key={star} className="checkbox-label rating-item">
                  <input 
                    type="checkbox" 
                    checked={selectedRatings.includes(star)}
                    onChange={() => toggleRating(star)}
                  />
                  {star > 0 ? (
                    <div className="rating-stars ml-2">
                      {[...Array(star)].map((_, i) => <span key={i} className="star filled">★</span>)}
                      {[...Array(5-star)].map((_, i) => <span key={i} className="star empty">★</span>)}
                    </div>
                  ) : (
                    <span className="ml-2 font-medium mr-auto">Unrated</span>
                  )}
                  <span className="count-badge">{getRatingCount(star)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-subtitle">Price Range</h4>
            <div className="price-slider-container">
              <div 
                className="price-slider-track" 
                style={{ 
                  left: `${(minPrice / 100000) * 100}%`, 
                  width: `${((maxPrice - minPrice) / 100000) * 100}%` 
                }}
              ></div>
              <input 
                type="range" min="0" max="100000" step="500"
                value={minPrice} onChange={e => setMinPrice(Math.min(Number(e.target.value), maxPrice - 500))}
                className="range-slider dual-range min"
              />
              <input 
                type="range" min="0" max="100000" step="500"
                value={maxPrice} onChange={e => setMaxPrice(Math.max(Number(e.target.value), minPrice + 500))}
                className="range-slider dual-range max"
              />
            </div>
            <div className="price-inputs mt-4">
              <div className="price-input-box">
                <span>From</span>
                <input type="number" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} />
              </div>
              <div className="price-input-box">
                <span>To</span>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-subtitle">Availability</h4>
            <div className="stock-filter-list">
              <label className="checkbox-label rating-item">
                <input 
                  type="checkbox" 
                  checked={stockStatus.inStock} 
                  onChange={() => setStockStatus({...stockStatus, inStock: !stockStatus.inStock})}
                />
                <span className="ml-2 mr-auto">In Stock</span>
                <span className="count-badge">{getStockCount(true)}</span>
              </label>
              <label className="checkbox-label rating-item">
                <input 
                  type="checkbox" 
                  checked={stockStatus.outOfStock} 
                  onChange={() => setStockStatus({...stockStatus, outOfStock: !stockStatus.outOfStock})}
                />
                <span className="ml-2 mr-auto">Out of Stock</span>
                <span className="count-badge">{getStockCount(false)}</span>
              </label>
            </div>
          </div>
        </aside>

        <main className={`products-main ${!showFilters ? 'full-width' : ''}`}>
          <div className="products-controls">
            <div className="controls-left">
              <button 
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className="results-count">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} results
              </div>
            </div>
            
            <div className="sort-dropdown">
              <SlidersHorizontal size={16} className="mr-2" />
              <select 
                className="select-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popularity">Most Popular</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {currentProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {currentProducts.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i + 1} 
                      className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="pagination-btn" 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query.</p>
              <button 
                className="btn-secondary mt-4"
                onClick={() => { setIsShowingAll(true); resetFilters(); }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

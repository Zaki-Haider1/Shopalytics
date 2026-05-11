import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Sun, Moon, Menu, X, Package, Tag, LogOut } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allData, setAllData] = useState({ products: [], categories: [] });
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        if (productsRes.success && categoriesRes.success) {
          setAllData({
            products: productsRes.products,
            categories: categoriesRes.categories
          });
        }
      } catch (err) {
        console.error("Navbar data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filteredCategories = allData.categories
        .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(cat => ({ type: 'category', value: cat }));

      const filteredProducts = allData.products
        .filter(prod => prod.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(prod => ({ type: 'product', value: prod.name, id: prod._id }));

      setSuggestions([...filteredCategories, ...filteredProducts].slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');
    if (suggestion.type === 'category') {
      navigate(`/products?category=${encodeURIComponent(suggestion.value)}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(suggestion.value)}`);
    }
  };

  return (
    <nav className="navbar glass">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-text">Shopalytics<span className="dot">.</span></span>
          </Link>
        </div>

        <div className="search-bar-container desktop-search" ref={searchRef}>
          <form className="search-bar" onSubmit={(e) => { e.preventDefault(); handleSearch(e); }}>
            <input 
              type="text" 
              placeholder="Search products, categories..." 
              className="input-field" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
            />
            <button type="submit" className="search-btn"><Search size={18} /></button>
          </form>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions glass">
              {suggestions.map((item, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item.type === 'category' ? <Tag size={14} className="mr-2" /> : <Package size={14} className="mr-2" />}
                  <span className="suggestion-text">{item.value}</span>
                  <span className="suggestion-type">{item.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link to="/categories" className="nav-link" onClick={() => setIsMenuOpen(false)}>Categories</Link>
          <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>Orders</Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</Link>
          {user?.role === 'admin' && <Link to="/admin" className="nav-link" onClick={() => setIsMenuOpen(false)}>Admin</Link>}
        </div>

        <div className="navbar-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <div className="navbar-user-info">
            {user ? (
              <div className="user-profile-nav">
                <Link to="/login" className="icon-btn user-btn" title={user.name}>
                  <User size={20} />
                  <span className="user-name-text">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={logout} className="icon-btn logout-btn" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="icon-btn">
                <User size={20} />
              </Link>
            )}
          </div>

          <Link to="/cart" className="icon-btn cart-btn">
            <ShoppingCart size={20} />
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </Link>
          <button className="icon-btn mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="mobile-search glass">
        <form className="search-bar" onSubmit={(e) => { e.preventDefault(); handleSearch(e); }}>
          <input 
            type="text" 
            placeholder="Search..." 
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn"><Search size={18} /></button>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;

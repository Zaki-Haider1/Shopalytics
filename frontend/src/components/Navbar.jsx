import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Sun, Moon, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="navbar glass">
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-text">Shopalytics<span className="dot">.</span></span>
          </Link>
        </div>

        <div className="search-bar desktop-search">
          <input type="text" placeholder="Search products, brands..." className="input-field" />
          <button className="search-btn"><Search size={18} /></button>
        </div>

        <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/products" className="nav-link" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          <Link to="/categories" className="nav-link" onClick={() => setIsMenuOpen(false)}>Categories</Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</Link>
        </div>

        <div className="navbar-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/login" className="icon-btn">
            <User size={20} />
          </Link>
          <Link to="/cart" className="icon-btn cart-btn">
            <ShoppingCart size={20} />
            <span className="cart-badge">3</span>
          </Link>
          <button className="icon-btn mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="mobile-search glass">
        <div className="search-bar">
          <input type="text" placeholder="Search..." className="input-field" />
          <button className="search-btn"><Search size={18} /></button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

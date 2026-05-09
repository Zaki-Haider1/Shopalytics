import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import './Home.css';

const categories = [
  { id: 1, name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80', color: '#3b82f6' },
  { id: 2, name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80', color: '#ec4899' },
  { id: 3, name: 'Home & Living', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80', color: '#10b981' },
  { id: 4, name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80', color: '#f59e0b' },
];

const featuredProducts = [
  { id: 1, name: 'Sony WH-1000XM5', price: 398.00, rating: 4.8, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Apple Watch Series 8', price: 399.00, rating: 4.9, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Nike Air Max 270', price: 150.00, rating: 4.7, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Minimalist Desk Lamp', price: 85.00, rating: 4.6, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80' },
];

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge">New AI Assistant Available</span>
            <h1 className="hero-title">
              Smart Shopping with <span className="text-gradient">AI-powered</span> recommendations.
            </h1>
            <p className="hero-subtitle">
              Experience the future of e-commerce. Personalized product suggestions, real-time stock updates, and a seamless checkout process.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary">
                Shop Now <ArrowRight size={18} className="ml-2" />
              </Link>
              <button className="btn-secondary flex items-center">
                <Bot size={18} className="mr-2" /> Ask AI Assistant
              </button>
            </div>
            
            <div className="features-row">
              <div className="feature"><Zap size={20} className="feature-icon" /> Fast Delivery</div>
              <div className="feature"><Shield size={20} className="feature-icon" /> Secure Payments</div>
              <div className="feature"><Truck size={20} className="feature-icon" /> Free Shipping</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass hero-card">
              <img src="https://images.unsplash.com/photo-1555529771-835f59bfc50c?auto=format&fit=crop&w=600&q=80" alt="Featured collection" className="hero-img" />
              <div className="floating-badge top-right">
                <div className="pulse-dot"></div>
                Popular Now
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/categories" className="view-all">View All <ArrowRight size={16} /></Link>
          </div>
          
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <motion.div 
                key={cat.id} 
                className="category-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <img src={cat.image} alt={cat.name} className="category-img" />
                <div className="category-overlay" style={{ background: `linear-gradient(to top, ${cat.color}E6, transparent)` }}>
                  <h3>{cat.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trending Products</h2>
            <Link to="/products" className="view-all">Shop All <ArrowRight size={16} /></Link>
          </div>
          
          <div className="products-scroll">
            {featuredProducts.map((product, index) => (
              <motion.div 
                key={product.id} 
                className="product-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="product-img-wrapper">
                  <img src={product.image} alt={product.name} className="product-img" />
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
                <div className="product-info">
                  <div className="rating">★ {product.rating}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Teaser */}
      <section className="ai-teaser-section">
        <div className="container">
          <motion.div 
            className="ai-banner glass"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="ai-banner-content">
              <Bot size={48} className="text-gradient" />
              <h2>Not sure what to buy?</h2>
              <p>Our AI assistant can help you find exactly what you're looking for based on your preferences, budget, and style.</p>
              <button className="btn-primary flex items-center">
                Try AI Recommendations <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
            <div className="ai-mockup">
              <div className="chat-bubble left">I need a good laptop for graphic design under $1500.</div>
              <div className="chat-bubble right gradient-bg">I recommend the MacBook Air M2 or the Dell XPS 15. Both offer great color accuracy and performance. Would you like me to compare them?</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

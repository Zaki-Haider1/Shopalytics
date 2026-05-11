import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Layout, ShieldCheck, ShoppingBag, Users, Globe, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="badge">The Ultimate Brand Growth Platform</div>
            <h1 className="hero-title">
              Sell your brand. <br />
              <span className="text-gradient">Control your data.</span>
            </h1>
            <p className="hero-subtitle">
              Shopalytics isn't just another marketplace. It's a powerful command center for your business, giving you complete oversight of your sales, customers, and analytical insights.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary">
                Shop Now <ShoppingBag size={18} className="ml-2" />
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn More <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
            
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Data Privacy</span>
              </div>
              <div className="divider"></div>
              <div className="stat-item">
                <span className="stat-number">Real-time</span>
                <span className="stat-label">Analytics</span>
              </div>
              <div className="divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="dashboard-preview glass">
              <div className="preview-header">
                <div className="dots"><span></span><span></span><span></span></div>
                <div className="preview-title">Shopalytics Admin</div>
              </div>
              <div className="preview-body">
                <div className="chart-mockup">
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar" style={{ height: '70%' }}></div>
                  <div className="bar" style={{ height: '50%' }}></div>
                  <div className="bar" style={{ height: '90%' }}></div>
                  <div className="bar" style={{ height: '60%' }}></div>
                </div>
                <div className="data-points">
                  <div className="point"></div>
                  <div className="point"></div>
                  <div className="point"></div>
                </div>
              </div>
              <div className="floating-card glass">
                <BarChart3 size={20} className="text-primary" />
                <div>
                  <small>Revenue Growth</small>
                  <strong>+24.8%</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-intro text-center">
            <h2 className="section-title">Why choose Shopalytics?</h2>
            <p className="section-subtitle">Everything you need to build, scale, and manage your brand with precision.</p>
          </div>

          <div className="features-grid">
            <motion.div 
              className="feature-card glass"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="icon-box gradient-bg">
                <Layout size={24} color="white" />
              </div>
              <h3>Complete Control</h3>
              <p>Customize your storefront and manage your inventory with intuitive tools designed for brand owners.</p>
            </motion.div>

            <motion.div 
              className="feature-card glass"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="icon-box gradient-bg">
                <BarChart3 size={24} color="white" />
              </div>
              <h3>Data-Driven Insights</h3>
              <p>Access detailed analytical data to understand your customers and optimize your selling strategy.</p>
            </motion.div>

            <motion.div 
              className="feature-card glass"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="icon-box gradient-bg">
                <ShieldCheck size={24} color="white" />
              </div>
              <h3>Secure & Reliable</h3>
              <p>Your business data is yours. We provide enterprise-grade security to keep your information safe.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-banner gradient-bg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="cta-content">
              <h2>Ready to start your journey?</h2>
              <p>Join hundreds of brand owners who are taking control of their commerce data today.</p>
              <div className="cta-buttons">
                <Link to="/contact" className="btn-light">
                  Start your own Shopalytics <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link to="/contact" className="btn-outline-light">
                  Contact Developers
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <Globe size={120} className="globe-icon" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="dev-section">
        <div className="container">
          <div className="dev-card glass">
            <div className="dev-info">
              <Users size={32} className="text-primary mb-4" />
              <h3>Meet the Developers</h3>
              <p>Built with passion by a team dedicated to empowering small and medium-sized brands through better data accessibility.</p>
              <Link to="/contact" className="btn-text">
                Get in touch with us <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="dev-tags">
              <span className="tag">React</span>
              <span className="tag">Node.js</span>
              <span className="tag">MongoDB</span>
              <span className="tag">Data Analytics</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

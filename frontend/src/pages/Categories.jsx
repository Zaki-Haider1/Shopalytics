import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, Smartphone, ShoppingBag, Coffee, Home, Zap } from 'lucide-react';
import { getCategories } from '../services/api';
import './Categories.css';

const CategoryIcon = ({ name, size = 24 }) => {
  const n = name.toLowerCase();
  if (n.includes('elect')) return <Zap size={size} />;
  if (n.includes('phone') || n.includes('tech')) return <Smartphone size={size} />;
  if (n.includes('fashion') || n.includes('cloth')) return <ShoppingBag size={size} />;
  if (n.includes('food') || n.includes('drink')) return <Coffee size={size} />;
  if (n.includes('home')) return <Home size={size} />;
  return <Layers size={size} />;
};

const categoryGradients = [
  'linear-gradient(135deg, #6366f1, #a855f7)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #10b981, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        if (res.success) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category}`);
  };

  if (loading) return <div className="categories-loading">Discovering categories...</div>;

  return (
    <div className="categories-page container">
      <div className="page-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="page-title">Shop by Category</h1>
          <p className="page-subtitle">Find exactly what you're looking for across our curated departments.</p>
        </motion.div>
      </div>

      <div className="categories-grid">
        {categories.map((cat, index) => (
          <motion.button
            key={cat}
            className="category-card-btn"
            style={{ '--card-gradient': categoryGradients[index % categoryGradients.length] }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => handleCategoryClick(cat)}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="category-card-content">
              <div className="category-icon-wrapper">
                <CategoryIcon name={cat} size={32} />
              </div>
              <h3 className="category-name">{cat}</h3>
              <div className="category-action">
                <span>Explore</span>
                <ArrowRight size={16} />
              </div>
            </div>
            <div className="category-bg-overlay"></div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Categories;

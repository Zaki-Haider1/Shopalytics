import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, index }) => {
  return (
    <motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="product-img-wrapper">
        <img src={product.image} alt={product.name} className="product-img" />
        <div className="product-actions">
          <button className="action-btn" title="Add to Cart">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
      <Link to={`/product/${product.id}`} className="product-info-link">
        <div className="product-info">
          <div className="rating">★ {product.rating}</div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">${product.price.toFixed(2)}</div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

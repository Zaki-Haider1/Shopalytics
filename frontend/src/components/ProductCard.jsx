import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';
import { useState } from 'react';

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Check for new images array first, then old image field, then placeholder
  const imageUrl = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : (product.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80`);

  return (
    <motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="product-img-wrapper">
        <img src={imageUrl} alt={product.name} className="product-img" />
        <div className="product-actions">
          <button 
            className={`action-btn ${added ? 'added' : ''}`} 
            title="Add to Cart"
            onClick={handleAddToCart}
          >
            {added ? <span style={{fontSize: '12px', fontWeight: 'bold'}}>✓</span> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
      <Link to={`/product/${product._id || product.id}`} className="product-info-link">
        <div className="product-info">
          <div className="rating">★ {product.ratings_avg || product.rating || 0}</div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-price">${(product.price || 0).toFixed(2)}</div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;


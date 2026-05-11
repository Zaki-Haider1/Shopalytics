import { ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const categoryPlaceholders = {
  "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&q=80",
  "Clothing": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
  "Books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
  "Home & Kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80",
  "Sports": "https://itemit.com/_next/image?url=%2Fimages%2Fblog%2Fcdn%2FSports-Equipment-For-The-Olympics-.png&w=3840&q=75"
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=500&q=80";

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const productImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : product.image || categoryPlaceholders[product.category] || DEFAULT_FALLBACK;

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if ((product.stock_quantity ?? product.stock ?? 0) <= 0) {
      alert("Sorry, this item is out of stock.");
      return;
    }
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };

  return (
    <motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-img-wrapper">
        <img src={productImage} alt={product.name} className="product-img" />
        <div className="product-actions">
          <button 
            className={`action-btn ${(product.stock_quantity ?? product.stock ?? 0) <= 0 ? 'disabled' : ''}`} 
            title={(product.stock_quantity ?? product.stock ?? 0) > 0 ? "Add to Cart" : "Out of Stock"} 
            onClick={handleAddToCart}
            disabled={(product.stock_quantity ?? product.stock ?? 0) <= 0}
          >
            <ShoppingCart size={18} />
          </button>
          <button className="action-btn" title="View Details" onClick={handleCardClick}>
            <Eye size={18} />
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-stats">
          <div className="rating-stars">
            {renderStars(product.ratings_avg || 0)}
            <span className="rating-value">({(product.ratings_avg || 0).toFixed(1)})</span>
          </div>
          <div className="views-count">
            <span>{(product.views_count || 0).toLocaleString()} views</span>
          </div>
        </div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">Rs.{(product.price || 0).toLocaleString()}</div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

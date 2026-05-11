import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, Bot, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

const categoryPlaceholders = {
  "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
  "Clothing": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
  "Books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
  "Home & Kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
  "Sports": "https://itemit.com/_next/image?url=%2Fimages%2Fblog%2Fcdn%2FSports-Equipment-For-The-Olympics-.png&w=3840&q=75"
};

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=600&q=80";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        if (res.success) {
          setProduct(res.product);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const productId = product._id || product.id;
    const existingItem = (JSON.parse(localStorage.getItem('cart')) || []).find(item => (item._id || item.id) === productId);
    const currentInCart = existingItem ? existingItem.quantity : 0;
    
    if (currentInCart + quantity > product.stock_quantity) {
      alert(`Cannot add ${quantity} more items. Only ${product.stock_quantity} total available and you have ${currentInCart} in cart.`);
      return;
    }

    addToCart(product, quantity);
    alert(`${quantity} ${product.name} added to cart!`);
  };

  if (loading) return <div className="container mt-10">Loading product...</div>;
  if (!product) return <div className="container mt-10">Product not found.</div>;

  // Logic to handle both single 'image' and 'images' array
  const getImages = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    const placeholder = categoryPlaceholders[product.category] || DEFAULT_FALLBACK;
    return [product.image || placeholder];
  };

  const images = getImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="product-details-page container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to={`/products?category=${product.category}`}>{product.category}</Link> &gt; <span>{product.name}</span>
      </div>

      <div className="product-details-grid">
        <div className="product-gallery-container">
          <div className="main-image-wrapper glass">
            {images.length > 1 && (
              <button className="carousel-btn prev" onClick={prevImage} aria-label="Previous image">
                <ChevronLeft size={24} />
              </button>
            )}
            
            <img src={images[currentImageIndex]} alt={product.name} className="main-image" />
            
            {images.length > 1 && (
              <button className="carousel-btn next" onClick={nextImage} aria-label="Next image">
                <ChevronRight size={24} />
              </button>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-grid">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail-item glass ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-panel">
          <div className="product-meta">
            <h1 className="detail-title">{product.name}</h1>
            <div className="product-price">
            <span className="current-price">Rs. {product.price.toFixed(2)}</span>
          </div>
            <div className="detail-rating">
              <Star className="star-icon filled" size={18} />
              <span className="review-count">({product.ratings_avg || 0})</span>
            </div>
            <div className={`stock-status ${(product.stock_quantity > 0) ? 'in-stock' : 'out-of-stock'}`}>
              {(product.stock_quantity > 0) ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
            </div>
          </div>

          <div className="product-description">
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          <div className="purchase-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button 
              className={`btn-primary add-cart-large flex items-center justify-center ${product.stock_quantity <= 0 ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingCart size={20} className="mr-2" /> 
              {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <Truck size={24} className="text-primary" />
              <div className="policy-info">
                <h4>Free Shipping</h4>
                <p>On orders over Rs. 5000</p>
              </div>
            </div>
            <div className="trust-badge">
              <ShieldCheck size={24} className="text-success" />
              <div>
                <h4>Secure Checkout</h4>
                <p>256-bit encryption</p>
              </div>
            </div>
          </div>

          <div className="ai-ask-box glass">
            <Bot size={24} className="text-gradient mb-2" />
            <h4>Have a question?</h4>
            <p>Ask our AI assistant anything about this product.</p>
            <button className="btn-secondary mt-2 w-full">Ask AI</button>
          </div>
        </div>
      </div>

      <div className="product-tabs section-margin">
        <div className="tab-headers">
          <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
          <button className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>Features</button>
          <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
        </div>
        <div className="tab-content glass">
          {activeTab === 'description' && <p>{product.description}</p>}
          {activeTab === 'features' && (
            <ul className="feature-list">
              {(product.features || ['High quality material', 'Original brand warranty', 'Premium design', 'Fast shipping']).map((feat, i) => <li key={i}>• {feat}</li>)}
            </ul>
          )}
          {activeTab === 'reviews' && <p>Customer reviews will appear here.</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

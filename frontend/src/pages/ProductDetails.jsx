import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, Bot, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

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
        const data = await getProduct(id);
        setProduct(data);
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
    // Add to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    alert(`${quantity} ${product.name} added to cart!`);
  };

  if (loading) return <div className="container mt-10">Loading product...</div>;
  if (!product) return <div className="container mt-10">Product not found.</div>;

  // Logic to handle both single 'image' and 'images' array
  const getImages = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'];
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
        <Link to="/">Home</Link> &gt; <Link to="/products">Electronics</Link> &gt; <span>{product.name}</span>
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
            <div className="detail-rating">
              <Star className="star-icon filled" size={18} />
              <span className="review-count">({product.reviews_count || 0} reviews)</span>
            </div>
            <div className="detail-price">${(product.price || 0).toFixed(2)}</div>
            <div className={`stock-status ${(product.stock > 0) ? 'in-stock' : 'out-of-stock'}`}>
              {(product.stock > 0) ? 'In Stock' : 'Out of Stock'}
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
              className="btn-primary add-cart-large flex items-center justify-center"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={20} className="mr-2" /> Add to Cart
            </button>
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <Truck size={24} className="text-primary" />
              <div>
                <h4>Free Shipping</h4>
                <p>On orders over $50</p>
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

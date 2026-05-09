import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, Bot, ShoppingCart } from 'lucide-react';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Mock fetching data based on ID
  const product = { 
    id, 
    name: 'Sony WH-1000XM5 Wireless Headphones', 
    price: 398.00, 
    rating: 4.8, 
    reviews: 124,
    description: 'Industry-leading noise canceling with two processors and eight microphones. Magnificent sound, engineered to perfection with the new Integrated Processor V1.',
    features: ['Auto Noise Canceling Optimizer', 'Up to 30-hour battery life', 'Touch Sensor controls', 'Multipoint connection'],
    inStock: true,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80' 
  };

  return (
    <div className="product-details-page container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/products">Electronics</Link> &gt; <span>{product.name}</span>
      </div>

      <div className="product-details-grid">
        <div className="product-gallery glass">
          <img src={product.image} alt={product.name} className="main-image" />
        </div>

        <div className="product-info-panel">
          <div className="product-meta">
            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-rating">
              <Star className="star-icon filled" size={18} />
              <Star className="star-icon filled" size={18} />
              <Star className="star-icon filled" size={18} />
              <Star className="star-icon filled" size={18} />
              <Star className="star-icon half" size={18} />
              <span className="review-count">({product.reviews} reviews)</span>
            </div>
            <div className="detail-price">${product.price.toFixed(2)}</div>
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>

          <div className="product-description">
            <p>{product.description}</p>
          </div>

          <div className="purchase-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="btn-primary add-cart-large flex items-center justify-center">
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
              {product.features.map((feat, i) => <li key={i}>• {feat}</li>)}
            </ul>
          )}
          {activeTab === 'reviews' && <p>Customer reviews will appear here.</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

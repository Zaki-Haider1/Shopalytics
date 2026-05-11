import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="container cart-page">
      <h1 className="page-title">Shopping Cart</h1>
      
      {cart.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items-list glass">
              {cart.map(item => (
                <div key={item._id || item.id} className="cart-item">
                  <img src={item.image || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80`} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">Rs. {item.price.toFixed(2)}</p>
                  </div>
                  <div className="quantity-selector">
                    <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1, item.stock_quantity)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1, item.stock_quantity)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item._id || item.id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="cart-summary-section">
            <div className="cart-summary glass">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax</span>
                <span>Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn-primary checkout-btn mt-4">
                Proceed to Checkout <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-cart glass">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-primary mt-4">Continue Shopping</Link>
        </div>
      )}
    </div>
  );
};

export default Cart;

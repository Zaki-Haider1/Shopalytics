import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  // Mock cart data
  const cartItems = [
    { id: 1, name: 'Sony WH-1000XM5', price: 398.00, quantity: 1, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=200&q=80' },
    { id: 3, name: 'Nike Air Max 270', price: 150.00, quantity: 2, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="container cart-page">
      <h1 className="page-title">Shopping Cart</h1>
      
      {cartItems.length > 0 ? (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items-list glass">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="quantity-selector">
                    <button>-</button>
                    <span>{item.quantity}</span>
                    <button>+</button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="remove-btn"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="cart-summary-section">
            <div className="cart-summary glass">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
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

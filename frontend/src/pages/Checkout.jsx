import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: ''
  });
  
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderData = {
        customer_id: "guest_" + Math.random().toString(36).substr(2, 9), // Temporary guest ID
        items: cart.map(item => ({
          product_id: item._id || item.id,
          name: item.name, // Save name so we don't have to join later
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        })),
        total_amount: getCartTotal() * 1.08, // Including 8% tax
        address: `${formData.address}, ${formData.city}, ${formData.zip}`
      };

      const response = await placeOrder(orderData);
      
      if (response.order_id) {
        setStep(3);
        clearCart();
        setTimeout(() => {
          navigate('/orders');
        }, 5000);
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="container text-center mt-10">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary mt-4">Go to Products</button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Checkout</h1>
      
      {step === 3 ? (
        <div className="order-success glass">
          <CheckCircle size={64} className="text-success mb-4" />
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for shopping with Shopalytics. Your order is being processed.</p>
          <p className="redirect-text">Redirecting to your orders in 5 seconds...</p>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-form-section glass">
            {step === 1 && (
              <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <h3><Truck className="mr-2 inline" size={20} /> Shipping Information</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" className="input-field" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" className="input-field" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group full-width">
                    <label>Address</label>
                    <input type="text" name="address" className="input-field" value={formData.address} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input type="text" name="city" className="input-field" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group">
                    <label>Zip Code</label>
                    <input type="text" name="zip" className="input-field" value={formData.zip} onChange={handleInputChange} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-4">Review Order</button>
              </form>
            )}

            {step === 2 && (
              <div className="checkout-review">
                <h3><Package className="mr-2 inline" size={20} /> Order Review</h3>
                <div className="review-details mb-6">
                  <p><strong>Shipping to:</strong> {formData.firstName} {formData.lastName}</p>
                  <p>{formData.address}, {formData.city}, {formData.zip}</p>
                  <p><strong>Payment Method:</strong> Cash on Delivery (Simplified)</p>
                </div>
                
                <div className="form-actions mt-4">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>Back</button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? "Placing Order..." : "Confirm & Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-summary glass">
            <h3>Order Summary</h3>
            <div className="summary-items-list">
              {cart.map(item => (
                <div key={item._id || item.id} className="summary-item">
                  <span className="summary-name">{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-price">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

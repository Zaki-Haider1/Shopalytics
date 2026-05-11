import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, Package, User, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder, getUserInfo, patchProductStock } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: 'Punjab',
    paymentMethod: 'cash'
  });

  const handleUseRegisteredInfo = async () => {
    if (!user) return;
    
    setFetchingUser(true);
    try {
      const res = await getUserInfo(user.id);
      if (res.success) {
        setFormData(prev => ({
          ...prev,
          name: res.user.name || '',
          email: res.user.email || '',
          phone: res.user.phone || '',
          address: res.user.address || '',
          city: res.user.city || '',
          region: res.user.region || 'Punjab'
        }));
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
      alert("Could not fetch user info");
    } finally {
      setFetchingUser(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderData = {
        customer_id: user ? user.id : "guest_" + Math.random().toString(36).substr(2, 9),
        items: cart.map(item => ({
          product_id: item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        })),
        total_amount: getCartTotal() * 1.08,
        payment_method: formData.paymentMethod,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.region}`,
        customer_details: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }
      };

      const response = await placeOrder(orderData);
      
      if (response.success) {
        // Update stock for each item
        try {
          await Promise.all(cart.map(item => 
            patchProductStock(item._id || item.id, -item.quantity)
          ));
        } catch (stockErr) {
          console.error("Failed to update stock after order:", stockErr);
          // We still show success since the order itself went through
        }

        setStep(3);
        clearCart();
      } else {
        alert(response.message || "Failed to place order");
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
                <div className="section-header">
                  <h3><Truck className="mr-2 inline" size={20} /> Shipping Information</h3>
                  {user && (
                    <button 
                      type="button"
                      onClick={handleUseRegisteredInfo}
                      className="use-registered-btn"
                      disabled={fetchingUser}
                    >
                      {fetchingUser ? "Fetching..." : "Use Registered Info"}
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="input-group full-width">
                    <label>Full Name</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input type="text" name="name" className="input-field" value={formData.name} onChange={handleInputChange} required />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input type="email" name="email" className="input-field" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Phone Number</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <label>Street Address</label>
                    <div className="input-with-icon">
                      <MapPin size={18} className="input-icon" />
                      <input type="text" name="address" className="input-field" value={formData.address} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>City</label>
                    <input type="text" name="city" className="input-field" value={formData.city} onChange={handleInputChange} required />
                  </div>

                  <div className="input-group">
                    <label>Region</label>
                    <div className="input-with-icon">
                      <Globe size={18} className="input-icon" />
                      <select 
                        name="region" 
                        className="input-field select-field" 
                        value={formData.region} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="KPK">KPK</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="payment-method-section mt-8">
                  <h3>Payment Method</h3>
                  <div className="payment-options">
                    <label className={`payment-option glass ${formData.paymentMethod === 'cash' ? 'active' : ''}`}>
                      <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handleInputChange} />
                      <span>Cash on Delivery</span>
                    </label>
                    <label className={`payment-option glass ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                      <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className={`payment-option glass ${formData.paymentMethod === 'online_transfer' ? 'active' : ''}`}>
                      <input type="radio" name="paymentMethod" value="online_transfer" checked={formData.paymentMethod === 'online_transfer'} onChange={handleInputChange} />
                      <span>Online Transfer</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-8">Review Order</button>
              </form>
            )}

            {step === 2 && (
              <div className="checkout-review">
                <h3><Package className="mr-2 inline" size={20} /> Order Review</h3>
                <div className="review-details mb-6 glass">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Shipping to:</strong> {formData.address}, {formData.city}, {formData.region}</p>
                  <p><strong>Payment Method:</strong> {formData.paymentMethod.replace('_', ' ')}</p>
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
                  <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span className="total-price">Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

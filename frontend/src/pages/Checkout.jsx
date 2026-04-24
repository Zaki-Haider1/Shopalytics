import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setStep(3);
    setTimeout(() => {
      navigate('/orders');
    }, 3000);
  };

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Checkout</h1>
      
      {step === 3 ? (
        <div className="order-success glass">
          <CheckCircle size={64} className="text-success mb-4" />
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for shopping with Shopalytics. Your order is being processed.</p>
          <p className="redirect-text">Redirecting to your orders...</p>
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
                    <input type="text" className="input-field" required />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input type="text" className="input-field" required />
                  </div>
                  <div className="input-group full-width">
                    <label>Address</label>
                    <input type="text" className="input-field" required />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input type="text" className="input-field" required />
                  </div>
                  <div className="input-group">
                    <label>Zip Code</label>
                    <input type="text" className="input-field" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary mt-4">Continue to Payment</button>
              </form>
            )}

            {step === 2 && (
              <form className="checkout-form" onSubmit={handlePlaceOrder}>
                <h3><CreditCard className="mr-2 inline" size={20} /> Payment Method</h3>
                <div className="form-grid">
                  <div className="input-group full-width">
                    <label>Card Number</label>
                    <input type="text" className="input-field" placeholder="0000 0000 0000 0000" required />
                  </div>
                  <div className="input-group">
                    <label>Expiry Date</label>
                    <input type="text" className="input-field" placeholder="MM/YY" required />
                  </div>
                  <div className="input-group">
                    <label>CVV</label>
                    <input type="text" className="input-field" placeholder="123" required />
                  </div>
                </div>
                <div className="form-actions mt-4">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn-primary">Place Order</button>
                </div>
              </form>
            )}
          </div>

          <div className="checkout-summary glass">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span className="summary-name">Sony WH-1000XM5</span>
              <span>$398.00</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Total</span>
              <span className="total-price">$429.84</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

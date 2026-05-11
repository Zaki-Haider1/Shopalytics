import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { getOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders(user?.id);
        if (res.success) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container orders-page">
        <div className="empty-orders glass text-center py-12">
          <Package size={64} className="mx-auto mb-4 text-muted opacity-50" />
          <h2 className="text-xl font-bold mb-2">Login to view your orders</h2>
          <p className="text-muted mb-6">You need to be signed in to see your order history.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="btn-primary"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="container mt-10">Loading orders...</div>;
  
  return (
    <div className="container orders-page">
      <h1 className="page-title">My Orders</h1>
      
      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card glass">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <span className="order-date">{order.order_date}</span>
                </div>
                <div className={`order-status ${(order.status || 'pending').toLowerCase()}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="order-items">
                {(order.items || []).map((item, index) => (
                  <div key={index} className="order-item-row">
                    <Package size={16} className="text-muted mr-2" />
                    <span>{item.quantity}x {item.name || 'Product ' + item.product_id}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <span className="order-total-label">Total (incl. tax)</span>
                <span className="order-total">
                  Rs. {(order.total_amount || 
                    (order.items || []).reduce((acc, item) => acc + (item.subtotal || 0), 0) * 1.08
                    ).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-orders glass">
          <p>No orders found. Start shopping to see your orders here!</p>
        </div>
      )}
    </div>
  );
};

export default Orders;

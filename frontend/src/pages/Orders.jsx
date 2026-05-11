import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { getOrders } from '../services/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
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
  }, []);

  if (loading) return <div className="container mt-10">Loading orders...</div>;
  if (orders.length === 0) return <div className="container mt-10">No orders found.</div>;

  return (
    <div className="container orders-page">
      <h1 className="page-title">My Orders</h1>
      
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
                ${(order.total_amount || 
                   (order.items || []).reduce((acc, item) => acc + (item.subtotal || 0), 0) * 1.08
                  ).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

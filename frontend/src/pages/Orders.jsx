import React from 'react';
import { Package } from 'lucide-react';
import './Orders.css';

const Orders = () => {
  const orders = [
    { id: 'ORD-12345', date: '2023-10-25', status: 'Delivered', total: 429.84, items: [{ name: 'Sony WH-1000XM5', qty: 1 }] },
    { id: 'ORD-12346', date: '2023-11-02', status: 'Processing', total: 150.00, items: [{ name: 'Nike Air Max 270', qty: 1 }] }
  ];

  return (
    <div className="container orders-page">
      <h1 className="page-title">My Orders</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card glass">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.id}</h3>
                <span className="order-date">{order.date}</span>
              </div>
              <div className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </div>
            </div>
            
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <Package size={16} className="text-muted mr-2" />
                  <span>{item.qty}x {item.name}</span>
                </div>
              ))}
            </div>
            
            <div className="order-footer">
              <span className="order-total-label">Total</span>
              <span className="order-total">${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

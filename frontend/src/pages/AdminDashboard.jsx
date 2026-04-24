import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, BarChart3, Users, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './AdminDashboard.css';

// Mock Data for charts
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Fashion', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Sports', value: 200 },
];

const DashboardOverview = () => (
  <div className="admin-content-inner">
    <h2 className="admin-page-title">Dashboard Overview</h2>
    
    <div className="stats-grid">
      <div className="stat-card glass">
        <h3>Total Revenue</h3>
        <div className="stat-value text-primary">$45,231.89</div>
        <div className="stat-change positive">+20.1% from last month</div>
      </div>
      <div className="stat-card glass">
        <h3>Active Users</h3>
        <div className="stat-value">2,350</div>
        <div className="stat-change positive">+180 new users</div>
      </div>
      <div className="stat-card glass">
        <h3>Total Sales</h3>
        <div className="stat-value">12,234</div>
        <div className="stat-change positive">+19% from last month</div>
      </div>
      <div className="stat-card glass">
        <h3>AI Interactions</h3>
        <div className="stat-value">8,432</div>
        <div className="stat-change text-secondary">High engagement</div>
      </div>
    </div>

    <div className="charts-grid">
      <div className="chart-container glass">
        <h3>Revenue Over Time</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="chart-container glass">
        <h3>Sales by Category</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar glass">
        <div className="admin-brand">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/analytics" className={`admin-nav-link ${location.pathname.includes('/analytics') ? 'active' : ''}`}>
            <BarChart3 size={20} /> Analytics
          </Link>
          <Link to="/admin/products" className={`admin-nav-link ${location.pathname.includes('/products') ? 'active' : ''}`}>
            <ShoppingBag size={20} /> Products
          </Link>
          <Link to="/admin/customers" className={`admin-nav-link ${location.pathname.includes('/customers') ? 'active' : ''}`}>
            <Users size={20} /> Customers
          </Link>
          <Link to="/admin/settings" className={`admin-nav-link ${location.pathname.includes('/settings') ? 'active' : ''}`}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>
      
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/analytics" element={<div className="p-8"><h2>Analytics Detail Page</h2></div>} />
          <Route path="/products" element={<div className="p-8"><h2>Manage Products</h2></div>} />
          {/* Add other admin routes */}
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;

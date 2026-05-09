import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Users
} from "lucide-react";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

import "./AdminDashboard.css";

/* ─────────────────────────────
   DASHBOARD (EXECUTIVE VIEW)
───────────────────────────── */
const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/dashboard")
      .then(res => setData(res.data));
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="admin-content-inner">

      <h2 className="admin-page-title">Executive Dashboard</h2>

      {/* KPI CARDS */}
      <div className="stats-grid">

        <div className="stat-card glass">
          <h3>Total Revenue</h3>
          <div className="stat-value">${data.stats.total_revenue}</div>
        </div>

        <div className="stat-card glass">
          <h3>Total Profit</h3>
          <div className="stat-value text-green">${data.stats.total_profit}</div>
        </div>

        <div className="stat-card glass">
          <h3>Total Orders</h3>
          <div className="stat-value">{data.stats.total_orders}</div>
        </div>

        <div className="stat-card glass">
          <h3>Total Users</h3>
          <div className="stat-value">{data.stats.total_users}</div>
        </div>

      </div>

      {/* BIG REVENUE + PROFIT CHART */}
      <div className="chart-container glass">
        <h3>Revenue vs Profit Trend</h3>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data.daily_metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            <Line type="monotone" dataKey="total_revenue" stroke="#6366f1" strokeWidth={3} />
            <Line type="monotone" dataKey="total_profit" stroke="#22c55e" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PRODUCT PERFORMANCE */}
      <div className="chart-container glass">
        <h3>Top Product Revenue</h3>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.product_performance}>
            <XAxis dataKey="product_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_revenue" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

/* ─────────────────────────────
   ANALYTICS (DEEP INSIGHTS)
───────────────────────────── */
const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/analytics")
      .then(res => setData(res.data));
  }, []);

  if (!data) return <div>Loading analytics...</div>;

  const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ec4899"];

  return (
    <div className="admin-content-inner">

      <h2 className="admin-page-title">Deep Analytics</h2>

      {/* CUSTOMER INSIGHTS */}
      <div className="stats-grid">

        <div className="stat-card glass">
          <h3>Avg Order Value</h3>
          <div className="stat-value">${data.avg_order_value}</div>
        </div>

        <div className="stat-card glass">
          <h3>Top Customer</h3>
          <div className="stat-value">{data.top_customer}</div>
        </div>

        <div className="stat-card glass">
          <h3>Conversion Rate</h3>
          <div className="stat-value">{data.conversion_rate}%</div>
        </div>

      </div>

      {/* CUSTOMER SPENDING */}
      <div className="chart-container glass">
        <h3>Customer Spending Distribution</h3>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.customer_summary}>
            <XAxis dataKey="user_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_spent" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART INSIGHT */}
      <div className="chart-container glass">
        <h3>Customer Segments</h3>

        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={[
                { name: "High Value", value: 40 },
                { name: "Medium", value: 35 },
                { name: "Low", value: 25 }
              ]}
              dataKey="value"
              outerRadius={120}
            >
              {data.customer_summary?.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
};

/* ─────────────────────────────
   PRODUCTS (EDITABLE TABLE)
───────────────────────────── */
const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/products")
      .then(res => setProducts(res.data));
  }, []);

  const update = (id, field, value) => {
    axios.put("http://localhost:5000/api/admin/products/update", {
      product_id: id,
      field,
      value
    });
  };

  return (
    <div className="admin-content-inner">

      <h2 className="admin-page-title">Products Management</h2>

      <table className="product-table glass">

        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p.product_id}>

              <td>
                <input
                  value={p.name}
                  onChange={(e) => update(p.product_id, "name", e.target.value)}
                />
              </td>

              <td>
                <input
                  value={p.price}
                  onChange={(e) => update(p.product_id, "price", e.target.value)}
                />
              </td>

              <td>
                <input
                  value={p.stock}
                  onChange={(e) => update(p.product_id, "stock", e.target.value)}
                />
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
};

/* ─────────────────────────────
   MAIN LAYOUT
───────────────────────────── */
const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar glass">

        <h2 className="admin-brand">Admin Panel</h2>

        <nav className="admin-nav">

          <Link to="/admin" className="admin-nav-link">
            <LayoutDashboard /> Dashboard
          </Link>

          <Link to="/admin/analytics" className="admin-nav-link">
            <BarChart3 /> Analytics
          </Link>

          <Link to="/admin/products" className="admin-nav-link">
            <ShoppingBag /> Products
          </Link>

          <Link to="/admin/customers" className="admin-nav-link">
            <Users /> Customers
          </Link>

        </nav>

      </aside>

      {/* MAIN */}
      <main className="admin-main">

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/products" element={<Products />} />
        </Routes>

      </main>

    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  Users,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Bot,
  Trash2,
  PlusCircle,
  X,
  Image as ImageIcon
} from "lucide-react";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend
} from "recharts";

import "./AdminDashboard.css";

const API_BASE = "http://localhost:5000/api/admin";

/* ─────────────────────────────
   DASHBOARD (CLEAN VIEW)
───────────────────────────── */
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const fetchDashboardData = () => {
    axios.get(`${API_BASE}/dashboard`)
      .then(res => setData(res.data));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post(`${API_BASE}/sync`);
      alert("Warehouse synchronized!");
      fetchDashboardData();
    } catch (err) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  if (!data) return <div className="admin-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-content-inner">
      <div className="admin-header-flex">
        <div>
          <h2 className="admin-page-title">Dashboard</h2>
          <p className="admin-page-subtitle">Overview of your store performance</p>
        </div>
        <button className={`btn-sync ${syncing ? 'spinning' : ''}`} onClick={handleSync}>
          <RefreshCw size={18} /> Sync Data
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header"><span>Revenue</span> <DollarSign size={20} /></div>
          <div className="stat-value">${data.stats.total_revenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><span>Orders</span> <Package size={20} /></div>
          <div className="stat-value">{data.stats.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><span>Customers</span> <Users size={20} /></div>
          <div className="stat-value">{data.stats.total_users}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><span>Total Products</span> <ShoppingBag size={20} /></div>
          <div className="stat-value">{data.stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><span>Estimated Profit</span> <TrendingUp size={20} /></div>
          <div className="stat-value">${data.stats.total_profit.toLocaleString()}</div>
        </div>
      </div>

      <div className="dashboard-grid-main">
        <div className="chart-container">
          <h3>Revenue Performance</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_metrics || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--admin-text-sub)" 
                  fontSize={10} 
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis stroke="var(--admin-text-sub)" fontSize={12} />
                <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                <Line type="monotone" dataKey="total_revenue" stroke="var(--admin-accent)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            {(!data.daily_metrics || data.daily_metrics.length === 0) && <div className="no-data-overlay">No sales data yet. Click 'Sync'!</div>}
          </div>
        </div>

        <div className="chart-container">
          <h3>Top Products by Sales</h3>
          <div className="top-products-list">
            {(data.product_performance || []).length > 0 ? (
              data.product_performance.slice(0, 5).map((p, i) => (
                <div key={i} className="top-product-item">
                  <div className="p-info">
                    <div className="p-name" style={{color: 'var(--admin-text)', fontWeight: 'bold'}}>{p.name}</div>
                    <div className="p-sales" style={{color: 'var(--admin-text-sub)'}}>{(p.total_sales || 0)} units sold</div>
                  </div>
                  <div className="p-revenue" style={{color: 'var(--admin-accent)', fontWeight: '800'}}>${(p.total_revenue || 0).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="no-data-msg">No product sales yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────
   ANALYTICS (INTERESTING STATS)
───────────────────────────── */
const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/analytics`)
      .then(res => setData(res.data));
  }, []);

  if (!data) return <div className="admin-loading">Loading Analytics...</div>;

  return (
    <div className="admin-content-inner">
      <h2 className="admin-page-title">Analytics</h2>
      
      <div className="dashboard-grid-main">
        <div className="chart-container">
          <h3>Sales by Category</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.category_sales || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--admin-border)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--admin-text-sub)" fontSize={12} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--admin-accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {(!data.category_sales || data.category_sales.length === 0) && <div className="no-data-overlay">No category data yet.</div>}
          </div>
        </div>

        <div className="chart-container">
          <h3>Regional Revenue</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.region_revenue || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
                <XAxis dataKey="region_name" stroke="var(--admin-text-sub)" fontSize={12} />
                <YAxis stroke="var(--admin-text-sub)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="table-container mt-6">
        <div style={{padding: '1.5rem', borderBottom: '1px solid var(--admin-border)'}}>
          <h3 style={{margin: 0}}>Customer Leaderboard</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Orders</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {(data.customer_summary || []).slice(0, 10).map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.total_orders}</td>
                <td style={{color: 'var(--admin-accent)', fontWeight: 'bold'}}>${(c.total_spent || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─────────────────────────────
   AI WAREHOUSING (GEMINI CHAT)
───────────────────────────── */
const AIWarehousing = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([
    { role: 'ai', text: "Hello! I am your Warehouse Intelligence AI. You can ask me questions about your sales, regions, and products. How can I help you today?" }
  ]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query };
    setChat(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/ai-query`, { query });
      const aiMsg = { 
        role: 'ai', 
        text: res.data.answer,
        sql: res.data.sql 
      };
      setChat(prev => [...prev, aiMsg]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that query. Make sure the database is synced!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content-inner">
      <h2 className="admin-page-title">AI Warehousing</h2>
      <p className="admin-page-subtitle">Natural Language Business Intelligence powered by Gemini</p>

      <div className="chat-container glass-card" style={{height: '600px', display: 'flex', flexDirection: 'column'}}>
        <div className="chat-messages" style={{flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {chat.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              <div className="bubble-content">
                {msg.text}
                {msg.sql && (
                  <div className="sql-box">
                    <div className="sql-label">AI Generated Query:</div>
                    <code style={{color: '#6366f1', display: 'block', wordBreak: 'break-all'}}>{msg.sql}</code>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="chat-bubble ai">Thinking...</div>}
        </div>

        <form onSubmit={handleAsk} className="chat-input-area" style={{padding: '1rem', borderTop: '1px solid var(--admin-border)', display: 'flex', gap: '1rem'}}>
          <input 
            type="text" 
            className="table-input" 
            placeholder="e.g. Which region has the highest revenue?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button className="btn-sync" disabled={loading}>
            <Bot size={18} /> Ask AI
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────
   ADD PRODUCT (PREMIUM FORM)
───────────────────────────── */
const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "50", // Default stock to 50
    description: "",
    images: [] // Array of Base64 strings
  });
  const [loading, setLoading] = useState(false);

  // Helper to convert file to Base64 string
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      const newImages = [...formData.images];
      newImages[index] = base64;
      setFormData({ ...formData, images: newImages });
    } catch (err) {
      alert("Error processing image file");
    }
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert("Please add at least one image");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/products`, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      });
      alert("Product added successfully!");
      setFormData({ name: "", category: "", brand: "", price: "", stock: "50", description: "", images: [] });
    } catch (err) {
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content-inner">
      <div className="admin-header-flex">
        <div>
          <h2 className="admin-page-title">Add New Product</h2>
          <p className="admin-page-subtitle">Upload local images directly to your database</p>
        </div>
      </div>

      <div className="glass-card" style={{padding: '2.5rem', maxWidth: '800px', marginTop: '1.5rem'}}>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          
          <div className="form-section">
            <h4 style={{marginBottom: '1rem', color: 'var(--admin-accent)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Basic Information</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" className="table-input" required placeholder="e.g. Premium Wireless Headphones"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Category</label>
                  <input 
                    type="text" className="table-input" required placeholder="Electronics"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Brand</label>
                  <input 
                    type="text" className="table-input" required placeholder="Sony"
                    value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Price ($)</label>
                  <input 
                    type="number" step="0.01" className="table-input" required placeholder="299.99"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Stock Quantity</label>
                  <input 
                    type="number" className="table-input" required placeholder="50"
                    value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="table-input" rows="4" placeholder="Tell customers about this product..."
                  style={{padding: '0.8rem', resize: 'vertical'}}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h4 style={{margin: 0, color: 'var(--admin-accent)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Product Gallery (Stored as Bytes)</h4>
              <button type="button" onClick={addImageField} className="btn-sync" style={{padding: '5px 12px', fontSize: '0.8rem'}}>
                <PlusCircle size={14} /> Add Image Slot
              </button>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {formData.images.map((data, index) => (
                <div key={index} style={{display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px'}}>
                  {data ? (
                    <img src={data} alt="Preview" style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover'}} />
                  ) : (
                    <div style={{width: '60px', height: '60px', borderRadius: '8px', background: 'var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <div style={{flex: 1}}>
                    <input 
                      type="file" accept="image/*" 
                      onChange={e => handleFileChange(e, index)}
                      style={{fontSize: '0.8rem'}}
                    />
                  </div>
                  <button type="button" onClick={() => removeImageField(index)} 
                    style={{background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', borderRadius: '8px', padding: '10px', cursor: 'pointer'}}>
                    <X size={18} />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <p style={{fontSize: '0.85rem', color: 'var(--admin-text-sub)', textAlign: 'center'}}>Click "Add Image Slot" to upload pictures.</p>
              )}
            </div>
          </div>

          <button className="btn-sync" style={{padding: '1rem', fontSize: '1rem', marginTop: '1rem'}} disabled={loading}>
            {loading ? 'Processing Images...' : 'Publish Product with Local Images'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────
   PRODUCTS MANAGEMENT
───────────────────────────── */
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    axios.get(`${API_BASE}/products`)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      // Remove from UI by checking both ID types
      setProducts(products.filter(p => p.product_id !== id && p._id !== id));
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="admin-content-inner">
      <h2 className="admin-page-title">Manage Inventory</h2>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Brand</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id || p.product_id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.price}</td>
                <td>{p.brand}</td>
                <td>
                  <button 
                    onClick={() => handleDelete(p.product_id || p._id)}
                    style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px'}}
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && !loading && <div className="no-data-msg">No products found in inventory.</div>}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand-section">
          <h2 className="admin-brand">Shopalytics<span>.</span></h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={`admin-nav-link ${location.pathname === "/admin" ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/analytics" className={`admin-nav-link ${location.pathname === "/admin/analytics" ? 'active' : ''}`}>
            <BarChart3 size={20} /> Analytics
          </Link>
          <Link to="/admin/ai" className={`admin-nav-link ${location.pathname === "/admin/ai" ? 'active' : ''}`}>
            <Bot size={20} /> AI Warehousing
          </Link>
          <Link to="/admin/products" className={`admin-nav-link ${location.pathname === "/admin/products" ? 'active' : ''}`}>
            <ShoppingBag size={20} /> Manage Inventory
          </Link>
          <Link to="/admin/add-product" className={`admin-nav-link ${location.pathname === "/admin/add-product" ? 'active' : ''}`}>
            <PlusCircle size={20} /> Add Product
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai" element={<AIWarehousing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={<AddProduct />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
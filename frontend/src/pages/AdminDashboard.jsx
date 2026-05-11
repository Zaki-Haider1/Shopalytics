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
  Plus,
  Minus,
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
          <div className="stat-value">Rs. {data.stats.total_revenue.toLocaleString()}</div>
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
          <div className="stat-value">Rs. {data.stats.total_profit.toLocaleString()}</div>
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
                  <div className="p-revenue" style={{color: 'var(--admin-accent)', fontWeight: '800'}}>Rs. {(p.total_revenue || 0).toLocaleString()}</div>
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
                <td style={{color: 'var(--admin-accent)', fontWeight: 'bold'}}>Rs. {(c.total_spent || 0).toLocaleString()}</td>
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
    price: "",
    cost_price: "",
    stock_quantity: "50",
    supplier_id: "",
    description: "",
    images: []
  });
  const [categories, setCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

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
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/products`, {
        ...formData,
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price),
        stock_quantity: parseInt(formData.stock_quantity) || 0
      });
      alert("Product added successfully!");
      setFormData({
        name: "",
        category: "",
        price: "",
        cost_price: "",
        stock_quantity: "50",
        supplier_id: "",
        description: "",
        images: []
      });
      setIsNewCategory(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content-inner">
      <div className="admin-header-flex">
        <div>
          <h2 className="admin-page-title">Add New Product</h2>
          <p className="admin-page-subtitle">Configure inventory and analytical metadata</p>
        </div>
      </div>

      <div className="glass-card" style={{padding: '2.5rem', maxWidth: '850px', marginTop: '1.5rem'}}>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          
          <div className="form-section">
            <h4 style={{marginBottom: '1rem', color: 'var(--admin-accent)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Essential Information</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
              
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 2}}>
                  <label>Product Name <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="text" className="table-input" required placeholder="e.g. Headphones UU-114"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Supplier ID <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="text" className="table-input" required placeholder="sup_025"
                    value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category <span style={{color: 'red'}}>*</span></label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  {!isNewCategory ? (
                    <>
                      <select 
                        className="table-input" required
                        value={formData.category} 
                        onChange={e => {
                          if (e.target.value === "ADD_NEW") {
                            setIsNewCategory(true);
                            setFormData({...formData, category: ""});
                          } else {
                            setFormData({...formData, category: e.target.value});
                          }
                        }}
                      >
                        <option value="">Select a Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="ADD_NEW" style={{fontWeight: 'bold', color: 'var(--admin-accent)'}}>+ Add New Category</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <input 
                        type="text" className="table-input" required placeholder="Enter new category name"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      />
                      <button type="button" className="btn-sync" style={{padding: '5px 12px'}} onClick={() => setIsNewCategory(false)}>
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Selling Price (Rs.) <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="number" step="0.01" min="0" className="table-input" required placeholder="0.00"
                    value={formData.price} onChange={e => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      setFormData({...formData, price: e.target.value < 0 ? 0 : e.target.value});
                    }}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Cost Price (Rs.) <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="number" step="0.01" min="0" className="table-input" required placeholder="0.00"
                    value={formData.cost_price} onChange={e => {
                      setFormData({...formData, cost_price: e.target.value < 0 ? 0 : e.target.value});
                    }}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Stock Quantity <span style={{color: 'red'}}>*</span></label>
                  <input 
                    type="number" min="0" className="table-input" required placeholder="50"
                    value={formData.stock_quantity} onChange={e => {
                      setFormData({...formData, stock_quantity: e.target.value < 0 ? 0 : e.target.value});
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  className="table-input" rows="3" placeholder="Description of the product..."
                  style={{padding: '0.8rem', resize: 'vertical'}}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h4 style={{margin: 0, color: 'var(--admin-accent)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Product Gallery</h4>
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
                <p style={{fontSize: '0.85rem', color: 'var(--admin-text-sub)', textAlign: 'center'}}>Add images to showcase your product.</p>
              )}
            </div>
          </div>

          <button className="btn-sync" style={{padding: '1rem', fontSize: '1rem', marginTop: '1rem'}} disabled={loading}>
            {loading ? 'Processing...' : 'Add Product to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────
   PRODUCTS MANAGEMENT 
───────────────────────────── */
const EditProductModal = ({ product, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...product });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/categories`).then(res => setCategories(res.data));
  }, []);

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const newImages = [...(formData.images || [])];
      newImages[index] = reader.result;
      setFormData({ ...formData, images: newImages });
    };
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...(formData.images || []), ""] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/products/${product._id || product.product_id}`, {
        ...formData,
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price),
        stock_quantity: parseInt(formData.stock_quantity) || 0
      });
      alert("Product updated!");
      onUpdate();
      onClose();
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal glass-card">
        <div className="modal-header">
          <h3>Edit Product: {product.name}</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="table-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="table-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Price</label>
              <input type="number" min="0" step="0.01" className="table-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value < 0 ? 0 : e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Cost Price</label>
              <input type="number" min="0" step="0.01" className="table-input" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value < 0 ? 0 : e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" min="0" className="table-input" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value < 0 ? 0 : e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Supplier ID</label>
              <input type="text" className="table-input" value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea className="table-input" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="modal-gallery">
            <div className="gallery-header">
              <label>Images</label>
              <button type="button" onClick={addImageField} className="text-btn">+ Add</button>
            </div>
            <div className="gallery-grid">
              {(formData.images || []).map((img, i) => (
                <div key={i} className="gallery-item">
                  {img && <img src={img} alt="preview" />}
                  <input type="file" onChange={e => handleFileChange(e, i)} />
                  <button type="button" onClick={() => removeImageField(i)} className="del-img"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-sync" disabled={loading}>{loading ? 'Updating...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [editingProduct, setEditingProduct] = useState(null);

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
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      setProducts(products.filter(p => p.product_id !== id && p._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStockUpdate = async (id, change) => {
    try {
      await axios.patch(`${API_BASE}/products/${id}/stock`, { stock_change: change });
      // Update local state for immediate feedback
      setProducts(products.map(p => {
        if (p._id === id || p.product_id === id) {
          const currentStock = p.stock_quantity || p.stock || 0;
          return { ...p, stock_quantity: currentStock + change };
        }
        return p;
      }));
    } catch (err) {
      alert("Stock update failed");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplier_id && p.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    // Handle numeric fields
    if (['price', 'stock_quantity', 'stock'].includes(sortConfig.key)) {
      aVal = parseFloat(aVal || 0);
      bVal = parseFloat(bVal || 0);
    } else {
      aVal = String(aVal || "").toLowerCase();
      bVal = String(bVal || "").toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="admin-content-inner">
      <div className="admin-header-flex">
        <div>
          <h2 className="admin-page-title">Manage Inventory</h2>
          <p className="admin-page-subtitle">Search, sort and edit your products</p>
        </div>
        <div className="search-wrapper">
          <input 
            type="text" 
            className="table-input" 
            placeholder="Search name, category, supplier..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('category')} className="sortable">Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('price')} className="sortable">Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('stock_quantity')} className="sortable">Stock {sortConfig.key === 'stock_quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('supplier_id')} className="sortable">Supplier {sortConfig.key === 'supplier_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map(p => (
              <tr key={p._id || p.product_id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>Rs. {p.price}</td>
                <td>
                  <div className="stock-adjustment">
                    <button onClick={() => handleStockUpdate(p._id || p.product_id, -1)} className="stock-btn sub" title="Subtract 1">
                      <Minus size={14} />
                    </button>
                    <span className="stock-value">{p.stock_quantity || p.stock || 0}</span>
                    <button onClick={() => handleStockUpdate(p._id || p.product_id, 1)} className="stock-btn add" title="Add 1">
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
                <td>{p.supplier_id || "N/A"}</td>
                <td className="table-actions">
                  <button onClick={() => setEditingProduct(p)} className="edit-btn" title="Edit Product">
                    <Layers size={18} />
                  </button>
                  <button onClick={() => handleDelete(p.product_id || p._id)} className="delete-btn" title="Delete Product">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedProducts.length === 0 && !loading && <div className="no-data-msg">No products match your search.</div>}
      </div>

      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onUpdate={fetchProducts} 
        />
      )}
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
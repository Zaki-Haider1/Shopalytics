import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, LogOut } from 'lucide-react';
import './Auth.css';
import { loginUser } from "../services/api";
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user, login, logout } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);

      if (!res.success) {
        alert(res.message || "Login failed");
        return;
      }

      // Store user in AuthContext
      login(res.user);

      // Navigate based on backend response
      if (res.redirect) {
        navigate(res.redirect);
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (user) {
    return (
      <div className="auth-page">
        <div className="auth-container glass text-center">
          <div className="auth-header">
            <h2>You are logged in</h2>
            <p>Welcome back, {user.name}!</p>
          </div>
          <div className="flex flex-col gap-4 mt-6">
            <Link to="/" className="btn-primary w-full block text-center">
              Continue Shopping
            </Link>
            <button 
              onClick={logout} 
              className="btn-secondary w-full flex items-center justify-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container glass">

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your Shopalytics account</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">

          {/* Email */}
          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full mt-4">
            Sign In
          </button>

        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>

      </div>
    </div>
  );
};

export default Login;
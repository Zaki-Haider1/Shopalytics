import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import './Auth.css';
import { loginUser } from "../services/api";

const ADMIN_EMAIL = "admin@shopalytics.com";

const Login = () => {
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

      // 👑 admin routing
      if (res.user.email === ADMIN_EMAIL) {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

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
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login logic
    if (email === 'admin@shopalytics.com') {
      navigate('/admin');
    } else {
      navigate('/');
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
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="input-field" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>
          </div>
          
          <button type="submit" className="btn-primary w-full mt-4">Sign In</button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

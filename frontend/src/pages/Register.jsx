import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Phone, MapPin } from 'lucide-react';
import './Auth.css';
import { registerUser } from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    region: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const res = await registerUser(form);

    if (res.user) {
      console.log("Full user:", res.user);

      alert("Account created!");
      navigate("/login");
    } else {
      alert(res.message || "Something went wrong");
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
          <h2>Create Account</h2>
          <p>Join Shopalytics for a smarter shopping experience</p>
        </div>
        
        <form onSubmit={handleRegister} className="auth-form">

          {/* Name */}
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <UserIcon size={18} className="input-icon" />
              <input 
                type="text"
                name="name"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email Address</label>
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

          {/* Phone */}
          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input 
                type="text"
                name="phone"
                className="input-field"
                placeholder="03XXXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="input-group">
            <label>Address</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input 
                type="text"
                name="address"
                className="input-field"
                placeholder="Street, Area"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* City */}
          <div className="input-group">
            <label>City</label>
            <input 
              type="text"
              name="city"
              className="input-field"
              placeholder="Islamabad"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          {/* Region Dropdown */}
          <div className="input-group">
            <label>Region</label>
            <select
              name="region"
              className="input-field"
              value={form.region}
              onChange={handleChange}
              required
            >
              <option value="">Select Region</option>
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="KPK">KPK</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full mt-4">
            Create Account
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
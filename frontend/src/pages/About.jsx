import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, Award, ShieldCheck, BarChart3, Users } from 'lucide-react';
import './About.css';

const About = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/contact') {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="about-title">Empowering Brands Through <span className="text-gradient">Data & Insight</span></h1>
            <p className="about-subtitle">The story behind Shopalytics and our mission to redefine modern commerce.</p>
          </motion.div>
        </div>
      </section>

      {/* Project Info Section */}
      <section className="project-info">
        <div className="container">
          <div className="info-grid">
            <motion.div 
              className="info-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>What is Shopalytics?</h2>
              <p>
                Shopalytics is more than just an e-commerce platform; it's a comprehensive ecosystem designed for the modern brand owner. Born from the need for better data visibility and control, we've built a system that bridges the gap between selling products and understanding your business.
              </p>
              <p>
                Our platform provides a dual-interface experience. For customers, it's a sleek, intuitive shopping environment. For brand owners, it's a powerful analytical command center.
              </p>
              
              <div className="value-props">
                <div className="value-item">
                  <BarChart3 className="text-primary" />
                  <div>
                    <h4>Analytical Superiority</h4>
                    <p>Track every click, view, and sale with high-fidelity data visualization.</p>
                  </div>
                </div>
                <div className="value-item">
                  <ShieldCheck className="text-primary" />
                  <div>
                    <h4>Total Ownership</h4>
                    <p>You own your data, your inventory, and your customer relationships.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="info-image glass"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Data Analytics" />
              <div className="image-overlay gradient-bg">
                <span>The Future of Commerce</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section gradient-bg">
        <div className="container text-center">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <Award size={40} />
              <h3>Quality</h3>
              <p>We believe in building tools that aren't just functional, but exceptional.</p>
            </div>
            <div className="value-card">
              <Globe size={40} />
              <h3>Accessibility</h3>
              <p>Powerful analytics shouldn't be reserved for giant corporations.</p>
            </div>
            <div className="value-card">
              <Users size={40} />
              <h3>Community</h3>
              <p>We grow together with the brands that power our platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-wrapper glass">
            <div className="contact-info">
              <h2>Contact Our Team</h2>
              <p>Have questions about Shopalytics? Whether you're a brand owner or a curious developer, we'd love to hear from you.</p>
              
              <div className="contact-methods">
                <div className="method">
                  <Mail className="text-primary" />
                  <div>
                    <h4>Email Us</h4>
                    <p>support@shopalytics.com</p>
                    <p>dev@shopalytics.com</p>
                  </div>
                </div>
                
                <div className="method">
                  <Phone className="text-primary" />
                  <div>
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>+1 (555) 987-6543</p>
                  </div>
                </div>
                
                <div className="method">
                  <MapPin className="text-primary" />
                  <div>
                    <h4>Visit Us</h4>
                    <p>123 Innovation Drive</p>
                    <p>Silicon Valley, CA 94025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

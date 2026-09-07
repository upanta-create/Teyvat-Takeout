import React from "react";
import "./Footer.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <Link to="/" className="footer-brand">
            <img src={assets.logo} alt="Teyvat Takeout" className="footer-logo" />
            <span className="footer-brand-title">Teyvat<span>Takeout</span></span>
          </Link>
          <p>
            Teyvat Takeout is a premier culinary delivery platform connecting passionate foodies with artisanal kitchens and specialty chefs across the region. Delivering fresh, chef-crafted meals straight to your doorstep with speed and care.
          </p>
          <div className="footer-social-links">
            <a 
              href="https://github.com/upanta-create" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-btn github"
              aria-label="GitHub Profile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/upanta-paul-2657ba359/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-btn linkedin"
              aria-label="LinkedIn Profile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74V9.97H5.06v8.53h2.8z"/>
              </svg>
              <span>LinkedIn</span>
            </a>
            <a 
              href="https://www.instagram.com/upanta_paul?stkn=Y2M1ZGRtYmNucjk0&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-btn instagram"
              aria-label="Instagram Profile"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>Quick Links</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Explore Menu</Link></li>
            <li><Link to="/about">Our Story &amp; About</Link></li>
            <li><Link to="/delivery">Delivery Logistics</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
            <li><Link to="/privacy">Privacy &amp; Terms</Link></li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>Get in Touch</h2>
          <ul>
            <li><strong>Hotline:</strong> +1 (800) 555-FOOD</li>
            <li><strong>Support:</strong> support@teyvattakeout.io</li>
            <li><strong>HQ:</strong> 100 Culinary Way, Suite 400</li>
            <li><strong>Developer:</strong> <a href="https://github.com/upanta-create" target="_blank" rel="noopener noreferrer" className="dev-link">@upanta-create</a></li>
          </ul>
        </div>
      </div>
      <hr />
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; 2026 Teyvat Takeout Inc. All rights reserved. Built with MERN, Kubernetes &amp; Terraform by <a href="https://github.com/upanta-create" target="_blank" rel="noopener noreferrer" className="dev-link">Upanta Paul</a>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

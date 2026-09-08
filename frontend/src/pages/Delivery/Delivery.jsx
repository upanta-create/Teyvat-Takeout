import React from "react";
import "./Delivery.css";
import { Link } from "react-router-dom";

const Delivery = () => {
  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <span className="delivery-badge">Logistics & Coverage</span>
        <h1>Speed, Precision & Temperature-Controlled Delivery</h1>
        <p>
          Learn how our real-time logistics infrastructure gets fresh, chef-prepared meals from our kitchens to your table in record time.
        </p>
      </div>

      {/* 3 Step Delivery Process */}
      <div className="process-grid">
        <div className="process-card">
          <div className="step-num">01</div>
          <h3>Made to Order</h3>
          <p>Dishes are only prepared the moment your ticket hits the kitchen queue to ensure peak freshness.</p>
        </div>
        <div className="process-card">
          <div className="step-num">02</div>
          <h3>Thermal Sealed</h3>
          <p>Packaged in multi-layer insulated bio-containers that lock in heat and crispness.</p>
        </div>
        <div className="process-card">
          <div className="step-num">03</div>
          <h3>Direct Dispatch</h3>
          <p>Assigned to dedicated nearby couriers with zero intermediate stops or detours.</p>
        </div>
      </div>

      {/* Delivery Tiers */}
      <div className="tiers-section">
        <h2>Delivery Options</h2>
        <div className="tiers-grid">
          <div className="tier-card standard">
            <h3>Standard Delivery</h3>
            <div className="tier-price">₹40 <span>/ order</span></div>
            <ul>
              <li>✓ 30–45 minute delivery window</li>
              <li>✓ Real-time SMS & web order tracking</li>
              <li>✓ Contactless delivery option</li>
            </ul>
          </div>
          <div className="tier-card express featured">
            <span className="featured-badge">Most Popular</span>
            <h3>Lightning Express</h3>
            <div className="tier-price">₹90 <span>/ order</span></div>
            <ul>
              <li>✓ Priority kitchen dispatch</li>
              <li>✓ 15–25 minute expedited arrival</li>
              <li>✓ Dedicated single-order rider</li>
              <li>✓ Temperature guarantee</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="delivery-cta">
        <h2>Ready for something delicious?</h2>
        <p>Browse our live menu and order now.</p>
        <Link to="/menu" className="cta-button">Order Now →</Link>
      </div>
    </div>
  );
};

export default Delivery;

import React from "react";
import "./About.css";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <span className="about-badge">Our Story</span>
        <h1>Crafting Exceptional Culinary Experiences</h1>
        <p>
          Teyvat Takeout was founded with a singular ambition: to bridge the gap between world-class artisanal kitchens and food lovers who value quality, freshness, and lightning-fast delivery.
        </p>
      </section>

      {/* Stats Counter Row */}
      <section className="about-stats-grid">
        <div className="stat-card">
          <h2>50K+</h2>
          <p>Orders Delivered</p>
        </div>
        <div className="stat-card">
          <h2>99.8%</h2>
          <p>On-Time Arrival</p>
        </div>
        <div className="stat-card">
          <h2>4.9 / 5</h2>
          <p>Customer Rating</p>
        </div>
        <div className="stat-card">
          <h2>30+</h2>
          <p>Partner Kitchens</p>
        </div>
      </section>

      {/* Mission & Philosophy */}
      <section className="about-details-section">
        <div className="about-text-column">
          <h2>Farm-to-Table, Straight to Door</h2>
          <p>
            We partner exclusively with local farms, certified organic growers, and passionate culinary artisans. Every recipe on our menu is meticulously developed to maintain peak flavor and temperature during transit.
          </p>
          <p>
            Our proprietary thermal packaging ensures that your crispy rolls stay crisp, soups stay steaming hot, and artisanal desserts remain chilled to perfection.
          </p>
          <Link to="/menu" className="explore-btn">
            Explore the Menu →
          </Link>
        </div>

        <div className="about-values-column">
          <div className="value-card">
            <div className="value-icon">🌱</div>
            <div>
              <h3>100% Organic Sourcing</h3>
              <p>Strict quality audits on all fresh produce, dairy, and proteins.</p>
            </div>
          </div>
          <div className="value-card">
            <div className="value-icon">⚡</div>
            <div>
              <h3>Sub-30 Minute Dispatch</h3>
              <p>Smart route optimization powered by modern cloud infrastructure.</p>
            </div>
          </div>
          <div className="value-card">
            <div className="value-icon">🛡️</div>
            <div>
              <h3>Zero Compromise Hygiene</h3>
              <p>Tamper-evident sealing and contactless delivery protocols.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

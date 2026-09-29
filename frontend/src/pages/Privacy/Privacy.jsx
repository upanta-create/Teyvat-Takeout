import React from "react";
import "./Privacy.css";

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-header">
        <span className="privacy-badge">Legal & Security</span>
        <h1>Privacy Policy & Data Protection</h1>
        <p>Last updated: September 2026</p>
      </div>

      <div className="privacy-content-card">
        <section className="privacy-section">
          <h2>1. Data We Collect</h2>
          <p>
            When you register an account or place an order with Teyvat Takeout, we securely process your delivery address, email, contact phone number, and order history strictly for transaction fulfillment.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Payment & Card Security</h2>
          <p>
            We do not store complete credit or debit card numbers on our servers. All online transactions are processed through encrypted Stripe gateways adhering to PCI-DSS Level 1 compliance.
          </p>
        </section>

        <section className="privacy-section">
          <h2>3. Cookies & Session Management</h2>
          <p>
            We use secure local storage and authentication tokens solely to keep you logged in and preserve your active shopping cart across browser sessions.
          </p>
        </section>

        <section className="privacy-section">
          <h2>4. Contact & Inquiries</h2>
          <p>
            For privacy inquiries, account data deletion, or questions, please email <strong>privacy@teyvattakeout.io</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;

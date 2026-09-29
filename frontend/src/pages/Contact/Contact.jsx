import React, { useState } from "react";
import "./Contact.css";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Thank you! Your message has been sent to support.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <span className="contact-badge">Support & Inquiries</span>
        <h1>We're Here to Assist You</h1>
        <p>
          Have a question about an order, kitchen partnership, or technical feedback? Get in touch with our team or connect directly with our developer.
        </p>
      </div>

      <div className="contact-layout">
        {/* Contact Information & Social Profiles */}
        <div className="contact-info-col">
          <div className="info-card">
            <div className="info-icon">📞</div>
            <div>
              <h3>Direct Hotline</h3>
              <p>+1 (800) 555-FOOD</p>
              <span>Mon-Sun: 8:00 AM – 11:00 PM EST</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">✉️</div>
            <div>
              <h3>Support Email</h3>
              <p>support@teyvattakeout.io</p>
              <span>Response within 2 hours</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <div>
              <h3>Headquarters</h3>
              <p>100 Culinary Way, Suite 400</p>
              <span>San Francisco, CA 94105</span>
            </div>
          </div>

          {/* Social / Developer Links */}
          <div className="social-connect-card">
            <h3>Connect with Developer</h3>
            <p>Check out our open-source repositories and social profiles:</p>
            <div className="social-links-list">
              <a
                href="https://www.linkedin.com/in/upanta-paul-2657ba359/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn linkedin"
              >
                LinkedIn Profile ↗
              </a>
              <a
                href="https://github.com/upanta-create"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn github"
              >
                GitHub Profile ↗
              </a>
              <a
                href="https://www.instagram.com/upanta_paul?stkn=Y2M1ZGRtYmNucjk0&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn instagram"
              >
                Instagram ↗
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Order inquiry, partnership, etc."
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                rows="5"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-message-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

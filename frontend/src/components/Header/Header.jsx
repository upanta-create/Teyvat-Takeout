import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="header-overlay"></div>
      <div className="header-contents">
        <span className="header-pill">✨ Artisanal Gastronomy Delivered</span>
        <h2>Order your favourite gourmet dishes here</h2>
        <p>
          Choose from a curated culinary menu featuring a delectable array of dishes
          crafted with the finest ingredients and culinary mastery. Experience authentic flavors delivered warm and fast right to your doorstep.
        </p>
        <div className="header-actions">
          <a href="#explore-menu" className="header-cta-btn">
            Explore Menu <span>→</span>
          </a>
          <div className="header-perks">
            <span className="perk-item">⚡ 30 Mins Express</span>
            <span className="perk-item">🌿 Farm Fresh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

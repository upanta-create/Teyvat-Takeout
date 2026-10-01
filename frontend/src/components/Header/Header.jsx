import React, { useEffect, useRef, useState } from "react";
import "./Header.css";

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Reset when scrolled out of view so it reveals again when scrolling back up
          setIsVisible(false);
        }
      },
      { threshold: 0.15 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
    };
  }, []);

  return (
    <div className="header" ref={headerRef}>
      <div className="header-overlay"></div>
      <div className={`header-contents ${isVisible ? "animate-reveal" : "hidden-reveal"}`}>
        <span className="header-pill">Artisanal Gastronomy Delivered</span>
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

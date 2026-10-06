import React, { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const Navbar = ({ setShowLogin }) => {
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const getActiveMenu = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/menu")) return "menu";
    if (pathname.startsWith("/about")) return "about";
    if (pathname.startsWith("/delivery")) return "delivery";
    if (pathname.startsWith("/contact")) return "contact";
    return "";
  };

  const activeMenu = getActiveMenu();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={assets.logo} alt="Teyvat Takeout" className="logo" />
        <span className="brand-name">Teyvat<span className="brand-accent">Takeout</span></span>
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          className={activeMenu === "home" ? "active" : ""}
        >
          Home
        </Link>
        <Link
          to="/menu"
          className={activeMenu === "menu" ? "active" : ""}
        >
          Menu
        </Link>
        <Link
          to="/about"
          className={activeMenu === "about" ? "active" : ""}
        >
          About Us
        </Link>
        <Link
          to="/delivery"
          className={activeMenu === "delivery" ? "active" : ""}
        >
          Delivery
        </Link>
        <Link
          to="/contact"
          className={activeMenu === "contact" ? "active" : ""}
        >
          Contact Us
        </Link>
      </ul>
      <div className="navbar-right">
        <Link to="/menu" className="nav-icon-link" aria-label="Search Menu">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </Link>
        <div className="navbar-search-icon">
          <Link to="/cart" className="nav-icon-link" aria-label="Shopping Cart">
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </Link>
          {getTotalCartAmount() > 0 && <div className="dot"></div>}
        </div>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className="navbar-profile">
            <div className="profile-icon-wrapper">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

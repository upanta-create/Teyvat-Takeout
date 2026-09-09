import React, { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import {useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate=useNavigate();
  const {token, admin, setAdmin, setToken } = useContext(StoreContext);
  const logout=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken("");
    setAdmin(false);
    toast.success("Logout Successfully")
    navigate("/");
  }
  return (
    <div className="navbar">
      <div className="admin-brand-wrapper" onClick={() => navigate("/")}>
        <img className="logo" src={assets.logo} alt="Teyvat Takeout" />
        <div className="brand-text">
          <span className="brand-main">Teyvat<span>Takeout</span></span>
          <span className="brand-badge">ADMIN</span>
        </div>
      </div>
      <div className="navbar-actions">
        {token && admin ? (
          <button className="admin-logout-btn" onClick={logout}>Sign Out</button>
        ) : (
          <button className="admin-logout-btn" onClick={() => navigate("/")}>Sign In</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;

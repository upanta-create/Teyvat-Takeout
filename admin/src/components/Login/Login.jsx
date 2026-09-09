import React, { useContext, useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import Dashboard from "../../pages/Dashboard/Dashboard";
import { assets } from "../../assets/assets";

const Login = ({ url }) => {
  const navigate = useNavigate();
  const { admin, setAdmin, token, setToken } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const fillDemoAdmin = () => {
    setData({
      email: "admin@teyvattakeout.io",
      password: "admin123456",
    });
    toast.info("Admin credentials pre-filled!");
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(url + "/api/user/login", data);
      if (response.data.success) {
        if (response.data.role === "admin") {
          setToken(response.data.token);
          setAdmin(true);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("admin", true);
          toast.success("Welcome back to Kitchen Control!");
        } else {
          toast.error("Access denied: Admin credentials required.");
        }
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated as admin, render the full Dashboard
  if (admin && token) {
    return <Dashboard url={url} />;
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src={assets.logo} alt="Teyvat Takeout" className="admin-login-logo" />
          <h2>Teyvat Takeout</h2>
          <span className="portal-sub">Kitchen Operations &amp; Admin Portal</span>
        </div>

        <form onSubmit={onLogin} className="admin-login-form">
          <div className="admin-input-group">
            <label>Admin Email Address</label>
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="admin@teyvattakeout.io"
              required
            />
          </div>

          <div className="admin-input-group">
            <label>Password</label>
            <input
              name="password"
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder="••••••••••••"
              required
            />
          </div>

          <button type="submit" className="admin-login-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Admin Portal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

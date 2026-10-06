import React, { useContext, useEffect, useState } from "react";
import "./Dashboard.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, foodRes] = await Promise.all([
        axios.get(url + "/api/order/list", { headers: { token } }),
        axios.get(url + "/api/food/list"),
      ]);

      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data);
      }
      if (foodRes.data.success) {
        setFoodCount(foodRes.data.data.length);
      }
    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.post(
        url + "/api/order/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status updated");
        fetchDashboardData();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      navigate("/");
    } else {
      fetchDashboardData();
    }
  }, [admin, token]);

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== "Delivered").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Operations Control Center</h1>
          <p>Real-time analytics, kitchen dispatch queue, and menu catalog management.</p>
        </div>
        <div className="system-health-pill">
          <span className="pulse-dot"></span>
          <span>SRE Probes: Healthy</span>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-icon rupee-icon">
            <span style={{ fontSize: "22px", fontWeight: "800" }}>₹</span>
          </div>
          <div className="metric-details">
            <span className="metric-label">Gross Revenue</span>
            <h2 className="metric-value">₹{totalRevenue.toLocaleString("en-IN")}</h2>
            <span className="metric-trend positive">Live Atlas Sync</span>
          </div>
        </div>

        <div className="metric-card orders">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Orders</span>
            <h2 className="metric-value">{orders.length}</h2>
            <span className="metric-sub">{deliveredOrders} completed</span>
          </div>
        </div>

        <div className="metric-card active">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="metric-details">
            <span className="metric-label">Kitchen Active Queue</span>
            <h2 className="metric-value">{activeOrders}</h2>
            <span className="metric-sub">Pending / In-Transit</span>
          </div>
        </div>

        <div className="metric-card catalog">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
          </div>
          <div className="metric-details">
            <span className="metric-label">Menu Dishes</span>
            <h2 className="metric-value">{foodCount}</h2>
            <span className="metric-sub">Active in Catalog</span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="quick-actions-bar">
        <h3>Quick Navigation</h3>
        <div className="actions-buttons">
          <button onClick={() => navigate("/add")} className="action-btn primary">
            + Add New Dish
          </button>
          <button onClick={() => navigate("/list")} className="action-btn">
            📋 View Menu Catalog ({foodCount})
          </button>
          <button onClick={() => navigate("/orders")} className="action-btn">
            🚚 Manage All Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="recent-orders-section">
        <div className="section-title-row">
          <h2>Recent Customer Orders</h2>
          <button onClick={() => navigate("/orders")} className="view-all-link">
            View All Orders →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-dashboard-orders">
            <p>No orders recorded yet in MongoDB Atlas.</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="order-items-preview">
                        <strong>
                          {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                        </strong>
                        <span className="order-id-sub">ID: {order._id.substring(0, 10)}...</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">
                          {order.address?.firstName} {order.address?.lastName}
                        </span>
                        <span className="customer-phone">{order.address?.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="price-tag">₹{order.amount}</span>
                    </td>
                    <td>
                      <span
                        className={`status-chip ${
                          order.status === "Delivered"
                            ? "delivered"
                            : order.status === "Out for delivery"
                            ? "transit"
                            : "processing"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-dropdown-select"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="Food Processing">Processing</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

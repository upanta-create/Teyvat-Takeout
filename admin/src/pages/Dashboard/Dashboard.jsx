import React, { useContext, useEffect, useState, useMemo } from "react";
import "./Dashboard.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// ── Custom Tooltip for charts ────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <strong>{prefix}{p.value.toLocaleString("en-IN")}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const STATUS_COLORS = {
  "Food Processing": "#f59e0b",
  "Out for delivery": "#3b82f6",
  "Delivered": "#10b981"
};
const PIE_COLORS = ["#ea580c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];

const Dashboard = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [foodCount, setFoodCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyticsRange, setAnalyticsRange] = useState(7); // days

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, foodRes] = await Promise.all([
        axios.get(url + "/api/order/list", { headers: { token } }),
        axios.get(url + "/api/food/list"),
      ]);
      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (foodRes.data.success) setFoodCount(foodRes.data.data.length);
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
    if (!admin && !token) navigate("/");
    else fetchDashboardData();
  }, [admin, token]);

  // ── Derived Metrics ──────────────────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== "Delivered").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const paidOrders = orders.filter((o) => o.payment === true).length;

  // ── Revenue Over Time (last N days) ─────────────────────────
  const revenueData = useMemo(() => {
    const days = analyticsRange;
    const map = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      map[key] = { date: key, revenue: 0, orders: 0 };
    }
    orders.forEach((o) => {
      const d = new Date(o.date);
      const key = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (map[key]) {
        map[key].revenue += Number(o.amount) || 0;
        map[key].orders += 1;
      }
    });
    return Object.values(map);
  }, [orders, analyticsRange]);

  // ── Top Selling Dishes ───────────────────────────────────────
  const topDishes = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + (item.quantity || 1);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, qty]) => ({ name: name.length > 18 ? name.slice(0, 16) + "…" : name, qty }));
  }, [orders]);

  // ── Order Status Distribution (Pie) ──────────────────────────
  const statusData = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Operations Control Center</h1>
          <p>Real-time analytics, kitchen dispatch queue, and menu catalog management.</p>
        </div>
        <div className="dashboard-header-right">
          <div className="system-health-pill">
            <span className="pulse-dot"></span>
            <span>SRE Probes: Healthy</span>
          </div>
          <button className="refresh-dash-btn" onClick={fetchDashboardData}>
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Orders</span>
            <h2 className="metric-value">{orders.length}</h2>
            <span className="metric-sub">{deliveredOrders} completed · {paidOrders} paid</span>
          </div>
        </div>

        <div className="metric-card active">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Analytics Charts Row */}
      <div className="analytics-section">
        <div className="analytics-card wide">
          <div className="chart-card-header">
            <div>
              <h3>Revenue & Orders Over Time</h3>
              <p>Daily breakdown of gross revenue and order volume</p>
            </div>
            <div className="range-tabs">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  className={`range-tab ${analyticsRange === d ? "active" : ""}`}
                  onClick={() => setAnalyticsRange(d)}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `₹${v}`} />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip content={<ChartTooltip prefix="₹" />} />
              <Legend />
              <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#ea580c" strokeWidth={2} fill="url(#revenueGrad)" />
              <Area yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={2} fill="url(#ordersGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-row-two">
          {/* Top Dishes Bar Chart */}
          <div className="analytics-card">
            <div className="chart-card-header">
              <div>
                <h3>Top Selling Dishes</h3>
                <p>By units ordered (all time)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topDishes} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} width={90} />
                <Tooltip formatter={(v) => [v, "Units Ordered"]} />
                <Bar dataKey="qty" name="Units Ordered" radius={[0, 6, 6, 0]}>
                  {topDishes.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="analytics-card">
            <div className="chart-card-header">
              <div>
                <h3>Order Status Distribution</h3>
                <p>Current fulfillment breakdown</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-bar">
        <h3>Quick Navigation</h3>
        <div className="actions-buttons">
          <button onClick={() => navigate("/add")} className="action-btn primary">+ Add New Dish</button>
          <button onClick={() => navigate("/list")} className="action-btn">📋 Menu Catalog ({foodCount})</button>
          <button onClick={() => navigate("/orders")} className="action-btn">🚚 All Orders ({orders.length})</button>
          <button onClick={() => navigate("/categories")} className="action-btn">🏷️ Categories</button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="recent-orders-section">
        <div className="section-title-row">
          <h2>Recent Customer Orders</h2>
          <button onClick={() => navigate("/orders")} className="view-all-link">View All Orders →</button>
        </div>
        {orders.length === 0 ? (
          <div className="empty-dashboard-orders"><p>No orders recorded yet in MongoDB Atlas.</p></div>
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
                        <strong>{order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}</strong>
                        <span className="order-id-sub">ID: {order._id.substring(0, 10)}...</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="customer-name">{order.address?.firstName} {order.address?.lastName}</span>
                        <span className="customer-phone">{order.address?.phone}</span>
                      </div>
                    </td>
                    <td><span className="price-tag">₹{order.amount}</span></td>
                    <td>
                      <span className={`status-chip ${order.status === "Delivered" ? "delivered" : order.status === "Out for delivery" ? "transit" : "processing"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select className="status-dropdown-select" value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
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

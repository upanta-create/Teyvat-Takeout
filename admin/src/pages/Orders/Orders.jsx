import React, { useState, useEffect, useContext } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Orders = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list", {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to load orders");
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/status",
        {
          orderId,
          status: event.target.value,
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status updated");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please sign in as Admin first");
      navigate("/");
    }
    fetchAllOrders();
  }, [admin, token]);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "All") return true;
    return order.status === statusFilter;
  });

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h2>Kitchen Orders &amp; Dispatch Queue</h2>
          <p>Real-time order processing and delivery status synchronization ({orders.length} total).</p>
        </div>
        <button onClick={fetchAllOrders} className="refresh-orders-btn">
          🔄 Refresh Queue
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="order-status-tabs">
        {["All", "Food Processing", "Out for delivery", "Delivered"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`status-tab ${statusFilter === st ? "active" : ""}`}
          >
            {st} ({st === "All" ? orders.length : orders.filter((o) => o.status === st).length})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-orders-view">
          <p>No orders found matching the filter "{statusFilter}".</p>
        </div>
      ) : (
        <div className="orders-cards-list">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ea580c" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>

              <div className="order-card-content">
                <div className="order-items-list">
                  <strong>
                    {order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.name} × {item.quantity}
                        {idx < order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </strong>
                </div>

                <div className="order-customer-info">
                  <span className="customer-name">
                    👤 {order.address.firstName} {order.address.lastName}
                  </span>
                  <span className="customer-phone">📞 {order.address.phone}</span>
                </div>

                <div className="order-address-box">
                  📍 {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipcode}
                </div>
              </div>

              <div className="order-card-summary">
                <div className="order-meta">
                  <span className="items-count">{order.items.length} Items</span>
                  <span className="order-amount">₹{order.amount}</span>
                </div>

                <div className="status-selector-wrapper">
                  <select
                    className={`order-status-select ${
                      order.status === "Delivered"
                        ? "delivered"
                        : order.status === "Out for delivery"
                        ? "transit"
                        : "processing"
                    }`}
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

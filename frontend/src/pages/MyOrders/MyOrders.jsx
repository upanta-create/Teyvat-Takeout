import React, { useContext, useEffect, useState, useRef } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const TRACKING_STEPS = [
  {
    key: "Order Placed",
    label: "Order Confirmed",
    desc: "Restaurant received and confirmed your order",
    icon: "🧾",
  },
  {
    key: "Food Processing",
    label: "Cooking in Kitchen",
    desc: "Chef is preparing your fresh meal",
    icon: "👨‍🍳",
  },
  {
    key: "Out for delivery",
    label: "Out for Delivery",
    desc: "Rider has picked up food and is on the way",
    icon: "🛵",
  },
  {
    key: "Delivered",
    label: "Delivered",
    desc: "Order handed over. Enjoy your meal!",
    icon: "🍱",
  },
];

const getStepIndex = (status) => {
  if (status === "Delivered") return 3;
  if (status === "Out for delivery") return 2;
  if (status === "Food Processing") return 1;
  return 0; // Order Placed / default
};

const MyOrders = () => {
  const { url, token, setShowLogin } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [liveStatus, setLiveStatus] = useState("");
  const [sseConnected, setSseConnected] = useState(false);
  const sseRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Handle live Server-Sent Events tracking connection
  const openTrackingModal = (order) => {
    setTrackingOrder(order);
    setLiveStatus(order.status || "Order Placed");

    if (sseRef.current) {
      sseRef.current.close();
    }

    try {
      const sseUrl = `${url}/api/order/track/${order._id}?token=${token}`;
      const sse = new EventSource(sseUrl);
      sseRef.current = sse;

      sse.onopen = () => {
        setSseConnected(true);
      };

      sse.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.status) {
            setLiveStatus(parsed.status);
            // Update in orders list as well
            setData((prev) =>
              prev.map((o) =>
                o._id === order._id ? { ...o, status: parsed.status } : o
              )
            );
          }
        } catch (e) {
          // ignore non-json heartbeats
        }
      };

      sse.onerror = () => {
        setSseConnected(false);
      };
    } catch (err) {
      console.warn("SSE connection fallback to polling", err);
    }
  };

  const closeTrackingModal = () => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setTrackingOrder(null);
    setSseConnected(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeTrackingModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeStepIdx = getStepIndex(liveStatus || trackingOrder?.status);

  if (!token) {
    return (
      <div className="my-orders">
        <div className="my-orders-empty">
          <div className="empty-cart-icon">🔒</div>
          <h3>Sign in to view your orders</h3>
          <p>Please log in to track live deliveries and review your order history.</p>
          <button
            onClick={() => setShowLogin(true)}
            className="track-order-btn"
            style={{ marginTop: "18px" }}
          >
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="my-orders-title-bar">
        <div>
          <h2>Order History &amp; Dispatch</h2>
          <p className="my-orders-subtitle">
            Track active deliveries in real-time or view your past order records.
          </p>
        </div>
        <button onClick={fetchOrders} className="my-orders-refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {data.length === 0 ? (
        <div className="my-orders-empty">
          <div className="empty-cart-icon">🛍️</div>
          <h3>No orders placed yet</h3>
          <p>Explore our menu and place your first delicious meal!</p>
        </div>
      ) : (
        <div className="container">
          {data.map((order, index) => {
            const currentStep = getStepIndex(order.status);
            const isDelivered = order.status === "Delivered";

            return (
              <div key={order._id || index} className="my-orders-order">
                <div className="order-box-svg-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>

                <div className="order-items-info">
                  <p className="order-dish-names">
                    {order.items.map((item, i) => (
                      <span key={i}>
                        {item.name} <b>× {item.quantity}</b>
                        {i < order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                  <span className="order-date-tag">
                    Order #{order._id ? order._id.slice(-6).toUpperCase() : index + 1}
                  </span>
                </div>

                <p className="order-price">₹{order.amount}.00</p>
                <p className="order-count">Items: {order.items.length}</p>

                <div className="order-status-badge">
                  <span
                    className={`status-dot ${
                      isDelivered
                        ? "dot-delivered"
                        : currentStep === 2
                        ? "dot-transit"
                        : "dot-processing"
                    }`}
                  ></span>
                  <b>{order.status}</b>
                </div>

                <button
                  onClick={() => openTrackingModal(order)}
                  className="track-order-btn"
                >
                  🚀 Track Live
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Swiggy-Style Live Tracking Modal */}
      {trackingOrder && (
        <div className="tracking-modal-overlay" onClick={closeTrackingModal}>
          <div
            className="tracking-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="tracking-modal-header">
              <div>
                <div className="tracking-modal-pill">
                  <span
                    className={`pulse-dot ${
                      sseConnected ? "connected" : "connecting"
                    }`}
                  ></span>
                  {sseConnected ? "Live SSE Stream Active" : "Connecting Live Feed..."}
                </div>
                <h3>Live Order Tracking</h3>
                <p className="order-id-sub">
                  Order ID: #{trackingOrder._id} • {trackingOrder.items?.length} items
                </p>
              </div>
              <button
                className="tracking-modal-close"
                onClick={closeTrackingModal}
              >
                ✕
              </button>
            </div>

            {/* Estimated Delivery Banner */}
            <div className="tracking-estimate-banner">
              <div className="estimate-icon">
                {activeStepIdx === 3 ? "🎉" : activeStepIdx === 2 ? "🛵" : "🍳"}
              </div>
              <div>
                <h4>
                  {activeStepIdx === 3
                    ? "Order Delivered!"
                    : activeStepIdx === 2
                    ? "Rider on the Way (~15 mins)"
                    : activeStepIdx === 1
                    ? "Cooking Fresh (~25 mins)"
                    : "Order Confirmed (~35 mins)"}
                </h4>
                <p>
                  Current Status: <b className="live-status-highlight">{liveStatus}</b>
                </p>
              </div>
            </div>

            {/* Swiggy-Style Visual Stepper */}
            <div className="swiggy-stepper">
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div
                    key={step.key}
                    className={`stepper-step ${isCompleted ? "completed" : ""} ${
                      isCurrent ? "current" : ""
                    }`}
                  >
                    <div className="stepper-track-line">
                      <div className="stepper-icon-bubble">
                        {isCompleted && !isCurrent ? "✓" : step.icon}
                      </div>
                      {idx < TRACKING_STEPS.length - 1 && (
                        <div
                          className={`stepper-connector ${
                            idx < activeStepIdx ? "filled" : ""
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="stepper-details">
                      <h5>{step.label}</h5>
                      <p>{step.desc}</p>
                      {isCurrent && (
                        <span className="live-indicator-badge">
                          <span className="tiny-pulse"></span> In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Info Details */}
            {trackingOrder.address && (
              <div className="tracking-delivery-box">
                <h5>📍 Delivery Destination</h5>
                <p className="delivery-address-text">
                  <b>
                    {trackingOrder.address.firstName} {trackingOrder.address.lastName}
                  </b>
                  <br />
                  {trackingOrder.address.street}, {trackingOrder.address.city},{" "}
                  {trackingOrder.address.state} — {trackingOrder.address.zipcode}
                  <br />
                  📞 Phone: {trackingOrder.address.phone}
                </p>
              </div>
            )}

            {/* Items Summary in Modal */}
            <div className="tracking-items-summary">
              <div className="tracking-items-header">
                <span>Items Ordered</span>
                <b>Total: ₹{trackingOrder.amount}.00</b>
              </div>
              <ul className="tracking-items-list">
                {trackingOrder.items?.map((item, i) => (
                  <li key={i}>
                    <span>{item.name}</span>
                    <span>
                      {item.quantity} × ₹{item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close Button */}
            <button
              className="tracking-done-btn"
              onClick={closeTrackingModal}
            >
              Done Tracking
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

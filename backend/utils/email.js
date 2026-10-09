import nodemailer from "nodemailer";
import logger from "./logger.js";

/**
 * Transactional Email Service — Nodemailer-based event-driven notifications.
 *
 * Sends HTML emails for:
 *   - Order confirmation (on payment verified)
 *   - Order status updates (Processing → Out for Delivery → Delivered)
 *
 * Config: Uses SMTP env variables. Falls back to Ethereal (test SMTP) when not configured.
 * Pattern: Event-driven architecture — decoupled from business logic, fire-and-forget.
 */

let transporter = null;

const initTransporter = async () => {
  // Use configured SMTP settings if available
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    logger.info("Email transporter initialized with SMTP config");
  } else {
    // Create Ethereal test account for development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      logger.info("Email transporter using Ethereal test account", {
        user: testAccount.user,
        previewUrl: "https://ethereal.email"
      });
    } catch (err) {
      logger.warn("Failed to create Ethereal test account — emails disabled", { error: err.message });
    }
  }
};

initTransporter();

/**
 * Send order confirmation email after payment is verified.
 */
export const sendOrderConfirmationEmail = async ({ to, name, orderId, items, total, address }) => {
  if (!transporter) return;

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${i.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;color:#ea580c;font-weight:700;">₹${i.price * i.quantity}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#ea580c;margin:0;font-size:28px;">🍜 Teyvat Takeout</h1>
        <p style="color:#94a3b8;margin:8px 0 0;">Your order is confirmed!</p>
      </div>
      <div style="padding:32px;background:#f8fafc;">
        <h2 style="color:#0f172a;margin-top:0;">Hello, ${name}! 🎉</h2>
        <p style="color:#475569;">Your order <strong>#${orderId}</strong> has been confirmed and is now being prepared by our kitchen team.</p>
        <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:10px;overflow:hidden;margin:20px 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;">Item</th>
              <th style="padding:12px;text-align:center;color:#64748b;font-size:12px;text-transform:uppercase;">Qty</th>
              <th style="padding:12px;text-align:right;color:#64748b;font-size:12px;text-transform:uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr style="background:#fff7ed;">
              <td colspan="2" style="padding:12px;font-weight:700;color:#0f172a;">Total</td>
              <td style="padding:12px;text-align:right;font-weight:800;color:#ea580c;font-size:18px;">₹${total}</td>
            </tr>
          </tfoot>
        </table>
        <div style="background:#ffffff;padding:16px;border-radius:10px;margin-top:16px;border-left:4px solid #ea580c;">
          <strong style="color:#0f172a;">📦 Delivering to:</strong>
          <p style="color:#475569;margin:4px 0 0;">${address.street}, ${address.city}, ${address.state} ${address.zipcode}</p>
        </div>
      </div>
      <div style="padding:20px;text-align:center;color:#94a3b8;font-size:12px;background:#f1f5f9;border-radius:0 0 12px 12px;">
        <p>© 2026 Teyvat Takeout. Built with ❤️ by <a href="https://github.com/upanta-create" style="color:#ea580c;">upanta-create</a></p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Teyvat Takeout" <${process.env.SMTP_USER || "noreply@teyvattakeout.io"}>`,
      to,
      subject: `✅ Order Confirmed — #${orderId.toString().slice(-8).toUpperCase()}`,
      html
    });
    logger.info("Order confirmation email sent", {
      orderId,
      to,
      messageId: info.messageId
    });
  } catch (err) {
    logger.warn("Failed to send order confirmation email", { error: err.message, orderId });
  }
};

/**
 * Send order status update email when an admin changes fulfillment state.
 */
export const sendStatusUpdateEmail = async ({ to, name, orderId, status }) => {
  if (!transporter) return;

  const statusConfig = {
    "Food Processing": { icon: "👨‍🍳", color: "#f59e0b", text: "Our chefs are preparing your order with care." },
    "Out for Delivery": { icon: "🛵", color: "#3b82f6", text: "Your order is on its way! Track your delivery in the app." },
    "Delivered": { icon: "✅", color: "#10b981", text: "Your order has been delivered. Enjoy your meal!" }
  };

  const cfg = statusConfig[status] || { icon: "📋", color: "#6366f1", text: `Your order status has been updated.` };

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#ea580c;margin:0;">🍜 Teyvat Takeout</h1>
        <p style="color:#94a3b8;margin:8px 0 0;">Order Status Update</p>
      </div>
      <div style="padding:32px;text-align:center;">
        <div style="font-size:56px;margin-bottom:16px;">${cfg.icon}</div>
        <h2 style="color:${cfg.color};margin:0;">${status}</h2>
        <p style="color:#475569;margin:12px 0;">Hi <strong>${name}</strong>, ${cfg.text}</p>
        <p style="color:#94a3b8;font-size:13px;">Order ID: <code>#${orderId.toString().slice(-8).toUpperCase()}</code></p>
      </div>
      <div style="padding:20px;text-align:center;color:#94a3b8;font-size:12px;background:#f1f5f9;border-radius:0 0 12px 12px;">
        <p>© 2026 Teyvat Takeout. <a href="https://github.com/upanta-create" style="color:#ea580c;">upanta-create</a></p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Teyvat Takeout" <${process.env.SMTP_USER || "noreply@teyvattakeout.io"}>`,
      to,
      subject: `${cfg.icon} Order Update — ${status}`,
      html
    });
    logger.info("Status update email sent", { orderId, status, to, messageId: info.messageId });
  } catch (err) {
    logger.warn("Failed to send status update email", { error: err.message, orderId });
  }
};

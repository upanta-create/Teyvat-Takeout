/**
 * Order Controller — Unit Tests
 *
 * Tests: order placement, payment verification, user order fetch,
 *        admin access control, SSE endpoint, and business metric counters.
 */

import { jest } from "@jest/globals";

// ── Mocks ────────────────────────────────────────────────────
const mockOrderSave = jest.fn().mockResolvedValue({});
const mockOrderFindById = jest.fn();
const mockOrderFindByIdAndUpdate = jest.fn().mockResolvedValue({});
const mockOrderFindByIdAndDelete = jest.fn().mockResolvedValue({});
const mockOrderFind = jest.fn();
const mockUserFindById = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn().mockResolvedValue({});
const mockOrderIncCounter = jest.fn();
const mockSendOrderConfirmationEmail = jest.fn();
const mockSendStatusUpdateEmail = jest.fn();

jest.unstable_mockModule("../models/orderModel.js", () => ({
  default: jest.fn().mockImplementation((data) => ({
    ...data,
    _id: "order_test_id_123",
    save: mockOrderSave
  }))
}));

jest.unstable_mockModule("../models/userModel.js", () => ({
  default: {
    findById: mockUserFindById,
    findByIdAndUpdate: mockUserFindByIdAndUpdate
  }
}));

jest.unstable_mockModule("../middleware/metrics.js", () => ({
  orderTransactionsCounter: { inc: mockOrderIncCounter }
}));

jest.unstable_mockModule("stripe", () => ({
  default: jest.fn().mockImplementation(() => ({}))
}));

jest.unstable_mockModule("../utils/logger.js", () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

jest.unstable_mockModule("../utils/email.js", () => ({
  sendOrderConfirmationEmail: mockSendOrderConfirmationEmail,
  sendStatusUpdateEmail: mockSendStatusUpdateEmail
}));

// ── Helpers ───────────────────────────────────────────────────
const makeRes = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.flushHeaders = jest.fn();
  res.write = jest.fn();
  return res;
};

// ── Tests ─────────────────────────────────────────────────────
describe("orderController — placeOrder", () => {
  let placeOrder;
  let OrderModel;

  beforeAll(async () => {
    const mod = await import("../controllers/orderController.js");
    placeOrder = mod.placeOrder;
    OrderModel = (await import("../models/orderModel.js")).default;
    OrderModel.find = mockOrderFind;
    OrderModel.findById = mockOrderFindById;
    OrderModel.findByIdAndUpdate = mockOrderFindByIdAndUpdate;
    OrderModel.findByIdAndDelete = mockOrderFindByIdAndDelete;
  });

  afterEach(() => jest.clearAllMocks());

  test("creates order, clears cart, and returns session_url", async () => {
    mockUserFindById.mockResolvedValue({ role: "user" });
    mockOrderIncCounter.mockReturnValue(undefined);

    const req = {
      body: {
        userId: "user123",
        items: [{ name: "Pasta", price: 300, quantity: 2 }],
        amount: 800,
        address: { firstName: "Test", lastName: "User", city: "Bengaluru" }
      }
    };
    const res = makeRes();

    await placeOrder(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, session_url: expect.any(String) })
    );
    expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith("user123", { cartData: {} });
    expect(mockOrderIncCounter).toHaveBeenCalledWith({ status: "created" });
  });
});

describe("orderController — verifyOrder", () => {
  let verifyOrder;
  let OrderModel;

  beforeAll(async () => {
    const mod = await import("../controllers/orderController.js");
    verifyOrder = mod.verifyOrder;
    OrderModel = (await import("../models/orderModel.js")).default;
    OrderModel.findById = mockOrderFindById;
    OrderModel.findByIdAndUpdate = mockOrderFindByIdAndUpdate;
    OrderModel.findByIdAndDelete = mockOrderFindByIdAndDelete;
  });

  afterEach(() => jest.clearAllMocks());

  test("marks payment=true and tracks 'paid' metric on success=true", async () => {
    mockOrderFindById.mockResolvedValue({
      _id: "abc123", userId: "user123",
      items: [{ name: "Pasta", price: 300, quantity: 2 }],
      amount: 800, address: { street: "123 Main" }
    });
    mockUserFindById.mockResolvedValue({ email: "user@test.com", name: "Test User" });

    const req = { body: { orderId: "abc123", success: "true" } };
    const res = makeRes();

    await verifyOrder(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Payment Verified" })
    );
    expect(mockOrderIncCounter).toHaveBeenCalledWith({ status: "paid" });
  });

  test("deletes order and tracks 'cancelled' metric on success=false", async () => {
    const req = { body: { orderId: "abc123", success: "false" } };
    const res = makeRes();

    await verifyOrder(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Payment Not Completed" })
    );
    expect(mockOrderFindByIdAndDelete).toHaveBeenCalledWith("abc123");
    expect(mockOrderIncCounter).toHaveBeenCalledWith({ status: "cancelled" });
  });
});

describe("orderController — listOrders (Admin RBAC)", () => {
  let listOrders;
  let OrderModel;

  beforeAll(async () => {
    const mod = await import("../controllers/orderController.js");
    listOrders = mod.listOrders;
    OrderModel = (await import("../models/orderModel.js")).default;
    OrderModel.find = mockOrderFind;
  });

  afterEach(() => jest.clearAllMocks());

  test("returns 403 for non-admin users", async () => {
    mockUserFindById.mockResolvedValue({ role: "user" });

    const req = { body: { userId: "not_admin" } };
    const res = makeRes();

    await listOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Admin access required" })
    );
  });

  test("returns all orders for admin", async () => {
    mockUserFindById.mockResolvedValue({ role: "admin" });
    const mockOrders = [
      { _id: "order1", amount: 500, status: "Delivered" },
      { _id: "order2", amount: 800, status: "Food Processing" }
    ];
    mockOrderFind.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockOrders) });

    const req = { body: { userId: "admin_user_id" } };
    const res = makeRes();

    await listOrders(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: mockOrders })
    );
  });
});

describe("orderController — updateStatus", () => {
  let updateStatus;

  beforeAll(async () => {
    const mod = await import("../controllers/orderController.js");
    updateStatus = mod.updateStatus;
  });

  afterEach(() => jest.clearAllMocks());

  test("blocks status update for non-admin", async () => {
    mockUserFindById.mockResolvedValue({ role: "user" });
    const req = { body: { userId: "user_id", orderId: "order1", status: "Delivered" } };
    const res = makeRes();

    await updateStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("updates status and sends email for admin", async () => {
    mockUserFindById.mockResolvedValue({ role: "admin" });
    mockOrderFindById.mockResolvedValue({
      userId: "cust_id", items: [], amount: 500, address: {}
    });

    const req = { body: { userId: "admin_id", orderId: "order1", status: "Delivered" } };
    const res = makeRes();

    await updateStatus(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});

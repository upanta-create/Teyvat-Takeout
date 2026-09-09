/**
 * User Controller — Unit Tests
 *
 * Tests: registration, login, duplicate email, invalid password strength,
 *        missing fields, and response shape validation.
 *
 * Pattern: Mock MongoDB + bcrypt to test controller logic in isolation.
 */

import { jest } from "@jest/globals";

// ── Mocks ────────────────────────────────────────────────────
const mockUserFindOne = jest.fn();
const mockUserSave = jest.fn();
const mockHashGenerate = jest.fn();
const mockCompare = jest.fn();
const mockSign = jest.fn(() => "mock_jwt_token");

jest.unstable_mockModule("../models/userModel.js", () => ({
  default: jest.fn().mockImplementation((data) => ({
    ...data,
    save: mockUserSave
  }))
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mockHashGenerate,
    compare: mockCompare,
    genSalt: jest.fn().mockResolvedValue("mock_salt")
  }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign: mockSign }
}));

jest.unstable_mockModule("validator", () => ({
  default: { isEmail: (email) => email.includes("@") }
}));

jest.unstable_mockModule("../utils/logger.js", () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

// ── Tests ────────────────────────────────────────────────────
describe("userController — loginUser", () => {
  let loginUser;
  let UserModel;

  beforeAll(async () => {
    const mod = await import("../controllers/userController.js");
    loginUser = mod.loginUser;
    UserModel = (await import("../models/userModel.js")).default;
    UserModel.findOne = mockUserFindOne;
  });

  afterEach(() => jest.clearAllMocks());

  const mockReq = (body) => ({ body });
  const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
  };

  test("returns error for non-existent email", async () => {
    mockUserFindOne.mockResolvedValue(null);
    const req = mockReq({ email: "nobody@test.com", password: "Test@1234" });
    const res = mockRes();

    await loginUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("returns error for wrong password", async () => {
    mockUserFindOne.mockResolvedValue({ email: "user@test.com", password: "hashed" });
    mockCompare.mockResolvedValue(false);

    const req = mockReq({ email: "user@test.com", password: "WrongPass@1" });
    const res = mockRes();

    await loginUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("returns JWT token on valid credentials", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "123abc", email: "user@test.com", password: "hashed", role: "user" });
    mockCompare.mockResolvedValue(true);

    const req = mockReq({ email: "user@test.com", password: "Correct@1" });
    const res = mockRes();

    await loginUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: "mock_jwt_token" })
    );
  });
});

describe("userController — registerUser", () => {
  let registerUser;
  let UserModel;

  beforeAll(async () => {
    const mod = await import("../controllers/userController.js");
    registerUser = mod.registerUser;
    UserModel = (await import("../models/userModel.js")).default;
    UserModel.findOne = mockUserFindOne;
  });

  afterEach(() => jest.clearAllMocks());

  const mockReq = (body) => ({ body });
  const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
  };

  test("rejects short passwords (< 8 chars)", async () => {
    const req = mockReq({ name: "Test", email: "test@test.com", password: "short" });
    const res = mockRes();

    await registerUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("rejects invalid email format", async () => {
    const req = mockReq({ name: "Test", email: "not-an-email", password: "Test@12345" });
    const res = mockRes();

    await registerUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("rejects duplicate email", async () => {
    mockUserFindOne.mockResolvedValue({ email: "existing@test.com" });
    const req = mockReq({ name: "Test", email: "existing@test.com", password: "Test@12345" });
    const res = mockRes();

    await registerUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("successfully registers valid user and returns JWT", async () => {
    mockUserFindOne.mockResolvedValue(null);
    mockHashGenerate.mockResolvedValue("hashed_password");
    mockUserSave.mockResolvedValue({ _id: "newid123", email: "newuser@test.com" });

    const req = mockReq({ name: "New User", email: "newuser@test.com", password: "Test@12345" });
    const res = mockRes();

    await registerUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, token: "mock_jwt_token" })
    );
  });
});

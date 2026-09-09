import { body, validationResult } from "express-validator";

/**
 * Centralized validation schemas for all API endpoints.
 * Uses express-validator to sanitize and validate request bodies.
 * Patterns: input sanitization, schema validation, secure coding practices.
 */

// Middleware to consume validation errors and short-circuit bad requests
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// --- Auth Validators ---
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),

  handleValidationErrors
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors
];

// --- Order Validators ---
export const validatePlaceOrder = [
  body("items")
    .isArray({ min: 1 }).withMessage("Order must contain at least one item"),

  body("items.*.name")
    .trim()
    .notEmpty().withMessage("Each item must have a name"),

  body("items.*.price")
    .isFloat({ min: 0 }).withMessage("Item price must be a positive number"),

  body("items.*.quantity")
    .isInt({ min: 1 }).withMessage("Item quantity must be at least 1"),

  body("amount")
    .isFloat({ min: 1 }).withMessage("Order amount must be greater than 0"),

  body("address.firstName")
    .trim()
    .notEmpty().withMessage("Delivery first name is required"),

  body("address.lastName")
    .trim()
    .notEmpty().withMessage("Delivery last name is required"),

  body("address.email")
    .trim()
    .isEmail().withMessage("Valid delivery email required")
    .normalizeEmail(),

  body("address.street")
    .trim()
    .notEmpty().withMessage("Street address is required"),

  body("address.city")
    .trim()
    .notEmpty().withMessage("City is required"),

  body("address.phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage("Must be a valid phone number"),

  handleValidationErrors
];

// --- Food / Admin Validators ---
export const validateAddFood = [
  body("name")
    .trim()
    .notEmpty().withMessage("Dish name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Dish name must be 2–100 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("price")
    .isFloat({ min: 1 }).withMessage("Price must be at least ₹1"),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required"),

  handleValidationErrors
];

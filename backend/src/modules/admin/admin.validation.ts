import { body } from "express-validator";

export const createOrganizationValidation = [
  body("name").trim().notEmpty().withMessage("Organization name is required"),
  body("slug").optional().trim(),
  body("logo").optional().trim(),
];

export const updateOrganizationValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("slug").optional().trim(),
  body("logo").optional().trim(),
];

export const createUserValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("role").isIn(["ADMIN", "MANAGER", "MEMBER"]).withMessage("Role must be ADMIN, MANAGER, or MEMBER"),
  body("organizationId").trim().notEmpty().withMessage("Organization ID is required"),
];

export const updateUserValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("role").optional().isIn(["ADMIN", "MANAGER", "MEMBER"]).withMessage("Role must be ADMIN, MANAGER, or MEMBER"),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
  body("organizationId").optional().trim().notEmpty().withMessage("Organization ID cannot be empty"),
];

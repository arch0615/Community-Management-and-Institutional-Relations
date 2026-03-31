import { body } from "express-validator";

export const createContactValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").optional().trim(),
  body("email").optional().isEmail().normalizeEmail().withMessage("Invalid email"),
  body("phone").optional().trim(),
  body("gender").optional().isIn(["MALE", "FEMALE", "NON_BINARY", "OTHER", "PREFER_NOT_TO_SAY"]),
  body("location").optional().trim(),
  body("source").optional().trim(),
];

export const updateContactValidation = [
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().trim(),
  body("email").optional().isEmail().normalizeEmail().withMessage("Invalid email"),
  body("phone").optional().trim(),
  body("gender").optional().isIn(["MALE", "FEMALE", "NON_BINARY", "OTHER", "PREFER_NOT_TO_SAY"]),
  body("location").optional().trim(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE", "ARCHIVED", "BLOCKED"]),
  body("source").optional().trim(),
];

export const addInteractionValidation = [
  body("type")
    .isIn(["EMAIL", "PHONE_CALL", "MEETING", "WHATSAPP", "INSTAGRAM_DM", "FACEBOOK_MESSAGE", "NOTE", "OTHER"])
    .withMessage("Valid interaction type is required"),
  body("subject").optional().trim(),
  body("notes").optional().trim(),
];

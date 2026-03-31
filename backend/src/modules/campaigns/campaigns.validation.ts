import { body } from "express-validator";

export const createCampaignValidation = [
  body("name").trim().notEmpty().withMessage("El nombre de la campaña es obligatorio"),
  body("description").optional().trim(),
  body("channel").optional().isIn(["WHATSAPP", "INSTAGRAM", "FACEBOOK_MESSENGER", "EMAIL", "SMS"]),
  body("content").optional().isObject(),
  body("segmentId").optional().trim(),
  body("scheduledAt").optional().isISO8601().withMessage("Fecha programada inválida"),
];

export const updateCampaignValidation = [
  body("name").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío"),
  body("description").optional().trim(),
  body("channel").optional().isIn(["WHATSAPP", "INSTAGRAM", "FACEBOOK_MESSENGER", "EMAIL", "SMS"]),
  body("content").optional().isObject(),
  body("segmentId").optional().trim(),
  body("scheduledAt").optional(),
  body("status").optional().isIn(["DRAFT", "SCHEDULED", "CANCELLED"]),
];

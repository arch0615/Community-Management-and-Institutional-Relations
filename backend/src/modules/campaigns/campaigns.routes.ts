import { Router } from "express";
import { CampaignsController } from "./campaigns.controller";
import { validate } from "../../middleware/validate";
import { createCampaignValidation, updateCampaignValidation } from "./campaigns.validation";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
const controller = new CampaignsController();

router.use(authenticate);

// All roles: read
router.get("/stats", controller.getStats);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);

// ADMIN & MANAGER: create, update, delete, send, duplicate
router.post("/", authorize("ADMIN", "MANAGER"), validate(createCampaignValidation), controller.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validate(updateCampaignValidation), controller.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), controller.delete);
router.post("/:id/send", authorize("ADMIN", "MANAGER"), controller.send);
router.post("/:id/duplicate", authorize("ADMIN", "MANAGER"), controller.duplicate);

export default router;

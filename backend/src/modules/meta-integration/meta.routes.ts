import { Router } from "express";
import { MetaController } from "./meta.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
const controller = new MetaController();

// Webhook endpoints (no auth - called by Meta)
router.get("/webhook", controller.verifyWebhook);
router.post("/webhook", controller.handleWebhook);

// ADMIN & MANAGER: send WhatsApp messages
router.post("/whatsapp/send", authenticate, authorize("ADMIN", "MANAGER"), controller.sendWhatsApp);

// All roles: view channels
router.get("/channels", authenticate, controller.getChannels);

// ADMIN only: manage channels/integrations
router.post("/channels", authenticate, authorize("ADMIN"), controller.createChannel);
router.put("/channels/:id", authenticate, authorize("ADMIN"), controller.updateChannel);
router.delete("/channels/:id", authenticate, authorize("ADMIN"), controller.deleteChannel);
router.post("/test-connection", authenticate, authorize("ADMIN"), controller.testConnection);

export default router;

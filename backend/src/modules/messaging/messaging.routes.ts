import { Router } from "express";
import { MessagingController } from "./messaging.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
const controller = new MessagingController();

router.use(authenticate);

// All roles: read conversations and messages
router.get("/conversations", controller.getConversations);
router.get("/stats", controller.getStats);
router.get("/:contactId", controller.getMessages);

// ADMIN & MANAGER: send messages
router.post("/:contactId", authorize("ADMIN", "MANAGER"), controller.sendMessage);

export default router;

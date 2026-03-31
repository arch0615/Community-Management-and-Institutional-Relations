import { Router } from "express";
import multer from "multer";
import { ContactsController } from "./contacts.controller";
import { validate } from "../../middleware/validate";
import { createContactValidation, updateContactValidation, addInteractionValidation } from "./contacts.validation";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
const controller = new ContactsController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticate);

// All roles: read access + export
router.get("/stats", controller.getStats);
router.get("/export", controller.exportCsv);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);

// All roles: create and update contacts, add interactions
router.post("/", validate(createContactValidation), controller.create);
router.put("/:id", validate(updateContactValidation), controller.update);
router.post("/:id/interactions", validate(addInteractionValidation), controller.addInteraction);

// ADMIN & MANAGER: import, delete contacts, manage tags
router.post("/import", authorize("ADMIN", "MANAGER"), upload.single("file"), controller.importCsv);
router.delete("/:id", authorize("ADMIN", "MANAGER"), controller.delete);
router.post("/:id/tags", authorize("ADMIN", "MANAGER"), controller.addTag);
router.delete("/:id/tags/:tagId", authorize("ADMIN", "MANAGER"), controller.removeTag);

export default router;

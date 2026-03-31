import { Router } from "express";
import { SegmentationController } from "./segmentation.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
const controller = new SegmentationController();

router.use(authenticate);

// All roles: read segments and tags
router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.get("/tags/all", controller.getAllTags);

// ADMIN & MANAGER: create, update, delete segments and tags
router.post("/", authorize("ADMIN", "MANAGER"), controller.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), controller.update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), controller.delete);
router.post("/:id/apply", authorize("ADMIN", "MANAGER"), controller.applyFilters);
router.post("/tags", authorize("ADMIN", "MANAGER"), controller.createTag);
router.delete("/tags/:id", authorize("ADMIN", "MANAGER"), controller.deleteTag);

export default router;

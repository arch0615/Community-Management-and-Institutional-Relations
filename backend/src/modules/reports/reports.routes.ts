import { Router } from "express";
import { ReportsController } from "./reports.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
const controller = new ReportsController();

router.use(authenticate);

router.get("/search", controller.globalSearch);
router.get("/dashboard", controller.getDashboardStats);
router.get("/notifications", controller.getNotifications);
router.get("/engagement", controller.getEngagementReport);

export default router;

import { Request, Response, NextFunction } from "express";
import { ReportsService } from "./reports.service";

const reportsService = new ReportsService();

export class ReportsController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await reportsService.getDashboardStats(req.user!.organizationId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const notifications = await reportsService.getNotifications(req.user!.organizationId, limit);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || "";
      const results = await reportsService.globalSearch(req.user!.organizationId, query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  async getEngagementReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.getEngagementReport(
        req.user!.organizationId,
        req.query as unknown as Record<string, string>
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}

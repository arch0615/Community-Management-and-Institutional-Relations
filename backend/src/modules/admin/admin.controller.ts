import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";

const service = new AdminService();

export class AdminController {
  // ─── Platform Stats ──────────────────────────────────────
  async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await service.getPlatformStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  // ─── Organizations ───────────────────────────────────────
  async listOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const result = await service.listOrganizations(page, limit, search);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await service.getOrganization(req.params.id as string);
      res.json(org);
    } catch (err) {
      next(err);
    }
  }

  async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await service.createOrganization(req.body);
      res.status(201).json(org);
    } catch (err) {
      next(err);
    }
  }

  async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await service.updateOrganization(req.params.id as string, req.body);
      res.json(org);
    } catch (err) {
      next(err);
    }
  }

  async deleteOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.deleteOrganization(req.params.id as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // ─── Users ───────────────────────────────────────────────
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        organizationId: req.query.organizationId as string | undefined,
        role: req.query.role as string | undefined,
        search: req.query.search as string | undefined,
      };
      const result = await service.listUsers(page, limit, filters);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.getUser(req.params.id as string);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.updateUser(req.params.id as string, req.body);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.deleteUser(req.params.id as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

import { Request, Response, NextFunction } from "express";
import { CampaignsService } from "./campaigns.service";

const campaignsService = new CampaignsService();

export class CampaignsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const result = await campaignsService.findAll(
        orgId,
        req.query as unknown as Record<string, string>
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const campaign = await campaignsService.findById(
        req.params.id as string,
        orgId
      );
      res.json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.body.organizationId || req.user!.organizationId;
      const campaign = await campaignsService.create(orgId, req.body);
      res.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const campaign = await campaignsService.update(
        req.params.id as string,
        orgId,
        req.body
      );
      res.json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      await campaignsService.delete(req.params.id as string, orgId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const result = await campaignsService.send(
        req.params.id as string,
        orgId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const campaign = await campaignsService.duplicate(
        req.params.id as string,
        orgId
      );
      res.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const stats = await campaignsService.getStats(orgId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

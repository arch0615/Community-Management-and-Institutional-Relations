import { Request, Response, NextFunction } from "express";
import { CampaignsService } from "./campaigns.service";

const campaignsService = new CampaignsService();

export class CampaignsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await campaignsService.findAll(
        req.user!.organizationId,
        req.query as unknown as Record<string, string>
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.findById(
        req.params.id as string,
        req.user!.organizationId
      );
      res.json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.create(req.user!.organizationId, req.body);
      res.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.update(
        req.params.id as string,
        req.user!.organizationId,
        req.body
      );
      res.json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await campaignsService.delete(req.params.id as string, req.user!.organizationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await campaignsService.send(
        req.params.id as string,
        req.user!.organizationId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.duplicate(
        req.params.id as string,
        req.user!.organizationId
      );
      res.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await campaignsService.getStats(req.user!.organizationId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

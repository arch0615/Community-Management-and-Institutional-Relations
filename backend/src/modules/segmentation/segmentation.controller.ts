import { Request, Response, NextFunction } from "express";
import { SegmentationService } from "./segmentation.service";

const segmentationService = new SegmentationService();

export class SegmentationController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const result = await segmentationService.findAll(
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
      const segment = await segmentationService.findById(req.params.id as string, orgId);
      res.json(segment);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.body.organizationId || req.user!.organizationId;
      const segment = await segmentationService.create(orgId, req.body);
      res.status(201).json(segment);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const segment = await segmentationService.update(
        req.params.id as string,
        orgId,
        req.body
      );
      res.json(segment);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      await segmentationService.delete(req.params.id as string, orgId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async applyFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const result = await segmentationService.applyFilters(
        req.params.id as string,
        orgId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Tags
  async getAllTags(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const tags = await segmentationService.getAllTags(orgId);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.body.organizationId || req.user!.organizationId;
      const tag = await segmentationService.createTag(orgId, req.body);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      await segmentationService.deleteTag(req.params.id as string, orgId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

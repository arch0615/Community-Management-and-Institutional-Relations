import { Request, Response, NextFunction } from "express";
import { SegmentationService } from "./segmentation.service";

const segmentationService = new SegmentationService();

export class SegmentationController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await segmentationService.findAll(
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
      const segment = await segmentationService.findById(req.params.id as string, req.user!.organizationId);
      res.json(segment);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const segment = await segmentationService.create(req.user!.organizationId, req.body);
      res.status(201).json(segment);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const segment = await segmentationService.update(
        req.params.id as string,
        req.user!.organizationId,
        req.body
      );
      res.json(segment);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await segmentationService.delete(req.params.id as string, req.user!.organizationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async applyFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await segmentationService.applyFilters(
        req.params.id as string,
        req.user!.organizationId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Tags
  async getAllTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await segmentationService.getAllTags(req.user!.organizationId);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }

  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await segmentationService.createTag(req.user!.organizationId, req.body);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      await segmentationService.deleteTag(req.params.id as string, req.user!.organizationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

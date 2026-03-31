import { Request, Response, NextFunction } from "express";
import { MetaService } from "./meta.service";

const metaService = new MetaService();

export class MetaController {
  // Webhook verification (GET)
  async verifyWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const challenge = metaService.verifyWebhook(req.query as any);
      res.status(200).send(challenge);
    } catch (error) {
      next(error);
    }
  }

  // Webhook event handler (POST)
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      await metaService.processWebhookEvent(req.body);
      res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      // Always return 200 for webhooks to prevent retries
      console.error("Webhook processing error:", error);
      res.status(200).send("EVENT_RECEIVED");
    }
  }

  // Send WhatsApp message
  async sendWhatsApp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, message } = req.body;
      const result = await metaService.sendWhatsAppMessage(phoneNumber, message);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Channel management
  async getChannels(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const channels = await metaService.getChannels(orgId);
      res.json(channels);
    } catch (error) {
      next(error);
    }
  }

  async createChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.body.organizationId || req.user!.organizationId;
      const channel = await metaService.createChannel(orgId, req.body);
      res.status(201).json(channel);
    } catch (error) {
      next(error);
    }
  }

  async updateChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      const channel = await metaService.updateChannel(
        req.params.id as string,
        orgId,
        req.body
      );
      res.json(channel);
    } catch (error) {
      next(error);
    }
  }

  async deleteChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = req.user!.role === "SUPER_ADMIN" ? undefined : req.user!.organizationId;
      await metaService.deleteChannel(req.params.id as string, orgId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await metaService.testConnection(req.body.type, req.body.credentials);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

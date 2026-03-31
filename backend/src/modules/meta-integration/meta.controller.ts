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
      const channels = await metaService.getChannels(req.user!.organizationId);
      res.json(channels);
    } catch (error) {
      next(error);
    }
  }

  async createChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await metaService.createChannel(req.user!.organizationId, req.body);
      res.status(201).json(channel);
    } catch (error) {
      next(error);
    }
  }

  async updateChannel(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await metaService.updateChannel(
        req.params.id as string,
        req.user!.organizationId,
        req.body
      );
      res.json(channel);
    } catch (error) {
      next(error);
    }
  }

  async deleteChannel(req: Request, res: Response, next: NextFunction) {
    try {
      await metaService.deleteChannel(req.params.id as string, req.user!.organizationId);
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

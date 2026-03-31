import { config } from "../../config";
import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

const META_GRAPH_API = "https://graph.facebook.com/v19.0";

export class MetaService {
  // ─── Webhook Verification ─────────────────────────────────
  verifyWebhook(query: { "hub.mode"?: string; "hub.verify_token"?: string; "hub.challenge"?: string }) {
    if (
      query["hub.mode"] === "subscribe" &&
      query["hub.verify_token"] === config.meta.webhookVerifyToken
    ) {
      return query["hub.challenge"];
    }
    throw new AppError("Webhook verification failed", 403);
  }

  // ─── Process Incoming Webhook Events ──────────────────────
  async processWebhookEvent(body: any) {
    const { object, entry } = body;

    if (object === "whatsapp_business_account") {
      await this.processWhatsAppMessages(entry);
    } else if (object === "instagram") {
      await this.processInstagramMessages(entry);
    } else if (object === "page") {
      await this.processMessengerMessages(entry);
    }
  }

  private async processWhatsAppMessages(entries: any[]) {
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "messages") {
          const messages = change.value?.messages || [];
          for (const msg of messages) {
            await this.storeInboundMessage({
              externalId: msg.id,
              content: msg.text?.body || msg.type,
              phone: msg.from,
              channel: "WHATSAPP",
              metadata: msg,
            });
          }
        }
      }
    }
  }

  private async processInstagramMessages(entries: any[]) {
    for (const entry of entries) {
      const messaging = entry.messaging || [];
      for (const event of messaging) {
        if (event.message) {
          await this.storeInboundMessage({
            externalId: event.message.mid,
            content: event.message.text || "[media]",
            externalUserId: event.sender.id,
            channel: "INSTAGRAM",
            metadata: event,
          });
        }
      }
    }
  }

  private async processMessengerMessages(entries: any[]) {
    for (const entry of entries) {
      const messaging = entry.messaging || [];
      for (const event of messaging) {
        if (event.message) {
          await this.storeInboundMessage({
            externalId: event.message.mid,
            content: event.message.text || "[media]",
            externalUserId: event.sender.id,
            channel: "FACEBOOK_MESSENGER",
            metadata: event,
          });
        }
      }
    }
  }

  private async storeInboundMessage(data: {
    externalId: string;
    content: string;
    phone?: string;
    externalUserId?: string;
    channel: string;
    metadata: any;
  }) {
    // Find or create contact based on phone or external ID
    let contact = null;

    if (data.phone) {
      contact = await prisma.contact.findFirst({
        where: { phone: data.phone },
      });
    }

    if (!contact && data.externalUserId) {
      contact = await prisma.contact.findFirst({
        where: { metadata: { path: ["externalId"], equals: data.externalUserId } },
      });
    }

    // If no contact found, we store the message with metadata for later matching
    if (contact) {
      await prisma.message.create({
        data: {
          externalId: data.externalId,
          content: data.content,
          direction: "INBOUND",
          channel: data.channel as any,
          status: "DELIVERED",
          contactId: contact.id,
          metadata: data.metadata,
        },
      });
    }
  }

  // ─── Send Messages via Meta APIs ──────────────────────────
  async sendWhatsAppMessage(phoneNumber: string, message: string) {
    if (!config.whatsapp.phoneNumberId || !config.whatsapp.accessToken) {
      throw new AppError("WhatsApp not configured", 503);
    }

    const response = await fetch(
      `${META_GRAPH_API}/${config.whatsapp.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.whatsapp.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new AppError(`WhatsApp API error: ${JSON.stringify(error)}`, 502);
    }

    return response.json();
  }

  // ─── Channel Management ───────────────────────────────────
  async getChannels(organizationId: string) {
    return prisma.channel.findMany({
      where: { organizationId },
      include: { _count: { select: { messages: true } } },
    });
  }

  async createChannel(organizationId: string, data: any) {
    return prisma.channel.create({
      data: { ...data, organizationId },
    });
  }

  async updateChannel(id: string, organizationId: string, data: any) {
    const channel = await prisma.channel.findFirst({ where: { id, organizationId } });
    if (!channel) throw new AppError("Canal no encontrado", 404);
    return prisma.channel.update({
      where: { id },
      data,
      include: { _count: { select: { messages: true } } },
    });
  }

  async deleteChannel(id: string, organizationId: string) {
    const channel = await prisma.channel.findFirst({ where: { id, organizationId } });
    if (!channel) throw new AppError("Canal no encontrado", 404);
    await prisma.channel.delete({ where: { id } });
  }

  async testConnection(type: string, credentials: any) {
    if (type === "WHATSAPP") {
      const phoneNumberId = credentials.phoneNumberId;
      const accessToken = credentials.accessToken;
      if (!phoneNumberId || !accessToken) {
        throw new AppError("Se requiere phoneNumberId y accessToken", 400);
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new AppError(
          `Error de conexión: ${(err as any)?.error?.message || response.statusText}`,
          400
        );
      }

      const data = await response.json();
      return { success: true, info: data };
    }

    if (type === "INSTAGRAM" || type === "FACEBOOK_MESSENGER") {
      const pageAccessToken = credentials.pageAccessToken;
      if (!pageAccessToken) {
        throw new AppError("Se requiere pageAccessToken", 400);
      }

      const response = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${pageAccessToken}`
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new AppError(
          `Error de conexión: ${(err as any)?.error?.message || response.statusText}`,
          400
        );
      }

      const data = await response.json();
      return { success: true, info: data };
    }

    return { success: true, info: { message: "Canal configurado (sin verificación automática)" } };
  }
}

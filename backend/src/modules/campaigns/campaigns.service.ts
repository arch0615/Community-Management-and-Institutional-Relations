import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { Prisma, CampaignStatus } from "@prisma/client";

export class CampaignsService {
  async findAll(organizationId: string, query: Record<string, string>) {
    const pagination = getPagination(query);
    const where: Prisma.CampaignWhereInput = { organizationId };

    if (query.status) {
      where.status = query.status as CampaignStatus;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          segment: {
            select: { id: true, name: true, _count: { select: { contacts: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return paginatedResponse(campaigns, total, pagination);
  }

  async findById(id: string, organizationId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, organizationId },
      include: {
        segment: {
          include: {
            contacts: {
              include: {
                contact: {
                  select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                },
              },
            },
            _count: { select: { contacts: true } },
          },
        },
      },
    });
    if (!campaign) throw new AppError("Campaña no encontrada", 404);
    return campaign;
  }

  async create(organizationId: string, data: {
    name: string;
    description?: string;
    channel?: string;
    content?: any;
    segmentId?: string;
    scheduledAt?: string;
  }) {
    // Validate segment belongs to org
    if (data.segmentId) {
      const segment = await prisma.segment.findFirst({
        where: { id: data.segmentId, organizationId },
      });
      if (!segment) throw new AppError("Segmento no encontrado", 404);
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        channel: data.channel as any,
        content: data.content || {},
        segmentId: data.segmentId || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
        organizationId,
      },
      include: {
        segment: {
          select: { id: true, name: true, _count: { select: { contacts: true } } },
        },
      },
    });

    return campaign;
  }

  async update(id: string, organizationId: string, data: {
    name?: string;
    description?: string;
    channel?: string;
    content?: any;
    segmentId?: string;
    scheduledAt?: string;
    status?: CampaignStatus;
  }) {
    const existing = await prisma.campaign.findFirst({ where: { id, organizationId } });
    if (!existing) throw new AppError("Campaña no encontrada", 404);

    if (existing.status === "SENT" || existing.status === "SENDING") {
      throw new AppError("No se puede editar una campaña que ya fue enviada", 400);
    }

    if (data.segmentId) {
      const segment = await prisma.segment.findFirst({
        where: { id: data.segmentId, organizationId },
      });
      if (!segment) throw new AppError("Segmento no encontrado", 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.segmentId !== undefined) updateData.segmentId = data.segmentId || null;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    if (data.status !== undefined) updateData.status = data.status;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        segment: {
          select: { id: true, name: true, _count: { select: { contacts: true } } },
        },
      },
    });

    return campaign;
  }

  async delete(id: string, organizationId: string) {
    const existing = await prisma.campaign.findFirst({ where: { id, organizationId } });
    if (!existing) throw new AppError("Campaña no encontrada", 404);

    if (existing.status === "SENDING") {
      throw new AppError("No se puede eliminar una campaña en proceso de envío", 400);
    }

    await prisma.campaign.delete({ where: { id } });
  }

  async send(id: string, organizationId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: { id, organizationId },
      include: {
        segment: {
          include: {
            contacts: {
              include: {
                contact: { select: { id: true, firstName: true, phone: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!campaign) throw new AppError("Campaña no encontrada", 404);
    if (campaign.status === "SENT") throw new AppError("La campaña ya fue enviada", 400);
    if (campaign.status === "SENDING") throw new AppError("La campaña se está enviando", 400);
    if (!campaign.channel) throw new AppError("La campaña no tiene canal definido", 400);

    // Mark as sending
    await prisma.campaign.update({
      where: { id },
      data: { status: "SENDING" },
    });

    // Get recipients from segment
    const recipients = campaign.segment?.contacts?.map((sc) => sc.contact) || [];

    // Create outbound messages for each recipient
    const content = (campaign.content as any)?.message || campaign.name;
    let sentCount = 0;

    for (const recipient of recipients) {
      await prisma.message.create({
        data: {
          content,
          direction: "OUTBOUND",
          channel: campaign.channel,
          status: "SENT",
          contactId: recipient.id,
        },
      });
      sentCount++;
    }

    // Mark as sent
    await prisma.campaign.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date() },
    });

    return { sent: sentCount, campaign: campaign.name };
  }

  async duplicate(id: string, organizationId: string) {
    const existing = await prisma.campaign.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new AppError("Campaña no encontrada", 404);

    const campaign = await prisma.campaign.create({
      data: {
        name: `${existing.name} (copia)`,
        description: existing.description,
        channel: existing.channel,
        content: existing.content || {},
        segmentId: existing.segmentId,
        status: "DRAFT",
        organizationId,
      },
      include: {
        segment: {
          select: { id: true, name: true, _count: { select: { contacts: true } } },
        },
      },
    });

    return campaign;
  }

  async getStats(organizationId: string) {
    const [total, byStatus, byChannel, recentCampaigns] = await Promise.all([
      prisma.campaign.count({ where: { organizationId } }),
      prisma.campaign.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: true,
      }),
      prisma.campaign.groupBy({
        by: ["channel"],
        where: { organizationId, channel: { not: null } },
        _count: true,
      }),
      prisma.campaign.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          segment: { select: { name: true, _count: { select: { contacts: true } } } },
        },
      }),
    ]);

    return { total, byStatus, byChannel, recentCampaigns };
  }
}

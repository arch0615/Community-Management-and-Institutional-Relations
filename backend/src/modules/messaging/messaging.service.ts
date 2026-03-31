import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { Prisma } from "@prisma/client";

export class MessagingService {
  async getConversations(organizationId: string | undefined, query: Record<string, string>) {
    const pagination = getPagination(query);

    // Get contacts with their latest message
    const where: Prisma.ContactWhereInput = { messages: { some: {} } };
    if (organizationId) where.organizationId = organizationId;

    if (query.channel) {
      where.messages = { some: { channel: query.channel as any } };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          messages: {
            orderBy: { sentAt: "desc" },
            take: 1,
          },
          tags: { include: { tag: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return paginatedResponse(contacts, total, pagination);
  }

  async getMessages(contactId: string, organizationId: string | undefined, query: Record<string, string>) {
    const contactWhere: Prisma.ContactWhereInput = { id: contactId };
    if (organizationId) contactWhere.organizationId = organizationId;

    const contact = await prisma.contact.findFirst({ where: contactWhere });
    if (!contact) throw new AppError("Contact not found", 404);

    const pagination = getPagination(query);

    const where: Prisma.MessageWhereInput = { contactId };
    if (query.channel) where.channel = query.channel as any;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.message.count({ where }),
    ]);

    return paginatedResponse(messages, total, pagination);
  }

  async sendMessage(contactId: string, organizationId: string | undefined, data: {
    content: string;
    channel: string;
  }) {
    const contactWhere: Prisma.ContactWhereInput = { id: contactId };
    if (organizationId) contactWhere.organizationId = organizationId;

    const contact = await prisma.contact.findFirst({ where: contactWhere });
    if (!contact) throw new AppError("Contact not found", 404);

    const message = await prisma.message.create({
      data: {
        content: data.content,
        channel: data.channel as any,
        direction: "OUTBOUND",
        status: "SENT",
        contactId,
      },
    });

    return message;
  }

  async getMessageStats(organizationId: string | undefined) {
    const orgFilter: Prisma.ContactWhereInput = organizationId ? { organizationId } : {};

    const [total, byChannel, byDirection, recent] = await Promise.all([
      prisma.message.count({ where: { contact: orgFilter } }),
      prisma.message.groupBy({
        by: ["channel"],
        where: { contact: orgFilter },
        _count: true,
      }),
      prisma.message.groupBy({
        by: ["direction"],
        where: { contact: orgFilter },
        _count: true,
      }),
      prisma.message.findMany({
        where: { contact: orgFilter },
        orderBy: { sentAt: "desc" },
        take: 10,
        include: {
          contact: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    return { total, byChannel, byDirection, recent };
  }
}

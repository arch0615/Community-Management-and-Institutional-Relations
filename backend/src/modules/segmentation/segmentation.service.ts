import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { Prisma } from "@prisma/client";

export class SegmentationService {
  async findAll(organizationId: string | undefined, query: Record<string, string>) {
    const pagination = getPagination(query);
    const where: Prisma.SegmentWhereInput = {};

    if (organizationId) where.organizationId = organizationId;

    const [segments, total] = await Promise.all([
      prisma.segment.findMany({
        where,
        include: { _count: { select: { contacts: true } } },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.segment.count({ where }),
    ]);

    return paginatedResponse(segments, total, pagination);
  }

  async findById(id: string, organizationId: string | undefined) {
    const where: Prisma.SegmentWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const segment = await prisma.segment.findFirst({
      where,
      include: {
        contacts: {
          include: { contact: { include: { tags: { include: { tag: true } } } } },
        },
        _count: { select: { contacts: true } },
      },
    });
    if (!segment) throw new AppError("Segment not found", 404);
    return segment;
  }

  async create(organizationId: string, data: { name: string; description?: string; filters: any }) {
    const segment = await prisma.segment.create({
      data: { ...data, organizationId },
      include: { _count: { select: { contacts: true } } },
    });
    return segment;
  }

  async update(id: string, organizationId: string | undefined, data: any) {
    const where: Prisma.SegmentWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const existing = await prisma.segment.findFirst({ where });
    if (!existing) throw new AppError("Segment not found", 404);

    return prisma.segment.update({
      where: { id },
      data,
      include: { _count: { select: { contacts: true } } },
    });
  }

  async delete(id: string, organizationId: string | undefined) {
    const where: Prisma.SegmentWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const existing = await prisma.segment.findFirst({ where });
    if (!existing) throw new AppError("Segment not found", 404);
    await prisma.segment.delete({ where: { id } });
  }

  async applyFilters(id: string, organizationId: string | undefined) {
    const segWhere: Prisma.SegmentWhereInput = { id };
    if (organizationId) segWhere.organizationId = organizationId;

    const segment = await prisma.segment.findFirst({ where: segWhere });
    if (!segment) throw new AppError("Segment not found", 404);

    const filters = segment.filters as any;
    const where: Prisma.ContactWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    else where.organizationId = segment.organizationId;

    if (filters.gender) where.gender = filters.gender;
    if (filters.status) where.status = filters.status;
    if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
    if (filters.source) where.source = filters.source;
    if (filters.tagIds?.length) {
      where.tags = { some: { tagId: { in: filters.tagIds } } };
    }
    if (filters.interestIds?.length) {
      where.interests = { some: { interestId: { in: filters.interestIds } } };
    }

    const matchingContacts = await prisma.contact.findMany({
      where,
      select: { id: true },
    });

    // Clear existing and add matching contacts
    await prisma.segmentContact.deleteMany({ where: { segmentId: id } });

    if (matchingContacts.length > 0) {
      await prisma.segmentContact.createMany({
        data: matchingContacts.map((c) => ({ segmentId: id, contactId: c.id })),
      });
    }

    return { matched: matchingContacts.length };
  }

  // ─── Tags Management ─────────────────────────────────────

  async getAllTags(organizationId: string | undefined) {
    const where: Prisma.TagWhereInput = {};
    if (organizationId) where.organizationId = organizationId;

    return prisma.tag.findMany({
      where,
      include: { _count: { select: { contacts: true } } },
      orderBy: { name: "asc" },
    });
  }

  async createTag(organizationId: string, data: { name: string; color?: string }) {
    return prisma.tag.create({
      data: { ...data, organizationId },
    });
  }

  async deleteTag(id: string, organizationId: string | undefined) {
    const where: Prisma.TagWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const tag = await prisma.tag.findFirst({ where });
    if (!tag) throw new AppError("Tag not found", 404);
    await prisma.tag.delete({ where: { id } });
  }
}

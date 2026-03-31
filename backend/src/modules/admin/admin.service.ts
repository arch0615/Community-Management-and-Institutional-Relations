import bcrypt from "bcryptjs";
import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { UserRole } from "@prisma/client";

export class AdminService {
  // ─── Platform Stats ─────────────────────────────────────────
  async getPlatformStats() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalOrganizations,
      totalUsers,
      totalContacts,
      totalMessages,
      contactsByStatus,
      usersByRole,
      messagesByChannel,
      contactGrowthRaw,
      orgsWithCounts,
      recentActivity,
    ] = await Promise.all([
      prisma.organization.count({ where: { isSystem: false } }),
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
      prisma.contact.count(),
      prisma.message.count(),
      prisma.contact.groupBy({ by: ["status"], _count: true }),
      prisma.user.groupBy({
        by: ["role"],
        where: { role: { not: "SUPER_ADMIN" } },
        _count: true,
      }),
      prisma.message.groupBy({ by: ["channel"], _count: true }),
      prisma.contact.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.organization.findMany({
        where: { isSystem: false },
        select: {
          name: true,
          _count: { select: { contacts: true, users: true, campaigns: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true } },
          organization: { select: { name: true } },
        },
      }),
    ]);

    // Build contact growth by month
    const monthlyData: Record<string, number> = {};
    for (const c of contactGrowthRaw) {
      const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    }
    const contactGrowth = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

    // Contacts per organization
    const contactsByOrg = orgsWithCounts.map((o) => ({
      name: o.name,
      contacts: o._count.contacts,
      users: o._count.users,
      campaigns: o._count.campaigns,
    }));

    return {
      totalOrganizations,
      totalUsers,
      totalContacts,
      totalMessages,
      contactsByStatus: contactsByStatus.map((s) => ({ status: s.status, count: s._count })),
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
      messagesByChannel: messagesByChannel.map((m) => ({ channel: m.channel, count: m._count })),
      contactGrowth,
      contactsByOrg,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        details: a.details as Record<string, any> | null,
        userName: a.user?.name || "Sistema",
        orgName: a.organization?.name || "—",
        createdAt: a.createdAt,
      })),
    };
  }

  // ─── Organizations ──────────────────────────────────────────
  async listOrganizations(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isSystem: false };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true, contacts: true, campaigns: true } },
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOrganization(id: string) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, contacts: true, segments: true, campaigns: true, channels: true },
        },
        users: {
          select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!org) throw new AppError("Organization not found", 404);
    return org;
  }

  async createOrganization(data: { name: string; slug?: string; logo?: string }) {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") +
        "-" +
        Date.now();

    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) throw new AppError("Organization slug already exists", 409);

    return prisma.organization.create({
      data: { name: data.name, slug, logo: data.logo },
    });
  }

  async updateOrganization(id: string, data: { name?: string; slug?: string; logo?: string }) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw new AppError("Organization not found", 404);
    if (org.isSystem) throw new AppError("Cannot modify system organization", 403);

    if (data.slug) {
      const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) throw new AppError("Slug already in use", 409);
    }

    return prisma.organization.update({ where: { id }, data });
  }

  async deleteOrganization(id: string) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw new AppError("Organization not found", 404);
    if (org.isSystem) throw new AppError("Cannot delete system organization", 403);

    // Delete all related data in order
    await prisma.activityLog.deleteMany({ where: { organizationId: id } });
    await prisma.message.deleteMany({ where: { contact: { organizationId: id } } });
    await prisma.interaction.deleteMany({ where: { contact: { organizationId: id } } });
    await prisma.segmentContact.deleteMany({ where: { segment: { organizationId: id } } });
    await prisma.contactTag.deleteMany({ where: { contact: { organizationId: id } } });
    await prisma.contactInterest.deleteMany({ where: { contact: { organizationId: id } } });
    await prisma.campaign.deleteMany({ where: { organizationId: id } });
    await prisma.segment.deleteMany({ where: { organizationId: id } });
    await prisma.channel.deleteMany({ where: { organizationId: id } });
    await prisma.tag.deleteMany({ where: { organizationId: id } });
    await prisma.contact.deleteMany({ where: { organizationId: id } });
    await prisma.user.deleteMany({ where: { organizationId: id } });
    await prisma.organization.delete({ where: { id } });

    return { message: "Organization deleted" };
  }

  // ─── Users ──────────────────────────────────────────────────
  async listUsers(page = 1, limit = 20, filters?: { organizationId?: string; role?: string; search?: string }) {
    const skip = (page - 1) * limit;
    const where: any = { role: { not: "SUPER_ADMIN" } };

    if (filters?.organizationId) where.organizationId = filters.organizationId;
    if (filters?.role) where.role = filters.role as UserRole;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, email: true, name: true, role: true, isActive: true, createdAt: true,
          organization: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true, isActive: true, avatar: true,
        createdAt: true, updatedAt: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async createUser(data: { email: string; password: string; name: string; role: UserRole; organizationId: string }) {
    if (data.role === "SUPER_ADMIN") throw new AppError("Cannot create SUPER_ADMIN users", 403);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("Email already registered", 409);

    const org = await prisma.organization.findUnique({ where: { id: data.organizationId } });
    if (!org || org.isSystem) throw new AppError("Invalid organization", 400);

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        organizationId: data.organizationId,
      },
      select: {
        id: true, email: true, name: true, role: true, isActive: true, createdAt: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    return user;
  }

  async updateUser(id: string, data: { name?: string; email?: string; role?: UserRole; isActive?: boolean; organizationId?: string }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "SUPER_ADMIN") throw new AppError("Cannot modify SUPER_ADMIN users", 403);
    if (data.role === "SUPER_ADMIN") throw new AppError("Cannot assign SUPER_ADMIN role", 403);

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new AppError("Email already in use", 409);
    }

    if (data.organizationId) {
      const org = await prisma.organization.findUnique({ where: { id: data.organizationId } });
      if (!org || org.isSystem) throw new AppError("Invalid organization", 400);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, name: true, role: true, isActive: true, createdAt: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "SUPER_ADMIN") throw new AppError("Cannot delete SUPER_ADMIN users", 403);

    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, email: true, name: true, isActive: true },
    });
  }
}

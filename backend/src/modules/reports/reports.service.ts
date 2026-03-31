import prisma from "../../config/database";

export class ReportsService {
  private orgFilter(organizationId?: string) {
    return organizationId ? { organizationId } : {};
  }

  private contactOrgFilter(organizationId?: string) {
    return organizationId ? { contact: { organizationId } } : {};
  }

  async getDashboardStats(organizationId?: string) {
    const orgWhere = this.orgFilter(organizationId);
    const contactOrgWhere = this.contactOrgFilter(organizationId);

    const [
      totalContacts,
      activeContacts,
      totalSegments,
      totalMessages,
      contactsByGender,
      contactsByStatus,
      contactsBySource,
      recentInteractions,
      contactGrowth,
      messagesByChannel,
    ] = await Promise.all([
      prisma.contact.count({ where: orgWhere }),
      prisma.contact.count({ where: { ...orgWhere, status: "ACTIVE" } }),
      prisma.segment.count({ where: orgWhere }),
      prisma.message.count({ where: contactOrgWhere }),
      prisma.contact.groupBy({
        by: ["gender"],
        where: orgWhere,
        _count: true,
      }),
      prisma.contact.groupBy({
        by: ["status"],
        where: orgWhere,
        _count: true,
      }),
      prisma.contact.groupBy({
        by: ["source"],
        where: { ...orgWhere, source: { not: null } },
        _count: true,
      }),
      prisma.interaction.findMany({
        where: contactOrgWhere,
        orderBy: { date: "desc" },
        take: 10,
        include: {
          contact: { select: { firstName: true, lastName: true } },
        },
      }),
      this.getContactGrowth(organizationId),
      prisma.message.groupBy({
        by: ["channel"],
        where: contactOrgWhere,
        _count: true,
      }),
    ]);

    return {
      overview: {
        totalContacts,
        activeContacts,
        inactiveContacts: totalContacts - activeContacts,
        totalSegments,
        totalMessages,
      },
      contactsByGender,
      contactsByStatus,
      contactsBySource,
      recentInteractions,
      contactGrowth,
      messagesByChannel,
    };
  }

  private async getContactGrowth(organizationId?: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orgWhere = this.orgFilter(organizationId);

    const contacts = await prisma.contact.findMany({
      where: {
        ...orgWhere,
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlyData: Record<string, number> = {};
    contacts.forEach((contact) => {
      const key = `${contact.createdAt.getFullYear()}-${String(contact.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });

    return Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
  }

  async getNotifications(organizationId?: string, limit = 20) {
    const orgWhere = this.orgFilter(organizationId);

    const notifications = await prisma.activityLog.findMany({
      where: orgWhere,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { name: true } },
      },
    });

    return notifications.map((n) => ({
      id: n.id,
      action: n.action,
      entityType: n.entityType,
      entityId: n.entityId,
      details: n.details as Record<string, any> | null,
      userName: n.user?.name || "Sistema",
      createdAt: n.createdAt,
    }));
  }

  async getEngagementReport(organizationId?: string, query: Record<string, string> = {}) {
    const dateFrom = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = query.to ? new Date(query.to) : new Date();
    const contactOrgWhere = this.contactOrgFilter(organizationId);

    const [interactions, messages] = await Promise.all([
      prisma.interaction.groupBy({
        by: ["type"],
        where: {
          ...contactOrgWhere,
          date: { gte: dateFrom, lte: dateTo },
        },
        _count: true,
      }),
      prisma.message.groupBy({
        by: ["channel", "direction"],
        where: {
          ...contactOrgWhere,
          sentAt: { gte: dateFrom, lte: dateTo },
        },
        _count: true,
      }),
    ]);

    return { dateRange: { from: dateFrom, to: dateTo }, interactions, messages };
  }

  async globalSearch(organizationId?: string, query: string = "") {
    if (!query || query.trim().length < 2) {
      return { contacts: [], segments: [], campaigns: [] };
    }

    const search = query.trim();
    const orgWhere = this.orgFilter(organizationId);

    const [contacts, segments, campaigns] = await Promise.all([
      prisma.contact.findMany({
        where: {
          ...orgWhere,
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.segment.findMany({
        where: {
          ...orgWhere,
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { contacts: true } },
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.campaign.findMany({
        where: {
          ...orgWhere,
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          status: true,
          channel: true,
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return { contacts, segments, campaigns };
  }
}

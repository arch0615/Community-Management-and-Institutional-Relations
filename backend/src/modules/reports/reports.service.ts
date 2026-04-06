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
      totalCampaigns,
      totalTags,
      totalInterests,
      contactsByGender,
      contactsByStatus,
      contactsBySource,
      recentInteractions,
      contactGrowth,
      messagesByChannel,
      contactsByLocation,
      topTags,
      topInterests,
      recentContacts,
    ] = await Promise.all([
      prisma.contact.count({ where: orgWhere }),
      prisma.contact.count({ where: { ...orgWhere, status: "ACTIVE" } }),
      prisma.segment.count({ where: orgWhere }),
      prisma.message.count({ where: contactOrgWhere }),
      prisma.campaign.count({ where: orgWhere }),
      prisma.tag.count({ where: orgWhere }),
      prisma.interest.count(),
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
        orderBy: { _count: { source: "desc" } },
        take: 15,
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
      prisma.contact.groupBy({
        by: ["location"],
        where: { ...orgWhere, location: { not: null } },
        _count: true,
        orderBy: { _count: { location: "desc" } },
        take: 15,
      }),
      this.getTopTags(organizationId),
      this.getTopInterests(organizationId),
      prisma.contact.findMany({
        where: orgWhere,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          location: true,
          createdAt: true,
          source: true,
        },
      }),
    ]);

    return {
      overview: {
        totalContacts,
        activeContacts,
        inactiveContacts: totalContacts - activeContacts,
        totalSegments,
        totalMessages,
        totalCampaigns,
        totalTags,
        totalInterests,
      },
      contactsByGender,
      contactsByStatus,
      contactsBySource,
      recentInteractions,
      contactGrowth,
      messagesByChannel,
      contactsByLocation,
      topTags,
      topInterests,
      recentContacts,
    };
  }

  private async getTopTags(organizationId?: string) {
    const orgWhere = organizationId ? { tag: { organizationId } } : {};
    const tagCounts = await prisma.contactTag.groupBy({
      by: ["tagId"],
      where: orgWhere,
      _count: true,
      orderBy: { _count: { tagId: "desc" } },
      take: 10,
    });

    const tagIds = tagCounts.map((t) => t.tagId);
    const tags = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true, name: true, color: true },
    });

    const tagMap = new Map(tags.map((t) => [t.id, t]));
    return tagCounts.map((tc) => ({
      name: tagMap.get(tc.tagId)?.name || "Unknown",
      color: tagMap.get(tc.tagId)?.color || "#6b7280",
      count: tc._count,
    }));
  }

  private async getTopInterests(organizationId?: string) {
    const orgWhere = organizationId
      ? { contact: { organizationId } }
      : {};
    const interestCounts = await prisma.contactInterest.groupBy({
      by: ["interestId"],
      where: orgWhere,
      _count: true,
      orderBy: { _count: { interestId: "desc" } },
      take: 10,
    });

    const interestIds = interestCounts.map((i) => i.interestId);
    const interests = await prisma.interest.findMany({
      where: { id: { in: interestIds } },
      select: { id: true, name: true },
    });

    const interestMap = new Map(interests.map((i) => [i.id, i]));
    return interestCounts.map((ic) => ({
      name: interestMap.get(ic.interestId)?.name || "Unknown",
      count: ic._count,
    }));
  }

  private async getContactGrowth(organizationId?: string) {
    const orgWhere = this.orgFilter(organizationId);

    const contacts = await prisma.contact.findMany({
      where: orgWhere,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by year-quarter for a cleaner timeline
    const quarterlyData: Record<string, number> = {};
    contacts.forEach((contact) => {
      const year = contact.createdAt.getFullYear();
      const quarter = Math.floor(contact.createdAt.getMonth() / 3) + 1;
      const key = `${year} Q${quarter}`;
      quarterlyData[key] = (quarterlyData[key] || 0) + 1;
    });

    // Cumulative growth
    let cumulative = 0;
    return Object.entries(quarterlyData).map(([period, count]) => {
      cumulative += count;
      return { month: period, count, cumulative };
    });
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

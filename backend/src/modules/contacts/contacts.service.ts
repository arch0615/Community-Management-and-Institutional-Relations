import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { getPagination, paginatedResponse } from "../../utils/pagination";
import { Prisma } from "@prisma/client";

export class ContactsService {
  async findAll(organizationId: string, query: Record<string, string>) {
    const pagination = getPagination(query);
    const where: Prisma.ContactWhereInput = { organizationId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.gender) {
      where.gender = query.gender as any;
    }

    if (query.location) {
      where.location = { contains: query.location, mode: "insensitive" };
    }

    if (query.tagId) {
      where.tags = { some: { tagId: query.tagId } };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          tags: { include: { tag: true } },
          interests: { include: { interest: true } },
          _count: { select: { interactions: true, messages: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return paginatedResponse(contacts, total, pagination);
  }

  async findById(id: string, organizationId: string) {
    const contact = await prisma.contact.findFirst({
      where: { id, organizationId },
      include: {
        tags: { include: { tag: true } },
        interests: { include: { interest: true } },
        interactions: { orderBy: { date: "desc" }, take: 20 },
        messages: { orderBy: { sentAt: "desc" }, take: 20 },
        segments: { include: { segment: true } },
      },
    });
    if (!contact) throw new AppError("Contact not found", 404);
    return contact;
  }

  async create(organizationId: string, data: any) {
    const contact = await prisma.contact.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        tags: { include: { tag: true } },
        interests: { include: { interest: true } },
      },
    });
    return contact;
  }

  async update(id: string, organizationId: string, data: any) {
    const existing = await prisma.contact.findFirst({ where: { id, organizationId } });
    if (!existing) throw new AppError("Contact not found", 404);

    const contact = await prisma.contact.update({
      where: { id },
      data,
      include: {
        tags: { include: { tag: true } },
        interests: { include: { interest: true } },
      },
    });
    return contact;
  }

  async delete(id: string, organizationId: string) {
    const existing = await prisma.contact.findFirst({ where: { id, organizationId } });
    if (!existing) throw new AppError("Contact not found", 404);
    await prisma.contact.delete({ where: { id } });
  }

  async addTag(contactId: string, tagId: string, organizationId: string) {
    const contact = await prisma.contact.findFirst({ where: { id: contactId, organizationId } });
    if (!contact) throw new AppError("Contact not found", 404);

    await prisma.contactTag.upsert({
      where: { contactId_tagId: { contactId, tagId } },
      create: { contactId, tagId },
      update: {},
    });
  }

  async removeTag(contactId: string, tagId: string, organizationId: string) {
    const contact = await prisma.contact.findFirst({ where: { id: contactId, organizationId } });
    if (!contact) throw new AppError("Contact not found", 404);

    await prisma.contactTag.delete({
      where: { contactId_tagId: { contactId, tagId } },
    });
  }

  async addInteraction(contactId: string, organizationId: string, data: any) {
    const contact = await prisma.contact.findFirst({ where: { id: contactId, organizationId } });
    if (!contact) throw new AppError("Contact not found", 404);

    return prisma.interaction.create({
      data: { ...data, contactId },
    });
  }

  async getStats(organizationId: string) {
    const [total, active, byGender, byStatus, recentContacts] = await Promise.all([
      prisma.contact.count({ where: { organizationId } }),
      prisma.contact.count({ where: { organizationId, status: "ACTIVE" } }),
      prisma.contact.groupBy({
        by: ["gender"],
        where: { organizationId },
        _count: true,
      }),
      prisma.contact.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: true,
      }),
      prisma.contact.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, firstName: true, lastName: true, createdAt: true },
      }),
    ]);

    return { total, active, byGender, byStatus, recentContacts };
  }

  async exportContacts(organizationId: string) {
    const contacts = await prisma.contact.findMany({
      where: { organizationId },
      include: {
        tags: { include: { tag: true } },
        interests: { include: { interest: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return contacts.map((c) => ({
      nombre: c.firstName,
      apellido: c.lastName || "",
      email: c.email || "",
      telefono: c.phone || "",
      genero: c.gender || "",
      ubicacion: c.location || "",
      estado: c.status,
      fuente: c.source || "",
      etiquetas: c.tags.map((t) => t.tag.name).join(", "),
      intereses: c.interests.map((i) => i.interest.name).join(", "),
      creado: c.createdAt.toISOString(),
    }));
  }

  async importContacts(organizationId: string, rows: any[]) {
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const firstName = (row.nombre || row.firstName || row.first_name || row.Nombre || "").trim();

      if (!firstName) {
        skipped++;
        errors.push(`Fila ${i + 2}: nombre vacío, omitida`);
        continue;
      }

      const data: any = {
        firstName,
        lastName: (row.apellido || row.lastName || row.last_name || row.Apellido || "").trim() || undefined,
        email: (row.email || row.Email || row.correo || row.Correo || "").trim() || undefined,
        phone: (row.telefono || row.phone || row.Phone || row.Telefono || row.Teléfono || "").trim() || undefined,
        gender: this.parseGender(row.genero || row.gender || row.Gender || row.Genero || row.Género || ""),
        location: (row.ubicacion || row.location || row.Location || row.Ubicacion || row.Ubicación || row.ciudad || row.Ciudad || "").trim() || undefined,
        source: (row.fuente || row.source || row.Source || row.Fuente || "CSV Import").trim(),
        status: "ACTIVE" as const,
        organizationId,
      };

      // Skip duplicates by email if email exists
      if (data.email) {
        const existing = await prisma.contact.findFirst({
          where: { email: data.email, organizationId },
        });
        if (existing) {
          skipped++;
          errors.push(`Fila ${i + 2}: email ${data.email} ya existe, omitida`);
          continue;
        }
      }

      await prisma.contact.create({ data });
      created++;
    }

    return { created, skipped, total: rows.length, errors: errors.slice(0, 10) };
  }

  private parseGender(value: string): any {
    const v = value.toUpperCase().trim();
    const map: Record<string, string> = {
      MALE: "MALE", MASCULINO: "MALE", M: "MALE", HOMBRE: "MALE",
      FEMALE: "FEMALE", FEMENINO: "FEMALE", F: "FEMALE", MUJER: "FEMALE",
      NON_BINARY: "NON_BINARY", "NO BINARIO": "NON_BINARY", NB: "NON_BINARY",
      OTHER: "OTHER", OTRO: "OTHER",
    };
    return map[v] || undefined;
  }
}

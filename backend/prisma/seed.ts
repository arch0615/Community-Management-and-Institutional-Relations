import {
  PrismaClient,
  UserRole,
  Gender,
  ContactStatus,
  ChannelType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ─── CSV Parsing ─────────────────────────────────────────────────

function parseCSV(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");

  // Detect delimiter: semicolon for Mailchimp export, comma for the rest
  const firstLine = raw.split("\n")[0];
  const delimiter = firstLine.includes(";") && !firstLine.includes(",") ? ";" : ",";

  const rows: Record<string, string>[] = [];
  const lines = splitCSVLines(raw);
  if (lines.length < 2) return rows;

  const headers = parseCSVLine(lines[0], delimiter);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line, delimiter);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]?.trim() || `col_${j}`] = (values[j] || "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

// ─── Phone Normalization ─────────────────────────────────────────

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, "");
  if (!digits || digits.replace(/\D/g, "").length < 7) return null;

  // Remove leading + if present for processing
  const hasPlus = digits.startsWith("+");
  const nums = digits.replace(/\+/g, "");

  // Chilean numbers
  if (nums.startsWith("569") && nums.length === 11) return `+${nums}`;
  if (nums.startsWith("56") && nums.length === 10) return `+569${nums.slice(2)}`;
  if (nums.startsWith("9") && nums.length === 9) return `+56${nums}`;
  if (nums.length === 8) return `+569${nums}`;

  if (hasPlus) return `+${nums}`;
  return `+56${nums}`;
}

// ─── Email Normalization ─────────────────────────────────────────

function normalizeEmail(raw: string): string | null {
  if (!raw) return null;
  const email = raw.trim().toLowerCase();
  if (!email.includes("@") || email === "no" || email === "sin correo" || email === "no tiene") return null;
  return email;
}

// ─── Comuna Normalization ────────────────────────────────────────

function normalizeComuna(raw: string): string | null {
  if (!raw) return null;
  let c = raw.trim();
  if (!c || c.toLowerCase() === "otra" || c.toLowerCase().includes("ninguna")) return null;

  // Common typo fixes
  const fixes: Record<string, string> = {
    "confepcion": "Concepción",
    "concepciin": "Concepción",
    "concepcin": "Concepción",
    "concepcion": "Concepción",
    "concepción": "Concepción",
    "conce": "Concepción",
    "ccp": "Concepción",
    "chiguyante": "Chiguayante",
    "chiguayante": "Chiguayante",
    "talchuano": "Talcahuano",
    "talcahuano": "Talcahuano",
    "thno": "Talcahuano",
    "san pedto de la paz": "San Pedro de la Paz",
    "san pedro de la paz": "San Pedro de la Paz",
    "sanpedro de la paz": "San Pedro de la Paz",
    "hualpen": "Hualpén",
    "hualpén": "Hualpén",
    "coronel": "Coronel",
    "penco": "Penco",
    "tomé": "Tomé",
    "tome": "Tomé",
    "lota": "Lota",
    "florida": "Florida",
    "hualqui": "Hualqui",
    "santa juana": "Santa Juana",
  };

  const key = c.toLowerCase().replace(/\s+/g, " ").trim();
  return fixes[key] || c.charAt(0).toUpperCase() + c.slice(1).trim();
}

// ─── Event → Interest Mapping ────────────────────────────────────

const EVENT_INTEREST_MAP: Record<string, string> = {
  "CICLO DE HISTORIA": "Historia",
  "CHILE EN LA ERA": "Historia",
  "LA GUERRA FRIA": "Historia",
  "LA GUERRA FRÍA": "Historia",
  "LA REVOLUCIÓN BOLCHEVIQUE": "Historia",
  "LA REVOLUCION BOLCHEVIQUE": "Historia",
  "REVOLUCIÓN CUBANA": "Historia",
  "REVOLUCION CUBANA": "Historia",
  "HISTORIA POLÍTICA": "Historia",
  "HISTORIA POLITICA": "Historia",
  "SORTEO LIBRO": "Historia",
  "PRESENTACIÓN LIBRO": "Historia",
  "PRESENTACION LIBRO": "Historia",
  "CONTINGENCIA POLÍTICA": "Política",
  "CONTINGENCIA POLITICA": "Política",
  "HABLEMOS DE ACTUALIDAD": "Política",
  "ELECCIONES": "Política",
  "DEBAJE": "Política",
  "MARXISMO": "Ideología",
  "Anarquismo": "Ideología",
  "SOCIAL DEMOCRACIA": "Ideología",
  "NACIÓN Y NACIONALISMO": "Ideología",
  "NACION Y NACIONALISMO": "Ideología",
  "IDEOLOGÍA DE GÉNERO": "Ideología",
  "IDEOLOGIA DE GENERO": "Ideología",
  "LIDERAZGOS HISTÓRICOS": "Liderazgo",
  "LIDERAZGOS HISTORICOS": "Liderazgo",
  "INFÓRMATE": "Constitución",
  "INFORMATE": "Constitución",
  "RECHAZO SUB-40": "Constitución",
  "PLEBISCITO": "Constitución",
  "TRATADOS": "Constitución",
  "EDUCACIÓN": "Educación",
  "EDUCACION": "Educación",
  "REDCOL": "Educación",
  "Mitin Edu": "Educación",
  "PTT Universitarios": "Educación",
  "POBREZA": "Economía",
  "Red de mujeres": "Género",
  "Encuesta _Red de mujeres": "Género",
  "Feminismo": "Género",
  "5K POR LA VIDA": "Deporte",
  "Trekking": "Deporte",
  "TALLER ACTIVISMO": "Activismo",
  "OPERATIVOS FERIAS": "Activismo",
  "VOLUNTARIOS": "Voluntariado",
  "Café": "Formación",
  "Cafe": "Formación",
  "Último Café": "Formación",
  "Escuchemos": "Consulta Ciudadana",
  "Habla Biobío": "Consulta Ciudadana",
  "Habla Biobio": "Consulta Ciudadana",
  "VELATÓN": "Seguridad",
  "VELATON": "Seguridad",
  "Levantamiento": "Reclutamiento",
  "Nueva Derecha": "Reclutamiento",
  "Recibe información": "Reclutamiento",
  "Recibe informacion": "Reclutamiento",
};

function getInterestForEvent(filename: string): string {
  for (const [key, interest] of Object.entries(EVENT_INTEREST_MAP)) {
    if (filename.includes(key)) return interest;
  }
  return "General";
}

// ─── Event → Tag Mapping ─────────────────────────────────────────

function getTagForEvent(filename: string): string {
  if (filename.includes("Café") || filename.includes("Cafe")) return "Café";
  if (filename.includes("CICLO DE HISTORIA")) return "Ciclo de Historia";
  if (filename.includes("LIDERAZGOS HISTÓRICOS") || filename.includes("LIDERAZGOS HISTORICOS")) return "Liderazgos Históricos";
  if (filename.includes("TALLER")) return "Taller";
  if (filename.includes("DEBAJE") || filename.includes("DEBATE")) return "Debate";
  if (filename.includes("FERIA") || filename.includes("Feria")) return "Feria";
  if (filename.includes("SORTEO")) return "Sorteo";
  if (filename.includes("VELATÓN") || filename.includes("VELATON")) return "Velatón";
  if (filename.includes("Mitin")) return "Mitin";
  if (filename.includes("5K")) return "Carrera";
  if (filename.includes("Trekking")) return "Trekking";
  if (filename.includes("REUNIÓN") || filename.includes("REUNION")) return "Reunión";
  if (filename.includes("Encuesta")) return "Encuesta";
  if (filename.includes("PRESENTACIÓN") || filename.includes("PRESENTACION")) return "Presentación Libro";
  if (filename.includes("OPERATIVOS")) return "Operativo Terreno";
  if (filename.includes("VOLUNTARIOS")) return "Voluntariado";
  if (filename.includes("Escuchemos") || filename.includes("Habla Biob")) return "Consulta Ciudadana";
  if (filename.includes("PTT")) return "Puerta a Puerta";
  if (filename.includes("INFÓRMATE") || filename.includes("INFORMATE")) return "Sesión Informativa";
  if (filename.includes("Levantamiento") || filename.includes("Nueva Derecha") || filename.includes("Recibe inform")) return "Reclutamiento";
  if (filename.includes("Red de mujeres")) return "Inscripción Red";
  return "Charla";
}

// ─── Extract Contact Fields ──────────────────────────────────────

interface ExtractedContact {
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: Gender | null;
  location: string | null;
  source: string;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  birthDate: string | null;
  registeredAt: string | null;
}

function extractContact(row: Record<string, string>, filename: string): ExtractedContact | null {
  const keys = Object.keys(row);
  const find = (patterns: string[]) => {
    for (const p of patterns) {
      const key = keys.find((k) => k.toLowerCase().includes(p.toLowerCase()));
      if (key && row[key]) return row[key].trim();
    }
    return null;
  };

  // Name extraction
  let firstName = find(["Nombre y apellido", "Nombre y Apellido"]);
  let lastName: string | null = null;

  if (firstName && (firstName.includes(" ") || !find(["Apellido"]))) {
    // Combined name field — split on first space
    const parts = firstName.split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(" ") || null;
  } else {
    firstName = find(["Nombre"]) || find(["First Name"]);
    lastName = find(["Apellido", "Last Name"]);
  }

  if (!firstName) return null;

  const email = normalizeEmail(find(["Correo electrónico", "Correo electronico", "correo", "Email", "Mail"]) || "");
  const phone = normalizePhone(find(["Teléfono", "Telefono", "Phone", "Celular", "celular"]) || "");

  if (!email && !phone) return null;

  const location = normalizeComuna(find(["Comuna", "comuna"]) || "");
  const registeredAt = find(["Marca temporal"]);

  // Gender
  let gender: Gender | null = null;
  const sexField = find(["Sexo"]);
  if (sexField) {
    const s = sexField.toLowerCase();
    if (s === "mujer" || s === "femenino") gender = Gender.FEMALE;
    else if (s === "hombre" || s === "masculino") gender = Gender.MALE;
  }

  // Social media
  const combinedSocial = find(["Nombre de usuario en redes sociales"]);
  let instagram = find(["Instagram"]) || null;
  let twitter = find(["Twitter"]) || null;
  let facebook = find(["Facebook"]) || null;

  if (combinedSocial && !instagram && !twitter) {
    // Try to parse combined field
    const lower = combinedSocial.toLowerCase();
    if (lower !== "no utilizo" && lower !== "no tengo" && lower !== "no" && combinedSocial.length > 1) {
      instagram = combinedSocial;
    }
  }

  // Clean social media values
  const cleanSocial = (v: string | null) => {
    if (!v) return null;
    const trimmed = v.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed || lower === "no" || lower === "no tengo" || lower === "no uso" || lower === "no utilizo" || lower === "x" || lower === "a" || lower === "si") return null;
    return trimmed;
  };
  instagram = cleanSocial(instagram);
  twitter = cleanSocial(twitter);
  facebook = cleanSocial(facebook);

  const birthDate = find(["Fecha de nacimiento", "fecha de nacimiento", "Birthday"]) || null;

  return {
    firstName: firstName.trim(),
    lastName: lastName?.trim() || null,
    email,
    phone,
    gender,
    location,
    source: filename.replace(".csv", ""),
    instagram,
    twitter,
    facebook,
    birthDate,
    registeredAt,
  };
}

// ─── Main Seed Function ──────────────────────────────────────────

async function main() {
  console.log("Seeding database with real client data...\n");

  // ─── Clean existing data ─────────────────────────────────
  await prisma.activityLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.segmentContact.deleteMany();
  await prisma.contactTag.deleteMany();
  await prisma.contactInterest.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log("Cleaned existing data.");

  // ─── System Organization + Super Admin ──────────────────
  const systemOrg = await prisma.organization.create({
    data: { name: "System", slug: "system", isSystem: true },
  });

  const superAdminPassword = await bcrypt.hash("SuperAdmin@1234", 12);
  await prisma.user.create({
    data: {
      email: "superadmin@system.local",
      password: superAdminPassword,
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      organizationId: systemOrg.id,
    },
  });

  console.log("Created Super Admin:");
  console.log("  SUPER_ADMIN → superadmin@system.local / SuperAdmin@1234");

  // ─── Organizations (from client data) ───────────────────
  const org1 = await prisma.organization.create({
    data: { name: "Juntos +Libres", slug: "juntos-mas-libres" },
  });

  const org2 = await prisma.organization.create({
    data: { name: "Red de Mujeres Formación y Acción", slug: "red-mujeres-formacion-accion" },
  });

  console.log("Created 2 organizations: Juntos +Libres, Red de Mujeres Formación y Acción");

  // ─── Demo Users ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Demo@1234", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      password: hashedPassword,
      name: "Carlos Rodriguez",
      role: UserRole.ADMIN,
      organizationId: org1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "manager@demo.com",
      password: hashedPassword,
      name: "Maria Fernandez",
      role: UserRole.MANAGER,
      organizationId: org1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "member@demo.com",
      password: hashedPassword,
      name: "Luis Gomez",
      role: UserRole.MEMBER,
      organizationId: org1.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@redmujeres.org",
      password: hashedPassword,
      name: "Ana Torres",
      role: UserRole.ADMIN,
      organizationId: org2.id,
    },
  });

  console.log("Created 4 demo users:");
  console.log("  ADMIN   → admin@demo.com         / Demo@1234");
  console.log("  MANAGER → manager@demo.com        / Demo@1234");
  console.log("  MEMBER  → member@demo.com          / Demo@1234");
  console.log("  ADMIN   → admin@redmujeres.org     / Demo@1234");

  // ─── Interests (from event topics) ──────────────────────
  const interestNames = [
    "Historia",
    "Política",
    "Ideología",
    "Liderazgo",
    "Constitución",
    "Educación",
    "Economía",
    "Género",
    "Deporte",
    "Activismo",
    "Voluntariado",
    "Formación",
    "Consulta Ciudadana",
    "Seguridad",
    "Reclutamiento",
    "General",
  ];

  const interestMap: Record<string, string> = {};
  for (const name of interestNames) {
    const interest = await prisma.interest.create({ data: { name } });
    interestMap[name] = interest.id;
  }

  console.log(`Created ${interestNames.length} interests.`);

  // ─── Tags (from event types) ────────────────────────────
  const tagDefs: Array<{ name: string; color: string }> = [
    { name: "Café", color: "#92400e" },
    { name: "Ciclo de Historia", color: "#7c3aed" },
    { name: "Liderazgos Históricos", color: "#6366f1" },
    { name: "Taller", color: "#059669" },
    { name: "Debate", color: "#dc2626" },
    { name: "Feria", color: "#f59e0b" },
    { name: "Sorteo", color: "#ec4899" },
    { name: "Velatón", color: "#1f2937" },
    { name: "Mitin", color: "#ef4444" },
    { name: "Carrera", color: "#10b981" },
    { name: "Trekking", color: "#22c55e" },
    { name: "Reunión", color: "#3b82f6" },
    { name: "Encuesta", color: "#8b5cf6" },
    { name: "Presentación Libro", color: "#a855f7" },
    { name: "Operativo Terreno", color: "#f97316" },
    { name: "Voluntariado", color: "#14b8a6" },
    { name: "Consulta Ciudadana", color: "#0ea5e9" },
    { name: "Puerta a Puerta", color: "#84cc16" },
    { name: "Sesión Informativa", color: "#06b6d4" },
    { name: "Reclutamiento", color: "#e11d48" },
    { name: "Inscripción Red", color: "#d946ef" },
    { name: "Charla", color: "#6b7280" },
  ];

  const tagMap: Record<string, string> = {};
  for (const t of tagDefs) {
    const tag = await prisma.tag.create({
      data: { name: t.name, color: t.color, organizationId: org1.id },
    });
    tagMap[t.name] = tag.id;
  }

  // Also create relevant tags for org2
  const org2Tags = ["Encuesta", "Carrera", "Trekking", "Inscripción Red"];
  const org2TagMap: Record<string, string> = {};
  for (const name of org2Tags) {
    const def = tagDefs.find((t) => t.name === name);
    const tag = await prisma.tag.create({
      data: { name, color: def?.color || "#6b7280", organizationId: org2.id },
    });
    org2TagMap[name] = tag.id;
  }

  console.log(`Created ${tagDefs.length} tags for org1, ${org2Tags.length} for org2.`);

  // ─── Channels (from client data) ────────────────────────
  await Promise.all([
    prisma.channel.create({
      data: { type: ChannelType.WHATSAPP, name: "Comunidad Juntos +Libres", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.INSTAGRAM, name: "Instagram", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.FACEBOOK_MESSENGER, name: "Facebook", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.EMAIL, name: "Correo Electrónico", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.SMS, name: "SMS", isActive: false, organizationId: org1.id },
    }),
  ]);

  console.log("Created 5 channels.");

  // ─── Parse CSV Files & Deduplicate Contacts ─────────────
  const dataDir = path.resolve(__dirname, "../../data");
  const folder1 = path.join(dataDir, "1v004-bz97PypejhFVtZV0aONQ_Cg5iXP");
  const folder2 = path.join(dataDir, "1Jza44Xvl2R6OYms9M7y04BRoRIDFHmWf");

  // Files that belong to Red de Mujeres org
  const org2FilePatterns = [
    "Red de mujeres",
    "Encuesta _Red de mujeres",
    "Feminismo",
  ];

  const isOrg2File = (filename: string) =>
    org2FilePatterns.some((p) => filename.includes(p));

  // Collect all CSV files
  const csvFiles: Array<{ filePath: string; filename: string }> = [];
  const seenFilenames = new Set<string>();

  for (const folder of [folder1, folder2]) {
    if (!fs.existsSync(folder)) continue;
    const files = fs.readdirSync(folder).filter((f) => f.endsWith(".csv"));
    for (const f of files) {
      if (seenFilenames.has(f)) continue; // skip duplicates across folders
      seenFilenames.add(f);
      csvFiles.push({ filePath: path.join(folder, f), filename: f });
    }
  }

  console.log(`Found ${csvFiles.length} unique CSV files.`);

  // Deduplicate contacts by email (primary) or phone (secondary)
  interface ContactRecord {
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    gender: Gender | null;
    location: string | null;
    source: string;
    instagram: string | null;
    twitter: string | null;
    facebook: string | null;
    birthDate: string | null;
    events: string[];
    interests: Set<string>;
    tags: Set<string>;
    orgId: string;
    earliestDate: Date | null;
  }

  const contactsByEmail = new Map<string, ContactRecord>();
  const contactsByPhone = new Map<string, ContactRecord>();

  for (const { filePath, filename } of csvFiles) {
    const rows = parseCSV(filePath);
    const interest = getInterestForEvent(filename);
    const tag = getTagForEvent(filename);
    const fileOrg = isOrg2File(filename) ? org2.id : org1.id;

    for (const row of rows) {
      const extracted = extractContact(row, filename);
      if (!extracted) continue;

      const key = extracted.email || extracted.phone;
      if (!key) continue;

      const existing = extracted.email
        ? contactsByEmail.get(extracted.email)
        : extracted.phone
          ? contactsByPhone.get(extracted.phone)
          : null;

      let registeredDate: Date | null = null;
      if (extracted.registeredAt) {
        try {
          registeredDate = new Date(extracted.registeredAt);
          if (isNaN(registeredDate.getTime())) registeredDate = null;
        } catch {
          registeredDate = null;
        }
      }

      if (existing) {
        // Merge: add event, interest, tag; fill in missing fields
        existing.events.push(filename);
        existing.interests.add(interest);
        existing.tags.add(tag);
        if (!existing.lastName && extracted.lastName) existing.lastName = extracted.lastName;
        if (!existing.location && extracted.location) existing.location = extracted.location;
        if (!existing.gender && extracted.gender) existing.gender = extracted.gender;
        if (!existing.phone && extracted.phone) existing.phone = extracted.phone;
        if (!existing.email && extracted.email) existing.email = extracted.email;
        if (!existing.instagram && extracted.instagram) existing.instagram = extracted.instagram;
        if (!existing.twitter && extracted.twitter) existing.twitter = extracted.twitter;
        if (!existing.facebook && extracted.facebook) existing.facebook = extracted.facebook;
        if (!existing.birthDate && extracted.birthDate) existing.birthDate = extracted.birthDate;
        if (registeredDate && (!existing.earliestDate || registeredDate < existing.earliestDate)) {
          existing.earliestDate = registeredDate;
        }
      } else {
        const record: ContactRecord = {
          firstName: extracted.firstName,
          lastName: extracted.lastName,
          email: extracted.email,
          phone: extracted.phone,
          gender: extracted.gender,
          location: extracted.location,
          source: extracted.source,
          instagram: extracted.instagram,
          twitter: extracted.twitter,
          facebook: extracted.facebook,
          birthDate: extracted.birthDate,
          events: [filename],
          interests: new Set([interest]),
          tags: new Set([tag]),
          orgId: fileOrg,
          earliestDate: registeredDate,
        };

        if (extracted.email) contactsByEmail.set(extracted.email, record);
        if (extracted.phone) {
          if (!extracted.email) {
            contactsByPhone.set(extracted.phone, record);
          } else {
            // Also index by phone for future dedup
            contactsByPhone.set(extracted.phone, record);
          }
        }
      }
    }
  }

  // Merge phone-only contacts that might match email contacts
  const allContacts = new Map<string, ContactRecord>();
  for (const [email, record] of contactsByEmail) {
    allContacts.set(email, record);
  }
  for (const [phone, record] of contactsByPhone) {
    if (record.email && allContacts.has(record.email)) continue; // already tracked by email
    allContacts.set(phone, record);
  }

  console.log(`Deduplicated to ${allContacts.size} unique contacts.`);

  // ─── Insert Contacts ────────────────────────────────────
  let contactCount = 0;
  const contactIds: Array<{ id: string; interests: Set<string>; tags: Set<string>; orgId: string }> = [];

  for (const [, record] of allContacts) {
    const metadata: Record<string, unknown> = {};
    if (record.instagram) metadata.instagram = record.instagram;
    if (record.twitter) metadata.twitter = record.twitter;
    if (record.facebook) metadata.facebook = record.facebook;
    if (record.birthDate) metadata.birthDate = record.birthDate;
    if (record.events.length > 0) metadata.events = record.events.map((e) => e.replace(".csv", ""));

    const contact = await prisma.contact.create({
      data: {
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        phone: record.phone,
        gender: record.gender,
        location: record.location,
        status: ContactStatus.ACTIVE,
        source: record.source,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        organizationId: record.orgId,
        createdAt: record.earliestDate || undefined,
      },
    });

    contactIds.push({
      id: contact.id,
      interests: record.interests,
      tags: record.tags,
      orgId: record.orgId,
    });
    contactCount++;
  }

  console.log(`Created ${contactCount} contacts.`);

  // ─── Assign Interests to Contacts ───────────────────────
  let interestAssignments = 0;
  for (const { id, interests } of contactIds) {
    for (const interestName of interests) {
      const interestId = interestMap[interestName];
      if (interestId) {
        await prisma.contactInterest.create({
          data: { contactId: id, interestId },
        });
        interestAssignments++;
      }
    }
  }

  console.log(`Created ${interestAssignments} contact-interest assignments.`);

  // ─── Assign Tags to Contacts ────────────────────────────
  let tagAssignments = 0;
  for (const { id, tags, orgId } of contactIds) {
    for (const tagName of tags) {
      const tMap = orgId === org2.id ? org2TagMap : tagMap;
      const tagId = tMap[tagName];
      if (tagId) {
        await prisma.contactTag.create({
          data: { contactId: id, tagId },
        });
        tagAssignments++;
      }
    }
  }

  console.log(`Created ${tagAssignments} contact-tag assignments.`);

  // ─── Segments (based on real data patterns) ─────────────
  const segments = [
    {
      name: "Contactos Concepción",
      description: "Contactos ubicados en Concepción.",
      filters: { location: "Concepción", status: "ACTIVE" },
      orgId: org1.id,
    },
    {
      name: "Asistentes Talleres",
      description: "Personas que han asistido a talleres de formación política.",
      filters: { tags: ["Taller"], status: "ACTIVE" },
      orgId: org1.id,
    },
    {
      name: "Participantes Historia",
      description: "Contactos interesados en el ciclo de historia y charlas históricas.",
      filters: { interests: ["Historia"], status: "ACTIVE" },
      orgId: org1.id,
    },
    {
      name: "Voluntarios Biobío",
      description: "Personas inscritas como voluntarios en la región del Biobío.",
      filters: { tags: ["Voluntariado"], status: "ACTIVE" },
      orgId: org1.id,
    },
    {
      name: "Red de Mujeres",
      description: "Contactos inscritos en la Red de Mujeres Formación y Acción.",
      filters: { status: "ACTIVE" },
      orgId: org2.id,
    },
    {
      name: "Participantes Deporte",
      description: "Contactos que participaron en eventos deportivos (5K, Trekking).",
      filters: { interests: ["Deporte"], status: "ACTIVE" },
      orgId: org1.id,
    },
  ];

  for (const seg of segments) {
    await prisma.segment.create({
      data: {
        name: seg.name,
        description: seg.description,
        filters: seg.filters,
        isActive: true,
        organizationId: seg.orgId,
      },
    });
  }

  console.log(`Created ${segments.length} segments.`);

  // ─── Summary ─────────────────────────────────────────────
  console.log("\n========================================");
  console.log("  Seed completed successfully!");
  console.log("========================================\n");
  console.log("Data summary:");
  console.log("  Organizations:     3 (1 system + Juntos +Libres + Red de Mujeres)");
  console.log("  Users:             5 (1 super admin + 4 demo)");
  console.log(`  Contacts:          ${contactCount}`);
  console.log(`  Interests:         ${interestNames.length}`);
  console.log(`  Tags:              ${tagDefs.length} (org1) + ${org2Tags.length} (org2)`);
  console.log("  Channels:          5");
  console.log(`  Interest assigns:  ${interestAssignments}`);
  console.log(`  Tag assigns:       ${tagAssignments}`);
  console.log(`  Segments:          ${segments.length}`);
  console.log("\nDemo accounts:");
  console.log("┌─────────────┬──────────────────────────────┬──────────────────┐");
  console.log("│ Rol         │ Correo                       │ Contraseña       │");
  console.log("├─────────────┼──────────────────────────────┼──────────────────┤");
  console.log("│ SUPER_ADMIN │ superadmin@system.local       │ SuperAdmin@1234  │");
  console.log("│ ADMIN       │ admin@demo.com               │ Demo@1234        │");
  console.log("│ MANAGER     │ manager@demo.com             │ Demo@1234        │");
  console.log("│ MEMBER      │ member@demo.com              │ Demo@1234        │");
  console.log("│ ADMIN       │ admin@redmujeres.org          │ Demo@1234        │");
  console.log("└─────────────┴──────────────────────────────┴──────────────────┘");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

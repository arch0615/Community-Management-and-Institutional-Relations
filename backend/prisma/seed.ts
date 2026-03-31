import { PrismaClient, UserRole, Gender, ContactStatus, InteractionType, ChannelType, MessageDirection, MessageStatus, CampaignStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with test data...\n");

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
    data: {
      name: "System",
      slug: "system",
      isSystem: true,
    },
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

  // ─── Organizations ───────────────────────────────────────
  const org1 = await prisma.organization.create({
    data: {
      name: "Fundacion Avanza",
      slug: "fundacion-avanza",
      logo: null,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Red Comunitaria del Sur",
      slug: "red-comunitaria-sur",
      logo: null,
    },
  });

  console.log("Created 2 organizations.");

  // ─── Users ───────────────────────────────────────────────
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

  const managerUser = await prisma.user.create({
    data: {
      email: "manager@demo.com",
      password: hashedPassword,
      name: "Maria Fernandez",
      role: UserRole.MANAGER,
      organizationId: org1.id,
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: "member@demo.com",
      password: hashedPassword,
      name: "Luis Gomez",
      role: UserRole.MEMBER,
      organizationId: org1.id,
    },
  });

  const org2Admin = await prisma.user.create({
    data: {
      email: "admin@redcomunitaria.org",
      password: hashedPassword,
      name: "Ana Torres",
      role: UserRole.ADMIN,
      organizationId: org2.id,
    },
  });

  console.log("Created 4 users.");
  console.log("  ADMIN   → admin@demo.com            / Demo@1234");
  console.log("  MANAGER → manager@demo.com          / Demo@1234");
  console.log("  MEMBER  → member@demo.com           / Demo@1234");
  console.log("  ADMIN   → admin@redcomunitaria.org  / Demo@1234");

  // ─── Tags ────────────────────────────────────────────────
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "VIP", color: "#ef4444", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Donante", color: "#f59e0b", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Voluntario", color: "#10b981", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Lider Comunitario", color: "#6366f1", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Beneficiario", color: "#8b5cf6", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Aliado Institucional", color: "#3b82f6", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Prensa", color: "#ec4899", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Gobierno", color: "#14b8a6", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "Empresa Privada", color: "#f97316", organizationId: org1.id } }),
    prisma.tag.create({ data: { name: "ONG", color: "#84cc16", organizationId: org1.id } }),
  ]);

  // Tags for org2
  await Promise.all([
    prisma.tag.create({ data: { name: "VIP", color: "#ef4444", organizationId: org2.id } }),
    prisma.tag.create({ data: { name: "Donante", color: "#f59e0b", organizationId: org2.id } }),
    prisma.tag.create({ data: { name: "Voluntario", color: "#10b981", organizationId: org2.id } }),
    prisma.tag.create({ data: { name: "Lider Comunitario", color: "#6366f1", organizationId: org2.id } }),
    prisma.tag.create({ data: { name: "Beneficiario", color: "#8b5cf6", organizationId: org2.id } }),
  ]);

  console.log("Created 15 tags (10 org1, 5 org2).");

  // ─── Interests ───────────────────────────────────────────
  const interests = await Promise.all([
    prisma.interest.create({ data: { name: "Educacion" } }),
    prisma.interest.create({ data: { name: "Salud" } }),
    prisma.interest.create({ data: { name: "Medio Ambiente" } }),
    prisma.interest.create({ data: { name: "Derechos Humanos" } }),
    prisma.interest.create({ data: { name: "Cultura" } }),
    prisma.interest.create({ data: { name: "Deporte" } }),
    prisma.interest.create({ data: { name: "Tecnologia" } }),
    prisma.interest.create({ data: { name: "Emprendimiento" } }),
    prisma.interest.create({ data: { name: "Voluntariado" } }),
    prisma.interest.create({ data: { name: "Politica Publica" } }),
    prisma.interest.create({ data: { name: "Genero" } }),
    prisma.interest.create({ data: { name: "Juventud" } }),
    prisma.interest.create({ data: { name: "Adulto Mayor" } }),
    prisma.interest.create({ data: { name: "Discapacidad" } }),
    prisma.interest.create({ data: { name: "Vivienda" } }),
  ]);

  console.log(`Created ${interests.length} interests.`);

  // ─── Contacts (Org 1 — 60 contacts) ─────────────────────
  const contactsData: Array<{
    firstName: string; lastName: string; email: string; phone: string;
    gender: Gender; location: string; status: ContactStatus; source: string;
  }> = [
    { firstName: "Alejandra", lastName: "Martinez", email: "alejandra.martinez@gmail.com", phone: "+573001234567", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Roberto", lastName: "Sanchez", email: "roberto.sanchez@outlook.com", phone: "+573012345678", gender: Gender.MALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Patricia", lastName: "Lopez", email: "patricia.lopez@yahoo.com", phone: "+573023456789", gender: Gender.FEMALE, location: "Cali", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Jorge", lastName: "Hernandez", email: "jorge.h@gmail.com", phone: "+573034567890", gender: Gender.MALE, location: "Barranquilla", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Carmen", lastName: "Diaz", email: "carmen.diaz@hotmail.com", phone: "+573045678901", gender: Gender.FEMALE, location: "Cartagena", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Fernando", lastName: "Ruiz", email: "fernando.ruiz@gmail.com", phone: "+573056789012", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Lucia", lastName: "Morales", email: "lucia.morales@outlook.com", phone: "+573067890123", gender: Gender.FEMALE, location: "Medellin", status: ContactStatus.INACTIVE, source: "Instagram" },
    { firstName: "Diego", lastName: "Castro", email: "diego.castro@gmail.com", phone: "+573078901234", gender: Gender.MALE, location: "Bucaramanga", status: ContactStatus.ACTIVE, source: "Facebook" },
    { firstName: "Valentina", lastName: "Ortiz", email: "valentina.ortiz@yahoo.com", phone: "+573089012345", gender: Gender.FEMALE, location: "Pereira", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Andres", lastName: "Jimenez", email: "andres.j@hotmail.com", phone: "+573090123456", gender: Gender.MALE, location: "Manizales", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Sofia", lastName: "Ramirez", email: "sofia.ramirez@gmail.com", phone: "+573101234567", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Miguel", lastName: "Torres", email: "miguel.torres@outlook.com", phone: "+573112345678", gender: Gender.MALE, location: "Cali", status: ContactStatus.ARCHIVED, source: "Redes sociales" },
    { firstName: "Isabella", lastName: "Flores", email: "isabella.flores@gmail.com", phone: "+573123456789", gender: Gender.FEMALE, location: "Barranquilla", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "David", lastName: "Vargas", email: "david.vargas@yahoo.com", phone: "+573134567890", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Camila", lastName: "Mendoza", email: "camila.m@hotmail.com", phone: "+573145678901", gender: Gender.FEMALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Santiago", lastName: "Guerrero", email: "santiago.g@gmail.com", phone: "+573156789012", gender: Gender.MALE, location: "Cartagena", status: ContactStatus.INACTIVE, source: "Instagram" },
    { firstName: "Mariana", lastName: "Pena", email: "mariana.pena@outlook.com", phone: "+573167890123", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Nicolas", lastName: "Cardenas", email: "nicolas.c@gmail.com", phone: "+573178901234", gender: Gender.MALE, location: "Cucuta", status: ContactStatus.ACTIVE, source: "Facebook" },
    { firstName: "Daniela", lastName: "Rojas", email: "daniela.rojas@yahoo.com", phone: "+573189012345", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Sebastian", lastName: "Reyes", email: "sebastian.r@hotmail.com", phone: "+573190123456", gender: Gender.MALE, location: "Medellin", status: ContactStatus.BLOCKED, source: "WhatsApp" },
    { firstName: "Laura", lastName: "Aguilar", email: "laura.aguilar@gmail.com", phone: "+573201234567", gender: Gender.FEMALE, location: "Cali", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Juan Pablo", lastName: "Herrera", email: "juanp.herrera@outlook.com", phone: "+573212345678", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Gabriela", lastName: "Romero", email: "gabriela.r@gmail.com", phone: "+573223456789", gender: Gender.FEMALE, location: "Barranquilla", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Felipe", lastName: "Navarro", email: "felipe.navarro@yahoo.com", phone: "+573234567890", gender: Gender.MALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Andrea", lastName: "Silva", email: "andrea.silva@hotmail.com", phone: "+573245678901", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.INACTIVE, source: "Instagram" },
    { firstName: "Ricardo", lastName: "Mejia", email: "ricardo.mejia@gmail.com", phone: "+573256789012", gender: Gender.MALE, location: "Pereira", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Natalia", lastName: "Cruz", email: "natalia.cruz@outlook.com", phone: "+573267890123", gender: Gender.FEMALE, location: "Manizales", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Oscar", lastName: "Gutierrez", email: "oscar.g@gmail.com", phone: "+573278901234", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Facebook" },
    { firstName: "Paula", lastName: "Vega", email: "paula.vega@yahoo.com", phone: "+573289012345", gender: Gender.FEMALE, location: "Cali", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Mateo", lastName: "Arias", email: "mateo.arias@hotmail.com", phone: "+573290123456", gender: Gender.MALE, location: "Bucaramanga", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Juliana", lastName: "Castano", email: "juliana.c@gmail.com", phone: "+573301234567", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Emmanuel", lastName: "Duarte", email: "emmanuel.d@outlook.com", phone: "+573312345678", gender: Gender.MALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Adriana", lastName: "Pineda", email: "adriana.pineda@gmail.com", phone: "+573323456789", gender: Gender.FEMALE, location: "Cartagena", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Tomas", lastName: "Acosta", email: "tomas.acosta@yahoo.com", phone: "+573334567890", gender: Gender.MALE, location: "Barranquilla", status: ContactStatus.INACTIVE, source: "Instagram" },
    { firstName: "Monica", lastName: "Rios", email: "monica.rios@hotmail.com", phone: "+573345678901", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Alex", lastName: "Quintero", email: "alex.quintero@gmail.com", phone: "+573356789012", gender: Gender.NON_BINARY, location: "Bogota", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Carolina", lastName: "Ospina", email: "carolina.o@outlook.com", phone: "+573367890123", gender: Gender.FEMALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "Facebook" },
    { firstName: "Esteban", lastName: "Zapata", email: "esteban.z@gmail.com", phone: "+573378901234", gender: Gender.MALE, location: "Cali", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Paola", lastName: "Suarez", email: "paola.suarez@yahoo.com", phone: "+573389012345", gender: Gender.FEMALE, location: "Pereira", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Javier", lastName: "Marin", email: "javier.marin@hotmail.com", phone: "+573390123456", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Catalina", lastName: "Lozano", email: "catalina.l@gmail.com", phone: "+573401234567", gender: Gender.FEMALE, location: "Manizales", status: ContactStatus.ARCHIVED, source: "Referido" },
    { firstName: "Cristian", lastName: "Becerra", email: "cristian.b@outlook.com", phone: "+573412345678", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Sara", lastName: "Trujillo", email: "sara.trujillo@gmail.com", phone: "+573423456789", gender: Gender.FEMALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "Instagram" },
    { firstName: "Daniel", lastName: "Parra", email: "daniel.parra@yahoo.com", phone: "+573434567890", gender: Gender.MALE, location: "Cali", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Vanessa", lastName: "Londono", email: "vanessa.l@hotmail.com", phone: "+573445678901", gender: Gender.FEMALE, location: "Barranquilla", status: ContactStatus.ACTIVE, source: "Facebook" },
    { firstName: "Gabriel", lastName: "Montoya", email: "gabriel.m@gmail.com", phone: "+573456789012", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Lorena", lastName: "Jaramillo", email: "lorena.j@outlook.com", phone: "+573467890123", gender: Gender.FEMALE, location: "Medellin", status: ContactStatus.INACTIVE, source: "Referido" },
    { firstName: "Hector", lastName: "Caicedo", email: "hector.caicedo@gmail.com", phone: "+573478901234", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Diana", lastName: "Velasquez", email: "diana.v@yahoo.com", phone: "+573489012345", gender: Gender.FEMALE, location: "Cartagena", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Ivan", lastName: "Correa", email: "ivan.correa@hotmail.com", phone: "+573490123456", gender: Gender.MALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Rosa", lastName: "Echeverri", email: "rosa.echeverri@gmail.com", phone: "+573501234567", gender: Gender.FEMALE, location: "Cali", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Samuel", lastName: "Rendon", email: "samuel.rendon@outlook.com", phone: "+573512345678", gender: Gender.MALE, location: "Pereira", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Taylor", lastName: "Beltran", email: "taylor.beltran@gmail.com", phone: "+573523456789", gender: Gender.OTHER, location: "Bogota", status: ContactStatus.ACTIVE, source: "Instagram" },
    { firstName: "Elena", lastName: "Gallego", email: "elena.gallego@yahoo.com", phone: "+573534567890", gender: Gender.FEMALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Marcos", lastName: "Valencia", email: "marcos.valencia@hotmail.com", phone: "+573545678901", gender: Gender.MALE, location: "Bogota", status: ContactStatus.BLOCKED, source: "Facebook" },
    { firstName: "Clara", lastName: "Bermudez", email: "clara.bermudez@gmail.com", phone: "+573556789012", gender: Gender.FEMALE, location: "Barranquilla", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Eduardo", lastName: "Soto", email: "eduardo.soto@outlook.com", phone: "+573567890123", gender: Gender.MALE, location: "Cali", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Jessica", lastName: "Cano", email: "jessica.cano@gmail.com", phone: "+573578901234", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Martin", lastName: "Henao", email: "martin.henao@yahoo.com", phone: "+573589012345", gender: Gender.MALE, location: "Medellin", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Luisa", lastName: "Gil", email: "luisa.gil@hotmail.com", phone: "+573590123456", gender: Gender.FEMALE, location: "Bogota", status: ContactStatus.ACTIVE, source: "Evento presencial" },
  ];

  // Spread createdAt across the last 6 months for growth chart data
  const contacts: any[] = [];
  for (let i = 0; i < contactsData.length; i++) {
    const monthsAgo = Math.floor((contactsData.length - i) / 10);
    const createdAt = randomDateInMonth(monthsAgo);

    const contact = await prisma.contact.create({
      data: {
        ...contactsData[i],
        organizationId: org1.id,
        createdAt,
      },
    });
    contacts.push(contact);
  }

  console.log(`Created ${contacts.length} contacts for Org 1.`);

  // ─── Contacts (Org 2 — 15 contacts) ─────────────────────
  const org2ContactsData: Array<{
    firstName: string; lastName: string; email: string; phone: string;
    gender: Gender; location: string; status: ContactStatus; source: string;
  }> = [
    { firstName: "Pedro", lastName: "Alvarado", email: "pedro.a@gmail.com", phone: "+573601234567", gender: Gender.MALE, location: "Soacha", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Marta", lastName: "Cifuentes", email: "marta.c@outlook.com", phone: "+573612345678", gender: Gender.FEMALE, location: "Soacha", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Raul", lastName: "Espinosa", email: "raul.e@gmail.com", phone: "+573623456789", gender: Gender.MALE, location: "Bosa", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Teresa", lastName: "Moreno", email: "teresa.m@yahoo.com", phone: "+573634567890", gender: Gender.FEMALE, location: "Kennedy", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Alberto", lastName: "Pacheco", email: "alberto.p@hotmail.com", phone: "+573645678901", gender: Gender.MALE, location: "Usme", status: ContactStatus.INACTIVE, source: "Facebook" },
    { firstName: "Gloria", lastName: "Salazar", email: "gloria.s@gmail.com", phone: "+573656789012", gender: Gender.FEMALE, location: "Ciudad Bolivar", status: ContactStatus.ACTIVE, source: "Evento presencial" },
    { firstName: "Hugo", lastName: "Delgado", email: "hugo.d@outlook.com", phone: "+573667890123", gender: Gender.MALE, location: "Soacha", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Claudia", lastName: "Franco", email: "claudia.f@gmail.com", phone: "+573678901234", gender: Gender.FEMALE, location: "Bosa", status: ContactStatus.ACTIVE, source: "Instagram" },
    { firstName: "Rene", lastName: "Castillo", email: "rene.c@yahoo.com", phone: "+573689012345", gender: Gender.MALE, location: "Kennedy", status: ContactStatus.ACTIVE, source: "Sitio web" },
    { firstName: "Martha", lastName: "Prieto", email: "martha.p@hotmail.com", phone: "+573690123456", gender: Gender.FEMALE, location: "Soacha", status: ContactStatus.ACTIVE, source: "WhatsApp" },
    { firstName: "Guillermo", lastName: "Leon", email: "guillermo.l@gmail.com", phone: "+573701234567", gender: Gender.MALE, location: "Usme", status: ContactStatus.ARCHIVED, source: "Evento presencial" },
    { firstName: "Beatriz", lastName: "Munoz", email: "beatriz.m@outlook.com", phone: "+573712345678", gender: Gender.FEMALE, location: "Ciudad Bolivar", status: ContactStatus.ACTIVE, source: "Referido" },
    { firstName: "Rafael", lastName: "Orozco", email: "rafael.o@gmail.com", phone: "+573723456789", gender: Gender.MALE, location: "Bosa", status: ContactStatus.ACTIVE, source: "Facebook" },
    { firstName: "Esperanza", lastName: "Guzman", email: "esperanza.g@yahoo.com", phone: "+573734567890", gender: Gender.FEMALE, location: "Kennedy", status: ContactStatus.ACTIVE, source: "Redes sociales" },
    { firstName: "Fabian", lastName: "Arango", email: "fabian.a@hotmail.com", phone: "+573745678901", gender: Gender.MALE, location: "Soacha", status: ContactStatus.ACTIVE, source: "Evento presencial" },
  ];

  const org2Contacts: any[] = [];
  for (const c of org2ContactsData) {
    const contact = await prisma.contact.create({
      data: { ...c, organizationId: org2.id },
    });
    org2Contacts.push(contact);
  }

  console.log(`Created ${org2Contacts.length} contacts for Org 2.`);

  // ─── Assign Interests to Contacts ───────────────────────
  for (const contact of contacts) {
    const numInterests = Math.floor(Math.random() * 4) + 1;
    const shuffled = [...interests].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numInterests);
    for (const interest of selected) {
      await prisma.contactInterest.create({
        data: { contactId: contact.id, interestId: interest.id },
      });
    }
  }

  console.log("Assigned interests to contacts.");

  // ─── Assign Tags to Contacts ────────────────────────────
  // tag indexes: 0=VIP, 1=Donante, 2=Voluntario, 3=Lider, 4=Beneficiario,
  //              5=Aliado, 6=Prensa, 7=Gobierno, 8=Empresa, 9=ONG
  const tagAssignments: [number, number[]][] = [
    [0, [0, 3, 10, 21, 27]],           // VIP
    [1, [1, 5, 13, 23, 30, 41]],       // Donante
    [2, [2, 8, 14, 17, 22, 28, 35, 42]], // Voluntario
    [3, [4, 9, 20, 26, 31, 44]],       // Lider Comunitario
    [4, [6, 11, 15, 18, 24, 29, 33, 36, 38, 43, 46, 48, 50, 52, 54, 56, 58]], // Beneficiario
    [5, [7, 12, 25, 37]],              // Aliado Institucional
    [6, [16, 39]],                      // Prensa
    [7, [19, 32, 45]],                  // Gobierno
    [8, [34, 40, 47]],                  // Empresa Privada
    [9, [49, 51, 53]],                  // ONG
  ];

  let tagCount = 0;
  for (const [tagIdx, contactIdxs] of tagAssignments) {
    for (const contactIdx of contactIdxs) {
      if (contactIdx < contacts.length) {
        await prisma.contactTag.create({
          data: { contactId: contacts[contactIdx].id, tagId: tags[tagIdx].id },
        });
        tagCount++;
      }
    }
  }

  console.log(`Assigned ${tagCount} tags to contacts.`);

  // ─── Channels ────────────────────────────────────────────
  const channels = await Promise.all([
    prisma.channel.create({
      data: { type: ChannelType.WHATSAPP, name: "WhatsApp Business Principal", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.INSTAGRAM, name: "Instagram @fundacionavanza", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.FACEBOOK_MESSENGER, name: "Facebook Messenger", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.EMAIL, name: "Email Institucional", isActive: true, organizationId: org1.id },
    }),
    prisma.channel.create({
      data: { type: ChannelType.SMS, name: "SMS Masivo", isActive: false, organizationId: org1.id },
    }),
  ]);

  const channelMap: Record<string, string> = {};
  for (const ch of channels) {
    channelMap[ch.type] = ch.id;
  }

  console.log(`Created ${channels.length} channels.`);

  // ─── Interactions (~180) ─────────────────────────────────
  const interactionTemplates: Array<{ type: InteractionType; subject: string; notes: string }> = [
    { type: "EMAIL", subject: "Invitacion a taller de liderazgo", notes: "Se envio invitacion al taller de liderazgo comunitario programado para el proximo mes." },
    { type: "PHONE_CALL", subject: "Seguimiento donacion", notes: "Llamada para agradecer la donacion recibida y actualizar sobre el uso de fondos." },
    { type: "MEETING", subject: "Reunion de planificacion", notes: "Reunion presencial para planificar actividades del trimestre." },
    { type: "WHATSAPP", subject: "Confirmacion de asistencia", notes: "Confirmo asistencia al evento de la proxima semana." },
    { type: "INSTAGRAM_DM", subject: "Consulta sobre voluntariado", notes: "Pregunto como puede inscribirse como voluntario en la fundacion." },
    { type: "FACEBOOK_MESSAGE", subject: "Solicitud de informacion", notes: "Solicito informacion sobre programas de capacitacion disponibles." },
    { type: "NOTE", subject: "Nota interna", notes: "Contacto muestra interes en participar en el comite de medio ambiente." },
    { type: "MEETING", subject: "Visita a comunidad", notes: "Visita de campo a la comunidad para evaluacion de necesidades." },
    { type: "PHONE_CALL", subject: "Coordinacion logistica", notes: "Llamada para coordinar logistica del evento de recaudacion de fondos." },
    { type: "EMAIL", subject: "Envio de informe trimestral", notes: "Se compartio el informe trimestral de actividades y resultados." },
    { type: "WHATSAPP", subject: "Recordatorio de reunion", notes: "Recordatorio enviado sobre la reunion del viernes." },
    { type: "NOTE", subject: "Actualizacion de estado", notes: "Contacto cambio de ciudad, actualizar direccion en el sistema." },
    { type: "MEETING", subject: "Firma de convenio", notes: "Reunion para firma de convenio interinstitucional." },
    { type: "EMAIL", subject: "Propuesta de alianza", notes: "Envio de propuesta formal para establecer alianza estrategica." },
    { type: "PHONE_CALL", subject: "Encuesta de satisfaccion", notes: "Encuesta telefonica sobre satisfaccion con los programas de la fundacion." },
  ];

  for (let i = 0; i < 180; i++) {
    const contactIdx = Math.floor(Math.random() * contacts.length);
    const template = interactionTemplates[i % interactionTemplates.length];
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    await prisma.interaction.create({
      data: {
        type: template.type,
        subject: template.subject,
        notes: template.notes,
        date,
        contactId: contacts[contactIdx].id,
      },
    });
  }

  console.log("Created 180 interactions.");

  // ─── Messages (~250) ─────────────────────────────────────
  const messageTemplates: Array<{
    content: string; direction: MessageDirection; channel: ChannelType; status: MessageStatus;
  }> = [
    // WhatsApp conversations
    { content: "Hola! Le escribimos de Fundacion Avanza para invitarle al taller de este sabado.", direction: "OUTBOUND", channel: "WHATSAPP", status: "DELIVERED" },
    { content: "Gracias por la invitacion! Estare presente.", direction: "INBOUND", channel: "WHATSAPP", status: "READ" },
    { content: "Recuerde que manana es la reunion a las 3pm en la sede principal.", direction: "OUTBOUND", channel: "WHATSAPP", status: "READ" },
    { content: "Perfecto, alla estare. Puedo llevar a un amigo interesado?", direction: "INBOUND", channel: "WHATSAPP", status: "READ" },
    { content: "Por supuesto! Todos son bienvenidos.", direction: "OUTBOUND", channel: "WHATSAPP", status: "DELIVERED" },
    // Instagram
    { content: "Hola! Vi su publicacion sobre el voluntariado, como me puedo inscribir?", direction: "INBOUND", channel: "INSTAGRAM", status: "READ" },
    { content: "Hola! Puede inscribirse en nuestro sitio web o visitarnos directamente.", direction: "OUTBOUND", channel: "INSTAGRAM", status: "DELIVERED" },
    { content: "Muchas gracias por la informacion!", direction: "INBOUND", channel: "INSTAGRAM", status: "READ" },
    // Facebook
    { content: "Buenos dias, quisiera saber sobre los programas para jovenes.", direction: "INBOUND", channel: "FACEBOOK_MESSENGER", status: "READ" },
    { content: "Buenos dias! Tenemos programas de formacion en liderazgo y emprendimiento para jovenes de 18 a 28 anos.", direction: "OUTBOUND", channel: "FACEBOOK_MESSENGER", status: "DELIVERED" },
    { content: "Excelente, me gustaria inscribirme. Que documentos necesito?", direction: "INBOUND", channel: "FACEBOOK_MESSENGER", status: "READ" },
    // Email
    { content: "Estimado/a, adjunto encontrara el informe trimestral de actividades de Fundacion Avanza.", direction: "OUTBOUND", channel: "EMAIL", status: "SENT" },
    { content: "Gracias por el informe. Los resultados son muy positivos. Felicitaciones al equipo.", direction: "INBOUND", channel: "EMAIL", status: "READ" },
    { content: "Le invitamos a la ceremonia de entrega de certificados el proximo viernes a las 5pm.", direction: "OUTBOUND", channel: "EMAIL", status: "DELIVERED" },
    { content: "Confirmacion de donacion recibida. Muchas gracias por su generoso aporte.", direction: "OUTBOUND", channel: "EMAIL", status: "DELIVERED" },
    // SMS
    { content: "FUNDACION AVANZA: Recordatorio - Asamblea general manana 10am. Su participacion es importante!", direction: "OUTBOUND", channel: "SMS", status: "SENT" },
    { content: "FUNDACION AVANZA: Gracias por asistir al evento. Su opinion es importante, responda esta breve encuesta.", direction: "OUTBOUND", channel: "SMS", status: "DELIVERED" },
  ];

  for (let i = 0; i < 250; i++) {
    const contactIdx = Math.floor(Math.random() * contacts.length);
    const template = messageTemplates[i % messageTemplates.length];
    const daysAgo = Math.floor(Math.random() * 180);
    const sentAt = new Date();
    sentAt.setDate(sentAt.getDate() - daysAgo);

    await prisma.message.create({
      data: {
        content: template.content,
        direction: template.direction,
        channel: template.channel,
        status: template.status,
        sentAt,
        contactId: contacts[contactIdx].id,
        channelId: channelMap[template.channel] || null,
      },
    });
  }

  console.log("Created 250 messages.");

  // ─── Segments ────────────────────────────────────────────
  const segment1 = await prisma.segment.create({
    data: {
      name: "Lideres Comunitarios Activos",
      description: "Lideres comunitarios con estado activo que participan regularmente en actividades.",
      filters: { status: "ACTIVE", tags: ["Lider Comunitario"] },
      isActive: true,
      organizationId: org1.id,
    },
  });

  const segment2 = await prisma.segment.create({
    data: {
      name: "Donantes Recurrentes",
      description: "Personas que han realizado donaciones de forma recurrente.",
      filters: { status: "ACTIVE", tags: ["Donante"] },
      isActive: true,
      organizationId: org1.id,
    },
  });

  const segment3 = await prisma.segment.create({
    data: {
      name: "Voluntarios Bogota",
      description: "Voluntarios ubicados en Bogota para actividades locales.",
      filters: { status: "ACTIVE", tags: ["Voluntario"], location: "Bogota" },
      isActive: true,
      organizationId: org1.id,
    },
  });

  const segment4 = await prisma.segment.create({
    data: {
      name: "Contactos Inactivos",
      description: "Contactos que no han tenido actividad reciente para campanas de re-engagement.",
      filters: { status: "INACTIVE" },
      isActive: true,
      organizationId: org1.id,
    },
  });

  const segment5 = await prisma.segment.create({
    data: {
      name: "Aliados Institucionales",
      description: "Organizaciones aliadas incluyendo gobierno, ONGs y empresa privada.",
      filters: { status: "ACTIVE", tags: ["Aliado Institucional", "Gobierno", "ONG", "Empresa Privada"] },
      isActive: true,
      organizationId: org1.id,
    },
  });

  const segment6 = await prisma.segment.create({
    data: {
      name: "Beneficiarios Medellin",
      description: "Beneficiarios de programas ubicados en Medellin.",
      filters: { status: "ACTIVE", tags: ["Beneficiario"], location: "Medellin" },
      isActive: false,
      organizationId: org1.id,
    },
  });

  // Assign contacts to segments
  const segmentAssignments: [string, number[]][] = [
    [segment1.id, [4, 9, 20, 26, 31, 44]],
    [segment2.id, [1, 5, 13, 23, 30, 41]],
    [segment3.id, [2, 14, 22, 28, 35, 42]],
    [segment4.id, [6, 15, 24, 33, 46]],
    [segment5.id, [7, 12, 25, 37, 19, 32, 45, 49, 51, 53]],
  ];

  for (const [segmentId, contactIdxs] of segmentAssignments) {
    for (const idx of contactIdxs) {
      if (idx < contacts.length) {
        await prisma.segmentContact.create({
          data: { segmentId, contactId: contacts[idx].id },
        });
      }
    }
  }

  console.log("Created 6 segments with assigned contacts.");

  // ─── Campaigns ───────────────────────────────────────────
  await Promise.all([
    prisma.campaign.create({
      data: {
        name: "Boletin Mensual - Marzo 2026",
        description: "Boletin informativo mensual con actualizaciones de la fundacion.",
        status: CampaignStatus.SENT,
        channel: ChannelType.EMAIL,
        content: { subject: "Boletin Fundacion Avanza - Marzo 2026", template: "newsletter_march" },
        scheduledAt: new Date("2026-03-01T08:00:00Z"),
        sentAt: new Date("2026-03-01T08:05:00Z"),
        organizationId: org1.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Invitacion Gala Anual 2026",
        description: "Invitacion a la gala anual de recaudacion de fondos.",
        status: CampaignStatus.SENT,
        channel: ChannelType.EMAIL,
        content: { subject: "Invitacion Especial - Gala Anual Fundacion Avanza", template: "gala_invite" },
        scheduledAt: new Date("2026-02-15T10:00:00Z"),
        sentAt: new Date("2026-02-15T10:02:00Z"),
        segmentId: segment2.id,
        organizationId: org1.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Convocatoria Voluntariado Abril",
        description: "Campana de reclutamiento de voluntarios para actividades de abril.",
        status: CampaignStatus.SCHEDULED,
        channel: ChannelType.WHATSAPP,
        content: { message: "Unete como voluntario en abril! Inscribete en fundacionavanza.org/voluntariado" },
        scheduledAt: new Date("2026-04-01T09:00:00Z"),
        segmentId: segment3.id,
        organizationId: org1.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Re-engagement Contactos Inactivos",
        description: "Campana para reactivar contactos que no han participado recientemente.",
        status: CampaignStatus.DRAFT,
        channel: ChannelType.EMAIL,
        content: { subject: "Te extranamos! Mira lo que hemos logrado", template: "reengagement" },
        segmentId: segment4.id,
        organizationId: org1.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Dia del Medio Ambiente",
        description: "Campana de concientizacion sobre medio ambiente.",
        status: CampaignStatus.DRAFT,
        channel: ChannelType.INSTAGRAM,
        content: { message: "Este 5 de junio, unete a nuestra jornada de siembra! #DiaDelMedioAmbiente" },
        organizationId: org1.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Encuesta Satisfaccion Q1",
        description: "Encuesta de satisfaccion del primer trimestre dirigida a beneficiarios.",
        status: CampaignStatus.SENDING,
        channel: ChannelType.SMS,
        content: { message: "FUNDACION AVANZA: Ayudanos a mejorar! Responde nuestra encuesta." },
        scheduledAt: new Date("2026-03-25T14:00:00Z"),
        segmentId: segment1.id,
        organizationId: org1.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Informe Aliados Q1 2026",
        description: "Envio de informe de resultados a aliados institucionales.",
        status: CampaignStatus.SENT,
        channel: ChannelType.EMAIL,
        content: { subject: "Informe de Resultados Q1 2026", template: "quarterly_report" },
        scheduledAt: new Date("2026-03-20T08:00:00Z"),
        sentAt: new Date("2026-03-20T08:03:00Z"),
        segmentId: segment5.id,
        organizationId: org1.id,
      },
    }),
    prisma.campaign.create({
      data: {
        name: "Capacitacion Liderazgo",
        description: "Invitacion a programa de capacitacion en liderazgo comunitario.",
        status: CampaignStatus.CANCELLED,
        channel: ChannelType.WHATSAPP,
        content: { message: "Inscripciones abiertas para el programa de liderazgo. Cupos limitados!" },
        segmentId: segment1.id,
        organizationId: org1.id,
      },
    }),
  ]);

  console.log("Created 8 campaigns.");

  // ─── Activity Logs (100) ─────────────────────────────────
  const activityTemplates = [
    { action: "CREATE", entityType: "Contact", details: { description: "Nuevo contacto registrado" } },
    { action: "UPDATE", entityType: "Contact", details: { description: "Informacion de contacto actualizada" } },
    { action: "CREATE", entityType: "Interaction", details: { description: "Nueva interaccion registrada" } },
    { action: "SEND", entityType: "Message", details: { description: "Mensaje enviado" } },
    { action: "CREATE", entityType: "Campaign", details: { description: "Nueva campana creada" } },
    { action: "UPDATE", entityType: "Campaign", details: { description: "Estado de campana actualizado" } },
    { action: "CREATE", entityType: "Segment", details: { description: "Nuevo segmento creado" } },
    { action: "UPDATE", entityType: "Segment", details: { description: "Filtros de segmento actualizados" } },
    { action: "IMPORT", entityType: "Contact", details: { description: "Importacion masiva de contactos", count: 25 } },
    { action: "EXPORT", entityType: "Contact", details: { description: "Exportacion de contactos a CSV" } },
    { action: "LOGIN", entityType: "User", details: { description: "Inicio de sesion exitoso" } },
    { action: "TAG_ADDED", entityType: "Contact", details: { description: "Etiqueta anadida a contacto" } },
  ];

  const users = [adminUser, managerUser, memberUser];
  for (let i = 0; i < 100; i++) {
    const template = activityTemplates[i % activityTemplates.length];
    const user = users[Math.floor(Math.random() * users.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const entityId = template.entityType === "Contact"
      ? contacts[Math.floor(Math.random() * contacts.length)].id
      : template.entityType === "User"
        ? user.id
        : `generated-${i}`;

    await prisma.activityLog.create({
      data: {
        action: template.action,
        entityType: template.entityType,
        entityId,
        details: template.details,
        userId: user.id,
        organizationId: org1.id,
        createdAt,
      },
    });
  }

  console.log("Created 100 activity logs.");

  // ─── Summary ─────────────────────────────────────────────
  console.log("\n========================================");
  console.log("  Seed completed successfully!");
  console.log("========================================\n");
  console.log("Data summary:");
  console.log("  Organizations:  3 (1 system + 2 regular)");
  console.log("  Users:          5 (1 super admin + 4 regular)");
  console.log(`  Contacts:       ${contacts.length + org2Contacts.length} (${contacts.length} org1, ${org2Contacts.length} org2)`);
  console.log(`  Interests:      ${interests.length}`);
  console.log("  Tags:           15 (10 org1, 5 org2)");
  console.log("  Channels:       5");
  console.log("  Interactions:   180");
  console.log("  Messages:       250");
  console.log("  Segments:       6");
  console.log("  Campaigns:      8");
  console.log("  Activity Logs:  100");
  console.log("\nDemo accounts:");
  console.log("┌─────────────┬──────────────────────────────┬──────────────────┐");
  console.log("│ Rol         │ Correo                       │ Contrasena       │");
  console.log("├─────────────┼──────────────────────────────┼──────────────────┤");
  console.log("│ SUPER_ADMIN │ superadmin@system.local       │ SuperAdmin@1234  │");
  console.log("│ ADMIN       │ admin@demo.com               │ Demo@1234        │");
  console.log("│ MANAGER     │ manager@demo.com             │ Demo@1234        │");
  console.log("│ MEMBER      │ member@demo.com              │ Demo@1234        │");
  console.log("│ ADMIN       │ admin@redcomunitaria.org      │ Demo@1234        │");
  console.log("└─────────────┴──────────────────────────────┴──────────────────┘");
}

// ─── Helpers ──────────────────────────────────────────────────

function randomDateInMonth(monthsAgo: number): Date {
  const now = new Date();
  const date = new Date(now);
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(Math.floor(Math.random() * 28) + 1);
  date.setHours(Math.floor(Math.random() * 12) + 8);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
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

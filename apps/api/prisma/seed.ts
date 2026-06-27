import { PrismaClient, UserRole, Priority, ProductionStage } from '@prisma/client';
import { ROLE_DEFAULT_TABS } from '@erp/types';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Dynamic role definitions (code + default permission bitmask).
  const ROLE_DEFS: { role: UserRole; definition: string; permissions: number }[] = [
    { role: 'ADMIN', definition: 'Full administrative access to all tabs and settings.', permissions: ROLE_DEFAULT_TABS.ADMIN },
    { role: 'SUPERVISOR', definition: 'Production oversight: dashboard, orders, work efficiency.', permissions: ROLE_DEFAULT_TABS.SUPERVISOR },
    { role: 'PARTNER', definition: 'Owner view: dashboard and reports.', permissions: ROLE_DEFAULT_TABS.PARTNER },
  ];
  const roleDefs: Record<string, string> = {}; // code -> id
  for (const d of ROLE_DEFS) {
    const rd = await prisma.roleDefinition.upsert({
      where: { code: d.role },
      update: {}, // don't clobber admin-tuned role defaults on re-seed
      create: { role: d.role, code: d.role, definition: d.definition, permissions: d.permissions },
    });
    roleDefs[d.role] = rd.id;
  }

  // Each user starts with their role's default tab mask; admin customises per user.
  const mkUser = async (name: string, email: string, password: string, role: UserRole) =>
    prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        roleAssignment: {
          create: { roleDefinitionId: roleDefs[role], permissions: ROLE_DEFAULT_TABS[role] },
        },
      },
    });

  const admin = await mkUser('Admin', 'admin@erp.local', 'admin123', 'ADMIN');
  await mkUser('Supervisor', 'supervisor@erp.local', 'supervisor123', 'SUPERVISOR');
  await mkUser('Partner', 'partner@erp.local', 'partner123', 'PARTNER');

  const client = await prisma.client.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Taaza',
      gstNumber: '29ABCDE1234F1Z5',
      phone: '+91 90000 00000',
      address: 'Plot 12, Industrial Area, Hyderabad',
    },
  });

  const order = await prisma.order.upsert({
    where: { orderCode: 'ORD-001' },
    update: {},
    create: {
      orderCode: 'ORD-001',
      name: 'Taaza Carry Bags',
      quantity: 50000,
      deadline: new Date('2026-06-15'),
      priority: Priority.HIGH,
      currentStage: ProductionStage.PRINTING,
      size: '12x16',
      gsm: 90,
      paperType: 'Brown',
      printingType: 'Flexo',
      handleType: 'Loop',
      lamination: true,
      clientId: client.id,
    },
  });

  await prisma.dailyUpdate.create({
    data: {
      orderId: order.id,
      stage: ProductionStage.PRINTING,
      quantityCompleted: 10000,
      quantityPending: 40000,
      remarks: 'Machine running',
      updatedById: admin.id,
    },
  });

  console.log('Seed complete: 3 users, 1 client, 1 order, 1 daily update.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

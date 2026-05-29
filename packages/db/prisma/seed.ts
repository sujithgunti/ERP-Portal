import { PrismaClient, Role, Priority, ProductionStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Seed one user per role (password: <role>123 — see developer guide).
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.local' },
    update: {},
    create: { name: 'Admin', email: 'admin@erp.local', passwordHash, role: Role.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'supervisor@erp.local' },
    update: {},
    create: {
      name: 'Supervisor',
      email: 'supervisor@erp.local',
      passwordHash: await bcrypt.hash('supervisor123', 10),
      role: Role.SUPERVISOR,
    },
  });

  await prisma.user.upsert({
    where: { email: 'partner@erp.local' },
    update: {},
    create: {
      name: 'Partner',
      email: 'partner@erp.local',
      passwordHash: await bcrypt.hash('partner123', 10),
      role: Role.PARTNER,
    },
  });

  // Sample client + order to populate the dashboard.
  const client = await prisma.client.upsert({
    where: { id: 'seed-client-taaza' },
    update: {},
    create: { id: 'seed-client-taaza', name: 'Taaza', contact: 'taaza@example.com' },
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

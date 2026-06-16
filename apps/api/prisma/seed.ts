import { PrismaClient, Role, Priority, ProductionStage } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@erp.local',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: Role.ADMIN,
    },
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

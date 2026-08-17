import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DFOLIO Database Seeding...');

  // 1. Clear existing demo data in safe order
  await prisma.activityLog.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.snag.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.subWork.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Cleared existing database tables.');

  // 2. Seed Default System Users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Alexander Wright (Admin)',
      email: 'admin@dfolio.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const pm = await prisma.user.create({
    data: {
      name: 'Sarah Connor (PM)',
      email: 'pm@dfolio.com',
      password: hashedPassword,
      role: 'PROJECT_MANAGER',
    },
  });

  const engineer = await prisma.user.create({
    data: {
      name: 'David Miller (Site Engineer)',
      email: 'engineer@dfolio.com',
      password: hashedPassword,
      role: 'SITE_ENGINEER',
    },
  });

  const contractor = await prisma.user.create({
    data: {
      name: 'Apex Construction Co. (Contractor)',
      email: 'contractor@dfolio.com',
      password: hashedPassword,
      role: 'CONTRACTOR',
    },
  });

  const client = await prisma.user.create({
    data: {
      name: 'Sterling Realty Group (Client)',
      email: 'client@dfolio.com',
      password: hashedPassword,
      role: 'CLIENT',
    },
  });

  console.log('👤 Created 5 default system users (Admin, PM, Engineer, Contractor, Client).');

  // 3. Seed Default Work Categories & Sub-Works
  const categoriesData = [
    {
      name: 'Civil & Structural',
      subWorks: ['Excavation & Shoring', 'Foundation Concrete', 'Columns & Beams', 'Masonry & Brickwork', 'Slab Casting'],
    },
    {
      name: 'Plumbing & Drainage',
      subWorks: ['Piping Supply Rough-in', 'Drainage Riser Installation', 'Sanitary Ware Fitting', 'Water Tank Hookup'],
    },
    {
      name: 'Electrical & Power',
      subWorks: ['Conduit Laying', 'Main Distribution Board Wiring', 'Light & Socket Fixtures', 'Earth Grounding'],
    },
    {
      name: 'HVAC & Mechanical',
      subWorks: ['Ductwork Fabrication', 'Chiller Piping Hookup', 'AC Diffuser Installation', 'Fire Sprinklers'],
    },
    {
      name: 'Finishing & Interior',
      subWorks: ['Wall Plastering', 'Floor Tile Laying', 'Ceiling False Grid', 'Interior Painting', 'Door & Frame Mounting'],
    },
  ];

  const createdCategories: any[] = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        subWorks: {
          create: cat.subWorks.map((swName) => ({ name: swName })),
        },
      },
      include: { subWorks: true },
    });
    createdCategories.push(createdCat);
  }

  console.log(`🏗️ Created ${createdCategories.length} core construction categories with sub-works.`);

  // 4. Seed Demo Project
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const project = await prisma.project.create({
    data: {
      name: 'Apex Commercial Tower',
      description: '24-Story High-Rise Commercial Office Complex with Basement Parking and Sky Lounge.',
      location: '742 Evergreen Terrace, Sector 5',
      startDate: thirtyDaysAgo,
      endDate: ninetyDaysLater,
      status: 'ACTIVE',
      floors: {
        create: [
          {
            name: 'Substructure Basement B1',
            number: -1,
            rooms: {
              create: [
                { name: 'Electrical Room B1-01' },
                { name: 'Pump Station B1-02' },
                { name: 'Parking Bay A' },
              ],
            },
          },
          {
            name: 'Ground Floor Lobby',
            number: 0,
            rooms: {
              create: [
                { name: 'Main Atrium Entrance' },
                { name: 'Concierge Desk Area' },
                { name: 'Elevator Bank A' },
              ],
            },
          },
          {
            name: 'Level 1 Commercial Suite',
            number: 1,
            rooms: {
              create: [
                { name: 'Executive Suite 101' },
                { name: 'Conference Hall B' },
                { name: 'Restroom Facilities East' },
              ],
            },
          },
        ],
      },
    },
    include: {
      floors: {
        include: { rooms: true },
      },
    },
  });

  console.log(`🏢 Created demo project "${project.name}" with 3 floors and 9 rooms.`);

  // Get sample IDs for linking
  const room1 = project.floors[1].rooms[0]; // Main Atrium Entrance
  const room2 = project.floors[2].rooms[0]; // Executive Suite 101
  const subWorkPlastering = createdCategories[4].subWorks[0]; // Wall Plastering
  const subWorkWiring = createdCategories[2].subWorks[2]; // Light & Socket Fixtures

  // 5. Seed Tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: project.id,
      roomId: room1.id,
      subWorkId: subWorkPlastering.id,
      name: 'Ground Floor Atrium Wall Plastering',
      description: 'Double coat smooth plastering on interior concrete shear walls.',
      startDate: thirtyDaysAgo,
      endDate: today,
      status: 'COMPLETED',
      priority: 'HIGH',
      progress: 100.0,
      contractorId: contractor.id,
      supervisorId: engineer.id,
      createdById: pm.id,
      labourCount: 8,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project.id,
      roomId: room2.id,
      subWorkId: subWorkWiring.id,
      name: 'Level 1 Suite Conduit & Wiring Installation',
      description: 'Pulling copper wiring through ceiling conduits and mounting junction boxes.',
      startDate: today,
      endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      progress: 45.0,
      dependsOnTaskId: task1.id,
      contractorId: contractor.id,
      supervisorId: engineer.id,
      createdById: pm.id,
      labourCount: 12,
    },
  });

  console.log('📋 Seeded demo tasks with dependencies.');

  // 6. Seed Snags
  await prisma.snag.create({
    data: {
      projectId: project.id,
      roomId: room2.id,
      taskId: task2.id,
      title: 'Exposed Junction Box Hairline Cracks',
      description: 'Cracks observed near ceiling junction box mount in Executive Suite 101.',
      status: 'OPEN',
      priority: 'HIGH',
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
      createdById: engineer.id,
      assignedToId: contractor.id,
    },
  });

  // 7. Seed Activity Logs
  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      userId: pm.id,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project.id,
      details: 'Created project Apex Commercial Tower with 3 floors.',
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      userId: engineer.id,
      action: 'SNAG_CREATED',
      entityType: 'SNAG',
      details: 'Logged defect: Exposed Junction Box Hairline Cracks',
    },
  });

  console.log('🌱 DFOLIO Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

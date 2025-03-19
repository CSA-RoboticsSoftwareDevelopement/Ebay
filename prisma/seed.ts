import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

/**
 * Main seed function to populate the database with initial data
 */
async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = 'admin123'; // This should be changed after first login in production

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: Role.ADMIN,
      },
    });
    
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Create initial signup keys
  const numberOfKeys = 5;
  for (let i = 0; i < numberOfKeys; i++) {
    const key = `KEY-${randomUUID().substring(0, 8).toUpperCase()}`;
    
    // Check if the key already exists
    const existingKey = await prisma.signupKey.findUnique({
      where: { key }
    });
    
    if (!existingKey) {
      await prisma.signupKey.create({
        data: {
          key,
          createdBy: adminEmail,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        },
      });
      
      console.log(`Created signup key: ${key}`);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
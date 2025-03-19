// Reset admin password script
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const adminEmail = 'admin@example.com';
  const newPassword = 'admin123';
  
  try {
    console.log(`Looking for admin user with email: ${adminEmail}`);
    
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!admin) {
      console.log(`No admin user found with email: ${adminEmail}`);
      return;
    }
    
    console.log(`Found admin user: ${admin.id}`);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`New password hashed`);
    
    // Update admin password
    const updatedAdmin = await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    
    console.log(`Admin password updated successfully: ${updatedAdmin.id}`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword(); 
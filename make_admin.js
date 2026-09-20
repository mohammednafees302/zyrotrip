const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Please provide an email address. Usage: node make_admin.js <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'ADMIN' },
    });
    console.log(`Successfully promoted ${user.email} to ADMIN.`);
  } catch (error) {
    console.error("Failed to promote user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

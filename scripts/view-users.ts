import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function viewUsers() {
  console.log('Fetching all users from database...\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('\nPlease register a user at: http://localhost:3000/signup');
    } else {
      console.log(`✓ Found ${users.length} user(s):\n`);

      users.forEach((user, index) => {
        console.log(`--- User ${index + 1} ---`);
        console.log(`ID:         ${user.id}`);
        console.log(`Email:      ${user.email}`);
        console.log(`Name:       ${user.name}`);
        console.log(`Role:       ${user.role}`);
        console.log(`Created:    ${user.createdAt.toLocaleString()}`);
        console.log(`Updated:    ${user.updatedAt.toLocaleString()}`);
        console.log('');
      });

      // Count associated data
      for (const user of users) {
        const chatsCount = await prisma.chat.count({ where: { userId: user.id } });
        const materialsCount = await prisma.material.count({ where: { userId: user.id } });

        console.log(`📊 ${user.name} has:`);
        console.log(`   - ${chatsCount} chat(s)`);
        console.log(`   - ${materialsCount} material(s)`);
        console.log('');
      }
    }

  } catch (error: any) {
    console.error('❌ Error fetching users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

viewUsers();

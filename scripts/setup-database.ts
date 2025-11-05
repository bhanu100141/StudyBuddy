import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('Testing database connection...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✓ Database connection successful!');

    // Check if User table exists and count users
    const userCount = await prisma.user.count();
    console.log(`✓ User table exists. Current users: ${userCount}`);

    // Check if Chat table exists
    const chatCount = await prisma.chat.count();
    console.log(`✓ Chat table exists. Current chats: ${chatCount}`);

    // Check if Material table exists
    const materialCount = await prisma.material.count();
    console.log(`✓ Material table exists. Current materials: ${materialCount}`);

    // Check if Message table exists
    const messageCount = await prisma.message.count();
    console.log(`✓ Message table exists. Current messages: ${messageCount}`);

    console.log('\n✓ All database tables are set up correctly!');
    console.log('\nDatabase URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

  } catch (error: any) {
    console.error('\n❌ Database error:', error.message);

    if (error.code === 'P1001') {
      console.error('\n⚠️  Cannot reach database server.');
      console.error('Please check:');
      console.error('1. DATABASE_URL in .env is correct');
      console.error('2. Your internet connection');
      console.error('3. Supabase project is running');
    } else if (error.code === 'P2021') {
      console.error('\n⚠️  Table does not exist in the database.');
      console.error('Please run: npx prisma db push');
    } else {
      console.error('\n⚠️  Full error:', error);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();

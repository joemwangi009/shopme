#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Setting up AI Amazona Database for Vercel...\n');

try {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('✅ DATABASE_URL found:', process.env.DATABASE_URL.substring(0, 20) + '...');

  // Step 1: Generate Prisma Client
  console.log('\n📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully');

  // Step 2: Push database schema (creates all tables)
  console.log('\n🗄️  Creating database tables...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database tables created successfully');

  // Step 3: Seed database with sample data
  console.log('\n🌱 Seeding database with sample data...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully');

  console.log('\n🎉 Vercel database setup completed successfully!');
  console.log('\n📊 Your production database now contains:');
  console.log('   • Complete e-commerce schema');
  console.log('   • Sample products and categories');
  console.log('   • Test users and orders');
  console.log('   • All necessary tables and relationships');

} catch (error) {
  console.error('\n❌ Vercel database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Verify DATABASE_URL in Vercel environment variables');
  console.log('   2. Check database connection and permissions');
  console.log('   3. Ensure database is accessible from Vercel');
  process.exit(1);
} 
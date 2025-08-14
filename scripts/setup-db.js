#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up AI Amazona Database...\n');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully\n');

  // Step 2: Push database schema (creates all tables)
  console.log('🗄️  Creating database tables...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database tables created successfully\n');

  // Step 3: Seed database with sample data
  console.log('🌱 Seeding database with sample data...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully\n');

  // Step 4: Verify setup
  console.log('🔍 Verifying database setup...');
  execSync('npx prisma studio --port 5555', { stdio: 'inherit' });

  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📊 Your database now contains:');
  console.log('   • Users (Admin + Regular)');
  console.log('   • Categories (T-shirts, Jeans, Shoes)');
  console.log('   • Products with images');
  console.log('   • Sample orders and reviews');
  console.log('\n🔑 Default login credentials:');
  console.log('   • Admin: admin@example.com / admin123');
  console.log('   • User: user@example.com / user123');
  console.log('\n🌐 Prisma Studio opened at: http://localhost:5555');

} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Check your DATABASE_URL environment variable');
  console.log('   2. Ensure your database is accessible');
  console.log('   3. Verify database permissions');
  process.exit(1);
} 
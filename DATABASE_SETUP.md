# 🗄️ AI Amazona Database Setup Guide

## 🚀 **Automatic Database Setup**

This project includes **automatic database setup** that will create all tables, relationships, and sample data automatically!

## 📋 **Prerequisites**

1. **PostgreSQL Database** (Supabase, Railway, or local)
2. **DATABASE_URL** environment variable set
3. **Node.js** and **npm** installed

## 🔧 **Quick Setup Commands**

### **Local Development:**
```bash
# Complete database setup (tables + sample data)
npm run db:setup

# Reset database and setup again
npm run db:reset

# Just seed sample data
npm run db:seed
```

### **Vercel Production:**
```bash
# Vercel-specific database setup
npm run vercel:setup
```

### **Manual Setup:**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

## 🎯 **What Gets Created Automatically**

### **Tables Created:**
- ✅ **User** - Authentication and user management
- ✅ **Account** - OAuth provider accounts
- ✅ **Session** - User sessions
- ✅ **Product** - E-commerce products
- ✅ **Category** - Product categories
- ✅ **Order** - Customer orders
- ✅ **OrderItem** - Order line items
- ✅ **Review** - Product reviews
- ✅ **Cart** - Shopping carts
- ✅ **CartItem** - Cart items
- ✅ **Address** - Shipping addresses

### **Sample Data Created:**
- 🛍️ **Categories**: T-shirts, Jeans, Shoes
- 📦 **Products**: 6 sample products with images
- 👥 **Users**: Admin + Regular user accounts
- 📋 **Orders**: 100 sample orders
- ⭐ **Reviews**: Product ratings and comments

## 🔑 **Default Login Credentials**

### **Admin Account:**
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

### **Regular User:**
- **Email**: `user@example.com`
- **Password**: `user123`
- **Role**: `USER`

## 🌐 **Database Management**

### **View Database (Prisma Studio):**
```bash
npm run db:studio
```
Opens at: http://localhost:5555

### **Reset Database:**
```bash
npm run db:reset
```
⚠️ **Warning**: This will delete all data and recreate everything!

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"DATABASE_URL not found"**
   - Check environment variables
   - Verify database connection string

2. **"Connection refused"**
   - Check database is running
   - Verify network access

3. **"Permission denied"**
   - Check database user permissions
   - Verify database exists

### **Vercel-Specific:**
1. **Environment Variables**: Set in Vercel dashboard
2. **Database Access**: Ensure database allows Vercel IPs
3. **Connection Limits**: Check database connection limits

## 📊 **Database Schema Overview**

```
User ←→ Account (OAuth)
  ↓
User ←→ Session
  ↓
User ←→ Order ←→ OrderItem ←→ Product
  ↓                    ↓
User ←→ Review ←→ Product
  ↓
User ←→ Cart ←→ CartItem ←→ Product
  ↓
User ←→ Address
```

## 🎉 **After Setup**

Once complete, your e-commerce platform will have:
- ✅ **Full database structure**
- ✅ **Sample products and categories**
- ✅ **User authentication system**
- ✅ **Shopping cart functionality**
- ✅ **Order management**
- ✅ **Review system**
- ✅ **Admin dashboard access**

## 🔄 **Updating Schema**

If you modify the Prisma schema:
```bash
# Create new migration
npm run db:migrate

# Apply to database
npm run db:push
```

---

**🎯 Goal**: Zero manual database setup - everything happens automatically! 
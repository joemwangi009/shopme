import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

class DatabasePool {
  private pool: Pool;
  private static instance: DatabasePool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // Reduced from 20 to prevent excessive connections
      min: 2,  // Reduced from 5 to prevent excessive connections
      idleTimeoutMillis: 30000, // Close clients after 30 seconds of inactivity
      connectionTimeoutMillis: 60000, // Maximum time to wait for a connection
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });

    // Only log connections in development
    if (process.env.NODE_ENV === 'development') {
      // Handle pool connection events
      this.pool.on('connect', () => {
        console.log('🔌 New client connected to database pool');
      });

      this.pool.on('remove', () => {
        console.log('🔌 Client removed from database pool');
      });
    }
  }

  // Singleton pattern to ensure only one pool instance
  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }

  // Execute a query with parameters
  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: (string | number | boolean | Date | null)[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('📊 Query executed:', { text: text.substring(0, 50) + '...', duration: `${duration}ms`, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
  }

  // Get a client from the pool for transactions
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // Transaction helper
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      console.log('✅ Database pool connection test successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('❌ Database pool connection test failed:', error);
      return false;
    }
  }

  // Get pool status
  getPoolStatus() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  // Close the pool
  async close(): Promise<void> {
    await this.pool.end();
    console.log('🔌 Database pool closed');
  }
}

// Export singleton instance
export const db = DatabasePool.getInstance();

// Helper functions for common database operations
export class DatabaseHelpers {
  
  // Create tables from schema
  static async createTables(): Promise<void> {
    const createTablesSQL = `
      -- Create enums
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Create tables
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "password" TEXT,
        "role" "Role" NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "User_email_key" UNIQUE ("email")
      );

      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
      );

      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Session_sessionToken_key" UNIQUE ("sessionToken")
      );

      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "image" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Category_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Category_name_key" UNIQUE ("name")
      );

      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "images" TEXT[],
        "categoryId" TEXT NOT NULL,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Address" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "street" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "postalCode" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
        "addressId" TEXT NOT NULL,
        "total" DOUBLE PRECISION NOT NULL,
        "stripePaymentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "userId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "Cart" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Cart_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Cart_userId_key" UNIQUE ("userId")
      );

      CREATE TABLE IF NOT EXISTS "CartItem" (
        "id" TEXT NOT NULL,
        "cartId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
      );

      -- Add foreign key constraints
      ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
      ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
      ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
      ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_userId_fkey";
      ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_addressId_fkey";
      ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_orderId_fkey";
      ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";
      ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_userId_fkey";
      ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "Review_productId_fkey";
      ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "Cart" DROP CONSTRAINT IF EXISTS "Cart_userId_fkey";
      ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_cartId_fkey";
      ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_productId_fkey";
      ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

      ALTER TABLE "Address" DROP CONSTRAINT IF EXISTS "Address_userId_fkey";
      ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `;

    try {
      await db.query(createTablesSQL);
      console.log('✅ All tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // Sample queries for common operations
  static async getUsers(limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }>> {
    const result = await db.query<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    }>(
      'SELECT id, name, email, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT $1',
      [limit]
    );
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: new Date(row.createdAt),
    }));
  }

  static async getProducts(categoryId?: string, limit: number = 20): Promise<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    categoryId: string;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    categoryName: string;
  }>> {
    let query = `
      SELECT p.*, c.name as "categoryName" 
      FROM "Product" p 
      JOIN "Category" c ON p."categoryId" = c.id
    `;
    const params: (string | number)[] = [];

    if (categoryId) {
      query += ' WHERE p."categoryId" = $1';
      params.push(categoryId);
    }

    query += ' ORDER BY p."createdAt" DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await db.query<{
      id: string;
      name: string;
      description: string;
      price: string;
      images: string[];
      categoryId: string;
      stock: string;
      createdAt: string;
      updatedAt: string;
      categoryName: string;
    }>(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      images: row.images,
      categoryId: row.categoryId,
      stock: parseInt(row.stock),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      categoryName: row.categoryName,
    }));
  }

  static async getOrderSummary(): Promise<{
    totalOrders: string;
    totalRevenue: string;
    avgOrderValue: string;
    uniqueCustomers: string;
  }> {
    const result = await db.query<{
      totalOrders: string;
      totalRevenue: string;
      avgOrderValue: string;
      uniqueCustomers: string;
    }>(`
      SELECT 
        COUNT(*) as "totalOrders",
        SUM(total) as "totalRevenue",
        AVG(total) as "avgOrderValue",
        COUNT(DISTINCT "userId") as "uniqueCustomers"
      FROM "Order"
    `);
    return result.rows[0];
  }
}

// Export default instance and helpers
export default db; 
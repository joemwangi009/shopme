import { db } from '@/lib/db-pool'
import { startOfDay, subDays, format } from 'date-fns'
import { OrderStatus } from '@prisma/client'

interface RevenueData {
  date: string
  revenue: number
}

interface OrderStat {
  name: string
  value: number
}

interface RecentOrder {
  id: string
  total: number
  status: OrderStatus
  createdAt: Date
  user: {
    name: string
  }
}

interface DBOrderRevenue {
  total: unknown
  createdAt: unknown
}

interface DBOrderStat {
  status: unknown
  count: unknown
}

interface DBRecentOrder {
  id: unknown
  total: unknown
  status: unknown
  createdAt: unknown
  user_name: unknown
}

export async function getRevenueData(days: number = 30): Promise<RevenueData[]> {
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, days)

  const result = await db.query<DBOrderRevenue>(`
    SELECT 
      total,
      "createdAt"
    FROM "Order" 
    WHERE 
      status = 'DELIVERED'
      AND "createdAt" >= $1
      AND "createdAt" <= $2
    ORDER BY "createdAt" ASC
  `, [startDate, endDate])

  const orders = result.rows

  // Group orders by date and calculate daily revenue
  const dailyRevenue = orders.reduce((acc, orderData) => {
    const date = format(new Date(orderData.createdAt as string), 'MMM d')
    acc[date] = (acc[date] || 0) + parseFloat(orderData.total as string)
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for Recharts
  const data: RevenueData[] = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }))

  return data
}

export async function getOrderStats(): Promise<OrderStat[]> {
  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  const result = await db.query<DBOrderStat>(`
    SELECT 
      status,
      COUNT(*) as count
    FROM "Order"
    WHERE 
      "createdAt" >= $1
      AND "createdAt" <= $2
    GROUP BY status
  `, [startDate, endDate])

  return result.rows.map((stat): OrderStat => ({
    name: stat.status as string,
    value: parseInt(stat.count as string),
  }))
}

export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
  const result = await db.query<DBRecentOrder>(`
    SELECT 
      o.id,
      o.total,
      o.status,
      o."createdAt",
      u.name as user_name
    FROM "Order" o
    JOIN "User" u ON o."userId" = u.id
    ORDER BY o."createdAt" DESC
    LIMIT $1
  `, [limit])

  return result.rows.map((order): RecentOrder => ({
    id: order.id as string,
    total: parseFloat(order.total as string),
    status: order.status as OrderStatus,
    createdAt: new Date(order.createdAt as string),
    user: {
      name: order.user_name as string
    }
  }))
}

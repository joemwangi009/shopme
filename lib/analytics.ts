import { db } from '@/lib/db-pool'
import { startOfDay, subDays, format } from 'date-fns'

export async function getRevenueData(days: number = 30) {
  const endDate = startOfDay(new Date())
  const startDate = subDays(endDate, days)

  const result = await db.query(`
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
  const dailyRevenue = orders.reduce((acc, order) => {
    const date = format(new Date(order.createdAt), 'MMM d')
    acc[date] = (acc[date] || 0) + parseFloat(order.total)
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for Recharts
  const data = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }))

  return data
}

export async function getOrderStats() {
  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  const result = await db.query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM "Order"
    WHERE 
      "createdAt" >= $1
      AND "createdAt" <= $2
    GROUP BY status
  `, [startDate, endDate])

  return result.rows.map((stat) => ({
    name: stat.status,
    value: parseInt(stat.count),
  }))
}

export async function getRecentOrders(limit: number = 5) {
  const result = await db.query(`
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

  return result.rows.map(order => ({
    id: order.id,
    total: parseFloat(order.total),
    status: order.status,
    createdAt: new Date(order.createdAt),
    user: {
      name: order.user_name
    }
  }))
}

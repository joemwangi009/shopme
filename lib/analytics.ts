import { db } from '@/lib/db-pool'
import { startOfDay, subDays, format } from 'date-fns'

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
  status: string
  createdAt: Date
  user: {
    name: string
  }
}

interface DBOrderRevenue {
  total: unknown
  created_at: unknown
}

interface DBOrderStat {
  status: unknown
  count: unknown
}

interface DBRecentOrder {
  id: unknown
  total: unknown
  status: unknown
  created_at: unknown
  user_name: unknown
}

export async function getRevenueData(days: number = 30): Promise<RevenueData[]> {
  try {
    const endDate = startOfDay(new Date())
    const startDate = subDays(endDate, days)

    const result = await db.query<DBOrderRevenue>(`
      SELECT 
        total,
        created_at
      FROM "Order" 
      WHERE 
        status = 'DELIVERED'
        AND created_at >= $1
        AND created_at <= $2
      ORDER BY created_at ASC
    `, [startDate, endDate])

    const orders = result.rows

    // Group orders by date and calculate daily revenue
    const dailyRevenue = orders.reduce((acc, orderData) => {
      const date = format(new Date(orderData.created_at as string), 'MMM d')
      acc[date] = (acc[date] || 0) + parseFloat(orderData.total as string)
      return acc
    }, {} as Record<string, number>)

    // Convert to array format for Recharts
    const data: RevenueData[] = Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue,
    }))

    return data
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return []
  }
}

export async function getOrderStats(): Promise<OrderStat[]> {
  try {
    const endDate = new Date()
    const startDate = subDays(endDate, 30)

    const result = await db.query<DBOrderStat>(`
      SELECT 
        status,
        COUNT(*) as count
      FROM "Order"
      WHERE 
        created_at >= $1
        AND created_at <= $2
      GROUP BY status
    `, [startDate, endDate])

    return result.rows.map((stat): OrderStat => ({
      name: stat.status as string,
      value: parseInt(stat.count as string),
    }))
  } catch (error) {
    console.error('Error fetching order stats:', error)
    return []
  }
}

export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
  try {
    const result = await db.query<DBRecentOrder>(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        u.name as user_name
      FROM "Order" o
      JOIN "User" u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT $1
    `, [limit])

    return result.rows.map((order): RecentOrder => ({
      id: order.id as string,
      total: parseFloat(order.total as string),
      status: order.status as string,
      createdAt: new Date(order.created_at as string),
      user: {
        name: order.user_name as string
      }
    }))
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}

export async function getAdminMetrics() {
  try {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

    // Get total revenue and compare with last month
    const [totalRevenue, lastMonthRevenue] = await Promise.all([
      db.query<{ total: unknown }>(`
        SELECT COALESCE(SUM(total), 0) as total
        FROM "Order" 
        WHERE status = 'DELIVERED'
      `),
      db.query<{ total: unknown }>(`
        SELECT COALESCE(SUM(total), 0) as total
        FROM "Order" 
        WHERE status = 'DELIVERED' 
        AND created_at >= $1 AND created_at < $2
      `, [lastMonth, now])
    ])

    // Get total orders and compare with last hour
    const [totalOrders, lastHourOrders] = await Promise.all([
      db.query<{ count: unknown }>('SELECT COUNT(*) as count FROM "Order"'),
      db.query<{ count: unknown }>(`
        SELECT COUNT(*) as count 
        FROM "Order" 
        WHERE created_at >= $1 AND created_at < $2
      `, [lastHour, now])
    ])

    // Get total customers and compare with last month
    const [totalCustomers, lastMonthCustomers] = await Promise.all([
      db.query<{ count: unknown }>(`
        SELECT COUNT(*) as count 
        FROM "User" 
        WHERE role = 'USER'
      `),
      db.query<{ count: unknown }>(`
        SELECT COUNT(*) as count 
        FROM "User" 
        WHERE role = 'USER' 
        AND created_at >= $1 AND created_at < $2
      `, [lastMonth, now])
    ])

    // Calculate average order value and compare with last week
    const [currentAOV, lastWeekAOV] = await Promise.all([
      db.query<{ avg: unknown }>(`
        SELECT COALESCE(AVG(total), 0) as avg
        FROM "Order" 
        WHERE status = 'DELIVERED'
      `),
      db.query<{ avg: unknown }>(`
        SELECT COALESCE(AVG(total), 0) as avg
        FROM "Order" 
        WHERE status = 'DELIVERED' 
        AND created_at >= $1 AND created_at < $2
      `, [lastWeek, now])
    ])

    const totalRevenueCurrent = parseFloat(totalRevenue.rows[0]?.total as string || '0')
    const lastMonthRevenueCurrent = parseFloat(lastMonthRevenue.rows[0]?.total as string || '0')
    const currentAOVValue = parseFloat(currentAOV.rows[0]?.avg as string || '0')
    const lastWeekAOVValue = parseFloat(lastWeekAOV.rows[0]?.avg as string || '0')

    // Calculate percentage changes
    const revenueChange = lastMonthRevenueCurrent
      ? ((totalRevenueCurrent - lastMonthRevenueCurrent) / lastMonthRevenueCurrent) * 100
      : 0

    const customerChange = lastMonthCustomers.rows[0]?.count
      ? ((parseInt(totalCustomers.rows[0]?.count as string) - parseInt(lastMonthCustomers.rows[0]?.count as string)) / parseInt(lastMonthCustomers.rows[0]?.count as string)) * 100
      : 0

    const aovChange = lastWeekAOVValue
      ? ((currentAOVValue - lastWeekAOVValue) / lastWeekAOVValue) * 100
      : 0

    return {
      totalRevenue: totalRevenueCurrent,
      revenueChange,
      totalOrders: parseInt(totalOrders.rows[0]?.count as string || '0'),
      newOrders: parseInt(lastHourOrders.rows[0]?.count as string || '0'),
      totalCustomers: parseInt(totalCustomers.rows[0]?.count as string || '0'),
      customerChange,
      averageOrderValue: currentAOVValue,
      aovChange,
    }
  } catch (error) {
    console.error('Error fetching admin metrics:', error)
    return {
      totalRevenue: 0,
      revenueChange: 0,
      totalOrders: 0,
      newOrders: 0,
      totalCustomers: 0,
      customerChange: 0,
      averageOrderValue: 0,
      aovChange: 0,
    }
  }
}

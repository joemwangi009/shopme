import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { db } from '@/lib/db-pool'

interface Order {
  id: string
  total: number
  status: string
  createdAt: Date
}

async function getRecentOrders(): Promise<Order[]> {
  try {
    const result = await db.query<{
      id: unknown
      total: unknown
      status: unknown
      created_at: unknown
    }>(`
      SELECT id, total, status, created_at
      FROM "Order"
      ORDER BY created_at DESC
      LIMIT 5
    `)

    return result.rows.map(row => ({
      id: row.id as string,
      total: parseFloat(row.total as string),
      status: row.status as string,
      createdAt: new Date(row.created_at as string),
    }))
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}

export default async function DashboardPage() {
  const recentOrders = await getRecentOrders()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
        <p className='text-muted-foreground'>
          Welcome back! Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      <DashboardNav />

      {/* Recent Orders */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Recent Orders</h3>
        <div className='space-y-2'>
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className='flex items-center justify-between p-4 border rounded-lg'
            >
              <div>
                <p className='font-medium'>Order #{order.id.slice(0, 8)}</p>
                <p className='text-sm text-muted-foreground'>
                  {order.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className='text-right'>
                <p className='font-medium'>${order.total.toFixed(2)}</p>
                <p className='text-sm text-muted-foreground capitalize'>
                  {order.status.toLowerCase()}
                </p>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <p className='text-muted-foreground'>No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

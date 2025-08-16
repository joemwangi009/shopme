import { db } from '@/lib/db-pool'

interface Order {
  id: string
  total: number
  status: string
  createdAt: Date
}

async function getOrders(): Promise<Order[]> {
  try {
    const result = await db.query<{
      id: unknown
      total: unknown
      status: unknown
      createdAt: unknown
    }>(`
      SELECT id, total, status, "createdAt"
      FROM "Order"
      ORDER BY "createdAt" DESC
    `)

    return result.rows.map(row => ({
      id: row.id as string,
      total: parseFloat(row.total as string),
      status: row.status as string,
      createdAt: new Date(row.createdAt as string),
    }))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Orders</h2>
        <p className='text-muted-foreground'>
          View your order history and track current orders.
        </p>
      </div>

      <div className='space-y-4'>
        {orders.length === 0 ? (
          <p className='text-muted-foreground'>No orders found.</p>
        ) : (
          orders.map((order) => (
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
          ))
        )}
      </div>
    </div>
  )
}

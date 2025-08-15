import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

interface Metrics {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  newOrders: number
  totalCustomers: number
  customerChange: number
  averageOrderValue: number
  aovChange: number
}

interface MetricsCardsProps {
  metrics: Metrics
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Suspense fallback={<MetricCardSkeleton />}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {metrics.revenueChange > 0 ? '+' : ''}
              {metrics.revenueChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+{metrics.totalOrders}</div>
            <p className='text-xs text-muted-foreground'>
              +{metrics.newOrders} since last hour
            </p>
          </CardContent>
        </Card>
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalCustomers}</div>
            <p className='text-xs text-muted-foreground'>
              {metrics.customerChange > 0 ? '+' : ''}
              {metrics.customerChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </Suspense>

      <Suspense fallback={<MetricCardSkeleton />}>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(metrics.averageOrderValue)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {metrics.aovChange > 0 ? '+' : ''}
              {metrics.aovChange.toFixed(1)}% from last week
            </p>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <Skeleton className='h-4 w-24' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-8 w-36 mb-2' />
        <Skeleton className='h-4 w-24' />
      </CardContent>
    </Card>
  )
}

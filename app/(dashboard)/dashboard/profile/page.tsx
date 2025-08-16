import { ProfileForm } from '@/components/dashboard/profile-form'
import { db } from '@/lib/db-pool'

interface User {
  id: string
  name: string
  email: string
  image: string | null
  emailVerified: Date | null
  password: string | null
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

async function getUser(): Promise<User | null> {
  try {
    // For now, we'll get the first user as an example
    // In a real app, you'd get the user from the session
    const result = await db.query<{
      id: unknown
      name: unknown
      email: unknown
      image: unknown
      email_verified: unknown
      password: unknown
      role: unknown
      createdAt: unknown
      updatedAt: unknown
    }>(`
      SELECT id, name, email, image, "emailVerified", password, role, "createdAt", "updatedAt"
      FROM "User"
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      image: row.image as string | null,
      emailVerified: row.email_verified ? new Date(row.email_verified as string) : null,
      password: row.password as string | null,
      role: row.role as 'USER' | 'ADMIN',
      createdAt: new Date(row.createdAt as string),
      updatedAt: new Date(row.updatedAt as string),
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className='space-y-6'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Profile</h2>
          <p className='text-muted-foreground'>
            User not found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Profile</h2>
        <p className='text-muted-foreground'>
          Update your account information and preferences.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}

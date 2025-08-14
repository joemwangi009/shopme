import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db-pool'
import * as z from 'zod'

interface DBUser {
  id: unknown;
  name: unknown;
  email: unknown;
  image: unknown;
  role: unknown;
  createdAt: unknown;
  updatedAt: unknown;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Name must not be longer than 30 characters.',
    }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, email } = profileSchema.parse(body)

    // Check if email is already taken by another user
    const existingUserResult = await db.query<DBUser>(
      'SELECT id FROM "User" WHERE email = $1 AND id != $2',
      [email, session.user.id]
    )

    if (existingUserResult.rows.length > 0) {
      return new NextResponse('Email already taken', { status: 400 })
    }

    // Update the user
    const updateResult = await db.query<DBUser>(
      `UPDATE "User" 
       SET name = $1, email = $2, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, image, role, "createdAt", "updatedAt"`,
      [name, email, session.user.id]
    )

    const updatedUserData = updateResult.rows[0]

    if (!updatedUserData) {
      return new NextResponse('User not found', { status: 404 })
    }

    const updatedUser: User = {
      id: updatedUserData.id as string,
      name: updatedUserData.name as string,
      email: updatedUserData.email as string,
      image: updatedUserData.image as string | null,
      role: updatedUserData.role as string,
      createdAt: new Date(updatedUserData.createdAt as string),
      updatedAt: new Date(updatedUserData.updatedAt as string)
    }

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error('User API Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

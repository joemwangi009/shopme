import NextAuth, { DefaultSession } from 'next-auth'
import authConfig from './auth.config'
import bcrypt from 'bcryptjs'
import Credentials from 'next-auth/providers/credentials'
import { db } from './lib/db-pool'

interface DBUser {
  id: unknown;
  email: unknown;
  name: unknown;
  image: unknown;
  password: unknown;
  role: unknown;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  password: string;
  role: 'USER' | 'ADMIN';
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role?: 'USER' | 'ADMIN'
    } & DefaultSession['user']
  }
  
  interface User {
    role?: 'USER' | 'ADMIN'
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: '/api/auth',
  session: { strategy: 'jwt' },
  ...authConfig,
  pages: {
    // signIn: '/auth/signin',
    // error: '/auth/error',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          const result = await db.query<DBUser>(
            'SELECT id, email, name, image, password, role FROM "User" WHERE email = $1',
            [email]
          )

          const userData = result.rows[0]
          if (!userData) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            userData.password as string
          )

          if (!isPasswordValid) {
            return null
          }

          const user: AuthUser = {
            id: userData.id as string,
            email: userData.email as string,
            name: userData.name as string,
            image: userData.image as string | null,
            password: userData.password as string,
            role: userData.role as 'USER' | 'ADMIN',
          }

          return user
        } catch (error) {
          console.error('Database error during authentication:', error)
          return null
        }
      },
    }),
  ],
})

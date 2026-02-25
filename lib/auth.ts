import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import sql, { initDB } from "@/lib/database"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase()
        const password = credentials?.password?.toString()

        if (!email || !password) {
          return null
        }

        await initDB()

        const users = await sql`
          SELECT id, email, name, password_hash
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `

        const user = users[0]

        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(password, user.password_hash)

        if (!isValid) {
          return null
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = String(token.id)
        }
        session.user.email = token.email ?? session.user.email ?? ""
        session.user.name = token.name ?? session.user.name
      }

      return session
    },
  },
})

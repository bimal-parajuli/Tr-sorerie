import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@tresorerie/api'
import { resolveUser } from '@/lib/auth'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      // Clerk handles authentication (sign-in/sign-up)
      // Supabase (via Prisma) handles role management & data access authorization
      const user = await resolveUser()
      return { user }
    },
  })

export { handler as GET, handler as POST }

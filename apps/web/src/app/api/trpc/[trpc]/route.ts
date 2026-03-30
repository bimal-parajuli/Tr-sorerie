import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@tresorerie/api'
import { UserRole } from '@tresorerie/db'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => {
      // TODO: In production, extract user from JWT/session
      // For now, use a mock dev user for testing
      if (process.env.NODE_ENV === 'development') {
        return {
          user: {
            id: 'dev-user-123',
            role: 'EMPLOYEE' as UserRole,
            memberProfileId: undefined,
          },
        }
      }
      return {}
    },
  })

export { handler as GET, handler as POST }

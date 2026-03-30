import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@sacco/api'

export const trpc = createTRPCReact<AppRouter>()

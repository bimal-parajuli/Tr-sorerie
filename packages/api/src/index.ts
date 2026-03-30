import { router } from './trpc'
import { authRouter } from './routers/auth'
import { membersRouter } from './routers/members'
import { savingsRouter } from './routers/savings'
import { loansRouter } from './routers/loans'
import { expensesRouter } from './routers/expenses'
import { reportsRouter } from './routers/reports'

export const appRouter = router({
  auth: authRouter,
  members: membersRouter,
  savings: savingsRouter,
  loans: loansRouter,
  expenses: expensesRouter,
  reports: reportsRouter,
})

export type AppRouter = typeof appRouter
export * from './trpc'

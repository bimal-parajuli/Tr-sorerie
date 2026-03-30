import { z } from 'zod'
import { router, employeeProcedure, superAdminProcedure } from '../trpc'
import { createExpenseSchema } from '../validation/expenseSchemas'
import prisma from '../../../db/src/client'

export const expensesRouter = router({
  list: employeeProcedure
    .input(z.object({
      category: z.string().optional(),
      fiscalYear: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return prisma.expense.findMany({
        where: {
          category: input.category as any,
          fiscalYear: input.fiscalYear,
        },
        orderBy: { expenseDate: 'desc' },
      })
    }),

  create: employeeProcedure
    .input(createExpenseSchema)
    .mutation(async ({ input, ctx }) => {
      const count = await prisma.expense.count()
      const expenseNumber = `EXP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`
      
      // Simple fiscal year calculation (Nepal fiscal year starts mid-July)
      const date = input.expenseDate ? new Date(input.expenseDate) : new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const fiscalYear = month >= 7 ? `${year}-${(year + 1) % 100}` : `${year - 1}-${year % 100}`

      return prisma.expense.create({
        data: {
          ...input,
          expenseNumber,
          fiscalYear,
          expenseDate: date,
          recordedBy: ctx.user?.id,
          status: 'APPROVED', // Assuming auto-approve for employee for now
        },
      })
    }),

  approve: superAdminProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      return prisma.expense.update({
        where: { id: input },
        data: {
          status: 'APPROVED',
          approvedBy: ctx.user?.id,
        },
      })
    }),
})

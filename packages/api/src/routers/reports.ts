import { z } from 'zod'
import { router, employeeProcedure } from '../trpc'
import prisma from '../../../db/src/client'

export const reportsRouter = router({
  memberSummary: employeeProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const savings = await prisma.savingsAccount.aggregate({
        where: { memberId: input, status: 'ACTIVE' },
        _sum: { balance: true },
      })

      const loans = await prisma.loan.aggregate({
        where: { memberId: input, status: 'ACTIVE' },
        _sum: { outstandingPrincipal: true },
      })

      return {
        totalSavings: savings._sum.balance || 0,
        totalLoansOutstanding: loans._sum.outstandingPrincipal || 0,
        netPosition: (Number(savings._sum.balance || 0)) - (Number(loans._sum.outstandingPrincipal || 0)),
      }
    }),

  portfolioSummary: employeeProcedure
    .query(async () => {
      const totalSavings = await prisma.savingsAccount.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { balance: true },
      })

      const totalLoans = await prisma.loan.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { outstandingPrincipal: true },
      })

      const totalMembers = await prisma.memberProfile.count({
        where: { membershipStatus: 'ACTIVE' },
      })

      const totalExpenses = await prisma.expense.aggregate({
        where: { status: 'PAID' }, // or APPROVED
        _sum: { amount: true },
      })

      return {
        totalSavings: totalSavings._sum.balance || 0,
        totalLoansOutstanding: totalLoans._sum.outstandingPrincipal || 0,
        totalMembers,
        totalExpenses: totalExpenses._sum.amount || 0,
      }
    }),
})

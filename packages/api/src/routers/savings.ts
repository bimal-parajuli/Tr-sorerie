import { z } from 'zod'
import { router, employeeProcedure } from '../trpc'
import { createSavingsAccountSchema, applySavingsTransactionSchema } from '../validation/savingsSchemas'
import prisma from '../../../db/src/client'
import { TRPCError } from '@trpc/server'

export const savingsRouter = router({
  listByMember: employeeProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      return prisma.savingsAccount.findMany({
        where: { memberId: input },
        orderBy: { openedAt: 'desc' },
      })
    }),

  getDetails: employeeProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      return prisma.savingsAccount.findUniqueOrThrow({
        where: { id: input },
        include: {
          transactions: {
            take: 50,
            orderBy: { createdAt: 'desc' },
          },
          member: true,
        },
      })
    }),

  createAccount: employeeProcedure
    .input(createSavingsAccountSchema)
    .mutation(async ({ input }) => {
      const { memberId, accountType, initialDeposit, interestRate } = input
      
      return prisma.$transaction(async (tx) => {
        const count = await tx.savingsAccount.count()
        const accountNumber = `SA-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`
        
        const account = await tx.savingsAccount.create({
          data: {
            memberId,
            accountType,
            accountNumber,
            balance: initialDeposit,
            interestRate,
            openedAt: new Date(),
          },
        })

        if (initialDeposit > 0) {
          const referenceNumber = `TXN-INIT-${Date.now()}`
          await tx.savingsTransaction.create({
            data: {
              accountId: account.id,
              transactionType: 'DEPOSIT',
              amount: initialDeposit,
              balanceBefore: 0,
              balanceAfter: initialDeposit,
              transactionDate: new Date(),
              referenceNumber,
              description: 'Initial deposit',
            },
          })
        }

        return account
      })
    }),

  applyTransaction: employeeProcedure
    .input(applySavingsTransactionSchema)
    .mutation(async ({ input, ctx }) => {
      const { accountId, transactionType, amount, description, transactionDate, metadata } = input
      
      return prisma.$transaction(async (tx) => {
        const account = await tx.savingsAccount.findUniqueOrThrow({
          where: { id: accountId },
        })

        const balanceBefore = account.balance
        let balanceAfter = balanceBefore

        if (['DEPOSIT', 'INTEREST_CREDIT', 'TRANSFER_IN'].includes(transactionType)) {
          balanceAfter = balanceBefore.plus(amount)
        } else if (['WITHDRAWAL', 'FEE_DEBIT', 'TRANSFER_OUT'].includes(transactionType)) {
          if (balanceBefore.lessThan(amount)) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Insufficient balance',
            })
          }
          balanceAfter = balanceBefore.minus(amount)
        }

        const referenceNumber = `TXN-${Date.now()}`
        
        const txn = await tx.savingsTransaction.create({
          data: {
            accountId,
            transactionType,
            amount,
            balanceBefore,
            balanceAfter,
            description,
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            referenceNumber,
            performedBy: ctx.user?.id,
            metadata: metadata ?? undefined,
          },
        })

        await tx.savingsAccount.update({
          where: { id: accountId },
          data: {
            balance: balanceAfter,
            lastTransactionAt: new Date(),
          },
        })

        return txn
      })
    }),
})

import { z } from 'zod'
import { AccountType, TransactionType } from '@tresorerie/db'

export const createSavingsAccountSchema = z.object({
  memberId: z.string().uuid(),
  accountType: z.nativeEnum(AccountType),
  initialDeposit: z.number().min(0).optional().default(0),
  interestRate: z.number().min(0).max(1), // 0 to 1 decimal
})

export const applySavingsTransactionSchema = z.object({
  accountId: z.string().uuid(),
  transactionType: z.nativeEnum(TransactionType),
  amount: z.number().positive(),
  description: z.string().optional(),
  transactionDate: z.string().optional(), // ISO date string
  metadata: z.any().optional(),
})

export type CreateSavingsAccountInput = z.infer<typeof createSavingsAccountSchema>
export type ApplySavingsTransactionInput = z.infer<typeof applySavingsTransactionSchema>

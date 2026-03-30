import { z } from 'zod'
import { ExpenseCategory, PaymentMode } from '@tresorerie/db'

export const createExpenseSchema = z.object({
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().min(3),
  amount: z.number().positive(),
  expenseDate: z.string().optional(),
  vendorName: z.string().optional(),
  paymentMode: z.nativeEnum(PaymentMode),
  receiptUrls: z.array(z.string()).optional().default([]),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

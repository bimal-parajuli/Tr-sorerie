import { z } from 'zod'
import { LoanType, PaymentMode } from '@tresorerie/db'

export const createLoanApplicationSchema = z.object({
  memberId: z.string().uuid(),
  loanType: z.nativeEnum(LoanType),
  requestedAmount: z.number().positive(),
  requestedTenureMonths: z.number().int().positive(),
  purpose: z.string().optional(),
  collateral: z.any().optional(),
})

export const approveLoanSchema = z.object({
  applicationId: z.string().uuid(),
  approvedAmount: z.number().positive(),
  approvedTenureMonths: z.number().int().positive(),
  interestRate: z.number().min(0).max(1),
})

export const disburseLoanSchema = z.object({
  loanId: z.string().uuid(),
  disbursementDate: z.string().optional(),
  firstEmiDate: z.string(),
})

export const recordLoanPaymentSchema = z.object({
  loanId: z.string().uuid(),
  amountPaid: z.number().positive(),
  paymentDate: z.string().optional(),
  paymentMode: z.nativeEnum(PaymentMode),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>
export type ApproveLoanInput = z.infer<typeof approveLoanSchema>
export type DisburseLoanInput = z.infer<typeof disburseLoanSchema>
export type RecordLoanPaymentInput = z.infer<typeof recordLoanPaymentSchema>

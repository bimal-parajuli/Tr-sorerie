import { z } from 'zod'
import { router, employeeProcedure } from '../trpc'
import { 
  createLoanApplicationSchema, 
  approveLoanSchema, 
  disburseLoanSchema, 
  recordLoanPaymentSchema 
} from '../validation/loanSchemas'
import prisma from '@tresorerie/db'
import { TRPCError } from '@trpc/server'

// Helper to calculate EMI
function calculateEMI(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return principal / months
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  return emi
}

export const loansRouter = router({
  listByMember: employeeProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      return prisma.loan.findMany({
        where: { memberId: input },
        orderBy: { disbursedAt: 'desc' },
      })
    }),

  getDetails: employeeProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      return prisma.loan.findUniqueOrThrow({
        where: { id: input },
        include: {
          member: true,
          emiSchedule: {
            orderBy: { installmentNumber: 'asc' },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }),

  createApplication: employeeProcedure
    .input(createLoanApplicationSchema)
    .mutation(async ({ input }) => {
      const count = await prisma.loanApplication.count()
      const applicationNumber = `LNA-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`
      
      return prisma.loanApplication.create({
        data: {
          ...input,
          applicationNumber,
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      })
    }),

  approve: employeeProcedure
    .input(approveLoanSchema)
    .mutation(async ({ input, ctx }) => {
      const { applicationId, approvedAmount, approvedTenureMonths, interestRate } = input
      
      return prisma.$transaction(async (tx) => {
        const application = await tx.loanApplication.findUniqueOrThrow({
          where: { id: applicationId },
        })

        if (application.status !== 'SUBMITTED' && application.status !== 'UNDER_REVIEW') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Application cannot be approved in current status',
          })
        }

        // Update application
        const updatedApplication = await tx.loanApplication.update({
          where: { id: applicationId },
          data: {
            status: 'APPROVED',
            approvedAmount,
            approvedTenureMonths,
            reviewedBy: ctx.user?.id,
            reviewedAt: new Date(),
          },
        })

        const loanCount = await tx.loan.count()
        const loanNumber = `LN-${new Date().getFullYear()}-${(loanCount + 1).toString().padStart(4, '0')}`

        const emiAmount = calculateEMI(approvedAmount, interestRate, approvedTenureMonths)

        // Create loan entry (status is ACTIVE once disbursed)
        return tx.loan.create({
          data: {
            applicationId,
            memberId: application.memberId,
            loanNumber,
            loanType: application.loanType,
            principalAmount: approvedAmount,
            interestRate,
            tenureMonths: approvedTenureMonths,
            emiAmount,
            disbursedAt: new Date(), // placeholder, updated on actual disbursement
            disbursedBy: ctx.user?.id,
            firstEmiDate: new Date(), // placeholder
            outstandingPrincipal: approvedAmount,
            status: 'ACTIVE',
          },
        })
      })
    }),

  disburse: employeeProcedure
    .input(disburseLoanSchema)
    .mutation(async ({ input }) => {
      const { loanId, disbursementAt, firstEmiDate } = input as any // simplifying for now
      
      return prisma.$transaction(async (tx) => {
        const loan = await tx.loan.findUniqueOrThrow({
          where: { id: loanId },
        })

        const disbursedAtDate = disbursementAt ? new Date(disbursementAt) : new Date()
        const firstEmiDateDate = new Date(firstEmiDate)

        // Update loan with real dates
        const updatedLoan = await tx.loan.update({
          where: { id: loanId },
          data: {
            disbursedAt: disbursedAtDate,
            firstEmiDate: firstEmiDateDate,
          },
        })

        // Generate EMI Schedule
        const schedule = []
        let remainingPrincipal = Number(loan.principalAmount)
        const monthlyRate = Number(loan.interestRate) / 12
        const emi = Number(loan.emiAmount)

        for (let i = 1; i <= loan.tenureMonths; i++) {
          const interestComponent = remainingPrincipal * monthlyRate
          const principalComponent = emi - interestComponent
          const openingBalance = remainingPrincipal
          remainingPrincipal -= principalComponent

          const dueDate = new Date(firstEmiDateDate)
          dueDate.setMonth(dueDate.getMonth() + (i - 1))

          schedule.push({
            loanId: loan.id,
            installmentNumber: i,
            dueDate,
            emiAmount: emi,
            principalComponent,
            interestComponent,
            openingBalance,
            closingBalance: Math.max(0, remainingPrincipal),
            status: 'PENDING' as const,
          })
        }

        await tx.loanEMISchedule.createMany({
          data: schedule,
        })

        // Also update application status to DISBURSED
        await tx.loanApplication.update({
          where: { id: loan.applicationId },
          data: { status: 'DISBURSED' },
        })

        return updatedLoan
      })
    }),

  recordPayment: employeeProcedure
    .input(recordLoanPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      const { loanId, amountPaid, paymentDate, paymentMode, paymentReference, notes } = input
      
      return prisma.$transaction(async (tx) => {
        const loan = await tx.loan.findUniqueOrThrow({
          where: { id: loanId },
          include: {
            emiSchedule: {
              where: { status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] } },
              orderBy: { installmentNumber: 'asc' },
            },
          },
        })

        let remainingAmount = amountPaid
        let totalPrincipalPaid = 0
        let totalInterestPaid = 0
        const updatedEmiIds = []

        for (const emi of loan.emiSchedule) {
          if (remainingAmount <= 0) break

          const emiDue = Number(emi.emiAmount) - Number(emi.paidAmount)
          const paymentForThisEmi = Math.min(remainingAmount, emiDue)
          
          // Simplified allocation: Interest first, then principal
          // In a real system, we'd need more precise logic based on actual interest accrued
          // But for this prototype, we'll follow the schedule
          
          totalInterestPaid += Math.min(paymentForThisEmi, Number(emi.interestComponent))
          totalPrincipalPaid += Math.max(0, paymentForThisEmi - Number(emi.interestComponent))

          remainingAmount -= paymentForThisEmi
          updatedEmiIds.push(emi.id)

          await tx.loanEMISchedule.update({
            where: { id: emi.id },
            data: {
              paidAmount: { increment: paymentForThisEmi },
              status: Number(emi.paidAmount) + paymentForThisEmi >= Number(emi.emiAmount) ? 'PAID' : 'PARTIALLY_PAID',
              paidAt: new Date(),
            },
          })
        }

        const paymentCount = await tx.loanPayment.count({ where: { loanId } })
        const paymentNumber = `PMT-${loan.loanNumber}-${(paymentCount + 1).toString().padStart(3, '0')}`

        const payment = await tx.loanPayment.create({
          data: {
            loanId,
            paymentNumber,
            amountPaid,
            principalPaid: totalPrincipalPaid,
            interestPaid: totalInterestPaid,
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            paymentMode,
            paymentReference,
            notes,
            receivedBy: ctx.user?.id,
            emiInstallmentIds: updatedEmiIds,
          },
        })

        // Update loan totals
        await tx.loan.update({
          where: { id: loanId },
          data: {
            outstandingPrincipal: { decrement: totalPrincipalPaid },
            totalPaidPrincipal: { increment: totalPrincipalPaid },
            totalPaidInterest: { increment: totalInterestPaid },
            lastPaymentDate: new Date(),
            status: Number(loan.outstandingPrincipal) - totalPrincipalPaid <= 0 ? 'CLOSED' : 'ACTIVE',
            closedAt: Number(loan.outstandingPrincipal) - totalPrincipalPaid <= 0 ? new Date() : null,
          },
        })

        return payment
      })
    }),
})

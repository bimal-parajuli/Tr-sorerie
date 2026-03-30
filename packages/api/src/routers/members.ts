import { z } from 'zod'
import { router, employeeProcedure } from '../trpc'
import { createMemberSchema } from '../validation/memberSchemas'
import prisma from '../../../db/src/client'

export const membersRouter = router({
  list: employeeProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const { search, limit, offset } = input
      return prisma.memberProfile.findMany({
        where: search ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { memberCode: { contains: search, mode: 'insensitive' } },
            { user: { phoneNumber: { contains: search } } },
          ],
        } : undefined,
        include: {
          user: true,
        },
        take: limit,
        skip: offset,
        orderBy: { joinedAt: 'desc' },
      })
    }),

  getById: employeeProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      return prisma.memberProfile.findUniqueOrThrow({
        where: { id: input },
        include: {
          user: true,
          savingsAccounts: true,
          loans: {
            where: { status: 'ACTIVE' },
          },
        },
      })
    }),

  create: employeeProcedure
    .input(createMemberSchema)
    .mutation(async ({ input, ctx }) => {
      // Create user first if not exists, then member profile
      const { phoneNumber, email, ...profileData } = input
      
      return prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({
          where: { phoneNumber },
        })

        if (!user) {
          user = await tx.user.create({
            data: {
              phoneNumber,
              email,
              role: 'MEMBER',
            },
          })
        }

        const memberCount = await tx.memberProfile.count()
        const memberCode = `MBR-${new Date().getFullYear()}-${(memberCount + 1).toString().padStart(4, '0')}`

        return tx.memberProfile.create({
          data: {
            ...profileData,
            userId: user.id,
            memberCode,
            joinedAt: new Date(),
            createdBy: ctx.user?.id,
            dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
          },
        })
      })
    }),
})

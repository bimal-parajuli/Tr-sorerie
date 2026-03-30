import { initTRPC, TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import { UserRole } from '@tresorerie/db'

export interface Context {
  user?: {
    id: string
    role: UserRole
    memberProfileId?: string
  }
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

const isEmployee = t.middleware(({ ctx, next }) => {
  if (!ctx.user || (ctx.user.role !== 'EMPLOYEE' && ctx.user.role !== 'SUPERADMIN')) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

const isSuperAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'SUPERADMIN') {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  })
})

export const employeeProcedure = t.procedure.use(isEmployee)
export const superAdminProcedure = t.procedure.use(isSuperAdmin)

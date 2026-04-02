import { auth } from '@clerk/nextjs/server'
import prisma from '@tresorerie/db'
import type { UserRole } from '@tresorerie/db'

/**
 * Resolves the current Clerk user to a Supabase/Prisma user.
 * Clerk handles authentication (sign-in/sign-up).
 * Supabase (via Prisma) handles role management and data access authorization.
 */
export async function resolveUser(): Promise<{
  id: string
  role: UserRole
  memberProfileId?: string
} | undefined> {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return undefined
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      memberProfile: {
        select: { id: true },
      },
    },
  })

  if (!user) {
    return undefined
  }

  return {
    id: user.id,
    role: user.role,
    memberProfileId: user.memberProfile?.id,
  }
}

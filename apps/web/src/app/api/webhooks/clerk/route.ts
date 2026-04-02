import { Webhook } from 'svix'
import { headers } from 'next/headers'
import type { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@tresorerie/db'

/**
 * Clerk webhook handler to sync users to Supabase (via Prisma).
 * 
 * When a user signs up or updates their profile in Clerk,
 * we create/update the corresponding user record in Supabase.
 * Role management stays in Supabase - Clerk only handles authentication.
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    )
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- missing svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred -- invalid signature', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, phone_numbers, first_name, last_name } = evt.data

    const email = email_addresses?.[0]?.email_address ?? null
    const phone = phone_numbers?.[0]?.phone_number ?? null

    if (!phone && !email) {
      return new Response('User must have a phone number or email', {
        status: 400,
      })
    }

    // Check if user already exists by email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phoneNumber: phone }] : []),
        ],
      },
    })

    if (existingUser) {
      // Link existing Supabase user to Clerk
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          clerkId: id,
          email: email ?? existingUser.email,
          lastLoginAt: new Date(),
        },
      })
    } else {
      // Create new user in Supabase with default MEMBER role
      // Role will be managed via Supabase/Prisma admin tools
      await prisma.user.create({
        data: {
          clerkId: id,
          phoneNumber: phone ?? `clerk_${id}`,
          email,
          role: 'MEMBER',
          authProviders: ['clerk'],
        },
      })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, phone_numbers } = evt.data

    const email = email_addresses?.[0]?.email_address ?? null
    const phone = phone_numbers?.[0]?.phone_number ?? null

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: id },
    })

    if (existingUser) {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          ...(email ? { email } : {}),
          ...(phone ? { phoneNumber: phone } : {}),
          lastLoginAt: new Date(),
        },
      })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (id) {
      // Soft delete: mark as inactive rather than deleting
      // This preserves data integrity for audit logs and related records
      await prisma.user.updateMany({
        where: { clerkId: id },
        data: { isActive: false },
      })
    }
  }

  return new Response('', { status: 200 })
}

import { z } from 'zod'
import { Gender, IdType, MembershipStatus } from '@tresorerie/db'

export const createMemberSchema = z.object({
  phoneNumber: z.string().min(10),
  fullName: z.string().min(3),
  email: z.string().email().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  address: z.any().optional().nullable(), // Should be refined to match Nepal address structure
  idType: z.nativeEnum(IdType).optional().nullable(),
  idNumber: z.string().optional().nullable(),
  idDocumentUrls: z.array(z.string()).optional().default([]),
  photoUrl: z.string().optional().nullable(),
  nomineeName: z.string().optional().nullable(),
  nomineeRelation: z.string().optional().nullable(),
  metadata: z.any().optional().nullable(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>

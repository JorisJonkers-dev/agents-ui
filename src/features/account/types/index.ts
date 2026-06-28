import type {
  ChangePasswordRequest as AuthChangePasswordRequest,
  ProfileResponse as AuthProfileResponse,
  TotpEnrollResponse as AuthTotpEnrollResponse,
  TotpVerifyRequest as AuthTotpVerifyRequest,
  UpdateProfileRequest as AuthUpdateProfileRequest,
} from '@jorisjonkers-dev/auth-api-client'
import { z } from 'zod'

export const profileResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  totpEnabled: z.boolean(),
  createdAt: z.string(),
})

export const updateProfileRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
})

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
})

export const totpEnrollResponseSchema = z.object({
  secret: z.string(),
  qrUri: z.string(),
})

export const totpVerifyRequestSchema = z.object({
  code: z.string(),
})

export type ProfileRole = 'ADMIN' | 'READONLY' | 'USER' | (string & Record<never, never>)

export type ProfileResponse = Omit<AuthProfileResponse, 'role'> & { role: ProfileRole }

export type UpdateProfileRequest = AuthUpdateProfileRequest
export type ChangePasswordRequest = AuthChangePasswordRequest
export type TotpEnrollResponse = AuthTotpEnrollResponse
export type TotpVerifyRequest = AuthTotpVerifyRequest

import type { z } from 'zod'
import { describe, expect, it } from 'vitest'
import {
  forgotPasswordRequestSchema,
  passwordConfirmationSchema,
  registerUserRequestSchema,
  resendConfirmationRequestSchema,
  resetPasswordRequestSchema,
} from '../types'

// These schemas gate account creation, password reset and password
// confirmation, and no test asserted any of their rules. A removed .trim() or a
// weakened minimum was invisible.
function registration(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    username: 'alice',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    password: 'securepass',
    ...overrides,
  }
}

function messageFor(schema: z.ZodType, value: unknown, field: string): string | undefined {
  // Typed as a zod schema rather than asserted: safeParse returns a
  // discriminated union, so narrowing on success needs no cast.
  const result = schema.safeParse(value)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path.includes(field))?.message
}

describe('registerUserRequestSchema', () => {
  it('accepts a complete registration', () => {
    expect(registerUserRequestSchema.safeParse(registration()).success).toBe(true)
  })

  it.each([
    ['username', 'Username is required'],
    ['firstName', 'First name is required'],
    ['lastName', 'Last name is required'],
  ])('rejects a whitespace-only %s', (field, message) => {
    // The rule trims before checking, so whitespace alone must not pass. A
    // removed .trim() would let '   ' through as a name.
    expect(messageFor(registerUserRequestSchema, registration({ [field]: '   ' }), field)).toBe(
      message,
    )
  })

  it.each(['username', 'firstName', 'lastName'])('rejects an empty %s', (field) => {
    expect(registerUserRequestSchema.safeParse(registration({ [field]: '' })).success).toBe(false)
  })

  it('accepts a password of exactly the minimum length', () => {
    expect(
      registerUserRequestSchema.safeParse(registration({ password: 'a'.repeat(8) })).success,
    ).toBe(true)
  })

  it('rejects a password one character short', () => {
    expect(
      messageFor(registerUserRequestSchema, registration({ password: 'a'.repeat(7) }), 'password'),
    ).toBe('Password must be at least 8 characters')
  })

  it('does not trim the password, since spaces are legitimate characters in one', () => {
    const password = '  spaced  '
    expect(registerUserRequestSchema.safeParse(registration({ password })).success).toBe(true)
  })

  it.each(['not-an-email', 'alice@', '@example.com', 'alice example.com', ''])(
    'rejects %j as an email address',
    (email) => {
      expect(messageFor(registerUserRequestSchema, registration({ email }), 'email')).toBe(
        'Enter a valid email address',
      )
    },
  )
})

describe('email-only requests', () => {
  it.each([
    ['resendConfirmation', resendConfirmationRequestSchema],
    ['forgotPassword', forgotPasswordRequestSchema],
  ])('%s accepts a valid address and rejects an invalid one', (_name, schema) => {
    expect(schema.safeParse({ email: 'alice@example.com' }).success).toBe(true)
    expect(messageFor(schema, { email: 'nope' }, 'email')).toBe('Enter a valid email address')
  })
})

describe('resetPasswordRequestSchema', () => {
  it('accepts a token with a long enough password', () => {
    expect(
      resetPasswordRequestSchema.safeParse({ token: 'abc123', newPassword: 'a'.repeat(8) }).success,
    ).toBe(true)
  })

  it('rejects a whitespace-only token', () => {
    // Without the trim a blank token would reach the API as a reset attempt.
    expect(
      messageFor(resetPasswordRequestSchema, { token: '   ', newPassword: 'a'.repeat(8) }, 'token'),
    ).toBe('Reset token is required')
  })

  it('rejects a new password one character short', () => {
    expect(
      messageFor(
        resetPasswordRequestSchema,
        { token: 'abc123', newPassword: 'a'.repeat(7) },
        'newPassword',
      ),
    ).toBe('Password must be at least 8 characters')
  })
})

describe('passwordConfirmationSchema', () => {
  it('accepts a matching pair at the minimum length', () => {
    const password = 'a'.repeat(8)
    expect(passwordConfirmationSchema.safeParse({ password, confirmPassword: password }).success).toBe(
      true,
    )
  })

  it('reports a mismatch under confirmPassword, where the form renders it', () => {
    const result = passwordConfirmationSchema.safeParse({
      password: 'securepass',
      confirmPassword: 'different1',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'confirmPassword')
      expect(issue?.message).toBe('Passwords must match')
    }
  })

  it('rejects a password one character short even when both fields match', () => {
    const password = 'a'.repeat(7)
    expect(
      messageFor(passwordConfirmationSchema, { password, confirmPassword: password }, 'password'),
    ).toBe('Password must be at least 8 characters')
  })

  it('rejects an empty confirmation', () => {
    expect(
      messageFor(passwordConfirmationSchema, { password: 'securepass', confirmPassword: '' }, 'confirmPassword'),
    ).toBe('Confirm your password')
  })
})

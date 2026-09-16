import { describe, expect, it } from 'vitest'
import { workspaceFailureReason, workspaceStatusTextClass } from '../lib/workspaceStatusPresentation'

describe('workspaceStatusTextClass', () => {
  it('gives FAILED a distinct colour', () => {
    expect(workspaceStatusTextClass('FAILED')).toBe('text-red-400')
  })

  it.each(['PREPARING', 'READY', 'DESTROYED'] as const)('stays muted for %s', (status) => {
    expect(workspaceStatusTextClass(status)).toBe('text-[var(--color-text-muted)]')
  })
})

describe('workspaceFailureReason', () => {
  it('returns the trimmed reason when FAILED with a reason', () => {
    expect(workspaceFailureReason('FAILED', '  pod image pull failed  ')).toBe('pod image pull failed')
  })

  it('returns null when FAILED but the reason is missing', () => {
    expect(workspaceFailureReason('FAILED', null)).toBeNull()
    expect(workspaceFailureReason('FAILED', undefined)).toBeNull()
  })

  it('returns null when FAILED but the reason is blank', () => {
    expect(workspaceFailureReason('FAILED', '   ')).toBeNull()
  })

  it.each(['PREPARING', 'READY', 'DESTROYED'] as const)(
    'returns null for %s even when a reason is present',
    (status) => {
      expect(workspaceFailureReason(status, 'some reason')).toBeNull()
    },
  )
})

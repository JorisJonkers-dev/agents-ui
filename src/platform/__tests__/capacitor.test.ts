import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { capacitorAppUrlOpener } from '../capacitor/appUrlOpener'
import { getCapacitorPlatformInfo } from '../capacitor/platformInfo'
import { capacitorSecureStorage } from '../capacitor/secureStorage'

// The native adapters had no tests: every mutant in them was reported as
// uncovered, so nothing here was verified on the path Android and iOS actually
// take.
//
// vi.mock factories are hoisted above the module body, so everything they close
// over has to come from vi.hoisted rather than a plain top-level binding.
const mocks = vi.hoisted(() => {
  const store = new Map<string, string>()
  return {
    store,
    preferences: {
      get: vi.fn(async ({ key }: { key: string }) => ({
        value: store.get(key) ?? null,
      })),
      set: vi.fn(async ({ key, value }: { key: string; value: string }) => {
        store.set(key, value)
      }),
      remove: vi.fn(async ({ key }: { key: string }) => {
        store.delete(key)
      }),
    },
    addListener: vi.fn(),
    platform: { name: 'android' },
  }
})

vi.mock('@capacitor/preferences', () => ({ Preferences: mocks.preferences }))
vi.mock('@capacitor/app', () => ({ App: { addListener: mocks.addListener } }))
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => mocks.platform.name },
}))

describe('capacitorSecureStorage', () => {
  beforeEach(() => {
    mocks.store.clear()
    vi.clearAllMocks()
  })

  it('round-trips a value through Preferences', async () => {
    await capacitorSecureStorage.setItem('session', 'abc123')
    await expect(capacitorSecureStorage.getItem('session')).resolves.toBe(
      'abc123',
    )
    await capacitorSecureStorage.removeItem('session')
    await expect(capacitorSecureStorage.getItem('session')).resolves.toBeNull()
  })

  it('passes the key and value through unchanged', async () => {
    // A swapped or dropped argument here silently writes to the wrong key,
    // which reads back as a logged-out user rather than as an error.
    await capacitorSecureStorage.setItem('a-key', 'a-value')
    expect(mocks.preferences.set).toHaveBeenCalledWith({
      key: 'a-key',
      value: 'a-value',
    })

    await capacitorSecureStorage.getItem('a-key')
    expect(mocks.preferences.get).toHaveBeenCalledWith({ key: 'a-key' })

    await capacitorSecureStorage.removeItem('a-key')
    expect(mocks.preferences.remove).toHaveBeenCalledWith({ key: 'a-key' })
  })

  it('returns null for a key that was never written', async () => {
    await expect(capacitorSecureStorage.getItem('absent')).resolves.toBeNull()
  })
})

describe('capacitorAppUrlOpener', () => {
  const assign = vi.fn()
  const open = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('location', { assign })
    vi.stubGlobal('open', open)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('navigates in place for a deep link', async () => {
    await capacitorAppUrlOpener.openDeepLink('agents://projects/7')
    expect(assign).toHaveBeenCalledWith('agents://projects/7')
    expect(open).not.toHaveBeenCalled()
  })

  it('navigates in place when the target is _self', async () => {
    await capacitorAppUrlOpener.openUrl(
      'https://agents.jorisjonkers.dev/x',
      '_self',
    )
    expect(assign).toHaveBeenCalledWith('https://agents.jorisjonkers.dev/x')
    expect(open).not.toHaveBeenCalled()
  })

  it('opens a new context with noopener and noreferrer', async () => {
    // Without these the opened page can reach back through window.opener and
    // navigate this app. The features string is a security property, not a
    // preference.
    await capacitorAppUrlOpener.openUrl('https://example.com/doc')
    expect(open).toHaveBeenCalledWith(
      'https://example.com/doc',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('defaults to a new tab when no target is given', async () => {
    await capacitorAppUrlOpener.openUrl('https://example.com/doc')
    expect(open).toHaveBeenCalledWith(
      'https://example.com/doc',
      '_blank',
      expect.any(String),
    )
    expect(assign).not.toHaveBeenCalled()
  })

  it('honours an explicitly requested new tab', async () => {
    // The signature allows only _blank and _self, so an explicit _blank must
    // behave the same as the default rather than falling into the _self branch.
    await capacitorAppUrlOpener.openUrl('https://example.com/doc', '_blank')
    expect(open).toHaveBeenCalledWith(
      'https://example.com/doc',
      '_blank',
      'noopener,noreferrer',
    )
    expect(assign).not.toHaveBeenCalled()
  })

  it('forwards the opened url to the listener and can be removed', async () => {
    const remove = vi.fn()
    let captured: ((event: { url: string }) => void) | undefined
    mocks.addListener.mockImplementation(
      async (_event: string, handler: (e: { url: string }) => void) => {
        captured = handler
        return { remove }
      },
    )

    const listener = vi.fn()
    const registration = await capacitorAppUrlOpener.onAppUrlOpen(listener)

    expect(mocks.addListener).toHaveBeenCalledWith(
      'appUrlOpen',
      expect.any(Function),
    )

    captured?.({ url: 'agents://projects/7' })
    expect(listener).toHaveBeenCalledWith({ url: 'agents://projects/7' })

    registration.remove()
    expect(remove).toHaveBeenCalled()
  })
})

describe('getCapacitorPlatformInfo', () => {
  it('always reports native, since this adapter only loads on a device', () => {
    mocks.platform.name = 'android'
    expect(getCapacitorPlatformInfo().isNative).toBe(true)
  })

  it('passes android and ios through', () => {
    for (const name of ['android', 'ios'] as const) {
      mocks.platform.name = name
      expect(getCapacitorPlatformInfo().platform).toBe(name)
    }
  })

  it('normalises any unrecognised platform to web', () => {
    // Capacitor reports 'web' in a browser, and a future platform name must not
    // leak through as an unexpected value.
    for (const name of ['web', 'electron', 'windows', '']) {
      mocks.platform.name = name
      expect(getCapacitorPlatformInfo().platform).toBe('web')
    }
  })
})

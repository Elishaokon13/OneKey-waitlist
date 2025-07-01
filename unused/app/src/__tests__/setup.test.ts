/**
 * Basic test to verify Jest setup is working correctly
 */
describe('Testing Framework Setup', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to environment variables', () => {
    expect(process.env.NEXT_PUBLIC_PRIVY_APP_ID).toBe('test-privy-app-id')
    expect(process.env.NEXT_PUBLIC_EAS_SCHEMA_UID).toBe('test-schema-uid')
    expect(process.env.NEXT_PUBLIC_LIT_NETWORK).toBe('cayenne')
  })

  it('should have TextEncoder and TextDecoder available', () => {
    expect(global.TextEncoder).toBeDefined()
    expect(global.TextDecoder).toBeDefined()
  })

  it('should have mocked window.matchMedia', () => {
    expect(window.matchMedia).toBeDefined()
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    expect(mediaQuery.matches).toBe(false)
  })
}) 
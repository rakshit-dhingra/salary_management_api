import { describe, it, expect } from 'vitest'
import { fmt$, fmtNum, fmtDate } from './utils'

describe('fmt$', () => {
  it('formats full currency', () => {
    expect(fmt$(120000)).toBe('$120,000')
  })
  it('compact: shows k for thousands', () => {
    expect(fmt$(85000, true)).toBe('$85k')
  })
  it('compact: shows M for millions', () => {
    expect(fmt$(2_500_000, true)).toBe('$2.5M')
  })
  it('returns — for null', () => {
    expect(fmt$(null)).toBe('—')
  })
  it('handles zero', () => {
    expect(fmt$(0)).toBe('$0')
  })
})

describe('fmtNum', () => {
  it('adds commas', () => {
    expect(fmtNum(10000)).toBe('10,000')
  })
  it('handles small numbers', () => {
    expect(fmtNum(42)).toBe('42')
  })
})

describe('fmtDate', () => {
  it('returns — for falsy input', () => {
    expect(fmtDate(null)).toBe('—')
    expect(fmtDate('')).toBe('—')
  })
  it('returns a readable date string', () => {
    const result = fmtDate('2022-06-15')
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/2022/)
  })
})
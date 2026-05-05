import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(()  => vi.useRealTimers())

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update before delay', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } }
    )
    rerender({ v: 'b' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
  })

  it('updates after delay', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } }
    )
    rerender({ v: 'b' })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('b')
  })

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: 'a' } }
    )
    rerender({ v: 'b' })
    act(() => vi.advanceTimersByTime(150))
    rerender({ v: 'c' })
    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('a')   // timer reset, not fired yet
    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('c')
  })
})
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.clearAllMocks()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

window.ResizeObserver = ResizeObserverMock as typeof ResizeObserver
window.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver
window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.scrollTo = vi.fn()
window.requestAnimationFrame = (callback: FrameRequestCallback) => window.setTimeout(callback, 0)
window.cancelAnimationFrame = (handle: number) => window.clearTimeout(handle)
window.PointerEvent = MouseEvent as typeof PointerEvent

vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({
    value = '',
    onChange,
    className,
    options,
  }: {
    value?: string
    onChange?: (value?: string) => void
    className?: string
    options?: { readOnly?: boolean }
  }) => (
    <textarea
      aria-label={options?.readOnly ? 'Monaco read only editor' : 'Monaco editor'}
      className={className}
      data-testid={options?.readOnly ? 'monaco-readonly' : 'monaco-editor'}
      readOnly={options?.readOnly}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
  DiffEditor: ({
    original = '',
    modified = '',
  }: {
    original?: string
    modified?: string
  }) => <div data-testid="monaco-diff">{`${original}\n---\n${modified}`}</div>,
}))

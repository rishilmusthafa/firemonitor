import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Cesium
jest.mock('cesium', () => ({
  Ion: {
    defaultAccessToken: 'test-token',
  },
  Cartesian3: {
    fromDegrees: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  },
  Viewer: jest.fn().mockImplementation(() => ({
    camera: {
      flyTo: jest.fn(),
      zoomIn: jest.fn(),
      position: { x: 0, y: 0, z: 0 },
    },
    entities: {
      add: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
    },
    scene: {
      camera: {
        position: { x: 0, y: 0, z: 0 },
      },
    },
  })),
}))

// Mock Resium
jest.mock('resium', () => ({
  Viewer: ({ children, ...props }) => <div data-testid="cesium-viewer" {...props}>{children}</div>,
  Entity: ({ children, ...props }) => <div data-testid="cesium-entity" {...props}>{children}</div>,
  Camera: ({ children, ...props }) => <div data-testid="cesium-camera" {...props}>{children}</div>,
}))

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock Web Workers
global.Worker = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
}) 
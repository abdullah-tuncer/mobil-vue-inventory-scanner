import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResizeObserver from 'resize-observer-polyfill';

(globalThis as any).ResizeObserver = ResizeObserver;

// Vuetify'ı oluştur
const vuetify = createVuetify({
  components,
  directives
})

// Global bileşenleri yapılandır
config.global.plugins = [vuetify]

// Capacitor ve diğer native plugin'leri mock'layalım
vi.mock('@capacitor/splash-screen', () => ({
  SplashScreen: {
    hide: vi.fn().mockResolvedValue(undefined),
    show: vi.fn().mockResolvedValue(undefined)
  }
}))

vi.mock('@capacitor-mlkit/barcode-scanning', () => ({
  BarcodeScanner: {
    requestPermissions: vi.fn().mockResolvedValue({ camera: 'granted' }),
    addListener: vi.fn().mockResolvedValue(undefined),
    removeAllListeners: vi.fn().mockResolvedValue(undefined),
    startScan: vi.fn().mockResolvedValue(undefined),
    stopScan: vi.fn().mockResolvedValue(undefined)
  }
}))

vi.mock('@capacitor-community/sqlite', () => ({
  CapacitorSQLite: {
    echo: vi.fn().mockResolvedValue({value: 'mock'}),
    createConnection: vi.fn().mockResolvedValue(undefined),
    closeConnection: vi.fn().mockResolvedValue(undefined),
    execute: vi.fn().mockResolvedValue({changes: 0, lastId: 0}),
    query: vi.fn().mockResolvedValue({values: []})
  },
  SQLiteConnection: vi.fn().mockImplementation(() => ({
    createConnection: vi.fn(),
    closeAllConnections: vi.fn(),
    retrieveConnection: vi.fn(),
    isConnection: vi.fn(),
  }))
}))

vi.mock("../services/BarkodTaramaService.ts", () => ({
  default: {
    scanBarcode: vi.fn(),
    startContinuousScan: vi.fn(),
    stopContinuousScan: vi.fn().mockResolvedValue(undefined)
  },
}));

vi.mock("vue3-toastify", () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Global özellikleri mock'layalım
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// HTML Audio API'sini mock'layalım
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
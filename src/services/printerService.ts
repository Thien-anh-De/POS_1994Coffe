// ============================================================
// POS 1994 Coffee — Printer Settings Service
// Manages thermal printer configuration via localStorage
// ============================================================

export interface PrinterSettings {
  paperSize: 'K80' | 'K58'
  shopName: string
  shopAddress: string
  shopPhone: string
  wifi: string
  footerMessage: string
  autoPrintOnPay: boolean
  printPreBill: boolean
  numberOfCopies: number
}

export const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  paperSize: 'K80',
  shopName: '1994 COFFEE',
  shopAddress: '123 Đường Cà Phê, Quận 1, TP.HCM',
  shopPhone: '0901 994 994',
  wifi: 'Wifi: 1994 Coffee - Pass: 1994coffee',
  footerMessage: 'Cảm ơn Quý khách & Hẹn gặp lại!',
  autoPrintOnPay: true,
  printPreBill: true,
  numberOfCopies: 1,
}

const STORAGE_KEY = 'pos_1994_printer_settings'

export const printerService = {
  getSettings(): PrinterSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return { ...DEFAULT_PRINTER_SETTINGS, ...JSON.parse(stored) }
      }
    } catch {
      // ignore parse errors
    }
    return { ...DEFAULT_PRINTER_SETTINGS }
  },

  saveSettings(settings: PrinterSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  },

  resetSettings(): PrinterSettings {
    localStorage.removeItem(STORAGE_KEY)
    return { ...DEFAULT_PRINTER_SETTINGS }
  },
}

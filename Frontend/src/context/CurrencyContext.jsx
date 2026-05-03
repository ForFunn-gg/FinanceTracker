import { createContext, useContext, useState, useCallback } from 'react'

export const CURRENCIES = [
  { code: 'PHP', symbol: '₱',  locale: 'en-PH', name: 'Philippine Peso'    },
  { code: 'USD', symbol: '$',  locale: 'en-US', name: 'US Dollar'           },
  { code: 'EUR', symbol: '€',  locale: 'de-DE', name: 'Euro'                },
  { code: 'GBP', symbol: '£',  locale: 'en-GB', name: 'British Pound'       },
  { code: 'JPY', symbol: '¥',  locale: 'ja-JP', name: 'Japanese Yen'        },
  { code: 'CNY', symbol: '¥',  locale: 'zh-CN', name: 'Chinese Yuan'        },
  { code: 'KRW', symbol: '₩',  locale: 'ko-KR', name: 'South Korean Won'    },
  { code: 'INR', symbol: '₹',  locale: 'en-IN', name: 'Indian Rupee'        },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar'   },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar'     },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar'    },
  { code: 'HKD', symbol: 'HK$',locale: 'zh-HK', name: 'Hong Kong Dollar'   },
  { code: 'MYR', symbol: 'RM', locale: 'ms-MY', name: 'Malaysian Ringgit'   },
  { code: 'THB', symbol: '฿',  locale: 'th-TH', name: 'Thai Baht'           },
  { code: 'IDR', symbol: 'Rp', locale: 'id-ID', name: 'Indonesian Rupiah'   },
  { code: 'VND', symbol: '₫',  locale: 'vi-VN', name: 'Vietnamese Dong'     },
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR', name: 'Brazilian Real'      },
  { code: 'MXN', symbol: 'MX$',locale: 'es-MX', name: 'Mexican Peso'       },
  { code: 'ARS', symbol: 'AR$',locale: 'es-AR', name: 'Argentine Peso'     },
  { code: 'CHF', symbol: 'Fr', locale: 'de-CH', name: 'Swiss Franc'         },
  { code: 'SEK', symbol: 'kr', locale: 'sv-SE', name: 'Swedish Krona'       },
  { code: 'NOK', symbol: 'kr', locale: 'nb-NO', name: 'Norwegian Krone'     },
  { code: 'DKK', symbol: 'kr', locale: 'da-DK', name: 'Danish Krone'        },
  { code: 'NZD', symbol: 'NZ$',locale: 'en-NZ', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R',  locale: 'en-ZA', name: 'South African Rand'  },
  { code: 'NGN', symbol: '₦',  locale: 'en-NG', name: 'Nigerian Naira'      },
  { code: 'KES', symbol: 'KSh',locale: 'sw-KE', name: 'Kenyan Shilling'    },
  { code: 'EGP', symbol: 'E£', locale: 'ar-EG', name: 'Egyptian Pound'      },
  { code: 'SAR', symbol: '﷼',  locale: 'ar-SA', name: 'Saudi Riyal'         },
  { code: 'AED', symbol: 'د.إ',locale: 'ar-AE', name: 'UAE Dirham'          },
  { code: 'TRY', symbol: '₺',  locale: 'tr-TR', name: 'Turkish Lira'        },
  { code: 'RUB', symbol: '₽',  locale: 'ru-RU', name: 'Russian Ruble'       },
  { code: 'PLN', symbol: 'zł', locale: 'pl-PL', name: 'Polish Zloty'        },
  { code: 'CZK', symbol: 'Kč', locale: 'cs-CZ', name: 'Czech Koruna'        },
  { code: 'HUF', symbol: 'Ft', locale: 'hu-HU', name: 'Hungarian Forint'    },
  { code: 'RON', symbol: 'lei',locale: 'ro-RO', name: 'Romanian Leu'        },
]

const STORAGE_KEY = 'finflow_currency'
const DEFAULT_CODE = 'PHP'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return CURRENCIES.find(c => c.code === saved)?.code ?? DEFAULT_CODE
  })

  const currency = CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]

  const setCurrency = useCallback((newCode) => {
    const found = CURRENCIES.find(c => c.code === newCode)
    if (!found) return
    localStorage.setItem(STORAGE_KEY, newCode)
    setCode(newCode)
  }, [])

  const formatCurrency = useCallback((amount) => {
    const n = Number(amount) || 0
    const noDecimals = ['JPY', 'KRW', 'VND', 'IDR', 'HUF'].includes(currency.code)
    try {
      return currency.symbol + n.toLocaleString(currency.locale, {
        minimumFractionDigits: noDecimals ? 0 : 2,
        maximumFractionDigits: noDecimals ? 0 : 2,
      })
    } catch {
      return currency.symbol + n.toFixed(noDecimals ? 0 : 2)
    }
  }, [currency])

  return (
    <CurrencyContext.Provider value={{ currency, code, setCurrency, formatCurrency, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside <CurrencyProvider>')
  return ctx
}
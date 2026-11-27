import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es'
import pt from './locales/pt'

export type Lang = 'pt' | 'es'
const KEY = 'caliope.lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'pt' || saved === 'es') return saved
  } catch { /* sem storage */ }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'pt'
}

void i18n.use(initReactI18next).init({
  resources: { pt: { translation: pt }, es: { translation: es } },
  lng: initialLang(),
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (l) => {
  document.documentElement.lang = l
  try { localStorage.setItem(KEY, l) } catch { /* sem storage */ }
})
document.documentElement.lang = i18n.language

export default i18n

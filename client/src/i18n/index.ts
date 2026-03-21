import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ptBR from './pt-BR.json'

const saved = localStorage.getItem('ito-lang')
const browser = navigator.language.startsWith('pt') ? 'pt-BR' : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
  lng: saved ?? browser,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n

import { useTranslation } from 'react-i18next'

export function LangToggle() {
  const { i18n } = useTranslation()
  return (
    <div className="lang" role="group" aria-label="Idioma / Idioma">
      {(['es', 'pt'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={i18n.language === l} onClick={() => void i18n.changeLanguage(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

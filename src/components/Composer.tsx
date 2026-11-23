import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const MAX = 280

export function Composer({ onPublish, onClose }: { onPublish: (text: string) => void; onClose: () => void }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const ok = text.trim().length > 0
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (ok) onPublish(text.trim()) }}>
        <h2>{t('composer.title')}</h2>
        <textarea autoFocus maxLength={MAX} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('composer.placeholder')} rows={5} />
        <div className="sheet-row">
          <span className="count">{text.length}/{MAX}</span>
          <button type="button" className="ghost" onClick={onClose}>{t('composer.cancel')}</button>
          <button type="submit" className="primary small" disabled={!ok}>{t('composer.publish')}</button>
        </div>
      </form>
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Kind, NewPost } from '../store'

type Data = Pick<NewPost, 'text' | 'title' | 'url' | 'featured'>

const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s)

export function Composer({ kind, onPublish, onClose }: { kind: Kind; onPublish: (d: Data) => void; onClose: () => void }) {
  const { t } = useTranslation()
  const romance = kind === 'romance'
  const max = romance ? 1000 : 280
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  const ok = text.trim().length > 0 && (!romance || (title.trim().length > 0 && isUrl(url.trim())))
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <form
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (!ok) return
          onPublish(romance ? { text: text.trim(), title: title.trim(), url: url.trim(), featured } : { text: text.trim() })
        }}
      >
        <h2>{t(romance ? 'composer.titleRomance' : 'composer.title')}</h2>
        {romance && (
          <>
            <input autoFocus maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('composer.workTitle')} />
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('composer.workUrl')} />
          </>
        )}
        <textarea autoFocus={!romance} maxLength={max} value={text} onChange={(e) => setText(e.target.value)} placeholder={t(romance ? 'composer.previewPlaceholder' : 'composer.placeholder')} rows={romance ? 7 : 5} />
        {romance && (
          <label className="check">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> {t('composer.featured')}
          </label>
        )}
        <div className="sheet-row">
          <span className="count">{text.length}/{max}</span>
          <button type="button" className="ghost" onClick={onClose}>{t('composer.cancel')}</button>
          <button type="submit" className="primary small" disabled={!ok}>{t('composer.publish')}</button>
        </div>
      </form>
    </div>
  )
}

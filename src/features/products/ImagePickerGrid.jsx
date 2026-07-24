import { useRef, useState } from 'react'
import { compressImage } from '../../utils/compressImage'

// -- Icons -------------------------------------------------------------------

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

function SmileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  )
}

// -- Image cache (localStorage) ----------------------------------------------

const IMG_CACHE_KEY = 'wte-image-cache'

function loadImageCache() {
  try { return JSON.parse(localStorage.getItem(IMG_CACHE_KEY) ?? '[]') } catch { return [] }
}

function saveToImageCache(base64) {
  try {
    const cache = loadImageCache().filter(img => img !== base64)
    localStorage.setItem(IMG_CACHE_KEY, JSON.stringify([base64, ...cache]))
  } catch { /* ignore localStorage errors */ }
}

// -- GallerySheet ------------------------------------------------------------

function GallerySheet({ onSelect, onClose }) {
  const images = loadImageCache()
  return (
    <div
      className="fixed inset-0 z-[70]"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Fermer la galerie"
    >
      <div className="absolute inset-0 bg-ink-primary/30" />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary p-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-4" />
        <p className="font-display font-semibold text-[16px] text-ink-primary mb-4">Galerie</p>
        {images.length === 0 ? (
          <p className="font-body text-[15px] text-ink-primary">Aucune photo en cache pour l'instant.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { onSelect(img); onClose() }}
                className="aspect-square rounded-xl overflow-hidden border border-ink-primary active:scale-95 transition-all"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// -- ImagePickerGrid ---------------------------------------------------------
// Grille 2×2 (photo caméra / photo galerie / galerie app / emoji).
// Gère son propre état interne (emojiMode, showGallery, refs fichiers).
// Le parent contrôle les valeurs image + emoji.
//
// Props:
//   image          string|null
//   onImageChange  (img: string|null) => void
//   emoji          string|null
//   onEmojiChange  (em: string|null) => void
//   onImagePicked  () => void  — optionnel : appelé après sélection photo/galerie
//                               (permet à ImagePickerSheet de se fermer automatiquement)

export default function ImagePickerGrid({ image, onImageChange, emoji, onEmojiChange, onImagePicked }) {
  const [showGallery, setShowGallery] = useState(false)
  const [emojiMode,   setEmojiMode]   = useState(false)
  const fileRef   = useRef()
  const cameraRef = useRef()

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    compressImage(file, (dataUrl) => {
      onImageChange(dataUrl)
      saveToImageCache(dataUrl)
      onImagePicked?.()
    })
  }

  const btnCls = 'aspect-square flex flex-col items-center justify-center gap-2 bg-canvas border border-ink-primary rounded-xl text-ink-primary hover:bg-brand active:scale-95 transition-all'

  return (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
      <input ref={fileRef}   type="file" accept="image/*" className="hidden" onChange={handleImage} />

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setEmojiMode(false); cameraRef.current.click() }} className={btnCls}>
          <CameraIcon />
          <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Prendre une photo</span>
        </button>
        <button onClick={() => { setEmojiMode(false); fileRef.current.click() }} className={btnCls}>
          <ImageIcon />
          <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Ajouter une photo</span>
        </button>
        <button onClick={() => { setEmojiMode(false); setShowGallery(true) }} className={btnCls}>
          <GridIcon />
          <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Galerie</span>
        </button>
        <button
          onClick={() => { onImageChange(null); setEmojiMode(m => !m) }}
          className={`${btnCls} ${emojiMode ? 'bg-brand' : ''}`}
        >
          {emoji ? <span className="text-3xl leading-none">{emoji}</span> : <SmileIcon />}
          <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Emoji</span>
        </button>
      </div>

      {emojiMode && (
        <div className="mt-3">
          <label htmlFor="img-picker-emoji" className="font-body font-semibold text-[16px] text-ink-primary mb-1.5 block">Emoji</label>
          <input
            id="img-picker-emoji"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={emojiMode}
            type="text"
            value={emoji ?? ''}
            onChange={e => onEmojiChange(e.target.value || null)}
            placeholder="😊"
            className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[28px] text-center placeholder:text-ink-primary/40 outline-none focus:border-forest transition-colors"
          />
        </div>
      )}

      {showGallery && (
        <GallerySheet
          onSelect={(img) => { onImageChange(img); onImagePicked?.() }}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  )
}

// -- ImagePickerSheet --------------------------------------------------------
// Wrapper bottom sheet autour de ImagePickerGrid — utilisé dans VoiceReviewRow.
// Les photos ferment le sheet automatiquement via onImagePicked.
// L'emoji reste ouvert jusqu'au tap sur le backdrop ou Échap.

export function ImagePickerSheet({ image, onImageChange, emoji, onEmojiChange, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Fermer le sélecteur d'image"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary p-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-5" />
        <p className="font-display font-bold text-[18px] text-ink-primary mb-4">Changer l'image</p>
        <ImagePickerGrid
          image={image}
          onImageChange={onImageChange}
          emoji={emoji}
          onEmojiChange={onEmojiChange}
          onImagePicked={onClose}
        />
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-xl border border-ink-primary bg-canvas-border text-ink-primary font-body font-semibold text-[15px] active:scale-[.98] transition-all"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

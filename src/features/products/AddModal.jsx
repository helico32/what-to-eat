import { useState, useRef } from 'react'
import { compressImage } from '../../utils/compressImage'

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

const IMG_CACHE_KEY = 'wte-image-cache'

function loadImageCache() {
  try { return JSON.parse(localStorage.getItem(IMG_CACHE_KEY) ?? '[]') } catch { return [] }
}

function saveToImageCache(base64) {
  try {
    const cache = loadImageCache().filter(img => img !== base64)
    localStorage.setItem(IMG_CACHE_KEY, JSON.stringify([base64, ...cache]))
  } catch {}
}

function GallerySheet({ onSelect, onClose }) {
  const images = loadImageCache()
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-primary/30" />
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary p-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-4" />
        <p className="font-display font-semibold text-[16px] text-ink-primary mb-4">Galerie</p>
        {images.length === 0 ? (
          <p className="font-body text-[15px] text-ink-secondary">Aucune photo en cache pour l'instant.</p>
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

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  )
}

const PRESETS = [
  { label: 'Demain', days: 1  },
  { label: '1 sem.', days: 7  },
  { label: '1 mois', days: 30 },
]

function FridgeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="4" y1="10" x2="20" y2="10"/>
      <line x1="9" y1="6" x2="9" y2="8"/>
      <line x1="9" y1="14" x2="9" y2="18"/>
    </svg>
  )
}

function SnowflakeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="m4.93 4.93 14.14 14.14"/>
      <path d="m19.07 4.93-14.14 14.14"/>
      <path d="M2 12h20"/>
      <path d="m9 4-3 3 3 3"/><path d="m9 20-3-3 3-3"/>
      <path d="m15 4 3 3-3 3"/><path d="m15 20 3-3-3-3"/>
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  )
}

const LOCATIONS = [
  { id: 'frigo',   label: 'Frigo',        Icon: FridgeIcon    },
  { id: 'congel',  label: 'Congélateur',  Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard',       Icon: BoxIcon       },
]

const dateInDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const todayStr = () => new Date().toISOString().split('T')[0]

export default function AddModal({ onClose, onAdd, products = [] }) {
  const [step,        setStep]        = useState(1)
  const [name,        setName]        = useState('')
  const [qty,         setQty]         = useState(1)
  const [emoji,       setEmoji]       = useState(null)
  const [image,       setImage]       = useState(null)
  const [expiry,      setExpiry]      = useState('')
  const [loc,         setLoc]         = useState('frigo')
  const [showGallery, setShowGallery] = useState(false)
  const [emojiMode,   setEmojiMode]   = useState(false)
  const fileRef   = useRef()
  const cameraRef = useRef()

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    compressImage(file, (dataUrl) => {
      setImage(dataUrl)
      saveToImageCache(dataUrl)
    })
  }

  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

  const handleConfirm = () => {
    onAdd({
      name:     cap(name.trim()) || 'Produit',
      emoji,
      image,
      qty,
      expiryDate: loc === 'frigo' ? expiry || null : null,
      location: loc,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto min-h-full flex flex-col">

        {/* ── STEP 1 : Détails ── */}
        {step === 1 && (
          <>
            <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-ink-primary z-10">
              <div className="flex items-center py-3">
                <button onClick={onClose} aria-label="Retour" className="text-ink-secondary w-10 flex items-center"><ArrowLeft /></button>
                <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
                  Détails de l'article
                </h1>
                <div className="w-10" />
              </div>
            </header>

            <div className="flex-1 px-4 pt-5 pb-10 flex flex-col gap-y-6">
              {/* Hidden file inputs */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
              <input ref={fileRef}   type="file" accept="image/*" className="hidden" onChange={handleImage} />

              {/* Image preview */}
              {image && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-ink-primary">
                  <img src={image} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImage(null)}
                    aria-label="Supprimer la photo"
                    className="absolute top-2 right-2 w-7 h-7 bg-ink-primary/60 text-canvas rounded-full flex items-center justify-center font-bold text-[16px] leading-none"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* 2×2 source grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setEmojiMode(false); cameraRef.current.click() }}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-canvas-surface border border-ink-primary rounded-xl text-ink-secondary hover:bg-brand active:scale-95 transition-all"
                >
                  <CameraIcon />
                  <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Prendre une photo</span>
                </button>
                <button
                  onClick={() => { setEmojiMode(false); fileRef.current.click() }}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-canvas-surface border border-ink-primary rounded-xl text-ink-secondary hover:bg-brand active:scale-95 transition-all"
                >
                  <ImageIcon />
                  <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Ajouter une photo</span>
                </button>
                <button
                  onClick={() => { setEmojiMode(false); setShowGallery(true) }}
                  className="aspect-square flex flex-col items-center justify-center gap-2 bg-canvas-surface border border-ink-primary rounded-xl text-ink-secondary hover:bg-brand active:scale-95 transition-all"
                >
                  <GridIcon />
                  <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Galerie</span>
                </button>
                <button
                  onClick={() => { setImage(null); setEmojiMode(m => !m) }}
                  className={`aspect-square flex flex-col items-center justify-center gap-2 border rounded-xl active:scale-95 transition-all ${
                    emojiMode ? 'bg-brand border-ink-primary text-ink-primary' : 'bg-canvas-surface border-ink-primary text-ink-secondary hover:bg-brand'
                  }`}
                >
                  {emoji ? <span className="text-3xl leading-none">{emoji}</span> : <SmileIcon />}
                  <span className="font-body text-[12px] font-semibold text-center leading-tight px-1">Emoji</span>
                </button>
              </div>

              {/* Champ emoji — visible uniquement si le carré Emoji est actif */}
              <div className={emojiMode ? 'block' : 'hidden'}>
                <label className="font-body font-semibold text-[16px] text-ink-secondary mb-1.5 block">Emoji</label>
                <input
                  autoFocus={emojiMode}
                  type="text"
                  value={emoji ?? ''}
                  onChange={e => setEmoji(e.target.value || null)}
                  placeholder="😊"
                  className="w-full px-4 py-3 bg-canvas-surface border border-ink-primary rounded-xl font-body text-[28px] text-center placeholder:text-ink-secondary/40 outline-none focus:border-forest transition-colors"
                />
              </div>

              {/* Nom */}
              <div>
                <label className="font-body font-semibold text-[16px] text-ink-secondary mb-1.5 block">Nom*</label>
                <input
                  type="text"
                  name="add-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex. Framboises"
                  className="w-full px-4 py-3 bg-canvas-surface border border-ink-primary rounded-xl font-body text-[16px] placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
                />
              </div>

              {/* Quantité */}
              <div>
                <label className="font-body font-semibold text-[16px] text-ink-secondary mb-1.5 block">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-canvas-surface border border-ink-primary text-ink-secondary font-bold text-xl hover:bg-brand hover:text-ink-primary transition-colors active:scale-90"
                  >−</button>
                  <input
                    type="number"
                    name="add-qty"
                    min="1"
                    step="1"
                    value={qty}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v) && v >= 1) setQty(v)
                    }}
                    className="w-10 text-center font-body font-bold text-[18px] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-canvas-surface border border-ink-primary text-ink-secondary font-bold text-xl hover:bg-brand hover:text-ink-primary transition-colors active:scale-90"
                  >+</button>
                </div>
              </div>

              {/* Date de péremption */}
              <div>
                <label className="font-body font-semibold text-[16px] text-ink-secondary mb-2 block">Date de péremption</label>
                <div className="flex gap-2 mb-3">
                  {PRESETS.map(p => {
                    const val = dateInDays(p.days)
                    return (
                      <button
                        key={p.label}
                        onClick={() => setExpiry(val)}
                        className={`flex-1 py-2 rounded-pill font-body font-semibold text-[14px] border transition-all ${
                          expiry === val
                            ? 'bg-brand text-ink-primary border-ink-primary'
                            : 'bg-canvas-surface text-ink-secondary border-ink-primary'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
                <div className="relative">
                  <input
                    type="date"
                    name="add-expiry"
                    value={expiry}
                    min={todayStr()}
                    onChange={e => setExpiry(e.target.value)}
                    className="w-full px-4 py-6 bg-canvas-surface border-2 border-ink-primary rounded-xl font-body text-[18px] font-semibold outline-none focus:border-forest transition-colors min-h-[64px]"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
                  name.trim()
                    ? 'bg-forest text-canvas active:scale-[.98]'
                    : 'bg-ink-secondary/20 border border-ink-primary text-ink-secondary cursor-not-allowed'
                }`}
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {/* In-app gallery sheet */}
        {showGallery && (
          <GallerySheet
            onSelect={setImage}
            onClose={() => setShowGallery(false)}
          />
        )}

        {/* ── STEP 2 : Emplacement ── */}
        {step === 2 && (
          <div className="flex-1 px-5 pt-6 pb-10 flex flex-col gap-3">
            <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-2" />
            <button onClick={() => setStep(1)} aria-label="Retour" className="text-ink-secondary w-10 mb-1 flex items-center"><ArrowLeft /></button>
            <p className="font-display font-bold text-[20px] text-ink-primary mb-1">Où le ranger ?</p>

            {LOCATIONS.map(l => (
              <button
                key={l.id}
                onClick={() => setLoc(l.id)}
                className={`flex items-center gap-4 p-4 rounded-[10px] border border-ink-primary text-left font-body font-semibold text-[16px] transition-all ${
                  loc === l.id
                    ? 'bg-brand text-ink-primary'
                    : 'bg-canvas-border text-ink-secondary'
                }`}
              >
                <l.Icon />
                <span>{l.label}</span>
              </button>
            ))}

            <button
              onClick={handleConfirm}
              className="mt-2 w-full py-3.5 bg-forest text-canvas rounded-xl font-body font-semibold text-[16px] active:scale-[.98] transition-all"
            >
              Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

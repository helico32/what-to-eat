import { useState, useRef } from 'react'

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

export default function AddModal({ onClose, onAdd }) {
  const [step,   setStep]   = useState(1)
  const [name,   setName]   = useState('')
  const [qty,    setQty]    = useState(1)
  const [emoji,  setEmoji]  = useState(null)
  const [image,  setImage]  = useState(null)
  const [expiry, setExpiry] = useState('')
  const [loc,    setLoc]    = useState('frigo')
  const fileRef = useRef()

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const MAX = 480
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      setImage(canvas.toDataURL('image/jpeg', 0.72))
      URL.revokeObjectURL(url)
    }
    img.src = url
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
                <button onClick={onClose} className="text-ink-secondary w-10 flex items-center"><ArrowLeft /></button>
                <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
                  Détails de l'article
                </h1>
                <div className="w-10" />
              </div>
            </header>

            <div className="flex-1 px-4 pt-5 pb-10 flex flex-col gap-y-6">
              {/* Image picker */}
              <input ref={fileRef} type="file" name="add-image" accept="image/*" className="hidden" onChange={handleImage} />
              <button
                onClick={() => fileRef.current.click()}
                className="w-full h-40 bg-canvas-surface rounded-xl flex items-center justify-center relative overflow-hidden border border-ink-primary transition-colors"
              >
                {image
                  ? <img src={image} alt="preview" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2 text-ink-secondary">
                      {emoji && <span className="text-4xl">{emoji}</span>}
                      <span className="font-body text-[16px]">Ajouter une photo</span>
                    </div>
                }
                {image && (
                  <div className="absolute bottom-2 right-2 bg-ink-primary/50 text-canvas text-[14px] px-2 py-1 rounded-lg font-body">
                    Changer
                  </div>
                )}
              </button>

              {/* Emoji */}
              <div>
                <label className="font-body font-semibold text-[16px] text-ink-secondary mb-1.5 block">Emoji</label>
                <input
                  type="text"
                  value={emoji ?? ''}
                  onChange={e => setEmoji(e.target.value || null)}
                  placeholder="ex. 🍓"
                  className="w-full px-4 py-3 bg-canvas-surface border border-ink-primary rounded-xl font-body text-[20px] placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
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
                  <div className="flex items-center bg-canvas-surface border border-ink-primary rounded-xl overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 text-ink-secondary hover:bg-brand hover:text-ink-primary transition-colors text-xl">−</button>
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
                      className="w-12 text-center font-body font-bold text-[16px] border-x border-ink-primary bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 text-ink-secondary hover:bg-brand hover:text-ink-primary transition-colors text-xl">＋</button>
                  </div>
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
                    className="w-full px-4 py-5 bg-canvas-surface border-2 border-ink-primary rounded-xl font-body text-[15px] font-semibold outline-none focus:border-forest transition-colors"
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

        {/* ── STEP 2 : Emplacement ── */}
        {step === 2 && (
          <div className="flex-1 px-5 pt-6 pb-10 flex flex-col gap-3">
            <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-2" />
            <button onClick={() => setStep(1)} className="text-ink-secondary w-10 mb-1 flex items-center"><ArrowLeft /></button>
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

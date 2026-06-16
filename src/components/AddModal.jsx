import { useState, useRef } from 'react'

const PRESETS = [
  { label: 'Demain',  days: 1  },
  { label: '3 jours', days: 3  },
  { label: '1 sem.',  days: 7  },
  { label: '1 mois',  days: 30 },
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
  {
    id: 'frigo',
    label: 'Frigo',
    Icon: FridgeIcon,
    cls: 'bg-forest text-white border-forest',
  },
  {
    id: 'congel',
    label: 'Congélateur',
    Icon: SnowflakeIcon,
    cls: 'bg-cold-light text-cold border-cold',
  },
  {
    id: 'placard',
    label: 'Placard',
    Icon: BoxIcon,
    cls: 'bg-pantry-light text-pantry border-pantry',
  },
]

const dateInDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const daysFromStr = (str) => {
  if (!str) return null
  const diff = new Date(str) - new Date(new Date().toISOString().split('T')[0])
  return Math.max(0, Math.ceil(diff / 86400000))
}

const todayStr = () => new Date().toISOString().split('T')[0]

export default function AddModal({ onClose, onAdd }) {
  const [step,   setStep]   = useState(1)
  const [name,   setName]   = useState('')
  const [qty,    setQty]    = useState(1)
  const [emoji,  setEmoji]  = useState(null)
  const [image,  setImage]  = useState(null)
  const [expiry, setExpiry] = useState(dateInDays(3))
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

  const handleConfirm = () => {
    onAdd({
      name:     name || 'Produit',
      emoji,
      image,
      qty,
      daysLeft: loc === 'frigo' ? daysFromStr(expiry) : null,
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
            <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-canvas-border z-10">
              <div className="flex items-center py-3">
                <button onClick={onClose} className="text-ink-secondary text-lg w-10">←</button>
                <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
                  Détails de l'article
                </h1>
                <div className="w-10" />
              </div>
            </header>

            <div className="flex-1 px-4 pt-5 pb-10">
              {/* Image picker */}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              <button
                onClick={() => fileRef.current.click()}
                className="w-full h-40 bg-canvas-surface rounded-xl flex items-center justify-center mb-5 relative overflow-hidden border border-canvas-border hover:border-ink-secondary/40 transition-colors"
              >
                {image
                  ? <img src={image} alt="preview" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2 text-ink-secondary">
                      {emoji && <span className="text-4xl">{emoji}</span>}
                      <span className="font-body text-[12px]">Ajouter une photo</span>
                    </div>
                }
                {image && (
                  <div className="absolute bottom-2 right-2 bg-ink-primary/50 text-white text-[11px] px-2 py-1 rounded-lg font-body">
                    Changer
                  </div>
                )}
              </button>

              {/* Nom */}
              <div className="mb-4">
                <label className="font-body font-semibold text-[12px] text-ink-secondary mb-1.5 block uppercase tracking-wider">Nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex. Framboises"
                  className="w-full px-4 py-3 bg-canvas-surface border border-canvas-border rounded-xl font-body text-[14px] placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
                />
              </div>

              {/* Quantité */}
              <div className="mb-4">
                <label className="font-body font-semibold text-[12px] text-ink-secondary mb-1.5 block uppercase tracking-wider">Quantité</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-canvas-surface border border-canvas-border rounded-xl overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(0.5, Math.round((q - 0.5) * 10) / 10))} className="w-10 h-10 text-ink-secondary hover:bg-canvas-border/50 transition-colors text-xl">−</button>
                    <span className="w-10 text-center font-body font-bold text-[14px] border-x border-canvas-border">{qty}</span>
                    <button onClick={() => setQty(q => Math.round((q + 0.5) * 10) / 10)} className="w-10 h-10 text-ink-secondary hover:bg-canvas-border/50 transition-colors text-xl">＋</button>
                  </div>
                  <span className="font-body text-[14px] text-ink-secondary">restant{qty > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Date de péremption */}
              <div className="mb-8">
                <label className="font-body font-semibold text-[12px] text-ink-secondary mb-2 block uppercase tracking-wider">Date de péremption</label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {PRESETS.map(p => {
                    const val = dateInDays(p.days)
                    return (
                      <button
                        key={p.label}
                        onClick={() => setExpiry(val)}
                        className={`px-3 py-1.5 rounded-pill font-body font-semibold text-[13px] border transition-all ${
                          expiry === val
                            ? 'bg-brand text-ink-primary border-brand'
                            : 'bg-canvas-surface text-ink-secondary border-canvas-border hover:border-ink-secondary/40'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-secondary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={expiry}
                    min={todayStr()}
                    onChange={e => setExpiry(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-canvas-surface border-2 border-canvas-border rounded-xl font-body text-[15px] font-semibold outline-none focus:border-forest transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-forest text-white rounded-xl font-body font-semibold text-[16px] hover:opacity-90 active:scale-[.98] transition-all"
              >
                Suivant
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2 : Emplacement ── */}
        {step === 2 && (
          <>
            <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-canvas-border z-10">
              <div className="flex items-center py-3">
                <button onClick={() => setStep(1)} className="text-ink-secondary text-lg w-10">←</button>
                <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
                  Où le ranger ?
                </h1>
                <div className="w-10" />
              </div>
            </header>

            <div className="flex-1 px-4 pt-8 pb-10 flex flex-col gap-4">
              {LOCATIONS.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setLoc(l.id); }}
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all font-body font-semibold text-[16px] ${l.cls} ${
                    loc === l.id ? 'opacity-100 scale-[1.01]' : 'opacity-60'
                  }`}
                >
                  <l.Icon />
                  <span>{l.label}</span>
                </button>
              ))}

              <button
                onClick={handleConfirm}
                className="mt-4 w-full py-3.5 bg-forest text-white rounded-xl font-body font-semibold text-[16px] hover:opacity-90 active:scale-[.98] transition-all"
              >
                Ajouter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

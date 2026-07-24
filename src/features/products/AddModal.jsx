import { useState, useEffect } from 'react'
import ImagePickerGrid           from './ImagePickerGrid'
import { useVoiceSession }       from '../voice/useVoiceSession'
import VoiceSessionScreen        from '../voice/VoiceSessionScreen'
import VoiceReviewScreen         from '../voice/VoiceReviewScreen'

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
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

export default function AddModal({ onClose, onAdd, initialName = '' }) {
  const [step,   setStep]   = useState(1)
  const [name,   setName]   = useState(initialName)
  const [qty,    setQty]    = useState(1)
  const [emoji,  setEmoji]  = useState(null)
  const [image,  setImage]  = useState(null)
  const [expiry, setExpiry] = useState('')
  const [loc,    setLoc]    = useState('frigo')

  // Flux vocal : null | 'session' | 'review'
  const [voiceStep,   setVoiceStep]   = useState(null)
  const voiceSession = useVoiceSession()

  // Quand la session se termine, passer automatiquement à l'écran de revue
  useEffect(() => {
    if (voiceSession.status === 'done' && voiceStep === 'session') {
      setVoiceStep('review')
    }
  }, [voiceSession.status, voiceStep])

  const handleConfirm = () => {
    onAdd({
      name:       cap(name.trim()) || 'Produit',
      emoji,
      image,
      qty,
      expiryDate: loc === 'frigo' ? expiry || null : null,
      location:   loc,
    })
    onClose()
  }

  // Appelé par VoiceReviewScreen avec tous les items validés
  const handleVoiceAddAll = (items) => {
    items.forEach(item => onAdd(item))
    onClose()
  }

  const startVoice = () => {
    voiceSession.start()
    setVoiceStep('session')
  }

  const cancelVoice = () => {
    voiceSession.stop()
    setVoiceStep(null)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-canvas overflow-y-auto lg:bg-ink-primary/30 lg:flex lg:items-start lg:justify-center lg:pt-10 lg:overflow-y-auto">
        <div className="max-w-[430px] mx-auto min-h-full flex flex-col lg:min-h-0 lg:max-h-[90vh] lg:overflow-y-auto lg:rounded-xl lg:border lg:border-ink-primary lg:shadow-lg lg:bg-canvas lg:w-full">

          {/* ── STEP 1 : Détails ── */}
          {step === 1 && (
            <>
              <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-ink-primary z-10">
                <div className="flex items-center py-3">
                  <button onClick={onClose} aria-label="Retour" className="text-ink-primary w-10 flex items-center"><ArrowLeft /></button>
                  <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
                    Détails de l'article
                  </h1>
                  <div className="w-10" />
                </div>
              </header>

              <div className="flex-1 px-4 pt-5 pb-10 flex flex-col gap-y-6">

                {/* Nom — en premier : le reste dépend du nom */}
                <div>
                  <label htmlFor="add-name" className="font-body font-semibold text-[16px] text-ink-primary mb-1.5 block">Nom*</label>
                  <input
                    id="add-name"
                    type="text"
                    name="add-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="ex. Framboises"
                    className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] placeholder:text-ink-primary/50 outline-none focus:border-forest transition-colors"
                  />
                  {/* Bouton vocal — chemin alternatif multi-produits */}
                  {voiceSession.supported && (
                    <button
                      onClick={startVoice}
                      aria-label="Dicter plusieurs articles d'un coup"
                      className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-ink-primary bg-brand text-ink-primary font-body font-semibold text-[15px] active:scale-[.98] transition-all"
                    >
                      🎤 Dicter plusieurs articles d'un coup
                    </button>
                  )}
                </div>

                {/* Quantité */}
                <div>
                  <p className="font-body font-semibold text-[16px] text-ink-primary mb-1.5 block">Quantité</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-canvas border border-ink-primary text-ink-primary font-bold text-xl hover:bg-brand hover:text-ink-primary transition-colors active:scale-90"
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
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-canvas border border-ink-primary text-ink-primary font-bold text-xl hover:bg-brand hover:text-ink-primary transition-colors active:scale-90"
                    >+</button>
                  </div>
                </div>

                {/* Aperçu image */}
                {image && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-ink-primary">
                    <img src={image} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImage(null)}
                      aria-label="Supprimer la photo"
                      className="absolute top-2 right-2 w-7 h-7 bg-ink-primary/60 text-canvas rounded-full flex items-center justify-center font-bold text-[16px] leading-none"
                    >×</button>
                  </div>
                )}

                {/* Grille image — composant extrait */}
                <ImagePickerGrid
                  image={image}
                  onImageChange={setImage}
                  emoji={emoji}
                  onEmojiChange={setEmoji}
                />

                {/* Date de péremption */}
                <div>
                  <p className="font-body font-semibold text-[16px] text-ink-primary mb-2 block">Date de péremption</p>
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
                              : 'bg-canvas text-ink-primary border-ink-primary'
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
                      className="w-full px-4 py-6 bg-canvas border-2 border-ink-primary rounded-xl font-body text-[18px] font-semibold outline-none focus:border-forest transition-colors min-h-[64px]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
                    name.trim()
                      ? 'bg-forest text-canvas active:scale-[.98]'
                      : 'bg-ink-primary/20 border border-ink-primary text-ink-primary cursor-not-allowed'
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
              <button onClick={() => setStep(1)} aria-label="Retour" className="text-ink-primary w-10 mb-1 flex items-center"><ArrowLeft /></button>
              <p className="font-display font-bold text-[20px] text-ink-primary mb-1">Où le ranger ?</p>

              {LOCATIONS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLoc(l.id)}
                  className={`flex items-center gap-4 p-4 rounded-[10px] border border-ink-primary text-left font-body font-semibold text-[16px] transition-all ${
                    loc === l.id
                      ? 'bg-brand text-ink-primary'
                      : 'bg-canvas-border text-ink-primary'
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

      {/* ── Flux vocal — par-dessus AddModal (z-50) ── */}
      {voiceStep === 'session' && (
        <VoiceSessionScreen
          status={voiceSession.status}
          interim={voiceSession.interim}
          onStop={voiceSession.stop}
          onClose={cancelVoice}
        />
      )}
      {voiceStep === 'review' && (
        <VoiceReviewScreen
          utterances={voiceSession.utterances}
          onAddAll={handleVoiceAddAll}
          onBack={cancelVoice}
        />
      )}
    </>
  )
}

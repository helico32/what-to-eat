import { useState, useRef } from 'react'
import { compressImage } from '../../utils/compressImage'

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  )
}

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

const EMOJI_PRESETS = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🫕', '🥙', '🌮', '🍱', '🐟', '🥩']

export default function AddRecipeModal({ onClose, onAdd }) {
  const [photo,       setPhoto]       = useState(null)
  const [emoji,       setEmoji]       = useState('🍳')
  const [name,        setName]        = useState('')
  const [time,        setTime]        = useState('')
  const [ingredients, setIngredients] = useState([])
  const [steps,       setSteps]       = useState([])
  const [newIng,      setNewIng]      = useState('')
  const [newStep,     setNewStep]     = useState('')

  const cameraRef = useRef()
  const fileRef   = useRef()

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    compressImage(file, (dataUrl) => setPhoto(dataUrl))
  }

  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

  const addIngredient = () => {
    const v = newIng.trim()
    if (v) { setIngredients(p => [...p, cap(v)]); setNewIng('') }
  }

  const addStep = () => {
    const v = newStep.trim()
    if (v) { setSteps(p => [...p, cap(v)]); setNewStep('') }
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({
      photo,
      emoji,
      name:        cap(name.trim()),
      time:        time.trim() || '15 min',
      ingredients: ingredients.length ? ingredients : [],
      steps:       steps.length       ? steps       : [],
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto min-h-full flex flex-col">

        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-ink-primary z-10">
          <div className="flex items-center py-3">
            <button onClick={onClose} aria-label="Retour" className="text-ink-secondary w-10 flex items-center"><ArrowLeft /></button>
            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
              Ajouter une recette
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 px-5 pt-5 pb-10">

          {/* Photo ou emoji */}
          <div className="mb-5">
            <label className="font-body font-semibold text-[16px] text-ink-secondary mb-2 block">
              Photo
            </label>

            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
            <input ref={fileRef}   type="file" accept="image/*" className="hidden" onChange={handleImage} />

            {photo ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-ink-primary mb-3">
                <img src={photo} alt="photo recette" className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhoto(null)}
                  aria-label="Supprimer la photo"
                  className="absolute top-2 right-2 w-7 h-7 bg-ink-primary/60 text-canvas rounded-full flex items-center justify-center font-bold text-[16px] leading-none"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => cameraRef.current.click()}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-canvas-surface border border-ink-primary rounded-xl text-ink-secondary active:scale-95 transition-all"
                  >
                    <CameraIcon />
                    <span className="font-body text-[12px] font-semibold">Prendre une photo</span>
                  </button>
                  <button
                    onClick={() => fileRef.current.click()}
                    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-canvas-surface border border-ink-primary rounded-xl text-ink-secondary active:scale-95 transition-all"
                  >
                    <ImageIcon />
                    <span className="font-body text-[12px] font-semibold">Galerie</span>
                  </button>
                </div>

                {/* Emoji — fallback si pas de photo */}
                <label className="font-body font-semibold text-[16px] text-ink-secondary mb-2 block">
                  Ou choisir un emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_PRESETS.map(e => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`w-10 h-10 rounded-lg text-xl transition-all ${
                        emoji === e ? 'bg-forest shadow-sm' : 'bg-canvas'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="font-body font-semibold text-[16px] text-ink-secondary mb-1.5 block">
              Nom*
            </label>
            <input
              type="text"
              name="recipe-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ex. Salade de quinoa"
              className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
            />
          </div>

          {/* Time */}
          <div className="mb-5">
            <label className="font-body font-semibold text-[16px] text-ink-secondary mb-1.5 block">
              Temps de préparation
            </label>
            <input
              type="text"
              name="recipe-time"
              value={time}
              onChange={e => setTime(e.target.value)}
              placeholder="ex. 25 min"
              className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
            />
          </div>

          {/* Ingredients */}
          <div className="mb-5">
            <label className="font-body font-semibold text-[16px] text-ink-secondary mb-2 block">
              Ingrédients
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ingredients.map((ing, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-ink-primary text-ink-primary rounded-pill font-body text-[14px]">
                  {ing}
                  <button onClick={() => setIngredients(p => p.filter((_, j) => j !== i))} className="text-ink-secondary text-[14px] leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="recipe-ingredient"
                value={newIng}
                onChange={e => setNewIng(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIngredient()}
                placeholder="Ajouter un ingrédient"
                className="flex-1 px-3 py-2 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
              />
              <button
                onClick={addIngredient}
                disabled={!newIng.trim()}
                className="px-3 py-2 bg-[#F9EDDC] text-ink-secondary rounded-xl font-body text-[16px] disabled:opacity-40 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-6">
            <label className="font-body font-semibold text-[16px] text-ink-secondary mb-2 block">
              Étapes
            </label>
            <div className="flex flex-col gap-2 mb-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-canvas rounded-xl">
                  <span className="w-5 h-5 bg-canvas-border rounded-full font-display font-bold text-[14px] text-ink-secondary flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="flex-1 font-body text-[16px] text-ink-primary leading-relaxed">{s}</p>
                  <button onClick={() => setSteps(p => p.filter((_, j) => j !== i))} className="text-ink-secondary text-[14px] leading-none">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                name="recipe-step"
                value={newStep}
                onChange={e => setNewStep(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStep()}
                placeholder="Ajouter une étape"
                className="flex-1 px-3 py-2 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
              />
              <button
                onClick={addStep}
                disabled={!newStep.trim()}
                className="px-3 py-2 bg-[#F9EDDC] text-ink-secondary rounded-xl font-body text-[16px] disabled:opacity-40 transition-all"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
              name.trim()
                ? 'bg-forest text-canvas active:scale-[.98]'
                : 'bg-ink-secondary/20 border border-ink-primary text-ink-secondary cursor-not-allowed'
            }`}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

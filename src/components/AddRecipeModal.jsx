import { useState } from 'react'

const EMOJI_PRESETS = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🫕', '🥙', '🌮', '🍱', '🐟', '🥩']

export default function AddRecipeModal({ onClose, onAdd }) {
  const [emoji,       setEmoji]       = useState('🍳')
  const [name,        setName]        = useState('')
  const [time,        setTime]        = useState('')
  const [ingredients, setIngredients] = useState([])
  const [steps,       setSteps]       = useState([])

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({
      emoji,
      name: name.trim(),
      time: time.trim() || '15 min',
      ingredients: ingredients.length ? ingredients : [],
      steps:       steps.length       ? steps       : [],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-primary/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas-surface rounded-t-[20px] pb-10 max-h-[92dvh] overflow-y-auto shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mt-3 mb-2" />

        <div className="flex items-center px-5 py-3 border-b border-canvas-border">
          <button onClick={onClose} className="mr-3 text-ink-secondary text-lg">←</button>
          <h2 className="flex-1 text-center font-display font-bold text-[16px] text-ink-primary">
            Ajouter une recette
          </h2>
          <div className="w-8" />
        </div>

        <div className="px-5 pt-5">

          {/* Emoji */}
          <div className="mb-5">
            <label className="font-body font-semibold text-[12px] text-ink-secondary mb-2 block uppercase tracking-wider">
              Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_PRESETS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    emoji === e
                      ? 'bg-forest shadow-sm'
                      : 'bg-canvas hover:bg-canvas-border/50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="font-body font-semibold text-[12px] text-ink-secondary mb-1.5 block uppercase tracking-wider">
              Nom*
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ex. Salade de quinoa"
              className="w-full px-4 py-3 bg-canvas border border-canvas-border rounded-xl font-body text-[14px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
            />
          </div>

          {/* Time */}
          <div className="mb-5">
            <label className="font-body font-semibold text-[12px] text-ink-secondary mb-1.5 block uppercase tracking-wider">
              Temps de préparation
            </label>
            <input
              type="text"
              value={time}
              onChange={e => setTime(e.target.value)}
              placeholder="ex. 25 min"
              className="w-full px-4 py-3 bg-canvas border border-canvas-border rounded-xl font-body text-[14px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
            />
          </div>

          {/* Ingredients */}
          <div className="mb-5">
            <label className="font-body font-semibold text-[12px] text-ink-secondary mb-2 block uppercase tracking-wider">
              Ingrédients
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ingredients.map((ing, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-canvas-border text-ink-primary rounded-pill font-body text-[13px]">
                  {ing}
                  <button
                    onClick={() => setIngredients(p => p.filter((_, j) => j !== i))}
                    className="text-ink-secondary hover:text-red-400 text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={() => { const v = window.prompt('Ajouter un ingrédient :'); if (v?.trim()) setIngredients(p => [...p, v.trim()]) }}
                className="px-3 py-1.5 border border-dashed border-canvas-border text-ink-secondary rounded-pill font-body text-[13px] hover:border-forest hover:text-forest transition-colors"
              >
                + Ajouter
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-6">
            <label className="font-body font-semibold text-[12px] text-ink-secondary mb-2 block uppercase tracking-wider">
              Étapes
            </label>
            <div className="flex flex-col gap-2 mb-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-canvas rounded-xl">
                  <span className="w-5 h-5 bg-canvas-border rounded-full font-display font-bold text-[11px] text-ink-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="flex-1 font-body text-[13px] text-ink-primary leading-relaxed">{s}</p>
                  <button
                    onClick={() => setSteps(p => p.filter((_, j) => j !== i))}
                    className="text-ink-secondary hover:text-red-400 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => { const v = window.prompt('Ajouter une étape :'); if (v?.trim()) setSteps(p => [...p, v.trim()]) }}
                className="font-body text-[14px] text-ink-secondary hover:text-forest text-left transition-colors"
              >
                + Ajouter une étape
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
              name.trim()
                ? 'bg-forest text-white hover:opacity-90 active:scale-[.98]'
                : 'bg-canvas-border text-ink-secondary cursor-not-allowed'
            }`}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

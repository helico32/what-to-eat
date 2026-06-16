import { useState } from 'react'

const EMOJI_PRESETS = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🫕', '🥙', '🌮', '🍱', '🐟', '🥩']

export default function AddRecipeModal({ onClose, onAdd }) {
  const [emoji,       setEmoji]       = useState('🍳')
  const [name,        setName]        = useState('')
  const [time,        setTime]        = useState('')
  const [ingredients, setIngredients] = useState([])
  const [steps,       setSteps]       = useState([])
  const [newIng,      setNewIng]      = useState('')
  const [newStep,     setNewStep]     = useState('')

  const addIngredient = () => {
    const v = newIng.trim()
    if (v) { setIngredients(p => [...p, v]); setNewIng('') }
  }

  const addStep = () => {
    const v = newStep.trim()
    if (v) { setSteps(p => [...p, v]); setNewStep('') }
  }

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
    <div className="fixed inset-0 z-50 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto min-h-full flex flex-col">

        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-canvas-border z-10">
          <div className="flex items-center py-3">
            <button onClick={onClose} className="text-ink-secondary text-lg w-10">←</button>
            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
              Ajouter une recette
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 px-5 pt-5 pb-10">

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
                  <button onClick={() => setIngredients(p => p.filter((_, j) => j !== i))} className="text-ink-secondary hover:text-urgent text-sm leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIng}
                onChange={e => setNewIng(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIngredient()}
                placeholder="Ajouter un ingrédient"
                className="flex-1 px-3 py-2 bg-canvas border border-canvas-border rounded-xl font-body text-[13px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
              />
              <button
                onClick={addIngredient}
                disabled={!newIng.trim()}
                className="px-3 py-2 bg-[#F9EDDC] text-ink-secondary rounded-xl font-body text-[13px] hover:opacity-80 disabled:opacity-40 transition-all"
              >
                +
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
                  <span className="w-5 h-5 bg-canvas-border rounded-full font-display font-bold text-[11px] text-ink-secondary flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="flex-1 font-body text-[13px] text-ink-primary leading-relaxed">{s}</p>
                  <button onClick={() => setSteps(p => p.filter((_, j) => j !== i))} className="text-ink-secondary hover:text-urgent text-sm leading-none">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStep}
                onChange={e => setNewStep(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStep()}
                placeholder="Ajouter une étape"
                className="flex-1 px-3 py-2 bg-canvas border border-canvas-border rounded-xl font-body text-[13px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
              />
              <button
                onClick={addStep}
                disabled={!newStep.trim()}
                className="px-3 py-2 bg-[#F9EDDC] text-ink-secondary rounded-xl font-body text-[13px] hover:opacity-80 disabled:opacity-40 transition-all"
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


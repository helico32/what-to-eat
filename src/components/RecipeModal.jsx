import { useEffect, useState } from 'react'

const EMOJI_PRESETS = ['🍳', '🥘', '🍲', '🥗', '🍜', '🍝', '🫕', '🥙', '🌮', '🍱', '🐟', '🥩']

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function EditForm({ recipe, onSave, onCancel }) {
  const [emoji,       setEmoji]       = useState(recipe.emoji)
  const [name,        setName]        = useState(recipe.name)
  const [time,        setTime]        = useState(recipe.time)
  const [ingredients, setIngredients] = useState(recipe.ingredients)
  const [steps,       setSteps]       = useState(recipe.steps)
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

  return (
    <div className="px-5 pt-4 pb-10">

      {/* Emoji */}
      <div className="mb-5">
        <label className="font-body font-semibold text-[12px] text-ink-secondary mb-2 block uppercase tracking-wider">Emoji</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_PRESETS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-lg text-xl transition-all ${emoji === e ? 'bg-forest shadow-sm' : 'bg-canvas hover:bg-canvas-border/50'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="font-body font-semibold text-[12px] text-ink-secondary mb-1.5 block uppercase tracking-wider">Nom*</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 bg-canvas border border-canvas-border rounded-xl font-body text-[14px] text-ink-primary placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
        />
      </div>

      {/* Time */}
      <div className="mb-5">
        <label className="font-body font-semibold text-[12px] text-ink-secondary mb-1.5 block uppercase tracking-wider">Temps de préparation</label>
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
        <label className="font-body font-semibold text-[12px] text-ink-secondary mb-2 block uppercase tracking-wider">Ingrédients</label>
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
        <label className="font-body font-semibold text-[12px] text-ink-secondary mb-2 block uppercase tracking-wider">Étapes</label>
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

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 bg-[#F9EDDC] text-ink-secondary rounded-xl font-body font-semibold text-[15px] hover:opacity-80 transition-all"
        >
          Annuler
        </button>
        <button
          onClick={() => name.trim() && onSave({ emoji, name: name.trim(), time: time.trim() || '15 min', ingredients, steps })}
          disabled={!name.trim()}
          className={`flex-1 py-3.5 rounded-xl font-body font-semibold text-[15px] transition-all ${
            name.trim() ? 'bg-forest text-white hover:opacity-90 active:scale-[.98]' : 'bg-canvas-border text-ink-secondary cursor-not-allowed'
          }`}
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}

export default function RecipeModal({ recipe, products, onClose, onEdit }) {
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && (editing ? setEditing(false) : onClose())
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, editing])

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-primary/40 backdrop-blur-sm" onClick={() => !editing && onClose()}>
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas-surface rounded-t-[20px] pb-10 max-h-[90dvh] overflow-y-auto shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mt-3 mb-0" />

        {editing ? (
          <>
            <div className="flex items-center px-5 py-3 border-b border-canvas-border">
              <button onClick={() => setEditing(false)} className="mr-3 text-ink-secondary text-lg">←</button>
              <h2 className="flex-1 text-center font-display font-bold text-[16px] text-ink-primary">Modifier la recette</h2>
              <div className="w-8" />
            </div>
            <EditForm
              recipe={recipe}
              onSave={(changes) => { onEdit(recipe.id, changes); setEditing(false) }}
              onCancel={() => setEditing(false)}
            />
          </>
        ) : (
          <>
            {/* Image / emoji header */}
            <div className="w-full h-40 bg-canvas flex items-center justify-center text-[64px] relative">
              {recipe.emoji}
              {onEdit && (
                <button
                  onClick={() => setEditing(true)}
                  className="absolute top-3 right-3 w-9 h-9 bg-[#F9EDDC] text-ink-secondary rounded-[10px] flex items-center justify-center hover:opacity-80 transition-all"
                >
                  <PencilIcon />
                </button>
              )}
            </div>

            <div className="px-5">
              <h2 className="font-display font-bold text-[24px] leading-[32px] text-ink-primary mb-1 mt-5">
                {recipe.name}
              </h2>
              <p className="flex items-center gap-1 font-body text-[13px] text-ink-secondary mb-5">
                <ClockIcon /> {recipe.time}
              </p>

              {recipe.ingredients.length > 0 && (
                <>
                  <p className="font-body font-semibold text-[11px] uppercase tracking-widest text-ink-secondary mb-3">Ingrédients</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {recipe.ingredients.map((name, i) => {
                      const p = products.find(x => x.name === name)
                      return (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-canvas text-ink-primary rounded-pill font-body text-[13px]">
                          {p?.emoji} {name}
                        </span>
                      )
                    })}
                  </div>
                </>
              )}

              {recipe.steps.length > 0 && (
                <>
                  <p className="font-body font-semibold text-[11px] uppercase tracking-widest text-ink-secondary mb-4">Préparation</p>
                  <div className="flex flex-col gap-3 mb-6">
                    {recipe.steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-canvas font-display font-bold text-[11px] text-ink-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="font-body text-[14px] text-ink-primary leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-forest text-white rounded-xl font-body font-semibold text-[16px] hover:opacity-90 active:scale-[.98] transition-all"
              >
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

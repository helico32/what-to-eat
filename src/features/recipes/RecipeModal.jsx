import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EditRecipeForm from './EditRecipeForm'

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  )
}

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

export default function RecipeModal({ recipes, products, onEdit }) {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  const recipe = recipes.find(r => String(r.id) === id)
  const [checkedSteps, setCheckedSteps] = useState(new Set())

  const toggleStep = (i) => {
    setCheckedSteps(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  useEffect(() => {
    if (!recipe) navigate('/recettes', { replace: true })
  }, [recipe, navigate])

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && (editing ? setEditing(false) : navigate(-1))
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [editing, navigate])

  if (!recipe) return null

  return (
    <div className="fixed inset-0 z-50 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto min-h-full flex flex-col">

        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-ink-primary z-10">
          <div className="flex items-center py-3">
            <button
              onClick={editing ? () => setEditing(false) : () => navigate(-1)}
              aria-label={editing ? 'Annuler les modifications' : 'Retour'}
              className="text-ink-primary w-10 flex items-center"
            ><ArrowLeft /></button>
            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center truncate px-2">
              {editing ? 'Modifier' : recipe.name}
            </h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                aria-label="Modifier la recette"
                className="w-10 h-10 flex items-center justify-center text-ink-primary transition-all"
              >
                <PencilIcon />
              </button>
            ) : <div className="w-10" />}
          </div>
        </header>

        {editing ? (
          <EditRecipeForm
            recipe={recipe}
            onSave={(changes) => { onEdit(recipe.id, changes); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="flex-1">
            {/* Bandeau visuel — photo ou emoji */}
            <div className="w-full h-40 bg-canvas overflow-hidden flex items-center justify-center">
              {recipe.photo
                ? <img src={recipe.photo} alt="" className="w-full h-full object-cover" />
                : <span className="text-[64px]">{recipe.emoji}</span>
              }
            </div>

            <div className="px-5 pt-5 pb-16">
              <p className="flex items-center gap-1 font-body text-[16px] text-ink-primary mb-5">
                <ClockIcon /> {recipe.time}
              </p>

              {recipe.ingredients.length > 0 && (
                <>
                  <p className="font-body font-semibold text-[16px] uppercase tracking-widest text-ink-primary mb-3">Ingrédients</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {recipe.ingredients.map((name, i) => {
                      const p = products.find(x => x.name === name)
                      return (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-canvas border border-ink-primary text-ink-primary rounded-pill font-body text-[14px]">
                          {p?.emoji} {name}
                        </span>
                      )
                    })}
                  </div>
                </>
              )}

              {recipe.steps.length > 0 && (
                <>
                  <p className="font-body font-semibold text-[16px] uppercase tracking-widest text-ink-primary mb-4">Préparation</p>
                  <div className="flex flex-col gap-3 mb-6">
                    {recipe.steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <button
                          onClick={() => toggleStep(i)}
                          aria-label={`Étape ${i + 1}${checkedSteps.has(i) ? ' — faite' : ''}`}
                          className={`w-6 h-6 rounded-full border border-ink-primary font-display font-bold text-[14px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            checkedSteps.has(i)
                              ? 'bg-canvas text-ink-primary'
                              : 'bg-forest text-canvas'
                          }`}
                        >
                          {i + 1}
                        </button>
                        <p className={`font-body text-[16px] leading-relaxed transition-colors ${
                          checkedSteps.has(i) ? 'text-ink-primary line-through' : 'text-ink-primary'
                        }`}>{step}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button onClick={() => navigate(-1)}
                className="w-full py-3.5 bg-forest text-canvas rounded-xl font-body font-semibold text-[16px] active:scale-[.98] transition-all">
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

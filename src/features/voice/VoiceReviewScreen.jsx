import { useState, useEffect } from 'react'
import { parseUtterance } from './parseUtterance'
import VoiceReviewRow from './VoiceReviewRow'

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  )
}

const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

// utterances : string[]           — résultats bruts de useVoiceSession
// onAddAll   : (items[]) => void  — appelé avec tous les items validés (AddModal itère et appelle onAdd + onClose)
// onBack     : () => void         — retour à VoiceSessionScreen (ou fermeture)
export default function VoiceReviewScreen({ utterances, onAddAll, onBack }) {
  // Initialisation synchrone : sur desktop les utterances sont déjà là au montage.
  // "Rien de reconnu" s'affiche immédiatement si utterances est vide.
  const [items, setItems] = useState(() =>
    utterances
      .flatMap(u => parseUtterance(u))
      .map((item, i) => ({ ...item, id: i, name: cap(item.name), emoji: null, image: null }))
  )

  // iOS Safari uniquement : les finals arrivent après onend, donc après le montage.
  // Si items était vide au montage mais que utterances arrive ensuite, on réinitialise.
  // Le cas "l'utilisatrice a déjà édité des items" ne peut pas se produire ici
  // (les finals iOS arrivent dans les ~100ms, avant tout tap possible).
  useEffect(() => {
    if (items.length === 0 && utterances.length > 0) {
      setItems(
        utterances
          .flatMap(u => parseUtterance(u))
          .map((item, i) => ({ ...item, id: i, name: cap(item.name), emoji: null, image: null }))
      )
    }
  }, [utterances])

  const updateItem = (id, updated) =>
    setItems(prev => prev.map(it => it.id === id ? updated : it))

  const deleteItem = (id) =>
    setItems(prev => prev.filter(it => it.id !== id))

  const handleAddAll = () => {
    onAddAll(items.map(item => ({ ...item, name: item.name.trim() || 'Produit' })))
  }

  return (
    <div className="fixed inset-0 z-50 bg-canvas overflow-y-auto">

      <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-ink-primary z-10">
        <div className="flex items-center py-3">
          <button onClick={onBack} aria-label="Retour" className="text-ink-primary w-10 flex items-center">
            <ArrowLeft />
          </button>
          <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
            Vérifier ma liste
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 pt-5 pb-32">
        {items === null ? (
          <p className="font-body text-[16px] text-ink-primary text-center py-12">Traitement en cours…</p>
        ) : items.length === 0 ? (
          <p className="font-body text-[16px] text-ink-primary text-center py-12">
            Rien de reconnu — reviens en arrière pour réessayer.
          </p>
        ) : (
          <div className="bg-canvas-card rounded-xl border border-ink-primary divide-y divide-ink-primary px-4">
            {items.map(item => (
              <VoiceReviewRow
                key={item.id}
                item={item}
                onChange={updated => updateItem(item.id, updated)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bouton fixe en bas — même pattern que AddModal */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-4 pb-8 pt-3 bg-canvas border-t border-ink-primary">
        <button
          onClick={handleAddAll}
          disabled={!items || items.length === 0}
          className="w-full py-3.5 bg-forest text-canvas rounded-xl font-body font-semibold text-[16px] active:scale-[.98] transition-all disabled:opacity-40"
        >
          {items.length > 0
            ? `Ajouter ${items.length} article${items.length > 1 ? 's' : ''}`
            : 'Ajouter'
          }
        </button>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import Header from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import MealGroupsList from './MealGroupsList'
import { btnActive, btnDefault } from '../../utils/styles'
import { sortByUrgency, getBadge } from '../products/badges'

const TODAY = new Date().toISOString().split('T')[0]
const TOMORROW = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })()

// 2 jours passés + aujourd'hui + 6 futurs = 9 jours.
// Les jours passés restent accessibles pour confirmer/annuler des repas oubliés.
function getDays() {
  return Array.from({ length: 9 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i - 2)
    return d.toISOString().split('T')[0]
  })
}

function getDayShortLabel(dateStr) {
  if (dateStr === TODAY)    return 'Auj.'
  if (dateStr === TOMORROW) return 'Dem.'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' })
}

function getDayNumber(dateStr) {
  return new Date(dateStr + 'T12:00:00').getDate()
}

function getDayFullLabel(dateStr) {
  if (dateStr === TODAY)    return "Aujourd'hui"
  if (dateStr === TOMORROW) return 'Demain'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function ProductPickerSheet({ products, selectedDate, onAdd, onClose }) {
  const [step, setStep] = useState('pick')
  const [chosenProduct, setChosenProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const available = sortByUrgency(products.filter(p => (p.qty ?? 0) > 0))
    .filter(p => !q || p.name.toLowerCase().includes(q))

  const handlePick = (product) => {
    setChosenProduct(product)
    setQty(Math.min(1, product.qty))
    setStep('qty')
  }

  const handleConfirm = () => {
    onAdd(chosenProduct, qty, selectedDate)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Fermer"
    >
      <div className="absolute inset-0 bg-ink-primary/30" />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mt-4 mb-4" />

        {step === 'pick' ? (
          <>
            <p className="font-display font-semibold text-[16px] text-ink-primary px-5 mb-3">Choisir un ingrédient</p>
            <div className="px-5 mb-3">
              <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un ingrédient…" />
            </div>
            {available.length === 0 ? (
              <p className="font-body text-[15px] text-ink-primary px-5 pb-10">Aucun ingrédient trouvé.</p>
            ) : (
              <div className="overflow-y-auto max-h-[45vh] px-5 pb-10 flex flex-col gap-2">
                {available.map(p => {
                  const badge = getBadge(p.expiryDate, p.location)
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePick(p)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-ink-primary text-left active:scale-[0.98] transition-all ${btnDefault}`}
                    >
                      <div className="w-9 h-9 bg-canvas rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <span>{p.emoji ?? '📦'}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-[15px] text-ink-primary truncate">{p.name}</p>
                        <p className="font-body text-[13px] text-ink-primary">x {p.qty}</p>
                      </div>
                      {badge.label && (
                        <span className={`flex-shrink-0 px-2.5 py-1 rounded-pill font-body font-medium text-[14px] ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="px-5 pb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-canvas-border rounded-xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                {chosenProduct.image
                  ? <img src={chosenProduct.image} alt="" className="w-full h-full object-cover rounded-xl" />
                  : <span>{chosenProduct.emoji ?? '📦'}</span>
                }
              </div>
              <div>
                <p className="font-display font-semibold text-[16px] text-ink-primary">{chosenProduct.name}</p>
                <p className="font-body text-[13px] text-ink-primary">{chosenProduct.qty} disponible{chosenProduct.qty > 1 ? 's' : ''}</p>
              </div>
            </div>
            <p className="font-body font-semibold text-[15px] text-ink-primary mb-3">Quantité à utiliser</p>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                aria-label="Diminuer la quantité"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas-border text-ink-primary font-bold text-[16px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
              >−</button>
              <span className="font-body text-[20px] text-ink-primary font-semibold min-w-[32px] text-center">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(chosenProduct.qty, q + 1))}
                aria-label="Augmenter la quantité"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-canvas-border text-ink-primary font-bold text-[16px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
              >+</button>
              <span className="font-body text-[13px] text-ink-primary">/ {chosenProduct.qty} max</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('pick')} className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}>Retour</button>
              <button onClick={handleConfirm} className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnActive}`}>Ajouter au repas</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function NewRepasSheet({ onConfirm, onClose }) {
  const [name, setName] = useState('')
  const inputRef = useRef()
  useEffect(() => { inputRef.current?.focus() }, [])

  const submit = () => { if (name.trim()) onConfirm(name.trim()) }

  return (
    <div
      className="fixed inset-0 z-50"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Fermer"
    >
      <div className="absolute inset-0 bg-ink-primary/30" />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary shadow-lg px-5 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mt-4 mb-5" />
        <p className="font-display font-semibold text-[16px] text-ink-primary mb-4">Nom du repas</p>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="ex. Déjeuner, Dîner…"
          className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] placeholder:text-ink-primary/50 outline-none focus:border-forest transition-colors mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}>Annuler</button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] transition-all ${name.trim() ? btnActive : 'opacity-40 cursor-not-allowed ' + btnDefault}`}
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MealPlanPage({ meals, repas, products, onAddMeal, onAddRepas, onRenameRepas, onNameNoneMeals, onDeleteRepas, onConfirmMeal, onCancelMeal, onClose, onMenu, onCart, cartCount }) {
  const days = getDays()
  const [selectedDay, setSelectedDay] = useState(TODAY)
  const [pickerRepasId, setPickerRepasId] = useState(null)
  const [showNewRepasSheet, setShowNewRepasSheet] = useState(false)

  const handleDayChange = (date) => {
    setSelectedDay(date)
    setPickerRepasId(null)
  }

  const handleCreateRepas = (name) => {
    onAddRepas(name, selectedDay)
    setShowNewRepasSheet(false)
  }

  return (
    <div className="min-h-dvh bg-canvas font-body text-ink-primary">
      <Header
        onTitleClick={onClose}
        onMenu={onMenu}
        onAdd={() => setPickerRepasId('__none__')}
        onCart={onCart}
        cartCount={cartCount}
      />

      <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-ink-primary" style={{ scrollbarWidth: 'none' }}>
        {days.map((date, i) => {
          const active = date === selectedDay
          return (
            <button
              key={date}
              onClick={() => handleDayChange(date)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border border-ink-primary transition-all min-w-[52px] ${active ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand/50'} ${date < TODAY && !active ? 'opacity-50' : ''}`}
            >
              <span className="font-body text-[11px] font-semibold uppercase">{getDayShortLabel(date)}</span>
              <span className="font-display font-bold text-[18px] leading-tight">{getDayNumber(date)}</span>
              {(meals.some(m => m.date === date) || repas.some(r => r.date === date)) && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${active ? 'bg-ink-primary' : 'bg-brand'}`} />
              )}
            </button>
          )
        })}
      </div>

      <main className="px-4 pt-4 pb-24">
        <p className="font-display font-semibold text-[15px] text-ink-primary mb-3 capitalize">
          {getDayFullLabel(selectedDay)}
        </p>
        <MealGroupsList
          key={selectedDay}
          meals={meals}
          repas={repas}
          date={selectedDay}
          onAddItem={setPickerRepasId}
          onDeleteRepas={onDeleteRepas}
          onRenameRepas={onRenameRepas}
          onNameNoneMeals={(name) => onNameNoneMeals(name, selectedDay)}
          onConfirmMeal={onConfirmMeal}
          onCancelMeal={onCancelMeal}
          onCreateRepas={() => setShowNewRepasSheet(true)}
        />
      </main>

      {pickerRepasId !== null && (
        <ProductPickerSheet
          products={products}
          selectedDate={selectedDay}
          onAdd={(product, qty, date) => {
            const repasId = pickerRepasId === '__none__' ? null : pickerRepasId
            onAddMeal(product, qty, date, repasId)
          }}
          onClose={() => setPickerRepasId(null)}
        />
      )}

      {showNewRepasSheet && (
        <NewRepasSheet
          onConfirm={handleCreateRepas}
          onClose={() => setShowNewRepasSheet(false)}
        />
      )}
    </div>
  )
}

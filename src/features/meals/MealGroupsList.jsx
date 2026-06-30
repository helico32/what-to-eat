import { useState, useRef, useEffect } from 'react'
import { useMealChecklist } from './useMealChecklist'
import { btnActive, btnDefault } from '../../utils/styles'

function ChevronIcon({ down }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {down ? <polyline points="6 9 12 15 18 9" /> : <polyline points="6 15 12 9 18 15" />}
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M8 6V4h8v2"/>
      <path d="M19 6l-1 14H6L5 6"/>
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}


function MealRow({ meal, isChecked, rowQty, onToggle, onSetRowQty, onCancel }) {
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(meal)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isChecked ? 'bg-brand border-ink-primary' : 'border-ink-primary'
          }`}
        >
          {isChecked && <CheckIcon />}
        </button>
        <div className="w-10 h-10 bg-canvas rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
          {meal.productSnapshot.image
            ? <img src={meal.productSnapshot.image} alt="" className="w-full h-full object-cover" />
            : <span>{meal.productSnapshot.emoji ?? '🍽️'}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-[15px] text-ink-primary truncate">{meal.productSnapshot.name}</p>
          <p className="font-body text-[13px] text-ink-secondary">x {meal.qty} prévu{meal.qty > 1 ? 's' : ''}</p>
        </div>
        {isChecked ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onSetRowQty(meal, rowQty - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
            >−</button>
            <span className="font-body text-[14px] text-ink-primary font-semibold min-w-[16px] text-center">{rowQty}</span>
            <button
              onClick={() => onSetRowQty(meal, rowQty + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-canvas-border text-ink-secondary font-bold text-[14px] border border-ink-primary hover:bg-brand active:scale-90 transition-all"
            >+</button>
          </div>
        ) : onCancel && (
          <button
            onClick={() => setConfirmRemove(c => !c)}
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-[10px] transition-all ${confirmRemove ? btnActive : btnDefault}`}
            aria-label="Retirer du repas"
          >
            <TrashIcon />
          </button>
        )}
      </div>
      {confirmRemove && (
        <div className="pt-1 pb-1 flex items-center gap-2">
          <p className="flex-1 font-body text-[14px] text-ink-secondary truncate">
            Retirer "{meal.productSnapshot.name}" ?
          </p>
          <button
            onClick={() => { onCancel(meal.id); setConfirmRemove(false) }}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[14px] ${btnDefault}`}
          >
            Oui
          </button>
          <button
            onClick={() => setConfirmRemove(false)}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[14px] ${btnActive}`}
          >
            Non
          </button>
        </div>
      )}
    </div>
  )
}

function RepasGroup({ name, meals, checked, rowQtys, onToggle, onSetRowQty, onAddItem, onDelete, onRename, onCancel }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef()

  useEffect(() => { if (isEditing) inputRef.current?.focus() }, [isEditing])
  useEffect(() => { setEditName(name) }, [name])

  const commitRename = () => {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== name) onRename(trimmed)
    else setEditName(name)
    setIsEditing(false)
  }

  return (
    <div className="bg-canvas-card rounded-xl border border-ink-primary mb-3">
      <div className="flex items-center gap-2 px-4 py-3">
        {!isEditing && !confirmDelete && (
          <button onClick={() => setCollapsed(c => !c)} className="flex-shrink-0 text-ink-secondary">
            <ChevronIcon down={!collapsed} />
          </button>
        )}

        <div className="flex-1 min-w-0 flex items-center gap-2">
          {confirmDelete ? (
            <p className="font-body text-[15px] text-ink-secondary truncate">Supprimer "{name}" ?</p>
          ) : isEditing ? (
            <>
              <input
                ref={inputRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditName(name); setIsEditing(false) } }}
                className="flex-1 min-w-0 bg-transparent border-b border-ink-primary font-display font-semibold text-[15px] text-ink-primary outline-none"
              />
              <button
                onClick={commitRename}
                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border border-ink-primary transition-all ${btnActive}`}
                aria-label="Confirmer le nouveau nom"
              >
                <CheckIcon />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCollapsed(c => !c)} className="flex-1 min-w-0 text-left flex items-center gap-1">
                <p className="font-display font-semibold text-[15px] text-ink-primary truncate">{name}</p>
                <span className="font-body text-[13px] text-ink-secondary flex-shrink-0">({meals.length})</span>
              </button>
              {onRename && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border border-ink-primary transition-all ${btnDefault}`}
                  aria-label="Renommer"
                >
                  <PencilIcon />
                </button>
              )}
            </>
          )}
        </div>

        {confirmDelete ? (
          <>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false) }}
              className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[14px] ${btnDefault}`}
            >
              Oui
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[14px] ${btnActive}`}
            >
              Non
            </button>
          </>
        ) : !isEditing && (
          <>
            {onAddItem && (
              <button
                onClick={onAddItem}
                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border border-ink-primary transition-all ${btnDefault}`}
                aria-label="Ajouter un ingrédient"
              >
                <PlusIcon />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border border-ink-primary transition-all ${btnDefault}`}
                aria-label="Supprimer ce repas"
              >
                <TrashIcon />
              </button>
            )}
          </>
        )}
      </div>

      {!collapsed && !confirmDelete && (
        <div className="border-t border-ink-primary divide-y divide-ink-primary px-4">
          {meals.length === 0 ? (
            <p className="py-4 font-body text-[14px] text-ink-secondary text-center">Vide — appuie sur + pour ajouter</p>
          ) : (
            meals.map(meal => (
              <MealRow
                key={meal.id}
                meal={meal}
                isChecked={checked.has(meal.id)}
                rowQty={rowQtys[meal.id] ?? meal.qty}
                onToggle={onToggle}
                onSetRowQty={onSetRowQty}
                onCancel={onCancel}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function MealGroupsList({ meals, repas, date, onAddItem, onDeleteRepas, onRenameRepas, onNameNoneMeals, onConfirmMeal, onCancelMeal, onCreateRepas }) {
  const dayRepas = repas.filter(r => r.date === date)
  const dayMeals = meals.filter(m => m.date === date)
  // Meals sans groupe de repas nommé — affichés dans un groupe "Encas"
  const noneMeals = dayMeals.filter(m => !m.repasId)

  const { checked, rowQtys, anyChecked, toggleCheck, setRowQty, handleJeter, handleRemettre } =
    useMealChecklist(dayMeals, onConfirmMeal)

  // Props communs passés à chaque RepasGroup pour éviter la répétition
  const groupProps = { checked, rowQtys, onToggle: toggleCheck, onSetRowQty: setRowQty, onCancel: onCancelMeal }
  const isEmpty = dayMeals.length === 0 && dayRepas.length === 0

  if (isEmpty) {
    return (
      <>
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">🍽️</span>
          <p className="font-body text-[15px] text-ink-secondary">Aucun repas prévu ce jour</p>
        </div>
        {onCreateRepas && (
          <button
            onClick={onCreateRepas}
            className="w-full py-3 rounded-xl border border-dashed border-ink-primary text-ink-secondary font-body text-[15px] hover:bg-canvas-border transition-all flex items-center justify-center gap-2"
          >
            <PlusIcon />
            Nouveau repas
          </button>
        )}
      </>
    )
  }

  return (
    <>
      {dayRepas.map(r => (
        <RepasGroup
          key={r.id}
          name={r.name}
          meals={dayMeals.filter(m => m.repasId === r.id)}
          {...groupProps}
          onAddItem={onAddItem ? () => onAddItem(r.id) : undefined}
          onDelete={onDeleteRepas ? () => onDeleteRepas(r.id) : undefined}
          onRename={onRenameRepas ? (newName) => onRenameRepas(r.id, newName) : undefined}
        />
      ))}
      {noneMeals.length > 0 && (
        <RepasGroup
          name="Encas"
          meals={noneMeals}
          {...groupProps}
          onAddItem={onAddItem ? () => onAddItem('__none__') : undefined}
          onRename={onNameNoneMeals}
          onDelete={onCancelMeal ? () => noneMeals.forEach(m => onCancelMeal(m.id)) : undefined}
        />
      )}
      {onCreateRepas && (
        <button
          onClick={onCreateRepas}
          className="w-full py-3 rounded-xl border border-dashed border-ink-primary text-ink-secondary font-body text-[15px] hover:bg-canvas-border transition-all flex items-center justify-center gap-2"
        >
          <PlusIcon />
          Nouveau repas
        </button>
      )}
      {anyChecked && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-canvas border-t border-ink-primary px-4 py-4 flex gap-2 z-10">
          <button onClick={handleJeter} className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}>Mangé</button>
          <button onClick={handleRemettre} className={`flex-1 py-3 rounded-[10px] font-body font-semibold text-[16px] ${btnActive}`}>Ranger</button>
        </div>
      )}
    </>
  )
}

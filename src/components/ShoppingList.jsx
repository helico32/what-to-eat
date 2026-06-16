import { useState, useRef } from 'react'

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 6 5 9 10 3"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M8 6V4h8v2"/>
      <path d="M19 6l-1 14H6L5 6"/>
    </svg>
  )
}

function DragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7"  x2="20" y2="7"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="17" x2="20" y2="17"/>
    </svg>
  )
}

function ShoppingItem({ item, onToggle, onRemove, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, index }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index) }}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors cursor-default select-none ${
        isDragging ? 'opacity-40' : ''
      } ${
        item.checked ? 'bg-canvas-border/40' : 'bg-transparent'
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          item.checked
            ? 'bg-forest border-forest text-white'
            : 'border-canvas-border hover:border-ink-secondary'
        }`}
      >
        {item.checked && <CheckIcon />}
      </button>

      <span className="text-xl flex-shrink-0">{item.emoji}</span>

      <p className={`flex-1 font-body text-[14px] font-medium transition-colors ${
        item.checked ? 'line-through text-ink-secondary' : 'text-ink-primary'
      }`}>
        {item.name}
      </p>

      <button
        onClick={() => onRemove(item.id)}
        className="text-ink-secondary/40 hover:text-ink-secondary transition-colors flex-shrink-0 p-1"
      >
        <TrashIcon />
      </button>

      <div className="text-ink-secondary/40 flex-shrink-0 cursor-grab active:cursor-grabbing p-1">
        <DragHandle />
      </div>
    </div>
  )
}

export default function ShoppingList({ items, onToggle, onRemove, onClearChecked, onReorder }) {
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  const handleDragStart = (index) => setDragFrom(index)
  const handleDragOver  = (index) => setDragOver(index)
  const handleDragEnd   = () => { setDragFrom(null); setDragOver(null) }

  const handleDrop = (toIndex) => {
    if (dragFrom === null || dragFrom === toIndex) return
    const next = [...items]
    const [moved] = next.splice(dragFrom, 1)
    next.splice(toIndex, 0, moved)
    onReorder(next)
    setDragFrom(null)
    setDragOver(null)
  }

  const checked = items.filter(i => i.checked)

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">🛒</span>
        <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Liste vide</h3>
        <p className="font-body text-[14px] text-ink-secondary">
          Appuie sur l'icône 🛒 à côté d'un produit.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-canvas-surface rounded-xl border border-canvas-border shadow-sm divide-y divide-canvas-border mb-4 overflow-hidden">
        {items.map((item, index) => (
          <ShoppingItem
            key={item.id}
            item={item}
            index={index}
            isDragging={dragFrom === index}
            onToggle={onToggle}
            onRemove={onRemove}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {checked.length > 0 && (
        <button
          onClick={onClearChecked}
          className="w-full py-3.5 bg-urgent/10 border border-urgent/20 rounded-xl font-body font-semibold text-[14px] text-urgent hover:bg-urgent/15 transition-colors"
        >
          Effacer cochés ({checked.length})
        </button>
      )}
    </div>
  )
}

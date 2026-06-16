import { useState, useRef, useEffect } from 'react'
import ShoppingList from './ShoppingList'

function AddItemSheet({ onAdd, onClose }) {
  const [value, setValue] = useState('')
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  const submit = () => {
    if (value.trim()) { onAdd(value.trim()); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-primary/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas-surface rounded-t-[20px] px-5 pt-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-5" />
        <p className="font-display font-bold text-[16px] text-ink-primary mb-4">Ajouter à la liste</p>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="ex. Lait, pain..."
          className="w-full px-4 py-3 bg-canvas border border-canvas-border rounded-xl font-body text-[14px] placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors mb-4"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
            value.trim() ? 'bg-forest text-white hover:opacity-90' : 'bg-canvas-border text-ink-secondary cursor-not-allowed'
          }`}
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}

export default function ListePage({ items, onToggle, onRemove, onClearChecked, onReorder, onAddItem, onClose }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="fixed inset-0 z-30 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto">

        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 border-b border-canvas-border z-10">
          <div className="flex items-center py-3">
            <button onClick={onClose} className="text-ink-secondary text-lg w-10">←</button>

            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
              Liste de courses
            </h1>

            <button
              onClick={() => setShowAdd(true)}
              className="w-10 h-10 bg-brand text-ink-primary rounded-full flex items-center justify-center text-xl font-light hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              +
            </button>
          </div>
        </header>

        <main className="px-4 pt-4 pb-32">
          <ShoppingList
            items={items}
            onToggle={onToggle}
            onRemove={onRemove}
            onClearChecked={onClearChecked}
            onReorder={onReorder}
          />
        </main>
      </div>

      {showAdd && (
        <AddItemSheet
          onAdd={onAddItem}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

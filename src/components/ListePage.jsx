import { useState, useRef, useEffect } from 'react'
import ShoppingList from './ShoppingList'
import Header from './Header'

function SortIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 16-4 4-4-4"/>
      <path d="M17 20V4"/>
      <path d="m3 8 4-4 4 4"/>
      <path d="M7 4v16"/>
    </svg>
  )
}

function AddItemSheet({ onAdd, onClose }) {
  const [value, setValue] = useState('')
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  const submit = () => {
    if (value.trim()) { onAdd(value.trim()); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-primary/40" onClick={onClose}>
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
          className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors mb-4"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
            value.trim() ? 'bg-forest text-canvas' : 'bg-canvas-border text-ink-secondary cursor-not-allowed'
          }`}
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}

export default function ListePage({ items, onToggle, onRemove, onClearChecked, onReorder, onAddItem, onAddCheckedToStock, onClose, onMenu, onCart, cartCount }) {
  const [showAdd, setShowAdd] = useState(false)
  const [sorting, setSorting] = useState(false)

  return (
    <div className="fixed inset-0 z-30 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto">

        <Header
          onTitleClick={onClose}
          onAdd={() => setShowAdd(true)}
          onMenu={onMenu}
          onCart={onCart}
          cartCount={cartCount}
        />

        <main className="px-4 pt-4 pb-32">
          {/* Section label */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-[15px] text-ink-primary">Liste de courses</p>
              <button
                onClick={() => setSorting(s => !s)}
                className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                  sorting ? 'text-ink-primary bg-brand' : 'text-ink-primary'
                }`}
              >
                <SortIcon />
              </button>
            </div>
            <span className="font-body text-[16px] text-ink-secondary">
              {items.length} article{items.length > 1 ? 's' : ''}
            </span>
          </div>

          <ShoppingList
            items={items}
            onToggle={onToggle}
            onRemove={onRemove}
            onClearChecked={onClearChecked}
            onReorder={onReorder}
            onAddCheckedToStock={onAddCheckedToStock}
            canSort={sorting}
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

import { useState, useRef, useEffect } from 'react'
import ShoppingList from './ShoppingList'
import Header from './Header'
import SearchBar from './SearchBar'
import SearchEmpty from './SearchEmpty'

function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 16-4 4-4-4"/>
      <path d="M17 20V4"/>
      <path d="m3 8 4-4 4 4"/>
      <path d="M7 4v16"/>
    </svg>
  )
}

function AddItemSheet({ onAdd, onClose }) {
  const [value, setValue] = useState('')
  const [emoji, setEmoji] = useState('')
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

  const submit = () => {
    if (value.trim()) { onAdd(cap(value.trim()), emoji.trim() || null); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink-primary/40" onClick={onClose}>
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas-surface rounded-t-[20px] px-5 pt-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-5" />
        <p className="font-display font-bold text-[16px] text-ink-primary mb-4">Ajouter à la liste</p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            placeholder="🛒"
            className="w-16 px-3 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[20px] text-center placeholder:text-ink-secondary/40 outline-none focus:border-forest transition-colors"
          />
          <div className="flex-1 flex flex-col gap-1">
            <input
              ref={inputRef}
              type="text"
              name="add-item"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="ex. Lait, pain..."
              className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors"
            />
          </div>
        </div>
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
            value.trim() ? 'bg-forest text-canvas active:scale-[.98]' : 'bg-ink-secondary/20 border border-ink-primary text-ink-secondary cursor-not-allowed'
          }`}
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}

export default function ListePage({ items, onToggle, onDelete, onDecrement, onIncrement, onClearChecked, onReorder, onAddItem, onAddCheckedToStock, onClose, onMenu, onCart, cartCount }) {
  const [showAdd, setShowAdd] = useState(false)
  const [sorting, setSorting] = useState(false)
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filteredItems = q
    ? items.filter(i => i.name.toLowerCase().includes(q))
    : items

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

        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setSorting(false) }}
          placeholder="Rechercher dans la liste…"
        />

        <main className="px-4 pb-32">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-[15px] text-ink-primary">
                {q ? `"${search.trim()}"` : 'Liste de courses'}
              </p>
              {!q && (
                <button
                  onClick={() => setSorting(s => !s)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
                    sorting ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
                  }`}
                >
                  <SortIcon />
                </button>
              )}
            </div>
            <span className="font-body text-[16px] text-ink-secondary">
              {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''}
            </span>
          </div>

          {q && filteredItems.length === 0
            ? <SearchEmpty />
            : <ShoppingList
                items={filteredItems}
                onToggle={onToggle}
                onDelete={onDelete}
                onDecrement={onDecrement}
                onIncrement={onIncrement}
                onClearChecked={onClearChecked}
                onReorder={onReorder}
                onAddCheckedToStock={onAddCheckedToStock}
                canSort={!q && sorting}
              />
          }
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

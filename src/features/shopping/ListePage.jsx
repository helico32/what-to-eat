import { useState, useRef, useEffect } from 'react'
import ShoppingList from './ShoppingList'
import Header from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import SearchEmpty from '../../components/SearchEmpty'
import { useIsDesktop } from '../../hooks/useIsDesktop'
import { btnDefault } from '../../utils/styles'

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

const LOCATIONS = [
  { id: 'frigo',   label: 'Frigo'        },
  { id: 'congel',  label: 'Congélateur'  },
  { id: 'placard', label: 'Placard'      },
]

function AddItemSheet({ onAdd, onClose }) {
  const [value, setValue] = useState('')
  const [emoji, setEmoji] = useState('')
  const [location, setLocation] = useState('frigo')
  const inputRef = useRef()

  useEffect(() => { inputRef.current?.focus() }, [])

  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

  const submit = () => {
    if (value.trim()) { onAdd(cap(value.trim()), emoji.trim() || null, location); onClose() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-ink-primary/40"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Fermer"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas rounded-t-[20px] px-5 pt-5 pb-10 shadow-lg"
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
            className="w-16 px-3 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[20px] text-center placeholder:text-ink-primary/40 outline-none focus:border-forest transition-colors"
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
              className="w-full px-4 py-3 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] placeholder:text-ink-primary/50 outline-none focus:border-forest transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {LOCATIONS.map(l => (
            <button
              key={l.id}
              onClick={() => setLocation(l.id)}
              className={`flex-1 py-2 rounded-pill font-body font-semibold text-[14px] border transition-all ${
                location === l.id ? 'bg-brand text-ink-primary border-ink-primary' : 'bg-canvas-border text-ink-primary border-ink-primary'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all ${
            value.trim() ? 'bg-forest text-canvas active:scale-[.98]' : 'bg-ink-primary/20 border border-ink-primary text-ink-primary cursor-not-allowed'
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
  const isDesktop = useIsDesktop()

  const q = search.trim().toLowerCase()
  const filteredItems = q
    ? items.filter(i => i.name.toLowerCase().includes(q))
    : items

  return (
    <div className={isDesktop ? 'min-h-dvh bg-canvas' : 'fixed inset-0 z-30 bg-canvas overflow-y-auto'}>
      <div className={isDesktop ? 'max-w-[1440px] mx-auto px-8 pt-8 pb-8' : 'max-w-[430px] mx-auto'}>

        {!isDesktop && (
          <Header
            onTitleClick={onClose}
            onAdd={() => setShowAdd(true)}
            onMenu={onMenu}
            onCart={onCart}
            cartCount={cartCount}
          />
        )}

        {isDesktop ? (
          <div className="max-w-[75%] mx-auto flex items-center gap-4 pt-8 mb-8">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-primary" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                name="search"
                value={search}
                onChange={e => { setSearch(e.target.value); setSorting(false) }}
                placeholder="Rechercher dans la liste…"
                className="w-full pl-9 pr-9 py-2 bg-canvas border border-ink-primary rounded-[10px] font-body text-[16px] text-ink-primary placeholder:text-ink-primary/50 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-primary text-lg leading-none">×</button>
              )}
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className={`flex-shrink-0 px-3 py-2 rounded-[10px] font-body font-semibold text-[14px] leading-6 border transition-all ${btnDefault}`}
            >
              + Ajouter un item
            </button>
          </div>
        ) : (
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setSorting(false) }}
            placeholder="Rechercher dans la liste…"
          />
        )}

        <main className={isDesktop ? 'pb-8' : 'px-4 pb-32'}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-[15px] text-ink-primary">
                {q ? `"${search.trim()}"` : 'Liste de courses'}
              </p>
              {!q && (
                <button
                  onClick={() => setSorting(s => !s)}
                  aria-label="Trier manuellement"
                  className={`w-7 h-7 flex items-center justify-center rounded-full border border-ink-primary transition-all ${
                    sorting ? 'bg-brand text-ink-primary' : 'bg-canvas-border text-ink-primary hover:bg-brand'
                  }`}
                >
                  <SortIcon />
                </button>
              )}
            </div>
            <span className="font-body text-[16px] text-ink-primary">
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
                horizontal={isDesktop && !q && !sorting}
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

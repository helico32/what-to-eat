import { useState } from 'react'

function FridgeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="4" y1="10" x2="20" y2="10"/>
      <line x1="9" y1="6" x2="9" y2="8"/>
      <line x1="9" y1="14" x2="9" y2="18"/>
    </svg>
  )
}

function SnowflakeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="m4.93 4.93 14.14 14.14"/>
      <path d="m19.07 4.93-14.14 14.14"/>
      <path d="M2 12h20"/>
      <path d="m9 4-3 3 3 3"/><path d="m9 20-3-3 3-3"/>
      <path d="m15 4 3 3-3 3"/><path d="m15 20 3-3-3-3"/>
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  )
}

const LOCATIONS = [
  { id: 'frigo',   label: 'Frigo',      Icon: FridgeIcon    },
  { id: 'congel',  label: 'Congél',     Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard',    Icon: BoxIcon       },
]

const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s

export default function QuickAddSheet({ onAdd, onClose, onFullAdd }) {
  const [name, setName] = useState('')
  const [loc,  setLoc]  = useState('frigo')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ name: cap(name.trim()), location: loc, qty: 1, expiryDate: null, emoji: null, image: null })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Fermer l'ajout rapide"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary p-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-5" />
        <p className="font-display font-bold text-[20px] text-ink-primary mb-4">Ajout rapide</p>

        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus -- focus automatique sur le champ principal d'une modale, attendu par l'utilisateur
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Framboises, yaourt, pâtes…"
          className="w-full px-4 py-3 bg-canvas-surface border border-ink-primary rounded-xl font-body text-[16px] placeholder:text-ink-secondary/50 outline-none focus:border-forest transition-colors mb-4"
        />

        <div className="flex gap-2 mb-5">
          {LOCATIONS.map(l => (
            <button
              key={l.id}
              onClick={() => setLoc(l.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border font-body font-semibold text-[14px] transition-all ${
                loc === l.id
                  ? 'bg-brand border-ink-primary text-ink-primary'
                  : 'bg-canvas-surface border-ink-primary text-ink-secondary'
              }`}
            >
              <l.Icon />
              {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className={`w-full py-3.5 rounded-xl font-body font-semibold text-[16px] transition-all mb-3 ${
            name.trim()
              ? 'bg-forest text-canvas active:scale-[.98]'
              : 'bg-ink-secondary/20 border border-ink-primary text-ink-secondary cursor-not-allowed'
          }`}
        >
          Ajouter
        </button>

        {/* Escalade vers le flux complet si la personne veut ajouter une photo ou une date */}
        <button
          onClick={() => { onClose(); onFullAdd() }}
          className="w-full text-center font-body text-[14px] text-ink-secondary py-1"
        >
          Avec photo / date →
        </button>
      </div>
    </div>
  )
}

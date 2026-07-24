import { useState } from 'react'
import { ImagePickerSheet } from '../products/ImagePickerGrid'
import { btnActive, btnDefault } from '../../utils/styles'

// -- Icônes ------------------------------------------------------------------

function FridgeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="4" y1="10" x2="20" y2="10"/>
      <line x1="9" y1="6" x2="9" y2="8"/>
      <line x1="9" y1="14" x2="9" y2="18"/>
    </svg>
  )
}

function SnowflakeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/>
      <path d="M2 12h20"/>
      <path d="m9 4-3 3 3 3"/><path d="m9 20-3-3 3-3"/>
      <path d="m15 4 3 3-3 3"/><path d="m15 20 3-3-3-3"/>
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M8 6V4h8v2"/>
      <path d="M19 6l-1 14H6L5 6"/>
    </svg>
  )
}

const LOCATIONS = [
  { id: 'frigo',   label: 'Frigo',  Icon: FridgeIcon    },
  { id: 'congel',  label: 'Congél', Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard', Icon: BoxIcon      },
]

function formatDate(iso) {
  const parts = iso.split('-')
  return `${parts[2]}/${parts[1]}`
}

const todayStr = () => new Date().toISOString().split('T')[0]

export default function VoiceReviewRow({ item, onChange, onDelete }) {
  const [isDateEdit,   setIsDateEdit]   = useState(false)
  const [pendingDate,  setPendingDate]  = useState('')
  const [showImgSheet, setShowImgSheet] = useState(false)

  const openDatePicker = () => {
    setPendingDate(item.expiryDate ?? '')
    setIsDateEdit(true)
  }

  const commitDate = () => {
    if (pendingDate) onChange({ ...item, expiryDate: pendingDate })
    setIsDateEdit(false)
    setPendingDate('')
  }

  const cancelDate = () => {
    setIsDateEdit(false)
    setPendingDate('')
  }

  return (
    <div className="py-3">

      {/* ── Ligne 1 : thumbnail | nom | badge date ── */}
      <div className="flex items-center gap-3 mb-2">

        {/* Thumbnail — tappable */}
        <button
          onClick={() => setShowImgSheet(true)}
          aria-label="Changer l'image"
          className="w-[75px] h-[60px] rounded-lg flex-shrink-0 overflow-hidden border border-ink-primary active:scale-95 transition-all"
        >
          {item.image
            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-canvas flex items-center justify-center text-2xl">
                {item.emoji ?? '📦'}
              </div>
          }
        </button>

        {/* Nom */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.name}
            onChange={e => onChange({ ...item, name: e.target.value })}
            aria-label="Nom du produit"
            className="w-full font-body font-semibold text-[16px] text-ink-primary bg-transparent outline-none border-b border-transparent focus:border-ink-primary transition-colors"
          />
        </div>

        {/* Badge date */}
        <button
          onClick={openDatePicker}
          aria-label={item.expiryDate ? 'Modifier la date de péremption' : 'Ajouter une date de péremption'}
          className={`flex-shrink-0 px-2.5 py-1 rounded-pill font-body font-medium text-[13px] border transition-all text-ink-primary ${
            isDateEdit ? btnActive : 'bg-canvas-border border-ink-primary'
          }`}
        >
          {item.expiryDate ? formatDate(item.expiryDate) : '⚠'}
        </button>
      </div>

      {/* ── Ligne 2 : qty | emplacements (flex-1) | poubelle ── */}
      {/* Pleine largeur du row — assez de place pour tout */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange({ ...item, qty: Math.max(1, item.qty - 1) })}
          aria-label="Diminuer"
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-canvas-border text-ink-primary font-bold text-[15px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand"
        >−</button>
        <span className="font-body text-[14px] text-ink-primary min-w-[20px] text-center flex-shrink-0">{item.qty}</span>
        <button
          onClick={() => onChange({ ...item, qty: item.qty + 1 })}
          aria-label="Augmenter"
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-canvas-border text-ink-primary font-bold text-[15px] leading-none active:scale-90 transition-all border border-ink-primary hover:bg-brand"
        >+</button>

        {LOCATIONS.map(l => (
          <button
            key={l.id}
            onClick={() => onChange({ ...item, location: l.id })}
            aria-pressed={item.location === l.id}
            aria-label={l.label}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-pill font-body text-[12px] font-semibold border transition-all ${
              item.location === l.id ? btnActive : btnDefault
            }`}
          >
            <l.Icon />{l.label}
          </button>
        ))}

        <button
          onClick={onDelete}
          aria-label="Supprimer cet article"
          className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-[10px] border transition-all ${btnDefault}`}
        >
          <TrashIcon />
        </button>
      </div>

      {/* ── Date picker inline ── */}
      {/* pendingDate + bouton OK : évite l'auto-commit iOS au simple tap */}
      {isDateEdit && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            min={todayStr()}
            value={pendingDate}
            onChange={e => setPendingDate(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-canvas border border-ink-primary rounded-xl font-body text-[16px] outline-none focus:border-forest transition-colors"
          />
          <button
            onClick={commitDate}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${btnActive}`}
          >
            OK
          </button>
          <button
            onClick={cancelDate}
            className={`px-3 py-1.5 rounded-[10px] font-body font-semibold text-[16px] ${btnDefault}`}
          >
            ✕
          </button>
        </div>
      )}

      {showImgSheet && (
        <ImagePickerSheet
          image={item.image}
          onImageChange={img => onChange({ ...item, image: img, emoji: null })}
          emoji={item.emoji}
          onEmojiChange={em => onChange({ ...item, emoji: em, image: null })}
          onClose={() => setShowImgSheet(false)}
        />
      )}
    </div>
  )
}

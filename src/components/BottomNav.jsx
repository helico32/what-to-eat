function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function BowlIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12h20c0-5.52-4.48-10-10-10z"/>
      <path d="M2 12c0 4 2.5 7.5 6 9h8c3.5-1.5 6-5 6-9"/>
      <line x1="12" y1="12" x2="12" y2="17"/>
    </svg>
  )
}

export default function BottomNav({ shoppingCount, onShowListe, onShowRecettes, activePage }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
      <div className="max-w-[430px] w-full px-4 pb-6 pointer-events-auto">
        <div className="flex bg-brand rounded-xl shadow-md overflow-hidden">

          <button
            onClick={onShowListe}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-body font-semibold text-[16px] transition-all ${
              activePage === 'liste' ? 'bg-ink-primary/10 text-ink-primary' : 'text-ink-primary/70'
            }`}
          >
            <div className="relative">
              <CartIcon />
              {shoppingCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-canvas text-ink-primary text-[14px] font-bold rounded-full flex items-center justify-center">
                  {shoppingCount}
                </span>
              )}
            </div>
            Liste de courses
          </button>

          <div className="w-px bg-ink-primary/15 my-3" />

          <button
            onClick={onShowRecettes}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-body font-semibold text-[16px] transition-all ${
              activePage === 'recettes' ? 'bg-ink-primary/10 text-ink-primary' : 'text-ink-primary/70'
            }`}
          >
            <BowlIcon />
            Recettes
          </button>
        </div>
      </div>
    </div>
  )
}

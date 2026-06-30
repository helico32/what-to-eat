function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

export default function Header({ onTitleClick, onAdd, onMenu, onCart, cartCount }) {
  return (
    <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur-md pt-4 md:pt-10 px-4 pb-3 border-b border-ink-primary">
      <div className="flex items-center">
        {/* Hamburger */}
        <button onClick={onMenu} aria-label="Menu" className="w-9 h-9 flex flex-col items-center justify-center gap-1.5">
          <span className="w-5 h-0.5 bg-ink-secondary rounded-full" />
          <span className="w-5 h-0.5 bg-ink-secondary rounded-full" />
          <span className="w-5 h-0.5 bg-ink-secondary rounded-full" />
        </button>

        {/* Title */}
        <button
          onClick={onTitleClick}
          className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center"
        >
          What to eat
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {cartCount > 0 && (
            <button onClick={onCart} aria-label="Liste de courses" className="relative w-10 h-10 flex items-center justify-center text-ink-secondary translate-y-1">
              <CartIcon />
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-brand text-ink-primary text-[14px] font-bold rounded-full flex items-center justify-center px-1">
                {cartCount}
              </span>
            </button>
          )}
          <button
            onClick={onAdd}
            aria-label="Ajouter un produit"
            className="w-8 h-8 bg-brand text-ink-primary border border-ink-primary rounded-full flex items-center justify-center text-2xl font-light active:scale-95 transition-all shadow-sm"
          >
            +
          </button>
        </div>
      </div>
    </header>
  )
}

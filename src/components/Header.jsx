export default function Header({ onTitleClick, onAdd }) {
  return (
    <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-3 border-b border-canvas-border">
      <div className="flex items-center justify-between">
        {/* Hamburger */}
        <button className="w-9 h-9 flex flex-col items-center justify-center gap-1.5">
          <span className="w-5 h-0.5 bg-ink-secondary rounded-full" />
          <span className="w-5 h-0.5 bg-ink-secondary rounded-full" />
          <span className="w-5 h-0.5 bg-ink-secondary rounded-full" />
        </button>

        {/* Title */}
        <button
          onClick={onTitleClick}
          className="font-display font-bold text-[20px] text-ink-primary tracking-tight"
        >
          What to eat
        </button>

        {/* Add button — orange circle */}
        <button
          onClick={onAdd}
          className="w-10 h-10 bg-brand text-ink-primary rounded-full flex items-center justify-center text-xl font-light hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          +
        </button>
      </div>
    </header>
  )
}

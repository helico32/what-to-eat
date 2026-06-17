export default function SearchBar({ value, onChange, placeholder = 'Rechercher…' }) {
  return (
    <div className="px-4 pb-2.5">
      <div className="relative py-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-primary" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 bg-canvas-surface border border-ink-primary rounded-[10px] font-body text-[16px] text-ink-primary placeholder:text-ink-secondary/50 outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

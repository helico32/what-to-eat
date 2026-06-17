export default function SearchEmpty() {
  return (
    <div className="text-center py-16 px-6">
      <svg className="mx-auto mb-3 text-ink-primary" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
        <path d="M11 7v4"/>
        <path d="M11 15h.01"/>
      </svg>
      <h3 className="font-display font-semibold text-[18px] text-ink-primary mb-2">Aucun résultat</h3>
      <p className="font-body text-[16px] text-ink-secondary inline-flex items-center gap-1.5">
        Ajoute-le avec 
        <span className="inline-flex items-center justify-center w-5 h-5 bg-brand text-ink-primary rounded-full text-[14px] font-light leading-none">+</span>
      </p>
    </div>
  )
}

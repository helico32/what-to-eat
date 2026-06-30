import { useNavigate } from 'react-router-dom'

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  )
}

export default function LegalLayout({ title, children }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="max-w-[430px] mx-auto flex flex-col">

        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-4 px-4 pb-0 z-10">
          <div className="flex items-center py-3">
            <button onClick={() => navigate(-1)} aria-label="Retour" className="text-ink-secondary w-10 flex items-center">
              <ArrowLeft />
            </button>
            <h1 className="font-display font-bold text-[18px] text-ink-primary flex-1 text-center">
              {title}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-5 pt-4 pb-20 flex flex-col gap-6 font-body text-[14px] text-ink-primary leading-relaxed">
          {children}
        </div>

      </div>
    </div>
  )
}

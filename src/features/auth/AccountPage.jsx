function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

export default function AccountPage({ onClose, authEmail, onSignOut, notifPermission, onRequestNotif }) {

  const handleSignOut = () => {
    onSignOut()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto min-h-full flex flex-col">

        {/* Header */}
        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-10 px-4 pb-0 z-10">
          <div className="flex items-center py-3">
            <button onClick={onClose} aria-label="Retour" className="text-ink-primary w-10 flex items-center">
              <ArrowLeft />
            </button>
            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
              Mon compte
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-4 pt-6 pb-16 flex flex-col gap-6">

          {/* ── Compte connecté ── */}
          <div className="rounded-xl border border-ink-primary bg-canvas-card p-5 flex flex-col gap-1">
            <p className="font-body font-semibold text-[13px] text-ink-primary uppercase tracking-wider mb-2">
              Compte
            </p>
            <p className="font-body text-[15px] text-ink-primary">
              ✓ Connectée
            </p>
            <p className="font-body font-semibold text-[15px] text-ink-primary">
              {authEmail}
            </p>
          </div>

          {/* ── Abonnement ── */}
          <div className="rounded-xl border border-ink-primary bg-canvas-card p-5 flex flex-col gap-2">
            <p className="font-body font-semibold text-[13px] text-ink-primary uppercase tracking-wider">
              Abonnement
            </p>
            <p className="font-body text-[15px] text-ink-primary">
              Disponible bientôt
            </p>
          </div>

          {/* ── Notifications ── */}
          {notifPermission !== 'unsupported' && (
            <div className="flex flex-col gap-2">
              <p className="font-body font-semibold text-[13px] text-ink-primary uppercase tracking-wider px-1">
                Alertes
              </p>
              {/* Même bouton radio que dans PlanPage */}
              <button
                onClick={() => { if (notifPermission === 'default') onRequestNotif() }}
                disabled={notifPermission === 'granted' || notifPermission === 'denied'}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-ink-primary bg-canvas-card font-body font-semibold text-[16px] text-ink-primary disabled:opacity-60 disabled:cursor-default"
              >
                <span className="w-4 h-4 rounded-full border-2 border-ink-primary flex items-center justify-center flex-shrink-0">
                  {notifPermission === 'granted' && <span className="w-2 h-2 rounded-full bg-ink-primary" />}
                  {notifPermission === 'denied'  && <span className="text-[10px] leading-none">×</span>}
                </span>
                <BellIcon />
                {notifPermission === 'granted' ? 'Alertes activées'
                : notifPermission === 'denied'  ? 'Alertes bloquées'
                : 'Activer les alertes'}
              </button>
              {notifPermission === 'denied' && (
                <p className="font-body text-[13px] text-ink-primary px-1">
                  Pour réactiver : Réglages du navigateur → Notifications → autoriser ce site.
                </p>
              )}
            </div>
          )}

          {/* ── Déconnexion ── */}
          <div className="mt-auto pt-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-3.5 rounded-xl border border-ink-primary bg-canvas-card font-body font-semibold text-[16px] text-urgent active:scale-[.98] transition-all"
            >
              Se déconnecter
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

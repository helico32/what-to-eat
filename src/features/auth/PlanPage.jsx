import { Link } from 'react-router-dom'

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-forest flex-shrink-0 mt-0.5">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-urgent flex-shrink-0 mt-0.5">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// Ce que le plan gratuit inclut — tout fonctionne sans compte, sans internet
const FREE_INCLUDED = [
  'Frigo, congélateur, placard',
  'Liste de courses',
  'Planning repas',
  'Recettes sauvegardées',
  'Fonctionne sans connexion',
]
// Ce que le plan gratuit ne couvre pas
const FREE_EXCLUDED = [
  'Tout est perdu si tu changes de téléphone (stock, recettes, planning…)',
  'Pas de notifications avant péremption',
]

// Ce que le plan payant ajoute
// → Google Sign-In requis pour sauvegarder et retrouver les données
const PAID_EXTRAS = [
  'Change de téléphone sans rien perdre (stock, recettes, planning)',
  'Notifications avant que tes produits périment',
  "Reconnaissance d'image plus rapide (réutilisation des photos déjà scannées)",
  'Tout le plan gratuit inclus',
]

export default function PlanPage({ onClose, onSignInWithGoogle }) {
  const handlePaid = async () => {
    await onSignInWithGoogle()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 bg-canvas overflow-y-auto">
      <div className="max-w-[430px] mx-auto min-h-full flex flex-col">

        {/* Header */}
        <header className="sticky top-0 bg-canvas/90 backdrop-blur-md pt-4 px-4 pb-0 z-10">
          <div className="flex items-center py-3">
            <button onClick={onClose} aria-label="Retour" className="text-ink-secondary w-10 flex items-center">
              <ArrowLeft />
            </button>
            <h1 className="font-display font-bold text-[20px] text-ink-primary flex-1 text-center">
              Connexion
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="px-4 pt-4 pb-16 flex flex-col gap-4">

          {/* ── Plan payant ── */}
          <div className="rounded-xl border-2 border-forest bg-canvas-card p-5 flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-display font-bold text-[22px] text-ink-primary">2,99€ / mois</p>
                <p className="font-body font-semibold text-[14px] text-forest">7 jours offerts · sans CB</p>
              </div>
              <span className="bg-canvas border border-ink-primary px-2 py-0.5 rounded-pill font-body text-[14px] text-ink-secondary">
                Recommandé
              </span>
            </div>

            <ul className="flex flex-col gap-3">
              {PAID_EXTRAS.map((text) => (
                <li key={text} className="flex items-start gap-3 font-body text-[15px] text-ink-primary">
                  <CheckIcon />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handlePaid}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-forest text-canvas rounded-xl font-body font-semibold text-[16px] active:scale-[.98] transition-all"
            >
              <GoogleIcon />
              Commencer l'essai de 7 jours
            </button>

            <p className="font-body text-[12px] text-ink-secondary text-center">
              Puis 2,99€/mois. Annulable à tout moment.
            </p>

            {/* Lien retour pour les utilisatrices qui ont déjà un compte */}
            <button
              onClick={handlePaid}
              className="font-body text-[13px] text-ink-secondary underline underline-offset-2 text-center"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>

          {/* ── Plan gratuit ── */}
          <div className="rounded-xl border border-ink-primary bg-canvas-card p-5 flex flex-col gap-4">
            <p className="font-display font-bold text-[20px] text-ink-primary">Gratuit</p>

            <ul className="flex flex-col gap-3">
              {FREE_INCLUDED.map((text) => (
                <li key={text} className="flex items-start gap-3 font-body text-[15px] text-ink-primary">
                  <CheckIcon />
                  <span>{text}</span>
                </li>
              ))}
              {FREE_EXCLUDED.map((text) => (
                <li key={text} className="flex items-start gap-3 font-body text-[15px] text-ink-secondary">
                  <CrossIcon />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl border border-ink-primary font-body font-semibold text-[16px] text-ink-secondary active:scale-[.98] transition-all"
            >
              Continuer sans compte
            </button>
          </div>

          {/* ── Liens légaux ── */}
          <p className="font-body text-[12px] text-ink-secondary text-center leading-relaxed">
            En continuant, tu acceptes nos{' '}
            <Link to="/conditions" className="underline underline-offset-2">Conditions générales</Link>
            {' '}et notre{' '}
            <Link to="/confidentialite" className="underline underline-offset-2">Politique de confidentialité</Link>.
            <br />
            <Link to="/mentions-legales" className="underline underline-offset-2 mt-1 inline-block">Mentions légales</Link>
          </p>

        </div>
      </div>
    </div>
  )
}

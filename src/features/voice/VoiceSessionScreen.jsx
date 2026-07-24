// Bottom sheet affiché pendant la session vocale.
//
// onStop  : bouton "Terminer" → hook.stop() → status passe à 'done' → parent bascule en review
// onClose : tap backdrop → annule la session, retour à AddModal

export default function VoiceSessionScreen({ status, interim, onStop, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Annuler la session vocale"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="w-full max-w-[430px] mx-auto bg-canvas rounded-t-[20px] border-t border-x border-ink-primary p-5 pb-10 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-canvas-border rounded-full mx-auto mb-5" />

        <p className="font-display font-bold text-[20px] text-ink-primary mb-3">
          {status === 'blocked' ? 'Micro bloqué' : "J'écoute…"}
        </p>

        {status === 'blocked' ? (
          <p className="font-body text-[15px] text-ink-primary mb-6">
            Autorise l'accès au micro dans les réglages de ton navigateur.
          </p>
        ) : (
          <p
            role="status"
            aria-live="polite"
            className="font-body text-[16px] text-ink-primary min-h-[48px] mb-6 italic"
          >
            {interim || '…'}
          </p>
        )}

        <button
          onClick={onStop}
          className="w-full py-3.5 bg-forest text-canvas rounded-xl font-body font-semibold text-[16px] active:scale-[.98] transition-all"
        >
          Terminer
        </button>
      </div>
    </div>
  )
}

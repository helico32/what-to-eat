import { btnActive, btnDefault } from '../utils/styles'

function UrgentIcon()    { return <span className="w-2.5 h-2.5 rounded-full bg-current inline-block" /> }
function FridgeIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="9" y1="6" x2="9" y2="8"/><line x1="9" y1="14" x2="9" y2="18"/></svg> }
function SnowflakeIcon() { return <span>❄️</span> }
function BoxIcon()       { return <span>📦</span> }
function ListIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function CartIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> }
function ChefHatIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg> }
function CalendarIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function BellIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> }
function GoogleIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> }

const TABS = [
  { id: 'urgent',  label: 'À utiliser en priorité', Icon: UrgentIcon    },
  { id: 'frigo',   label: 'Frigo',                  Icon: FridgeIcon    },
  { id: 'congel',  label: 'Congélateur',             Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard',                Icon: BoxIcon       },
  { id: 'tout',    label: 'Tout',                    Icon: ListIcon      },
]

const PAGES = [
  { id: 'planning', label: 'Planning repas',   Icon: CalendarIcon },
  { id: 'liste',    label: 'Liste de courses', Icon: CartIcon    },
  { id: 'recettes', label: 'Recettes',         Icon: ChefHatIcon },
]

export default function MenuDrawer({
  activeTab, activePage, shoppingCount,
  onSelectTab, onSelectPage, onClose,
  notifPermission, onRequestNotif,
  isAnonymous, authEmail, authLoading,
  onShowPlan, onSignOut,
}) {

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      aria-label="Fermer le menu"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation technique, pas une interaction utilisateur */}
      <div
        className="w-[300px] max-w-[80vw] h-full bg-canvas flex flex-col pt-14 pb-10 shadow-lg overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <p className="font-display font-bold text-[18px] text-ink-primary px-5 mb-5">What to eat</p>

        <nav className="flex flex-col gap-3 px-3">
          {TABS.map(({ id, label, Icon }) => {
            const active = activePage === null && activeTab === id
            return (
              <button
                key={id}
                onClick={() => { onSelectTab(id); onClose() }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[10px] font-body font-semibold text-[16px] transition-all text-left border ${active ? btnActive : btnDefault}`}
              >
                <Icon />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="h-px bg-ink-primary mx-5 my-5" />

        <p className="font-body font-semibold text-[16px] uppercase tracking-wider text-ink-secondary px-5 mb-3">
          Outils
        </p>

        <nav className="flex flex-col gap-3 px-3">
          {PAGES.map(({ id, label, Icon }) => {
            const active = activePage === id
            return (
              <button
                key={id}
                onClick={() => { onSelectPage(id); onClose() }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[10px] font-body font-semibold text-[16px] transition-all text-left border ${active ? btnActive : btnDefault}`}
              >
                <Icon />
                <span className="flex-1">{label}</span>
                {id === 'liste' && shoppingCount > 0 && (
                  <span className="w-5 h-5 bg-brand text-ink-primary text-[14px] font-bold rounded-full flex items-center justify-center">
                    {shoppingCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Notifications — plan payant uniquement ── */}
        {!isAnonymous && notifPermission !== 'unsupported' && (
          <>
            <div className="h-px bg-ink-primary mx-5 my-5" />
            <div className="px-3">
              <button
                onClick={() => { if (notifPermission === 'default') { onRequestNotif(); onClose() } }}
                disabled={notifPermission === 'granted' || notifPermission === 'denied'}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] font-body font-semibold text-[16px] transition-all text-left border ${btnDefault} disabled:opacity-60 disabled:cursor-default`}
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
            </div>
          </>
        )}

        {/* ── Auth ── */}
        {!authLoading && (
          <>
            <div className="h-px bg-ink-primary mx-5 my-5" />
            <div className="px-3">

              {/* Connectée — affiche l'email et un lien de déconnexion */}
              {!isAnonymous && (
                <div className="flex flex-col gap-2">
                  <p className="font-body text-[14px] text-ink-secondary px-1">
                    ✓ Connectée · <span className="font-semibold text-ink-primary">{authEmail}</span>
                  </p>
                  <button
                    onClick={() => { onSignOut(); onClose() }}
                    className={`w-full flex items-center justify-center px-4 py-2.5 rounded-[10px] font-body font-semibold text-[15px] border transition-all ${btnDefault}`}
                  >
                    Se déconnecter
                  </button>
                </div>
              )}

              {/* Anonymous — ouvre la page de choix de plan */}
              {isAnonymous && (
                <button
                  onClick={() => { onShowPlan(); onClose() }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] font-body font-semibold text-[16px] border transition-all ${btnDefault}`}
                >
                  <GoogleIcon />
                  Sauvegarder mes données
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 bg-ink-primary/30" />
    </div>
  )
}

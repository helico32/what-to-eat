import { btnActive, btnDefault } from '../utils/styles'

function UrgentIcon()    { return <span className="w-2.5 h-2.5 rounded-full bg-current inline-block" /> }
function FridgeIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="9" y1="6" x2="9" y2="8"/><line x1="9" y1="14" x2="9" y2="18"/></svg> }
function SnowflakeIcon() { return <span>❄️</span> }
function BoxIcon()       { return <span>📦</span> }
function ListIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function CartIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> }
function ChefHatIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg> }

const TABS = [
  { id: 'urgent',  label: 'À utiliser en priorité', Icon: UrgentIcon    },
  { id: 'frigo',   label: 'Frigo',                  Icon: FridgeIcon    },
  { id: 'congel',  label: 'Congélateur',             Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard',                Icon: BoxIcon       },
  { id: 'tout',    label: 'Tout',                    Icon: ListIcon      },
]

const PAGES = [
  { id: 'liste',    label: 'Liste de courses', Icon: CartIcon    },
  { id: 'recettes', label: 'Recettes',         Icon: ChefHatIcon },
]

export default function MenuDrawer({ activeTab, activePage, shoppingCount, onSelectTab, onSelectPage, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div
        className="w-[300px] max-w-[80vw] h-full bg-canvas flex flex-col pt-14 pb-10 shadow-lg"
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
      </div>

      <div className="flex-1 bg-ink-primary/30"  />
    </div>
  )
}

// Icon components (inline SVG, 14×14)
function DotIcon()      { return <span className="w-2 h-2 rounded-full bg-current inline-block" /> }
function FridgeIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/></svg> }
function SnowflakeIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/><path d="M2 12h20"/><path d="m9 4-3 3 3 3"/><path d="m9 20-3-3 3-3"/><path d="m15 4 3 3-3 3"/><path d="m15 20 3-3-3-3"/></svg> }
function CabinetIcon()  { return <span className="text-[13px]">📦</span> }
function ListIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }

const TABS = [
  { id: 'urgent',  label: 'Urgent',   Icon: DotIcon },
  { id: 'frigo',   label: 'Frigo',    Icon: FridgeIcon },
  { id: 'congel',  label: 'Congél',   Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placards', Icon: CabinetIcon },
  { id: 'tout',    label: 'Tout',     Icon: ListIcon },
]

export default function TabBar({ active, onChange }) {
  return (
    <div className="sticky top-[68px] z-10 bg-canvas/90 backdrop-blur-md">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              active === id
                ? 'bg-brand text-ink-primary'
                : 'bg-[#F9EDDC] text-ink-secondary hover:opacity-80'
            }`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

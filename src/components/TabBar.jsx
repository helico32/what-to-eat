import { btnActive, btnDefault } from '../utils/styles'

// Icon components (inline SVG, 14×14)
function DotIcon()      { return <span className="w-2 h-2 rounded-full bg-current inline-block" /> }
function FridgeIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/></svg> }
function SnowflakeIcon(){ return <span className="text-[14px]">❄️</span> }
function CabinetIcon()  { return <span className="text-[14px]">📦</span> }
function ListIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }

const TABS = [
  { id: 'urgent',  label: 'Urgent',   Icon: DotIcon },
  { id: 'frigo',   label: 'Frigo',    Icon: FridgeIcon },
  { id: 'congel',  label: 'Congél',   Icon: SnowflakeIcon },
  { id: 'placard', label: 'Placard', Icon: CabinetIcon },
  { id: 'tout',    label: 'Tout',     Icon: ListIcon },
]

export default function TabBar({ active, onChange }) {
  return (
    <div className="pt-3">
      <div className="flex gap-3 px-4 py-2.5 overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-[10px] text-[16px] font-semibold transition-all ${active === id ? btnActive : btnDefault}`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

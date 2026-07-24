import { btnActive, btnDefault } from '../utils/styles'
import { DotIcon, FridgeIcon, SnowflakeIcon, CabinetIcon, ListIcon } from './icons'

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

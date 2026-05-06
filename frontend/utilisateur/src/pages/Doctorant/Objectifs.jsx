import React, { useState, useEffect } from 'react'
import {
  ClipboardListIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CircleIcon,
} from 'lucide-react'

const chipStyles = {
  ok: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warn: 'bg-amber-50 text-amber-800 border border-amber-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
}

const Chip = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${chipStyles[color]}`}>
    {label}
  </span>
)

const statusConfig = {
  non_commence: { chip: 'Non commencé', color: 'gray', dot: '#94a3b8', icon: CircleIcon },
  en_cours:     { chip: 'En cours',      color: 'info', dot: '#378ADD', icon: ClockIcon },
  termine:      { chip: 'Terminé',       color: 'ok',   dot: '#1D9E75', icon: CheckCircleIcon },
  retard:       { chip: 'En retard',     color: 'danger', dot: '#E24B4A', icon: AlertCircleIcon },
}

const Objectifs = () => {
  const [objectifs, setObjectifs] = useState([])
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) return;
    fetch(`http://localhost:3001/api/objectifs/${user.id}`)
      .then(res => res.json())
      .then(data => setObjectifs(data))
      .catch(err => console.log(err))
  }, [])

  const toggleJalon = (objId, jalonId, done) => {
    fetch(`http://localhost:3001/api/jalons/${jalonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done })
    });

    setObjectifs(prev =>
      prev.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              jalons: obj.jalons.map(j =>
                j.id === jalonId ? { ...j, done: !j.done } : j
              ),
            }
          : obj
      )
    )
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      <div className="flex items-center gap-3">
        <ClipboardListIcon className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-semibold text-slate-800">Objectifs & Jalons</h1>
      </div>

      {objectifs.map(obj => {
        const config = statusConfig[obj.status] || statusConfig['non_commence']
        const Icon = config.icon
        const isOpen = openId === obj.id

        return (
          <div key={obj.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">

            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setOpenId(isOpen ? null : obj.id)}
            >
              <div className="flex items-start gap-3">
                <span className="w-3 h-3 rounded-full mt-1.5" style={{ background: config.dot }} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{obj.label}</p>
                  <p className="text-xs text-slate-500">{obj.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Chip label={config.chip} color={config.color} />
                {isOpen ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
              </div>
            </div>

            <div className="mt-3">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${obj.pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{obj.pct}% complété</p>
            </div>

            {isOpen && (
              <div className="mt-4 space-y-3">
                <div className="text-xs text-slate-500">
                  Début: {obj.dateDebut} · Échéance: {obj.dateEcheance}
                </div>

                <div className="space-y-2">
                  {obj.jalons.map(j => (
                    <div key={j.id} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleJalon(obj.id, j.id, j.done)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                          j.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                        }`}
                      >
                        {j.done && (
                          <svg width="10" height="10">
                            <polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="2" fill="none" />
                          </svg>
                        )}
                      </button>
                      <p className={`text-sm ${j.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {j.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}

export default Objectifs
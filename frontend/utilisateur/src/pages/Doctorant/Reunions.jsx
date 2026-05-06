import React, { useState, useEffect } from 'react'
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from 'lucide-react'

const chipStyles = {
  ok: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
  warn: 'bg-amber-50 text-amber-800 border border-amber-200',
}

const Chip = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${chipStyles[color]}`}>
    {label}
  </span>
)

const statusConfig = {
  planifiee: { label: "Planifiée",  color: "info",   icon: ClockIcon },
  realisee:  { label: "Terminée",   color: "ok",     icon: CheckCircleIcon },
  annulee:   { label: "Annulée",    color: "danger", icon: AlertCircleIcon },
}

const Reunions = () => {
  const [reunions, setReunions] = useState([])
  const [filtre, setFiltre] = useState('tous')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) return;
    fetch(`http://localhost:3001/api/reunions/${user.id}`)
      .then(res => res.json())
      .then(data => setReunions(data))
      .catch(err => console.log(err))
  }, [])

  const reunionsFiltrees = filtre === 'tous'
    ? reunions
    : reunions.filter(r => r.statut === filtre)

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Réunions</h1>
        <p className="text-sm text-slate-500">Consultez vos réunions d'encadrement</p>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'tous', label: 'Toutes' },
          { key: 'planifiee', label: 'Planifiées' },
          { key: 'realisee', label: 'Terminées' },
          { key: 'annulee', label: 'Annulées' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtre === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* EMPTY */}
      {reunionsFiltrees.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <CalendarIcon className="mx-auto w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Aucune réunion disponible</p>
        </div>
      )}

      {/* LIST */}
      {reunionsFiltrees.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
          {reunionsFiltrees.map(r => {
            const config = statusConfig[r.statut] || statusConfig['planifiee']
            const StatusIcon = config.icon
            const date = r.date_reunion ? new Date(r.date_reunion) : null

            return (
              <div key={r.id} className="flex items-center gap-4 px-4 py-4 border-b last:border-0 hover:bg-slate-50 transition">

                {/* DATE BOX */}
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-center w-14 flex-shrink-0">
                  <p className="text-lg font-semibold text-slate-700 leading-none">
                    {date ? date.getDate() : '-'}
                  </p>
                  <p className="text-xs text-slate-400 uppercase">
                    {date ? date.toLocaleDateString('fr-FR', { month: 'short' }) : '-'}
                  </p>
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{r.titre}</p>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    {r.heure && <span><ClockIcon className="inline w-3 h-3 mr-1" />{r.heure}</span>}
                    {r.participants && <span><UsersIcon className="inline w-3 h-3 mr-1" />{r.participants}</span>}
                  </div>
                </div>

                {/* STATUS */}
                <Chip label={config.label} color={config.color} />
                <StatusIcon className="w-4 h-4 text-slate-400" />

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default Reunions
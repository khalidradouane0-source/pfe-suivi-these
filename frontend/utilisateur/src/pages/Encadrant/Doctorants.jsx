import React, { useState, useEffect } from 'react'
import {
  UserIcon,
  BookOpenIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon
} from 'lucide-react'

const chipStyles = {
  ok: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warn: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
  info: 'bg-blue-50 text-blue-800 border border-blue-200',
}

const Chip = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${chipStyles[color]}`}>
    {label}
  </span>
)

const statutConfig = {
  en_cours:  { label: "En cours",   color: "info",   icon: ClockIcon },
  soutenue:  { label: "Soutenue",   color: "ok",     icon: CheckCircleIcon },
  suspendue: { label: "Suspendue",  color: "danger", icon: AlertCircleIcon },
}

const Doctorants = () => {
  const [doctorants, setDoctorants] = useState([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) return;
    fetch(`http://localhost:3001/api/encadrant/doctorants/${user.id}`)
      .then(res => res.json())
      .then(data => setDoctorants(data))
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Mes Doctorants</h1>
        <p className="text-sm text-slate-500">Liste des doctorants que vous encadrez</p>
      </div>

      {/* EMPTY */}
      {doctorants.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <UserIcon className="mx-auto w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Aucun doctorant assigné</p>
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 gap-4">
        {doctorants.map(d => {
          const config = statutConfig[d.these_statut] || statutConfig['en_cours']
          const StatusIcon = config.icon

          return (
            <div key={d.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">

              <div className="flex items-center gap-4">

                {/* AVATAR */}
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold text-lg">
                    {d.prenom?.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">
                      {d.prenom} {d.nom}
                    </p>
                    <Chip label={config.label} color={config.color} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{d.email}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    <BookOpenIcon className="inline w-3 h-3 mr-1" />
                    {d.sujet || 'Sujet non défini'}
                  </p>
                </div>

                {/* PROGRESSION */}
                <div className="text-center flex-shrink-0">
                  <p className="text-2xl font-semibold text-slate-800">{d.progression || 0}%</p>
                  <p className="text-xs text-slate-400">Progression</p>
                </div>

              </div>

              {/* PROGRESS BAR */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${d.progression || 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">{d.laboratoire}</p>
                  <p className="text-xs text-slate-400">{d.discipline}</p>
                </div>
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Doctorants
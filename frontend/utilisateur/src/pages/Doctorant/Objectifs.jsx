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
  ok:     'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warn:   'bg-amber-50 text-amber-800 border border-amber-200',
  info:   'bg-blue-50 text-blue-800 border border-blue-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
  gray:   'bg-slate-100 text-slate-600 border border-slate-200',
}

const Chip = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${chipStyles[color]}`}>
    {label}
  </span>
)

const statusConfig = {
  non_commence: { chip: 'Non commencé', color: 'gray',   dot: '#94a3b8', icon: CircleIcon },
  en_cours:     { chip: 'En cours',     color: 'info',   dot: '#6366f1', icon: ClockIcon },
  termine:      { chip: 'Terminé',      color: 'ok',     dot: '#10b981', icon: CheckCircleIcon },
  retard:       { chip: 'En retard',    color: 'danger', dot: '#f43f5e', icon: AlertCircleIcon },
}

const Objectifs = () => {
  const [objectifs, setObjectifs]         = useState([])
  const [openId, setOpenId]               = useState(null)
  const [encadrantId, setEncadrantId]     = useState(null)

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) return

    fetch(`http://localhost:3001/api/objectifs/${user.id}`)
      .then(res => res.json())
      .then(data => setObjectifs(Array.isArray(data) ? data : []))
      .catch(err => console.log(err))

    fetch(`http://localhost:3001/api/these/${user.id}`)
      .then(res => res.json())
      .then(data => setEncadrantId(data.encadrant_id || null))
      .catch(err => console.log(err))
  }, [])

  const toggleJalon = async (objId, jalonId, done) => {
    await fetch(`http://localhost:3001/api/jalons/${jalonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done })
    })
    setObjectifs(prev =>
      prev.map(obj =>
        obj.id === objId
          ? { ...obj, jalons: obj.jalons.map(j => j.id === jalonId ? { ...j, done: !j.done } : j) }
          : obj
      )
    )
  }

  const updateStatus = async (id, statut) => {
    const obj = objectifs.find(o => o.id === id)
    if (!obj) return

    await fetch(`http://localhost:3001/api/objectifs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label:         obj.label,
        description:   obj.description,
        statut,
        progression:   obj.pct,
        date_echeance: null,
        encadrant_id:  encadrantId,
        doctorant_nom: `${user.prenom} ${user.nom}`
      })
    })

    setObjectifs(prev =>
      prev.map(o => o.id === id ? { ...o, status: statut } : o)
    )
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      <div className="flex items-center gap-3">
        <ClipboardListIcon className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Objectifs & Jalons</h1>
          <p className="text-sm text-slate-500">Suivez vos objectifs définis par votre encadrant</p>
        </div>
      </div>

      {objectifs.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <ClipboardListIcon className="mx-auto w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Aucun objectif défini par votre encadrant</p>
        </div>
      )}

      {objectifs.map(obj => {
        const config = statusConfig[obj.status] || statusConfig['non_commence']
        const isOpen = openId === obj.id

        return (
          <div key={obj.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">

            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setOpenId(isOpen ? null : obj.id)}
            >
              <div className="flex items-start gap-3">
                <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: config.dot }} />
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
                <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${obj.pct}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{obj.pct}% complété</p>
            </div>

            {isOpen && (
              <div className="mt-4 space-y-4">

                <p className="text-xs text-slate-400">
                  Début : {obj.dateDebut} · Échéance : {obj.dateEcheance}
                </p>

                <div
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                  onClick={e => e.stopPropagation()}
                >
                  <label className="text-xs font-medium text-slate-600">Mettre à jour le statut :</label>
                  <select
                    value={obj.status}
                    onChange={e => updateStatus(obj.id, e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    <option value="non_commence">Non commencé</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé ✅</option>
                    <option value="retard">En retard</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Jalons</p>
                  <div className="space-y-2">
                    {obj.jalons.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Aucun jalon défini</p>
                    )}
                    {obj.jalons.map(j => (
                      <div key={j.id} className="flex items-center gap-3">
                        <button
                          onClick={e => { e.stopPropagation(); toggleJalon(obj.id, j.id, j.done) }}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            j.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          {j.done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
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

              </div>
            )}

          </div>
        )
      })}

    </div>
  )
}

export default Objectifs
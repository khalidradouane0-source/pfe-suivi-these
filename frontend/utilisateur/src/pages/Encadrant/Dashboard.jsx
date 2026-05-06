import React, { useState, useEffect } from 'react'
import {
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  BookOpenIcon
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

const EncDashboard = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) return;
    fetch(`http://localhost:3001/api/encadrant/dashboard/${user.id}`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.log(err))
  }, [])

  if (!data) return <div className="p-6 text-slate-500">Chargement...</div>

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const user = JSON.parse(localStorage.getItem("user"))

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 capitalize">{today}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Bonjour, <span className="font-medium text-slate-700">{user?.prenom}</span> · Espace Encadrant
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Encadrant actif
        </span>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Doctorants", value: data.stats.total, icon: UsersIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "En cours", value: data.stats.en_cours, icon: ClockIcon, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "En retard", value: data.stats.en_retard, icon: AlertCircleIcon, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Livrables à valider", value: data.stats.livrables_attente, icon: FileTextIcon, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-semibold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* DOCTORANTS + REUNIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* DOCTORANTS */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Mes Doctorants</p>
          <div className="space-y-3">
            {data.doctorants.map(d => (
              <div key={d.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {d.prenom?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{d.prenom} {d.nom}</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500"
                      style={{ width: `${d.progression || 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500">{d.progression || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* REUNIONS */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Prochaines Réunions</p>
          {data.reunions.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Aucune réunion planifiée</p>
          )}
          <div className="space-y-3">
            {data.reunions.map(r => {
              const date = r.date_reunion ? new Date(r.date_reunion) : null
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 text-center flex-shrink-0 w-11">
                    <p className="text-base font-semibold text-slate-700 leading-none">{date ? date.getDate() : '-'}</p>
                    <p className="text-[10px] uppercase text-slate-400">{date ? date.toLocaleDateString('fr-FR', { month: 'short' }) : '-'}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.titre}</p>
                    <p className="text-xs text-slate-400">{r.prenom} {r.nom}</p>
                  </div>
                  <Chip label="Planifiée" color="info" />
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* LIVRABLES A VALIDER + ALERTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LIVRABLES */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Livrables à valider</p>
          {data.livrables_attente.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Aucun livrable en attente</p>
          )}
          <div className="space-y-2">
            {data.livrables_attente.map(l => (
              <div key={l.id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <FileTextIcon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{l.label}</p>
                  <p className="text-xs text-slate-400">{l.prenom} {l.nom}</p>
                </div>
                <Chip
                  label={l.statut === 'a_corriger' ? 'À corriger' : 'Soumis'}
                  color={l.statut === 'a_corriger' ? 'warn' : 'info'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ALERTES */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">⚠️ Alertes</p>
          {data.alertes.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Aucune alerte</p>
          )}
          <div className="space-y-2">
            {data.alertes.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <AlertCircleIcon className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{a.prenom} {a.nom}</p>
                  <p className="text-xs text-slate-400 truncate">{a.sujet}</p>
                </div>
                <Chip label={`${a.progression}%`} color="danger" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

export default EncDashboard
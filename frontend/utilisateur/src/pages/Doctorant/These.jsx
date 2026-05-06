
import React, { useState, useEffect } from 'react'
import {
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  FlaskConicalIcon,
  TagIcon,
  TrendingUpIcon,
} from 'lucide-react'

const These = () => {
  const [these, setThese] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) return;
    fetch(`http://localhost:3001/api/these/${user.id}`)
      .then(res => res.json())
      .then(data => setThese(data))
      .catch(err => console.log(err))
  }, [])

  if (!these) return <div className="p-6 text-slate-500">Chargement...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Ma Thèse</h1>
        <p className="text-slate-500 text-sm mt-1">Informations sur votre dossier doctoral</p>
      </div>

      {/* BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-800 p-6">
        <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest mb-2">Sujet de thèse</p>
        <p className="text-white text-lg font-semibold leading-snug mb-4">{these.sujet}</p>
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
            style={{ width: `${these.progression}%` }}
          />
        </div>
        <p className="text-indigo-300 text-xs">Progression globale · {these.progression}%</p>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Doctorant</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{these.prenom} {these.nom}</p>
              <p className="text-xs text-slate-400">{these.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Encadrant</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {these.encadrant_prenom} {these.encadrant_nom}
              </p>
              <p className="text-xs text-slate-400">{these.specialite}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Laboratoire & Discipline</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{these.laboratoire}</p>
              <p className="text-xs text-slate-400">{these.discipline}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Inscription & Durée</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {new Date(these.date_inscription).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs text-slate-400">Durée prévue : {these.duree_prevue} ans</p>
            </div>
          </div>
        </div>

      </div>

      {/* STATUT */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Statut de la thèse</p>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          these.statut === 'en_cours' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          these.statut === 'soutenue' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {these.statut === 'en_cours' ? '🟢 En cours' :
           these.statut === 'soutenue' ? '🎓 Soutenue' : '⏸ Suspendue'}
        </span>
      </div>

      {/* RESUME */}
      {these.resume && (
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Résumé du projet doctoral</p>
          <p className="text-sm text-slate-600 leading-relaxed">{these.resume}</p>
        </div>
      )}

    </div>
  )
}

export default These
import React, { useState, useEffect } from 'react'
import {
  BellIcon,
  ChevronRightIcon,
} from 'lucide-react'

const chipStyles = {
  ok:     'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warn:   'bg-amber-50 text-amber-800 border border-amber-200',
  info:   'bg-blue-50 text-blue-800 border border-blue-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
}

const Chip = ({ label, color }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${chipStyles[color]}`}>
    {label}
  </span>
)

const DocDashboard = () => {
  const [profile, setProfile] = useState({})
  const [kpis, setKpis] = useState([])
  const [objectifs, setObjectifs] = useState([])
  const [reunions, setReunions] = useState([])
  const [taches, setTaches] = useState([])
  const [livrables, setLivrables] = useState([])
  const [echeances, setEcheances] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user) return;
    fetch(`http://localhost:3001/api/dashboard/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile)
        setKpis(data.kpis)
        setObjectifs(data.objectifs)
        setReunions(data.reunions)
        setTaches(data.taches)
        setLivrables(data.livrables)
        setEcheances(data.echeances)
        setNotifications(data.notifications)
      })
      .catch(err => console.log(err))
  }, [])

  const toggleTache = (id) => {
  const tache = taches.find(t => t.id === id);
  const newStatut = tache.done ? 'a_faire' : 'fait';

  fetch(`http://localhost:3001/api/taches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut: newStatut })
  });

  setTaches(prev =>
    prev.map(t =>
      t.id === id
        ? { ...t, done: !t.done, chip: !t.done ? 'Fait' : 'À faire', chipColor: !t.done ? 'ok' : 'info' }
        : t
    )
  );
};

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 capitalize">{today}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Bonjour, <span className="font-medium text-slate-700">{profile.firstName}</span> · Année {profile.year} de thèse
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Thèse en cours
        </span>
      </div>

      {/* PROGRESS BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-800 p-5 flex items-center gap-6 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest mb-1">Sujet de thèse</p>
          <p className="text-white text-sm font-medium leading-snug mb-4 line-clamp-2">{profile.thesisTitle}</p>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700"
              style={{ width: `${profile.progress}%` }}
            />
          </div>
          <p className="text-indigo-300 text-xs mt-2">Progression globale · {profile.progress}%</p>
        </div>
        <div className="text-center">
          <p className="text-5xl font-semibold text-white leading-none">
            {profile.progress}
            <span className="text-2xl text-indigo-300">%</span>
          </p>
          <p className="text-indigo-300 text-xs mt-1">sur 4 ans</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, chip, chipColor }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-semibold text-slate-800">{value}</p>
            <p className="text-xs text-slate-500 mb-2">{label}</p>
            <Chip label={chip} color={chipColor} />
          </div>
        ))}
      </div>

      {/* NOTIFICATIONS */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-600">
          <BellIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Notifications</span>
        </div>
        <div className="flex gap-4 flex-wrap flex-1">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
              {n.label}
            </div>
          ))}
        </div>
      </div>

      {/* OBJECTIFS + RÉUNIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Objectifs & jalons</p>
          <div className="space-y-3">
            {objectifs.map((o) => (
              <div key={o.label} className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: o.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-700 truncate">{o.label}</p>
                    <span className="text-xs font-medium text-slate-500 flex-shrink-0">{o.pct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1">
                    {o.status === 'retard'
                      ? <span className="text-rose-500 font-medium">{o.date} — En retard</span>
                      : o.date}
                  </p>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${o.pct}%`, background: o.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Prochaines réunions</p>
          <div className="space-y-3">
            {reunions.map((r) => (
              <div key={r.title} className="flex items-center gap-3">
                <div className="bg-slate-50 rounded-lg px-2.5 py-1.5 text-center flex-shrink-0 w-11">
                  <p className="text-base font-semibold text-slate-700 leading-none">{r.day}</p>
                  <p className="text-[10px] uppercase text-slate-400 tracking-wide">{r.month}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{r.title}</p>
                  <p className="text-[11px] text-slate-400">{r.who}</p>
                  <Chip label={r.chip} color={r.chipColor} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TÂCHES + LIVRABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Tâches assignées</p>
          <div className="space-y-2">
            {taches.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <button
                  onClick={() => toggleTache(t.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {t.done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
                <p className={`text-sm flex-1 ${t.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {t.label}
                </p>
                <Chip label={t.done ? 'Fait' : t.chip} color={t.done ? 'ok' : t.chipColor} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Livrables récents</p>
          <div className="space-y-2">
            {livrables.map((l) => (
              <div key={l.label} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: l.bg }}>
                  {l.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{l.label}</p>
                  <p className="text-[11px] text-slate-400">{l.sub}</p>
                </div>
                <Chip label={l.chip} color={l.chipColor} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ÉCHÉANCES */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Échéances à venir</p>
          <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            Voir le calendrier <ChevronRightIcon className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {echeances.map((e) => (
            <div key={e.label} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.dot }} />
              <p className="text-sm text-slate-700 flex-1">{e.label}</p>
              <p className="text-xs text-slate-400 hidden sm:block">{e.date}</p>
              <Chip label={e.chip} color={e.chipColor} />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default DocDashboard
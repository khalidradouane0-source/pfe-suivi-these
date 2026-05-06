import React, { useState, useEffect } from 'react'
import {
  CalendarIcon,
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  XIcon,
  TrashIcon
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

const statusConfig = {
  a_venir:  { label: "À venir",   color: "info",   icon: CalendarIcon },
  proche:   { label: "Proche",    color: "warn",   icon: ClockIcon },
  depasse:  { label: "Dépassée",  color: "danger", icon: AlertCircleIcon },
  termine:  { label: "Terminée",  color: "ok",     icon: CheckCircleIcon },
}

const Echeances = () => {
  const [echeances, setEcheances] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newEcheance, setNewEcheance] = useState({ label: '', date_echeance: '', statut: 'a_venir' })

  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3001/api/echeances/${user.id}`)
      .then(res => res.json())
      .then(data => setEcheances(data))
      .catch(err => console.log(err))
  }, [])

  const deleteEcheance = (id) => {
    fetch(`http://localhost:3001/api/echeances/${id}`, { method: 'DELETE' });
    setEcheances(prev => prev.filter(e => e.id !== id));
  }

  const addEcheance = () => {
    if (!newEcheance.label || !newEcheance.date_echeance) return;
    fetch('http://localhost:3001/api/echeances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEcheance, doctorant_id: user.id })
    })
    .then(res => res.json())
    .then(data => {
      setEcheances(prev => [...prev, {
        id: data.id,
        label: newEcheance.label,
        date_echeance: newEcheance.date_echeance,
        statut: newEcheance.statut
      }]);
      setNewEcheance({ label: '', date_echeance: '', statut: 'a_venir' });
      setShowModal(false);
    });
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Échéances</h1>
          <p className="text-sm text-slate-500">Suivez vos deadlines académiques et administratives</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvelle échéance
        </button>
      </div>

      {/* EMPTY */}
      {echeances.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <CalendarIcon className="mx-auto w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Aucune échéance disponible</p>
        </div>
      )}

      {/* LIST */}
      {echeances.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
          {echeances.map(e => {
            const config = statusConfig[e.statut] || statusConfig['a_venir']
            const StatusIcon = config.icon
            const today = new Date()
            const dateEch = new Date(e.date_echeance)
            const daysLeft = Math.ceil((dateEch - today) / (1000 * 60 * 60 * 24))

            return (
              <div key={e.id} className="flex items-center gap-4 px-4 py-4 border-b last:border-0 hover:bg-slate-50 transition">

                {/* DOT */}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  e.statut === 'depasse' ? 'bg-rose-500' :
                  e.statut === 'proche'  ? 'bg-amber-400' :
                  e.statut === 'termine' ? 'bg-emerald-500' : 'bg-blue-400'
                }`} />

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{e.label}</p>
                  <p className="text-xs text-slate-400">
                    📅 {new Date(e.date_echeance).toLocaleDateString('fr-FR')}
                  </p>
                  {e.statut !== 'termine' && (
                    <p className="text-xs mt-1 text-slate-500">
                      {daysLeft <= 0 ? "Aujourd'hui" : `J-${daysLeft}`}
                    </p>
                  )}
                </div>

                {/* STATUS */}
                <Chip label={config.label} color={config.color} />
                <StatusIcon className="w-4 h-4 text-slate-400" />

                {/* DELETE */}
                <button onClick={() => deleteEcheance(e.id)} className="text-slate-300 hover:text-rose-400 transition">
                  <TrashIcon className="w-4 h-4" />
                </button>

              </div>
            )
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Nouvelle échéance</h2>
              <button onClick={() => setShowModal(false)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Titre</label>
                <input
                  type="text"
                  placeholder="Titre de l'échéance"
                  value={newEcheance.label}
                  onChange={e => setNewEcheance({ ...newEcheance, label: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Date</label>
                <input
                  type="date"
                  value={newEcheance.date_echeance}
                  onChange={e => setNewEcheance({ ...newEcheance, date_echeance: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Statut</label>
                <select
                  value={newEcheance.statut}
                  onChange={e => setNewEcheance({ ...newEcheance, statut: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="a_venir">À venir</option>
                  <option value="proche">Proche</option>
                  <option value="depasse">Dépassée</option>
                  <option value="termine">Terminée</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={addEcheance}
                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Ajouter
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Echeances
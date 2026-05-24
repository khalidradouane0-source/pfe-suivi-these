import React, { useState, useEffect } from 'react'
import {
  CalendarIcon, ClockIcon, UsersIcon, CheckCircleIcon,
  AlertCircleIcon, PlusIcon, XIcon, TrashIcon
} from 'lucide-react'

const chipStyles = {
  ok:     'bg-emerald-50 text-emerald-800 border border-emerald-200',
  info:   'bg-blue-50 text-blue-800 border border-blue-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
  warn:   'bg-amber-50 text-amber-800 border border-amber-200',
}

const Chip = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${chipStyles[color]}`}>
    {label}
  </span>
)

const statusConfig = {
  planifiee: { label: "Planifiée", color: "info",   icon: ClockIcon },
  realisee:  { label: "Terminée",  color: "ok",     icon: CheckCircleIcon },
  annulee:   { label: "Annulée",   color: "danger", icon: AlertCircleIcon },
}

const EncReunions = () => {
  const [reunions, setReunions]     = useState([])
  const [filtre, setFiltre]         = useState('tous')
  const [showModal, setShowModal]   = useState(false)
  const [doctorants, setDoctorants] = useState([])
  const [newReunion, setNewReunion] = useState({
    titre: '', date_reunion: '', heure: '', participants: '', doctorant_id: ''
  })

  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    if (!user) return
    fetch(`http://localhost:3001/api/encadrant/reunions/${user.id}`)
      .then(res => res.json())
      .then(data => setReunions(Array.isArray(data) ? data : []))

    fetch(`http://localhost:3001/api/encadrant/doctorants/${user.id}`)
      .then(res => res.json())
      .then(data => setDoctorants(Array.isArray(data) ? data : []))
  }, [])

  const reunionsFiltrees = filtre === 'tous'
    ? reunions
    : reunions.filter(r => r.statut === filtre)

  // ✅ updateStatut داخل component
  const updateStatut = async (id, statut) => {
    try {
      await fetch(`http://localhost:3001/api/reunions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut,
          encadrant_nom: `${user.prenom} ${user.nom}`
        })
      })
      setReunions(prev => prev.map(r => r.id === id ? { ...r, statut } : r))
    } catch (err) {
      console.log(err)
    }
  }

  const addReunion = async () => {
    if (!newReunion.titre || !newReunion.date_reunion || !newReunion.doctorant_id) return
    const encadrant_nom = `${user.prenom} ${user.nom}`

    if (newReunion.doctorant_id === 'tous') {
      const results = await Promise.all(doctorants.map(doc =>
        fetch('http://localhost:3001/api/reunions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newReunion, doctorant_id: doc.id, statut: 'planifiee', encadrant_nom })
        }).then(res => res.json())
        .then(data => ({
          id: data.id, titre: newReunion.titre, date_reunion: newReunion.date_reunion,
          heure: newReunion.heure, participants: newReunion.participants,
          statut: 'planifiee', nom: doc.nom, prenom: doc.prenom
        }))
      ))
      setReunions(prev => [...prev, ...results])
    } else {
      const res  = await fetch('http://localhost:3001/api/reunions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newReunion, statut: 'planifiee', encadrant_nom })
      })
      const data = await res.json()
      const doc  = doctorants.find(d => d.id === parseInt(newReunion.doctorant_id))
      setReunions(prev => [...prev, {
        id: data.id, titre: newReunion.titre, date_reunion: newReunion.date_reunion,
        heure: newReunion.heure, participants: newReunion.participants,
        statut: 'planifiee', nom: doc?.nom, prenom: doc?.prenom
      }])
    }

    setNewReunion({ titre: '', date_reunion: '', heure: '', participants: '', doctorant_id: '' })
    setShowModal(false)
  }

  const deleteReunion = (id) => {
    fetch(`http://localhost:3001/api/reunions/${id}`, { method: 'DELETE' })
    setReunions(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Réunions</h1>
          <p className="text-sm text-slate-500">Toutes les réunions de vos doctorants</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">
          <PlusIcon className="w-4 h-4" /> Nouvelle réunion
        </button>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'tous',      label: 'Toutes' },
          { key: 'planifiee', label: 'Planifiées' },
          { key: 'realisee',  label: 'Terminées' },
          { key: 'annulee',   label: 'Annulées' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtre === f.key ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
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
            const config     = statusConfig[r.statut] || statusConfig['planifiee']
            const StatusIcon = config.icon
            const date       = r.date_reunion ? new Date(r.date_reunion) : null

            return (
              <div key={r.id} className="flex items-center gap-4 px-4 py-4 border-b last:border-0 hover:bg-slate-50 transition">

                {/* DATE BOX */}
                <div className="bg-slate-50 rounded-lg px-3 py-2 text-center w-14 flex-shrink-0">
                  <p className="text-lg font-semibold text-slate-700 leading-none">{date ? date.getDate() : '-'}</p>
                  <p className="text-xs text-slate-400 uppercase">{date ? date.toLocaleDateString('fr-FR', { month: 'short' }) : '-'}</p>
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{r.titre}</p>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    {r.heure && <span><ClockIcon className="inline w-3 h-3 mr-1" />{r.heure}</span>}
                    <span><UsersIcon className="inline w-3 h-3 mr-1" />{r.prenom} {r.nom}</span>
                    {r.participants && <span>· {r.participants}</span>}
                  </div>
                </div>

                <Chip label={config.label} color={config.color} />
                <StatusIcon className="w-4 h-4 text-slate-400" />

                {/* BOUTONS STATUT */}
                {r.statut === 'planifiee' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatut(r.id, 'realisee')}
                      className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      ✅ Terminée
                    </button>
                    <button
                      onClick={() => updateStatut(r.id, 'annulee')}
                      className="px-3 py-1 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                )}

                <button onClick={() => deleteReunion(r.id)} className="text-slate-300 hover:text-rose-400 transition">
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
              <h2 className="text-lg font-semibold text-slate-800">Nouvelle réunion</h2>
              <button onClick={() => setShowModal(false)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Doctorant</label>
                <select value={newReunion.doctorant_id}
                  onChange={e => setNewReunion({ ...newReunion, doctorant_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Choisir un doctorant</option>
                  <option value="tous">Tous les doctorants</option>
                  {doctorants.map(d => (
                    <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Titre</label>
                <input type="text" placeholder="Titre de la réunion" value={newReunion.titre}
                  onChange={e => setNewReunion({ ...newReunion, titre: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Date</label>
                  <input type="date" value={newReunion.date_reunion}
                    onChange={e => setNewReunion({ ...newReunion, date_reunion: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Heure</label>
                  <input type="time" value={newReunion.heure}
                    onChange={e => setNewReunion({ ...newReunion, heure: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Participants</label>
                <input type="text" placeholder="Ex: Dr. Mohammed, Dr. Rachida" value={newReunion.participants}
                  onChange={e => setNewReunion({ ...newReunion, participants: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={addReunion}
                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                Ajouter
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default EncReunions
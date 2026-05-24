import React, { useEffect, useState } from "react"
import {
  ClipboardListIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CircleIcon
} from "lucide-react"

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
  non_commence: { chip: 'Non commencé', color: 'gray',   icon: CircleIcon },
  en_cours:     { chip: 'En cours',     color: 'info',   icon: ClockIcon },
  termine:      { chip: 'Terminé',      color: 'ok',     icon: CheckCircleIcon },
  retard:       { chip: 'En retard',    color: 'danger', icon: AlertCircleIcon },
}

const EncObjectifs = () => {
  const [objectifs, setObjectifs]   = useState([])
  const [doctorants, setDoctorants] = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [openId, setOpenId]         = useState(null)
  const [newJalon, setNewJalon]     = useState({})
  const [form, setForm] = useState({
    doctorant_id: '', label: '', description: '',
    statut: 'non_commence', progression: 0,
    date_debut: '', date_echeance: ''
  })

  const user = JSON.parse(localStorage.getItem("user"))

  const fetchObjectifs = () => {
    fetch(`http://localhost:3001/api/encadrant/objectifs/${user.id}`)
      .then(res => res.json())
      .then(data => setObjectifs(Array.isArray(data) ? data : []))
  }

  useEffect(() => {
    fetchObjectifs()
    fetch(`http://localhost:3001/api/encadrant/doctorants/${user.id}`)
      .then(res => res.json())
      .then(data => setDoctorants(Array.isArray(data) ? data : []))
  }, [])

  const addObjectif = async () => {
    if (!form.label || !form.doctorant_id) return

    const encadrant_nom = `${user.prenom} ${user.nom}`

    if (form.doctorant_id === 'tous') {
      await Promise.all(doctorants.map(doc =>
        fetch("http://localhost:3001/api/objectifs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, doctorant_id: doc.id, encadrant_nom })
        })
      ))
    } else {
      await fetch("http://localhost:3001/api/objectifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, encadrant_nom })
      })
    }

    setForm({ doctorant_id: '', label: '', description: '', statut: 'non_commence', progression: 0, date_debut: '', date_echeance: '' })
    setShowModal(false)
    fetchObjectifs()
  }

  const deleteObjectif = async (id) => {
    if (!window.confirm("Supprimer cet objectif ?")) return
    await fetch(`http://localhost:3001/api/objectifs/${id}`, { method: "DELETE" })
    fetchObjectifs()
  }

  const updateStatus = async (id, statut) => {
    const obj = objectifs.find(o => o.id === id)
    await fetch(`http://localhost:3001/api/objectifs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: obj.label,
        description: obj.description,
        statut,
        progression: obj.pct,
        date_echeance: null
      })
    })
    fetchObjectifs()
  }

  const addJalon = async (objectif_id) => {
    const label = newJalon[objectif_id]
    if (!label) return
    await fetch("http://localhost:3001/api/jalons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objectif_id, label })
    })
    setNewJalon({ ...newJalon, [objectif_id]: '' })
    fetchObjectifs()
  }

  const deleteJalon = async (id) => {
    await fetch(`http://localhost:3001/api/jalons/${id}`, { method: "DELETE" })
    fetchObjectifs()
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardListIcon className="w-6 h-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Objectifs & Jalons</h1>
            <p className="text-sm text-slate-500">Définissez les objectifs pour vos doctorants</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvel objectif
        </button>
      </div>

      {/* EMPTY */}
      {objectifs.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <ClipboardListIcon className="mx-auto w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Aucun objectif défini</p>
        </div>
      )}

      {/* LIST */}
      {objectifs.map(obj => {
        const config = statusConfig[obj.status] || statusConfig['non_commence']
        const isOpen = openId === obj.id
        const dotColor = config.color === 'ok' ? '#10b981' : config.color === 'danger' ? '#f43f5e' : config.color === 'info' ? '#6366f1' : '#94a3b8'

        return (
          <div key={obj.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => setOpenId(isOpen ? null : obj.id)}>
                <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: dotColor }} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{obj.label}</p>
                  <p className="text-xs text-slate-500">{obj.description}</p>
                  <p className="text-xs text-indigo-500 mt-0.5">👤 {obj.doctorant}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Chip label={config.chip} color={config.color} />
                <button onClick={() => deleteObjectif(obj.id)} className="text-slate-300 hover:text-rose-400 transition">
                  <TrashIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setOpenId(isOpen ? null : obj.id)}>
                  {isOpen ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                </button>
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

                <p className="text-xs text-slate-400">Début: {obj.dateDebut} · Échéance: {obj.dateEcheance}</p>

                {/* STATUT READ ONLY */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <label className="text-xs font-medium text-slate-600">Statut actuel :</label>
                  <Chip label={config.chip} color={config.color} />
                </div>

                {/* JALONS */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Jalons</p>
                  <div className="space-y-2">
                    {obj.jalons.map(j => (
                      <div key={j.id} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 ${j.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        <p className={`text-sm flex-1 ${j.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{j.label}</p>
                        <button onClick={() => deleteJalon(j.id)} className="text-slate-300 hover:text-rose-400">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Nouveau jalon..."
                      value={newJalon[obj.id] || ''}
                      onChange={e => setNewJalon({ ...newJalon, [obj.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && addJalon(obj.id)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button onClick={() => addJalon(obj.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )
      })}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Nouvel objectif</h2>
              <button onClick={() => setShowModal(false)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Doctorant</label>
                <select
                  value={form.doctorant_id}
                  onChange={e => setForm({ ...form, doctorant_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Choisir un doctorant</option>
                  <option value="tous">Tous les doctorants</option>
                  {doctorants.map(d => (
                    <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Titre</label>
                <input
                  type="text"
                  placeholder="Titre de l'objectif"
                  value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Description</label>
                <textarea
                  placeholder="Description..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Date début</label>
                  <input type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Échéance</label>
                  <input type="date" value={form.date_echeance} onChange={e => setForm({ ...form, date_echeance: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Progression initiale (%)</label>
                <input type="number" min="0" max="100" value={form.progression} onChange={e => setForm({ ...form, progression: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
              <button onClick={addObjectif} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Ajouter</button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default EncObjectifs
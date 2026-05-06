import React, { useState, useEffect } from 'react'
import {
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  DownloadIcon
} from 'lucide-react'

const chipStyles = {
  ok:     'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warn:   'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border border-rose-200',
  info:   'bg-blue-50 text-blue-800 border border-blue-200',
  gray:   'bg-slate-100 text-slate-700 border border-slate-200',
}

const Chip = ({ label, color }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${chipStyles[color]}`}>
    {label}
  </span>
)

const statusConfig = {
  valide:     { label: 'Validé',      color: 'ok',   icon: CheckCircleIcon },
  soumis:     { label: 'Soumis',      color: 'info', icon: ClockIcon },
  a_corriger: { label: 'À corriger',  color: 'warn', icon: AlertCircleIcon },
  brouillon:  { label: 'Brouillon',   color: 'gray', icon: FileTextIcon },
}

const EncLivrables = () => {
  const [livrables, setLivrables] = useState([])
  const [filtre, setFiltre]       = useState('tous')

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) return
    fetch(`http://localhost:3001/api/encadrant/livrables/${user.id}`)
      .then(res => res.json())
      .then(data => setLivrables(Array.isArray(data) ? data : []))
      .catch(err => console.log(err))
  }, [])

  const updateStatut = (id, statut) => {
    fetch(`http://localhost:3001/api/livrables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut })
    })
    setLivrables(prev => prev.map(l => l.id === id ? { ...l, statut } : l))
  }

  const livrablesFiltres = filtre === 'tous'
    ? livrables
    : livrables.filter(l => l.statut === filtre)

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Livrables</h1>
        <p className="text-sm text-slate-500">Consultez et validez les livrables de vos doctorants</p>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'tous',       label: 'Tous' },
          { key: 'soumis',     label: 'Soumis' },
          { key: 'a_corriger', label: 'À corriger' },
          { key: 'valide',     label: 'Validés' },
          { key: 'brouillon',  label: 'Brouillons' },
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

      {/* BADGE SOUMIS */}
      {livrables.filter(l => l.statut === 'soumis').length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <ClockIcon className="w-4 h-4" />
          <span>
            <strong>{livrables.filter(l => l.statut === 'soumis').length}</strong> livrable(s) en attente de validation
          </span>
        </div>
      )}

      {/* EMPTY */}
      {livrablesFiltres.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <FileTextIcon className="mx-auto w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Aucun livrable disponible</p>
        </div>
      )}

      {/* LIST */}
      {livrablesFiltres.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
          {livrablesFiltres.map(l => {
            const config     = statusConfig[l.statut] || statusConfig['brouillon']
            const StatusIcon = config.icon

            return (
              <div key={l.id} className="flex items-center gap-4 px-4 py-4 border-b last:border-0 hover:bg-slate-50 transition">

                {/* ICON */}
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-5 h-5 text-slate-500" />
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{l.label}</p>
                  <div className="text-xs text-slate-400 mt-1 flex gap-3 flex-wrap">
                    <span>👤 {l.prenom} {l.nom}</span>
                    {l.type && <span>· {l.type}</span>}
                    {l.date_depot && (
                      <span>📅 {new Date(l.date_depot).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>

                {/* STATUS */}
                <StatusIcon className="w-4 h-4 text-slate-400" />
                <Chip label={config.label} color={config.color} />

                {/* DOWNLOAD — si fichier existe */}
                {l.fichier_url ? (
                  <a
                    href={`http://localhost:3001${l.fichier_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition border border-slate-200"
                    title="Télécharger le fichier"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    Fichier
                  </a>
                ) : (
                  <span className="text-xs text-slate-300 italic">Pas de fichier</span>
                )}

                {/* ACTIONS VALIDATION */}
                <div className="flex gap-2">
                  {l.statut === 'soumis' && (
                    <>
                      <button
                        onClick={() => updateStatut(l.id, 'valide')}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition border border-emerald-200"
                      >
                        ✅ Valider
                      </button>
                      <button
                        onClick={() => updateStatut(l.id, 'a_corriger')}
                        className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition border border-amber-200"
                      >
                        ✏️ Corriger
                      </button>
                    </>
                  )}
                  {l.statut === 'a_corriger' && (
                    <button
                      onClick={() => updateStatut(l.id, 'valide')}
                      className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition border border-emerald-200"
                    >
                      ✅ Valider
                    </button>
                  )}
                  {l.statut === 'valide' && (
                    <span className="text-xs text-emerald-600 font-medium">✅ Validé</span>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default EncLivrables

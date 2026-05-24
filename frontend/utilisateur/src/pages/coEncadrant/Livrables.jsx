import React, { useState, useEffect } from 'react'
import {
  FileTextIcon, CheckCircleIcon, AlertCircleIcon,
  ClockIcon, DownloadIcon, MessageSquareIcon,
  ChevronDownIcon, ChevronUpIcon
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
  valide:     { label: 'Validé',     color: 'ok',   icon: CheckCircleIcon },
  soumis:     { label: 'Soumis',     color: 'info', icon: ClockIcon },
  a_corriger: { label: 'À corriger', color: 'warn', icon: AlertCircleIcon },
  brouillon:  { label: 'Brouillon',  color: 'gray', icon: FileTextIcon },
}

const CoLivrables = () => {
  const [livrables, setLivrables]       = useState([])
  const [filtre, setFiltre]             = useState('tous')
  const [openComments, setOpenComments] = useState({})
  const [commentaires, setCommentaires] = useState({})
  const [newComment, setNewComment]     = useState({})

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) return
    fetch(`http://localhost:3001/api/coencadrant/livrables/${user.id}`)
      .then(res => res.json())
      .then(data => setLivrables(Array.isArray(data) ? data : []))
  }, [])

  const fetchCommentaires = async (livrable_id) => {
    const res  = await fetch(`http://localhost:3001/api/commentaires/${livrable_id}`)
    const data = await res.json()
    setCommentaires(prev => ({ ...prev, [livrable_id]: Array.isArray(data) ? data : [] }))
  }

  const toggleComments = (id) => {
    const isOpen = openComments[id]
    setOpenComments(prev => ({ ...prev, [id]: !isOpen }))
    if (!isOpen) fetchCommentaires(id)
  }

  const addComment = async (livrable_id, doctorant_id) => {
    const contenu = newComment[livrable_id]
    if (!contenu) return
    await fetch('http://localhost:3001/api/commentaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        livrable_id,
        auteur_id: user.id,
        auteur_nom: `${user.prenom} ${user.nom}`,
        auteur_role: 'co-encadrant',
        contenu,
        doctorant_id
      })
    })
    setNewComment(prev => ({ ...prev, [livrable_id]: '' }))
    fetchCommentaires(livrable_id)
  }

  const livrablesFiltres = filtre === 'tous'
    ? livrables
    : livrables.filter(l => l.statut === filtre)

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Livrables</h1>
        <p className="text-sm text-slate-500">Consultez et commentez les livrables des doctorants</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'tous',       label: 'Tous' },
          { key: 'soumis',     label: 'Soumis' },
          { key: 'a_corriger', label: 'À corriger' },
          { key: 'valide',     label: 'Validés' },
          { key: 'brouillon',  label: 'Brouillons' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtre === f.key ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {livrablesFiltres.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <FileTextIcon className="mx-auto w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Aucun livrable disponible</p>
        </div>
      )}

      <div className="space-y-3">
        {livrablesFiltres.map(l => {
          const config     = statusConfig[l.statut] || statusConfig['brouillon']
          const StatusIcon = config.icon
          const isOpen     = openComments[l.id]
          const comments   = commentaires[l.id] || []

          return (
            <div key={l.id} className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">

              <div className="flex items-center gap-4 px-4 py-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{l.label}</p>
                  <div className="text-xs text-slate-400 mt-1 flex gap-3 flex-wrap">
                    <span>👤 {l.prenom} {l.nom}</span>
                    {l.type && <span>· {l.type}</span>}
                    {l.date_depot && <span>📅 {new Date(l.date_depot).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
                <StatusIcon className="w-4 h-4 text-slate-400" />
                <Chip label={config.label} color={config.color} />
                {l.fichier_url ? (
                  <a href={`http://localhost:3001${l.fichier_url}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs hover:bg-sky-50 hover:text-sky-600 transition border border-slate-200">
                    <DownloadIcon className="w-3.5 h-3.5" /> Fichier
                  </a>
                ) : <span className="text-xs text-slate-300 italic">Pas de fichier</span>}

                <button onClick={() => toggleComments(l.id)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-sky-600 transition">
                  <MessageSquareIcon className="w-4 h-4" />
                  {isOpen ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Commentaires</p>

                  {comments.length === 0 && <p className="text-xs text-slate-400 italic">Aucun commentaire</p>}

                  <div className="space-y-2">
                    {comments.map(c => (
                      <div key={c.id} className={`flex gap-2 ${c.auteur_role === 'co-encadrant' ? 'flex-row-reverse' : ''}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-xl text-xs ${
                          c.auteur_role === 'co-encadrant'
                            ? 'bg-sky-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}>
                          <p className={`text-[10px] font-medium mb-0.5 ${c.auteur_role === 'co-encadrant' ? 'text-sky-200' : 'text-slate-400'}`}>
                            {c.auteur_nom}
                          </p>
                          <p>{c.contenu}</p>
                          <p className={`text-[10px] mt-0.5 ${c.auteur_role === 'co-encadrant' ? 'text-sky-200' : 'text-slate-400'}`}>
                            {new Date(c.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Écrire un commentaire..."
                      value={newComment[l.id] || ''}
                      onChange={e => setNewComment(prev => ({ ...prev, [l.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addComment(l.id, l.doctorant_id)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                    />
                    <button onClick={() => addComment(l.id, l.doctorant_id)}
                      className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700">
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default CoLivrables
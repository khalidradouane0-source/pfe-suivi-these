import React, { useState, useEffect } from 'react'
import {
  FileTextIcon, UploadIcon, CheckCircleIcon, AlertCircleIcon,
  ClockIcon, TrashIcon, XIcon, DownloadIcon, MessageSquareIcon, ChevronDownIcon, ChevronUpIcon
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

const Livrables = () => {
  const [livrables, setLivrables]         = useState([])
  const [filtre, setFiltre]               = useState('tous')
  const [showModal, setShowModal]         = useState(false)
  const [loading, setLoading]             = useState(false)
  const [form, setForm]                   = useState({ label: '', type: '', fichier: null })
  const [openComments, setOpenComments]   = useState({})
  const [commentaires, setCommentaires]   = useState({})
  const [newComment, setNewComment]       = useState({})

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) return
    fetch(`http://localhost:3001/api/livrables/${user.id}`)
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

  const addComment = async (livrable_id) => {
    const contenu = newComment[livrable_id]
    if (!contenu) return
    await fetch('http://localhost:3001/api/commentaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        livrable_id,
        auteur_id: user.id,
        auteur_nom: `${user.prenom} ${user.nom}`,
        auteur_role: 'doctorant',
        contenu
      })
    })
    setNewComment(prev => ({ ...prev, [livrable_id]: '' }))
    fetchCommentaires(livrable_id)
  }

  const livrablesFiltres = filtre === 'tous' ? livrables : livrables.filter(l => l.statut === filtre)

  const handleUpload = async () => {
    if (!form.label || !form.fichier) return
    setLoading(true)
    const theseRes = await fetch(`http://localhost:3001/api/these/${user.id}`)
    const these    = await theseRes.json()
    const formData = new FormData()
    formData.append('doctorant_id', user.id)
    formData.append('label', form.label)
    formData.append('type', form.type)
    formData.append('fichier', form.fichier)
    formData.append('encadrant_id', these.encadrant_id || '')
    formData.append('doctorant_nom', `${user.prenom} ${user.nom}`)
    try {
      const res  = await fetch('http://localhost:3001/api/livrables/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) return
      setLivrables(prev => [{ id: data.id, label: form.label, type: form.type, fichier_url: data.fichier_url, statut: 'soumis', date_depot: new Date().toISOString() }, ...prev])
      setForm({ label: '', type: '', fichier: null })
      setShowModal(false)
    } catch (err) { console.log(err) }
    finally { setLoading(false) }
  }

  const deleteLivrable = (id) => {
    fetch(`http://localhost:3001/api/livrables/${id}`, { method: 'DELETE' })
    setLivrables(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Livrables</h1>
          <p className="text-sm text-slate-500">Déposez et suivez vos documents scientifiques et administratifs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">
          <UploadIcon className="w-4 h-4" /> Déposer un fichier
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ key: 'tous', label: 'Tous' }, { key: 'soumis', label: 'Soumis' }, { key: 'a_corriger', label: 'À corriger' }, { key: 'valide', label: 'Validés' }, { key: 'brouillon', label: 'Brouillons' }].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filtre === f.key ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
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

              {/* ROW */}
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{l.label}</p>
                  <div className="text-xs text-slate-400 mt-1 flex gap-3 flex-wrap">
                    {l.type && <span>{l.type}</span>}
                    {l.date_depot && <span>📅 {new Date(l.date_depot).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
                <StatusIcon className="w-4 h-4 text-slate-400" />
                <Chip label={config.label} color={config.color} />
                {l.fichier_url && (
                  <a href={`http://localhost:3001${l.fichier_url}`} target="_blank" rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-500 transition">
                    <DownloadIcon className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => toggleComments(l.id)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition">
                  <MessageSquareIcon className="w-4 h-4" />
                  {isOpen ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
                </button>
                <button onClick={() => deleteLivrable(l.id)} className="text-slate-300 hover:text-rose-400 transition">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* COMMENTAIRES */}
              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Commentaires</p>

                  {comments.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Aucun commentaire</p>
                  )}

                  <div className="space-y-2">
                    {comments.map(c => (
                      <div key={c.id} className={`flex gap-2 ${c.auteur_role === 'doctorant' ? 'flex-row-reverse' : ''}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-xl text-xs ${
                          c.auteur_role === 'doctorant'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700'
                        }`}>
                          <p className={`text-[10px] font-medium mb-0.5 ${c.auteur_role === 'doctorant' ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {c.auteur_nom}
                          </p>
                          <p>{c.contenu}</p>
                          <p className={`text-[10px] mt-0.5 ${c.auteur_role === 'doctorant' ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(c.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADD COMMENT */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Écrire un commentaire..."
                      value={newComment[l.id] || ''}
                      onChange={e => setNewComment(prev => ({ ...prev, [l.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addComment(l.id)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                    <button onClick={() => addComment(l.id)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Déposer un livrable</h2>
              <button onClick={() => setShowModal(false)}><XIcon className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Titre *</label>
                <input type="text" placeholder="Ex: Chapitre 1" value={form.label}
                  onChange={e => setForm({ ...form, label: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Choisir un type</option>
                  <option value="Chapitre">Chapitre</option>
                  <option value="Article scientifique">Article scientifique</option>
                  <option value="Rapport d'avancement">Rapport d'avancement</option>
                  <option value="Revue de littérature">Revue de littérature</option>
                  <option value="Présentation">Présentation</option>
                  <option value="Document administratif">Document administratif</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Fichier *</label>
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                  onChange={e => setForm({ ...form, fichier: e.target.files[0] })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs cursor-pointer" />
                {form.fichier && <p className="text-xs text-slate-400 mt-1">📎 {form.fichier.name}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowModal(false); setForm({ label: '', type: '', fichier: null }) }}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
              <button onClick={handleUpload} disabled={loading || !form.label || !form.fichier}
                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Envoi...' : 'Déposer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Livrables
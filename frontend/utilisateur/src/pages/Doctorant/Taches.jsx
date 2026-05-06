import React, { useState, useEffect } from 'react'
import {
  CheckSquareIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  XIcon
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
  a_faire:  { label: "À faire",    color: "info",   icon: ClockIcon },
  en_cours: { label: "En cours",   color: "warn",   icon: ClockIcon },
  fait:     { label: "Terminé",    color: "ok",     icon: CheckCircleIcon },
  retard:   { label: "En retard",  color: "danger", icon: AlertCircleIcon },
}

const Taches = () => {
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ label: '', priorite: 'moyenne', date_limite: '' })

  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:3001/api/taches/${user.id}`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.log(err))
  }, [])

  const toggleTask = (id, statut) => {
    const newStatut = statut === 'fait' ? 'a_faire' : 'fait';
    fetch(`http://localhost:3001/api/taches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: newStatut })
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, statut: newStatut } : t));
  }

  const deleteTask = (id) => {
    fetch(`http://localhost:3001/api/taches/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const addTask = () => {
    if (!newTask.label) return;
    fetch('http://localhost:3001/api/taches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, doctorant_id: user.id })
    })
    .then(res => res.json())
    .then(data => {
      setTasks(prev => [...prev, {
        id: data.id,
        label: newTask.label,
        statut: 'a_faire',
        priorite: newTask.priorite,
        date_limite: newTask.date_limite
      }]);
      setNewTask({ label: '', priorite: 'moyenne', date_limite: '' });
      setShowModal(false);
    });
  }

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Tâches</h1>
          <p className="text-sm text-slate-500">Suivi des tâches liées à votre thèse</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvelle tâche
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucune tâche disponible
          </div>
        )}
        {tasks.map(task => {
          const config = statusConfig[task.statut] || statusConfig['a_faire']
          const StatusIcon = config.icon

          return (
            <div key={task.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0 hover:bg-slate-50 transition">

              {/* CHECK */}
              <button
                onClick={() => toggleTask(task.id, task.statut)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                  task.statut === 'fait' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                }`}
              >
                {task.statut === 'fait' && (
                  <svg width="10" height="10">
                    <polyline points="1,5 4,8 9,1" stroke="white" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </button>

              {/* CONTENT */}
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.statut === 'fait' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.label}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap items-center">
                  <Chip label={config.label} color={config.color} />
                  <Chip
                    label={`Priorité: ${task.priorite}`}
                    color={task.priorite === 'haute' ? 'danger' : task.priorite === 'moyenne' ? 'warn' : 'info'}
                  />
                  {task.date_limite && (
                    <span className="text-xs text-slate-400">
                      📅 {new Date(task.date_limite).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>

              {/* DELETE */}
              <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-rose-400 transition">
                <TrashIcon className="w-4 h-4" />
              </button>

              <StatusIcon className="w-4 h-4 text-slate-400" />
            </div>
          )
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Nouvelle tâche</h2>
              <button onClick={() => setShowModal(false)}>
                <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Titre</label>
                <input
                  type="text"
                  placeholder="Titre de la tâche"
                  value={newTask.label}
                  onChange={e => setNewTask({ ...newTask, label: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Priorité</label>
                <select
                  value={newTask.priorite}
                  onChange={e => setNewTask({ ...newTask, priorite: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="basse">Basse</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Date limite</label>
                <input
                  type="date"
                  value={newTask.date_limite}
                  onChange={e => setNewTask({ ...newTask, date_limite: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
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
                onClick={addTask}
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

export default Taches
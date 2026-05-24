import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BellIcon, ChevronDownIcon, LogOutIcon, UserIcon,
  SettingsIcon, BookOpenIcon, UsersIcon, LayoutDashboardIcon,
  ShieldIcon, CheckCheckIcon,
} from 'lucide-react'

const roleConfig = {
  doctorant:      { label: 'Doctorant',       icon: BookOpenIcon,        color: 'bg-indigo-100 text-indigo-700' },
  encadrant:      { label: 'Encadrant',        icon: UsersIcon,           color: 'bg-teal-100 text-teal-700' },
  'co-encadrant': { label: 'Co-Encadrant',     icon: UsersIcon,           color: 'bg-sky-100 text-sky-700' },
  responsable:    { label: 'Responsable',      icon: LayoutDashboardIcon, color: 'bg-amber-100 text-amber-700' },
  admin:          { label: 'Administrateur',   icon: ShieldIcon,          color: 'bg-purple-100 text-purple-700' },
}

const pageTitles = {
  '/doctorant':               'Tableau de bord',
  '/doctorant/these':         'Ma thèse',
  '/doctorant/objectifs':     'Objectifs & jalons',
  '/doctorant/reunions':      'Réunions',
  '/doctorant/livrables':     'Livrables',
  '/doctorant/taches':        'Tâches',
  '/doctorant/echeances':     'Échéances',
  '/encadrant':               'Tableau de bord',
  '/encadrant/doctorants':    'Doctorants',
  '/encadrant/objectifs':     'Objectifs',
  '/encadrant/reunions':      'Réunions',
  '/encadrant/livrables':     'Livrables',
  '/co-encadrant':            'Tableau de bord',
  '/co-encadrant/doctorants': 'Doctorants',
  '/co-encadrant/reunions':   'Réunions',
  '/co-encadrant/livrables':  'Livrables',
  '/responsable':             'Tableau de bord',
  '/responsable/statistiques':'Statistiques',
  '/responsable/doctorants':  'Doctorants',
  '/responsable/reports':     'Rapports',
  '/admin':                   'Tableau de bord',
  '/admin/users':             'Utilisateurs',
  '/admin/roles':             'Rôles',
}

const typeColors = {
  reunion:  '#378ADD',
  objectif: '#EF9F27',
  tache:    '#7F77DD',
  livrable: '#1D9E75',
  echeance: '#E24B4A',
  info:     '#378ADD',
}

const Navbar = () => {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || {} }
    catch { return {} }
  })

  const [notifications, setNotifications] = useState([])
  const [notifLoading,  setNotifLoading]  = useState(false)
  const [notifOpen,     setNotifOpen]     = useState(false)
  const [profileOpen,   setProfileOpen]   = useState(false)

  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  const getRole = useCallback(() => {
    if (pathname.startsWith('/co-encadrant')) return 'co-encadrant'
    if (pathname.startsWith('/encadrant'))    return 'encadrant'
    if (pathname.startsWith('/doctorant'))    return 'doctorant'
    if (pathname.startsWith('/responsable'))  return 'responsable'
    if (pathname.startsWith('/admin'))        return 'admin'
    return 'doctorant'
  }, [pathname])

  const role      = getRole()
  const config    = roleConfig[role] || roleConfig.doctorant
  const RoleIcon  = config.icon
  const pageTitle = pageTitles[pathname] || 'Tableau de bord'

  // جيب notifications
  const fetchNotifications = useCallback(async () => {
    if (!user.id) return
    setNotifLoading(true)
    try {
      const res  = await fetch(`http://localhost:3001/api/notifications?user_id=${user.id}&role=${role}`)
      const data = await res.json()
      if (Array.isArray(data)) setNotifications(data)
    } catch {
      // silencieux
    } finally {
      setNotifLoading(false)
    }
  }, [user.id, role])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // فرم dropdowns فاش تكليك برا
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // علم notification كـ lue
  const markAsRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, lu: true } : n))
    try {
      await fetch(`http://localhost:3001/api/notifications/${notifId}/lu`, { method: 'PATCH' })
    } catch {}
  }

  // علم كل notifications كـ lues
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
    try {
      await fetch('http://localhost:3001/api/notifications/tout-lire', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, role })
      })
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  const unreadCount = notifications.filter(n => !n.lu).length
  const firstName   = user.prenom || ''
  const lastName    = user.nom    || ''
  const initials    = `${firstName[0] || '?'}${lastName[0] || ''}`.toUpperCase()
  const email       = user.email  || ''

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return "À l'instant"
    if (m < 60) return `${m}min`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}j`
  }

  return (
    <header className="h-16 px-6 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-30">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800 leading-none">{pageTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-none capitalize">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* Badge rôle */}
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <RoleIcon className="w-3 h-3" />
          {config.label}
        </span>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">

              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-700">Notifications</p>
                  {notifLoading && (
                    <span className="w-3 h-3 border border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <CheckCheckIcon className="w-3 h-3" />
                    Tout lire
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <BellIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.lu && markAsRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                        !n.lu ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: n.couleur || typeColors[n.type] || '#378ADD' }}
                      />
                      <div className="flex-1 min-w-0">
                        {n.expediteur_nom && (
                          <p className="text-[10px] font-medium text-slate-400 mb-0.5 uppercase tracking-wide">
                            {n.expediteur_nom} · {n.expediteur_role}
                          </p>
                        )}
                        <p className={`text-xs leading-snug ${n.lu ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.lu && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                <button
                  onClick={() => { setNotifOpen(false); fetchNotifications() }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Rafraîchir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">
              {firstName || 'Utilisateur'}
            </span>
            <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-60 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">

              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-900 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{firstName} {lastName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{email}</p>
                  </div>
                </div>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${config.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  {config.label}
                </div>
              </div>

              <div className="py-1">
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Mon profil
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  Paramètres
                </button>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar
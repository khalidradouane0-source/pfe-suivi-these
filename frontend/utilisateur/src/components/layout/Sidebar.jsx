import React, { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { dummyProfileData } from '../../assets/assets'

import {
  UserIcon,
  MenuIcon,
  XIcon,
  LayoutGridIcon,
  CalendarIcon,
  CheckSquareIcon,
  FileTextIcon,
  ClipboardListIcon,
  BookOpenIcon,
  ChevronRightIcon
} from 'lucide-react'

const SideBar = () => {

  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [userName, setUserName] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

// حذف import dummyProfileData

useEffect(() => {
  const stored = localStorage.getItem("user")
  if (stored) {
    const user = JSON.parse(stored)
    setUserName(user.prenom + " " + user.nom)
  }
}, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  /* ROLE FROM PATH */
  const getRoleFromPath = () => {
    if (pathname.startsWith("/doctorant")) return "doctorant"
    if (pathname.startsWith("/encadrant")) return "encadrant"
    if (pathname.startsWith("/responsable")) return "responsable"
    if (pathname.startsWith("/admin")) return "admin"
    return "doctorant"
  }

  const role = getRoleFromPath()

  /* ROLE LABELS (CDC) */
  const roleLabels = {
    doctorant: {
      title: "Doctorant",
      subtitle: "Suivi de thèse"
    },
    encadrant: {
      title: "Encadrant",
      subtitle: "Encadrement doctoral"
    },
    responsable: {
      title: "Responsable",
      subtitle: "Suivi global des doctorants"
    },
    admin: {
      title: "Administrateur",
      subtitle: "Gestion de la plateforme"
    }
  }

  /* NAV ITEMS BY ROLE */
  const navItemsByRole = {
    doctorant: [
      { name: "Dashboard", href: "/doctorant", icon: LayoutGridIcon },      { name: "Objectifs", href: "/doctorant/objectifs", icon: ClipboardListIcon },
      { name: "Taches", href: "/doctorant/taches", icon: CheckSquareIcon },
      { name: "Livrables", href: "/doctorant/livrables", icon: FileTextIcon },
      { name: "Reunions", href: "/doctorant/reunions", icon: CalendarIcon },
      { name: "Echeances", href: "/doctorant/echeances", icon: CalendarIcon },
      { name: "These", href: "/doctorant/these", icon: BookOpenIcon },
    ],

    encadrant: [
      { name: "Dashboard", href: "/encadrant", icon: LayoutGridIcon },
      { name: "Doctorants", href: "/encadrant/doctorants", icon: UserIcon },
      { name: "Reunions", href: "/encadrant/reunions", icon: CalendarIcon },
      { name: "Livrables", href: "/encadrant/livrables", icon: FileTextIcon },
    ],

    responsable: [
      { name: "Dashboard", href: "/responsable", icon: LayoutGridIcon },
      { name: "Statistiques", href: "/responsable/statistiques", icon: ClipboardListIcon },
      { name: "Doctorants", href: "/responsable/doctorants", icon: UserIcon },
      { name: "Reports", href: "/responsable/reports", icon: FileTextIcon },
    ],

    admin: [
      { name: "Dashboard", href: "/admin", icon: LayoutGridIcon },
      { name: "Users", href: "/admin/users", icon: UserIcon },
      { name: "Roles", href: "/admin/roles", icon: ClipboardListIcon },
    ]
  }

  const navItems = navItemsByRole[role] || []

  /* LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/")
  }

  const sidebarcontent = (
    <>
      {/* HEADER */}
      <div className='px-5 pt-6 pb-5 border-b border-white/10'>
        <div className='flex items-center justify-between'>

          <div className='flex items-center gap-3'>
            <UserIcon className='text-white w-7 h-7' />
            <div>
              <p className='font-semibold text-sm text-white tracking-wide'>
                {roleLabels[role]?.title}
              </p>
              <p className='text-xs text-slate-400'>
                {roleLabels[role]?.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className='lg:hidden text-gray-400 hover:text-white p-1'
          >
            <XIcon size={20} />
          </button>

        </div>
      </div>

      {/* PROFILE */}
      {userName && (
        <div className='mx-3 mt-4 mb-2 p-4 rounded-xl bg-white/5 border border-white/10'>
          <div className='flex items-center gap-3'>

            <div className='w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ring-1 ring-white/10'>
              <span className='text-slate-200 text-sm font-semibold'>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className='min-w-0'>
              <p className='text-sm font-medium text-white truncate'>
                {userName}
              </p>
              <p className='text-xs text-slate-400 truncate'>
                {roleLabels[role]?.subtitle}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* NAV TITLE */}
      <div className='px-5 pt-5 pb-2'>
        <p className='text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500'>
          Navigation
        </p>
      </div>

      {/* NAV ITEMS */}
      <div className='flex-1 px-4 space-y-2 overflow-y-auto'>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 relative ${
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >

              <item.icon
                className={`w-[18px] h-[18px] ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white"
                }`}
              />

              <span className='flex-1'>{item.name}</span>

              {isActive && (
                <div className="w-2 h-2 rounded-full bg-white opacity-70"/>
              )}

              {isActive && (
                <ChevronRightIcon className='w-4 h-4 text-white/70'/>
              )}

            </Link>
          )
        })}
      </div>

      {/* LOGOUT */}
      <div className='p-3 border-t border-white/10'>
        <button
          onClick={handleLogout}
          className='flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-red-400'
        >
          <LayoutGridIcon className='w-[17px] h-[17px]'/>
          <span>Log out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        className='lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-700 text-white rounded-lg shadow-lg border border-white/10'
      >
        <MenuIcon size={20} />
      </button>

      {/* OVERLAY */}
      {mobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* DESKTOP */}
      <aside className='hidden lg:flex flex-col h-full w-[260px] bg-gradient-to-b from-indigo-900 via-infigo-900 to-slate-900 text-white border-r border-white/10'>
        {sidebarcontent}
      </aside>

      {/* MOBILE */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 to-gray-400 text-white z-50 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarcontent}
      </aside>
    </>
  )
}

export default SideBar
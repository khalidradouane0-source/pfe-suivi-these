import React from 'react'

const AuthLayout = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-indigo-900 relative overflow-hidden border-r border-slate-200">
      <div className="absolute -top-30 -left-30 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="relative z-10 flex flex-col items-start justify-center p-12 lg:p-20 w-full h-full">
      <h1 className="text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight tracking-tight">Platform <br />de Suivi Doctoral</h1>
      <p className="text-slate-400 text-lg max-w-md leading-relaxed">Aplication web permettant de centraliser le suivi de la thèse, d’organiser l’encadrement doctoral, d’assurer la traçabilité des échanges et de mieux piloter la progression scientifique et administrative du doctorant.

      </p>

      </div>

   </div>
  )
}

export default AuthLayout
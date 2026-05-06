import React, { useState } from 'react'
import AuthLayout from '../../components/auth/AuthLayout'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, Loader2Icon, EyeIcon, EyeOffIcon } from 'lucide-react'

const FirstLogin= () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if(password !== confirmPassword){
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setError("")
    setLoading(true)

    // simulate API
    setTimeout(() => {
      setLoading(false)
      alert("Compte activé avec succès ✅")
    }, 1500)
  }

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <AuthLayout />

      <div className='flex-1 flex items-center justify-center p-6 sm:p-12 bg-white'>
        <div className='w-full max-w-md animate-fade-in'>

          <Link to='/' className='inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-10'>
            <ArrowLeftIcon size={16}/> Back to portals
          </Link>

          <div className='mb-8'>
            <h1 className='text-2xl sm:text-3xl font-medium text-zinc-800'>
              Première connexion
            </h1>
            <p className='text-slate-500 text-sm mt-2'>
              Activez votre compte en définissant votre mot de passe.
            </p>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Adresse email
              </label>
              <input
                type='email'
                required
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
                className='w-full px-3 py-2 border rounded-md'
                placeholder='jawad@example.com'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Mot de passe
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e)=> setPassword(e.target.value)}
                  className='w-full px-3 py-2 border rounded-md pr-10'
                />
                <button
                  type='button'
                  onClick={()=> setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
                >
                  {showPassword ? <EyeOffIcon size={18}/> : <EyeIcon size={18}/>}
                </button>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                Confirmer le mot de passe
              </label>
              <input
                type='password'
                required
                value={confirmPassword}
                onChange={(e)=> setConfirmPassword(e.target.value)}
                className='w-full px-3 py-2 border rounded-md'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full mt-4 py-2 bg-linear-to-r from-indigo-900 to-indigo-500 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 flex items-center justify-center'
            >
              {loading && <Loader2Icon className='animate-spin h-4 w-4 mr-2'/>}
              Activer le compte
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default FirstLogin
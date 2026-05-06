import React, { useState } from 'react'
import AuthLayout from '../../components/auth/AuthLayout'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, Loader2Icon, EyeIcon, EyeOffIcon, UserPlusIcon } from 'lucide-react'

const Login = ({ role, title, subtitle }) => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      })

      const data = await res.json()

      if (data.status === "success") {
        // نخزن المستخدم في localStorage
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect حسب الـ role
        if (role === "doctorant")    navigate("/doctorant")
        if (role === "encadrant")    navigate("/encadrant")
        if (role === "co-encadrant") navigate("/co-encadrant")
        if (role === "responsable")  navigate("/responsable")
        if (role === "admin")        navigate("/admin")

      } else {
        setError(data.message)
      }

    } catch (err) {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <AuthLayout />
      <div className='flex-1 flex items-center justify-center p-6 sm:p-12 bg-white'>
        <div className='w-full max-w-md animate-fade-in'>

          <Link to='/' className='inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm mb-10 transition-colors'>
            <ArrowLeftIcon size={16} /> Back to portals
          </Link>

          <div className='mb-8'>
            <h1 className='text-2xl sm:text-3xl font-medium text-zinc-800'>{title}</h1>
            <p className='text-slate-500 text-sm sm:text-base mt-2'>{subtitle}</p>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-3'>
              <div className='w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0' />
              {error}
            </div>
          )}

          {/* ✅ onSubmit مصحح */}
          <form className='space-y-5' onSubmit={handleSubmit}>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>Adresse email</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder='jawad@example.com'
                className='w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>Mot de passe</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder='••••••••'
                  className='w-full border border-slate-300 rounded-md px-3 py-2 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* ✅ type='submit' مصحح */}
            <button
              type='submit'
              disabled={loading}
              className='mt-8 w-full py-3 bg-gradient-to-r from-indigo-900 to-indigo-500 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center'
            >
              {loading && <Loader2Icon className='animate-spin h-4 w-4 mr-2' />}
              Se connecter
            </button>
          </form>

          <div className='text-right mt-2'>
            <Link to='/login/forgot-password' className='text-sm text-indigo-900 hover:text-indigo-700'>
              Mot de passe oublié ?
            </Link>
          </div>

          <div className='mt-6 text-center'>
            <Link
              to='/login/first-login'
              className='inline-flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold rounded-md border border-indigo-500 text-indigo-900 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-500 transition-all duration-200 active:scale-[0.98]'
            >
              <UserPlusIcon size={18} />
              Première connexion
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login
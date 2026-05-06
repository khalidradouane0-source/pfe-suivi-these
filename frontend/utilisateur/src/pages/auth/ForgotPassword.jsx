import React, { useState } from 'react'
import AuthLayout from '../../components/auth/AuthLayout'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // simulate request
    setTimeout(() => {
      setLoading(false)
      setMessage("Un email de réinitialisation a été envoyé.")
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
              Mot de passe oublié
            </h1>
            <p className='text-slate-500 text-sm mt-2'>
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          {message && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl'>
              {message}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder='jawad@example.com'
                className='w-full px-3 py-2 border rounded-md'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full mt-4 py-2 bg-linear-to-r from-indigo-900 to-indigo-500 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-indigo-900 disabled:opacity-50 flex items-center justify-center'
            >
              {loading && <Loader2Icon className='animate-spin h-4 w-4 mr-2'/>}
              Envoyer le lien
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
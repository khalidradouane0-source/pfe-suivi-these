import React, { useState, useEffect, useRef } from 'react'
import { MessageSquareIcon, SendIcon, UserIcon } from 'lucide-react'

const Messages = () => {
  const [contacts, setContacts]         = useState([])
  const [selectedContact, setSelected] = useState(null)
  const [messages, setMessages]         = useState([])
  const [newMessage, setNewMessage]     = useState('')
  const messagesEndRef                  = useRef(null)

  const user = JSON.parse(localStorage.getItem("user"))
  const role = 'encadrant'

  useEffect(() => {
    fetch(`http://localhost:3001/api/messages/contacts/${role}/${user.id}`)
      .then(res => res.json())
      .then(data => setContacts(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    if (!selectedContact) return
    fetch(`http://localhost:3001/api/messages/conversation/${role}/${user.id}/${selectedContact.role}/${selectedContact.id}`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))

    const interval = setInterval(() => {
      fetch(`http://localhost:3001/api/messages/conversation/${role}/${user.id}/${selectedContact.role}/${selectedContact.id}`)
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []))
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedContact])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return
    await fetch('http://localhost:3001/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expediteur_id: user.id,
        expediteur_role: role,
        expediteur_nom: `${user.prenom} ${user.nom}`,
        destinataire_id: selectedContact.id,
        destinataire_role: selectedContact.role,
        destinataire_nom: `${selectedContact.prenom} ${selectedContact.nom}`,
        contenu: newMessage
      })
    })
    setMessages(prev => [...prev, {
      id: Date.now(),
      expediteur_id: user.id,
      expediteur_role: role,
      expediteur_nom: `${user.prenom} ${user.nom}`,
      contenu: newMessage,
      created_at: new Date().toISOString()
    }])
    setNewMessage('')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-120px)]">

      <div className="flex items-center gap-3 mb-5">
        <MessageSquareIcon className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Messages</h1>
          <p className="text-sm text-slate-500">Communication avec les co-encadrants</p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100%-80px)]">

        {/* CONTACTS */}
        <div className="w-72 bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Co-Encadrants</p>
          </div>
          <div className="overflow-y-auto">
            {contacts.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">Aucun contact disponible</p>
            )}
            {contacts.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-b border-slate-50 last:border-0 ${
                  selectedContact?.id === c.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-600 font-semibold text-sm">{c.prenom?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{c.prenom} {c.nom}</p>
                  <p className="text-xs text-slate-400">Co-Encadrant</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CONVERSATION */}
        <div className="flex-1 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col overflow-hidden">

          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquareIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Sélectionnez un contact pour commencer</p>
              </div>
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <span className="text-sky-600 font-semibold text-sm">{selectedContact.prenom?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{selectedContact.prenom} {selectedContact.nom}</p>
                  <p className="text-xs text-slate-400">Co-Encadrant</p>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Aucun message — commencez la conversation</p>
                )}
                {messages.map(m => {
                  const isMine = m.expediteur_id === user.id && m.expediteur_role === role
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                        isMine ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <p>{m.contenu}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(m.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2"
                >
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
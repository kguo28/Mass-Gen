'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  { label: 'What is the PDUA?', q: 'What is the PDUA and what does it require us to sign?' },
  { label: 'IRB ceding process', q: 'How does IRB ceding to MGB work and how long does it take?' },
  { label: 'What is Phlox?', q: 'What is the Phlox registry and what data do we submit?' },
  { label: 'After activation', q: 'What does BAN expect from us once we are fully activated?' },
  { label: 'What is a learning health network?', q: 'What is a learning health network and why does it matter for bipolar care?' },
]

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome to the BAN Living Field Guide. I can help you understand any part of the onboarding process — what a document means, what a phase requires, how to navigate a specific situation at your institution, or what to expect from the BAN team. What would you like to know?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(q?: string) {
    const text = (q ?? input).trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setMessages([...history, { role: 'assistant', content: data.text }])
    } catch {
      setMessages([...history, { role: 'assistant', content: 'Sorry, something went wrong. Please try again or email bipolaractionnetwork@mgb.org.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Ask the guide</h1>
        <p className="text-gray-600-ban leading-relaxed">
          Have a question about the process, a document, or what comes next? The guide draws on BAN&apos;s actual materials to answer.
        </p>
      </div>

      <div className="bg-white rounded-[10px] border border-gray-200-ban flex flex-col" style={{ height: '560px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold ${
                m.role === 'user' ? 'bg-gray-200-ban text-gray-600-ban' : 'bg-green-deep text-white'
              }`}>
                {m.role === 'user' ? 'Me' : 'BG'}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-green-deep text-white rounded-tr-sm'
                  : 'bg-gray-50-ban text-gray-900-ban rounded-tl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-green-deep text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">BG</div>
              <div className="bg-gray-50-ban rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] text-gray-400-ban">Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        <div className="px-4 py-3 border-t border-gray-100-ban flex flex-wrap gap-2">
          {SUGGESTED.map(s => (
            <button
              key={s.label}
              onClick={() => send(s.q)}
              disabled={loading}
              className="text-[11px] bg-green-pale text-green-deep px-3 py-1 rounded-full hover:bg-green-light hover:text-white transition-colors disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t border-gray-200-ban">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about BAN onboarding..."
            className="flex-1 border border-gray-200-ban rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-green-mid"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="bg-green-deep text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-green-mid transition-colors disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}

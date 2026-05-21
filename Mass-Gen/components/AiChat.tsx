'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTeamState } from '@/hooks/useTeamState'
import { useNetwork } from '@/hooks/useNetwork'
import { findModule } from '@/data/modules'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  activeCardId?: string | null
  /** Module the user is currently focused on (set via ModuleSwitcher or by
   *  opening a module unit). Preferred for chat scoping when set, since it
   *  covers operational modules too (which don't have changeCardIds). */
  activeModuleId?: string | null
}

const SUGGESTED_BASE = [
  { label: 'Seven clinical care elements', q: 'What are the seven clinical care elements BAN defines?' },
  { label: 'Foundational modules', q: 'What are the seven foundational modules and how do they sit inside the CCM?' },
  { label: 'Aligned payment for dyadic practice', q: 'How does Aligned payment work for a dyadic psychiatric practice using PCM codes?' },
  { label: 'What is the PDUA?', q: 'What is the PDUA and what does it require us to sign?' },
  { label: 'IRB pathway', q: 'How does IRB work in BAN — what are our options if we don\'t want to cede to MGB?' },
]

export default function AiChat({ activeCardId, activeModuleId }: Props) {
  const { state, hydrated } = useTeamState()
  const { networkId } = useNetwork()

  // Prefer activeModuleId (covers operational modules too); fall back to
  // activeCardId for backwards compat.
  const focusModuleId = activeModuleId ?? activeCardId ?? null
  const focusModule = focusModuleId ? findModule(focusModuleId as never) : undefined

  const teamContext = useMemo(() => ({
    region: state.region,
    hubState: state.hubState,
    arcCompleted: state.arcCompleted,
    selectedModules: state.selectedModules,
    activeCardId: activeCardId ?? null,
    activeModuleId: focusModuleId,
    activeModuleName: focusModule?.name ?? null,
    activeModuleKind: focusModule?.kind ?? null,
    synthesis: state.synthesis,
    networkId,
  }), [state, activeCardId, focusModuleId, focusModule, networkId])

  const SUGGESTED = useMemo(() => {
    if (focusModule) {
      const label = focusModule.name
      const isOp = focusModule.kind === 'operational'
      return isOp
        ? [
            { label: `What does ${label} cover?`, q: `Summarize what ${label} covers and what a site needs to do in this module.` },
            { label: 'Where are we likely stuck?', q: `What are common places sites stall in ${label}, and how do they unblock?` },
            { label: 'Required documents', q: `Which documents are required to make progress on ${label}?` },
            { label: 'Back to general', q: 'What modules am I currently working on?' },
          ]
        : [
            { label: `What is ${label}?`, q: `Explain ${label} at the level needed to start Preparing it at our site.` },
            { label: `First PDSA for ${label}`, q: `What would a sensible first PDSA cycle for ${label} look like for a small dyadic practice?` },
            { label: `Common barriers`, q: `What are the most common barriers sites hit when starting ${label}, and how do they address them?` },
            { label: 'Back to general', q: 'What are the foundational modules in this network?' },
          ]
    }
    return SUGGESTED_BASE
  }, [focusModule])

  const welcomeContent = focusModule
    ? `You're focused on the ${focusModule.name} module${focusModule.kind === 'operational' ? ' (operational)' : ''}. I'll scope my answers to that module unless you ask about something broader.`
    : "Welcome to the Living Field Guide. I can help with the orientation arc, the clinical care elements, the Chronic Care Model and foundational modules, or institutional setup. What would you like to know?"

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: welcomeContent },
  ])

  // If a Change Card is loaded after first render, swap the welcome message
  useEffect(() => {
    setMessages(prev => {
      if (prev.length !== 1 || prev[0].role !== 'assistant') return prev
      return [{ role: 'assistant', content: welcomeContent }]
    })
  }, [welcomeContent])
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
          context: hydrated ? teamContext : undefined,
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
                {m.role === 'user' ? m.content : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      h3: ({ children }) => <p className="font-semibold mt-1">{children}</p>,
                      hr: () => <hr className="my-1 border-gray-300" />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                )}
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

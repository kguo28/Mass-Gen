'use client'
import { useState } from 'react'
import AiChat from './AiChat'

interface Props {
  activePage: string
  activeCardId?: string | null
  activeModuleId?: string | null
}

export default function FloatingRanger({ activePage, activeCardId, activeModuleId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-green-deep px-4 py-3 text-[13px] font-medium text-white shadow-lg transition-colors hover:bg-green-mid"
          aria-label="Ask the Ranger"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[13px]">◑</span>
          <span>Ask the Ranger</span>
        </button>
      )}

      {/* Popup panel (anchored bottom-right, Intercom-style) */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-200-ban bg-white shadow-2xl"
          role="dialog"
          aria-label="Ask the Ranger"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100-ban bg-green-deep px-4 py-3 text-white">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-green-light">
                Living Field Guide
              </div>
              <div className="text-[14px] font-medium">Ask the Ranger</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <span className="block text-[16px] leading-none">×</span>
            </button>
          </div>

          {/* Chat body — fills remaining height */}
          <div className="flex-1 min-h-0">
            <AiChat
              activePage={activePage}
              activeCardId={activeCardId}
              activeModuleId={activeModuleId}
            />
          </div>
        </div>
      )}
    </>
  )
}

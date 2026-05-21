'use client'
import { useTeamState } from '@/hooks/useTeamState'
import { findModule } from '@/data/modules'

/** Renders the BAN_Demo Screen 5 — the brief acknowledgement that the
 *  team has crossed from Basecamp into Preparing. Dismissing clears the
 *  justCommitted flag so the next Hub render falls through to the
 *  normal Emerging layout. */
export default function CompletionScreen() {
  const { state, update } = useTeamState()

  const chips = state.selectedModules
    .map(id => findModule(id))
    .filter((m): m is NonNullable<ReturnType<typeof findModule>> => !!m)

  function dismiss() {
    update({ justCommitted: false })
  }

  return (
    <div className="max-w-[680px] mx-auto py-12 text-center">
      <h1 className="font-serif text-4xl text-gray-900-ban mb-4">
        Your team is on its way.
      </h1>
      <p className="text-[14px] text-gray-600-ban leading-relaxed max-w-[520px] mx-auto mb-8">
        You&apos;ve moved from Basecamp into Preparing on the modules you selected. The next time you sign in, your hub will show your active work.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {chips.map(m => (
          <span
            key={m.id}
            className="bg-green-pale border border-green-light/40 text-green-deep text-[13px] font-medium px-4 py-1.5 rounded-full"
          >
            {m.name}
          </span>
        ))}
      </div>

      <div className="bg-white border border-gray-200-ban rounded-[10px] p-6 text-left mb-8">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400-ban mb-2">
          What happens next
        </div>
        <p className="text-[13px] text-gray-700 leading-relaxed">
          Your hub will redraw to show your active modules. You&apos;ll be invited to charter the team for each one and begin the setup work — registry definitions, team formation, initial training. The Ranger is available throughout, and the existing BAN PVP Knowledge Website and Wayfinder content connect from each module&apos;s detail page.
        </p>
      </div>

      <button
        onClick={dismiss}
        className="bg-green-deep text-white text-[13px] font-medium px-6 py-2.5 rounded-lg hover:bg-green-mid transition-colors"
      >
        Open my hub →
      </button>
    </div>
  )
}

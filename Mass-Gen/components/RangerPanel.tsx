interface RangerNote {
  title: string
  body: string
}

interface Props {
  notes: RangerNote[]
}

export default function RangerPanel({ notes }: Props) {
  return (
    <aside className="bg-green-pale border border-green-light/40 rounded-[10px] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-green-deep mb-2">
        Ranger
      </div>
      <div className="space-y-3">
        {notes.map(n => (
          <div key={n.title}>
            <div className="text-[12px] font-medium text-green-deep mb-0.5">{n.title}</div>
            <div className="text-[12px] text-gray-600-ban leading-relaxed">{n.body}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}

'use client'
import { useState } from 'react'

const AUDIENCES = [
  { id: 'lead', label: 'Department leadership' },
  { id: 'fin',  label: 'Finance / grants' },
  { id: 'leg',  label: 'Legal / contracts' },
  { id: 'irb',  label: 'IRB / research admin' },
  { id: 'it',   label: 'IT / informatics' },
]

const FAQS = [
  {
    q: '"What does this cost us?"',
    a: 'BAN participation involves an annual fee (specified in the PDUA) covering the registry, QI coaching, training, community convenings, and operational infrastructure. No invoice is issued until agreements are fully executed. Funding typically comes from department budgets, grants, or philanthropy.',
  },
  {
    q: '"What are we signing?"',
    a: 'The Participation and Data Use Agreement (PDUA) governs data sharing, use, and governance — executed between your institution and MGH. It includes a Business Associate Agreement (BAA) for HIPAA compliance. BAN uses a standardized template and holds office hours with MGH legal representation available.',
  },
  {
    q: '"What does IRB involvement look like?"',
    a: "BAN strongly recommends ceding to MGB (Mass General Brigham) as the single central IRB, but sites are free to keep their own IRB if they prefer. If you cede, BAN provides all required documents: the protocol, model consent forms, reliance instructions, local context form, and SMART IRB addendum.",
  },
  {
    q: '"What do we get out of this?"',
    a: 'Access to Phlox registry and automated reports, QI coaching, a national peer learning community, benchmarking data, and collaborative research and publication opportunities. Participating sites become both learners and contributors — sharing tools and best practices across the network.',
  },
]

function genLines(dept: string, auds: string[], mot: string): string {
  const audList = auds.length ? auds : ['your internal stakeholders']
  const lines: string[] = []
  const motTrim = mot.trim()
  if (motTrim) {
    lines.push('YOUR MOTIVATION')
    lines.push(`• You said: "${motTrim}"`)
    lines.push(`• Frame each conversation below around this — BAN's QI infrastructure, peer learning, and bipolar-specific outcomes work directly support this goal.`)
    lines.push('')
  }
  audList.forEach(aud => {
    lines.push(aud.toUpperCase())
    if (aud.includes('leadership')) {
      lines.push(`• BAN is a national learning health network run out of MGH — joining places ${dept || 'your department'} among the most committed psychiatry programs working to improve bipolar care.`)
      lines.push('• Participation provides access to benchmarking data, QI coaching, and shared improvement strategies that would be costly to develop independently.')
      lines.push('• The network is designed to be low-burden at the outset — BAN right-sizes participation to your capacity, starting small and scaling with your team.')
    } else if (aud.includes('Finance')) {
      lines.push('• The annual participation fee covers registry access, QI coaching, training, and community convenings — transparent cost structure, no invoice until agreements are executed.')
      lines.push('• BAN participation is fundable through department budgets, grants, or philanthropy — BAN can provide documentation to support budget justification.')
      lines.push('• The Phlox registry and reporting infrastructure would cost significantly more to build independently; BAN provides it as shared network infrastructure.')
    } else if (aud.includes('Legal')) {
      lines.push("• BAN uses a standardized PDUA template executed with many institutions — your legal team is not starting from scratch, and BAN holds office hours with MGH legal available.")
      lines.push('• The agreement is between your institution and MGH (The General Hospital Corporation) — a well-established counterparty familiar to most legal teams.')
      lines.push('• The PDUA includes a BAA for HIPAA compliance — data governance terms are clearly specified and the Phlox registry is fully HIPAA-compliant.')
    } else if (aud.includes('IRB')) {
      lines.push("• BAN strongly recommends ceding to MGB as the single central IRB — this reduces your IRB office's workload, but sites may also keep their own IRB if they prefer.")
      lines.push('• If you cede, BAN provides a complete IRB document packet: protocol, model consent and assent forms, local context form, SMART IRB LOA and Flex Addendum, and optional HIPAA waiver.')
      lines.push('• Many institutions have completed ceding to MGB before — your IRB office may already be familiar with the SMART IRB framework.')
    } else if (aud.includes('IT')) {
      lines.push('• Phlox is accessed via standard web browsers — no local installation or infrastructure build required from your IT team.')
      lines.push('• Data submission uses standard file formats (CSV/Excel) — a scoped data extraction, not a custom integration; Hive provides a data dictionary and full technical support.')
      lines.push('• The PDUA and BAA specify all data security requirements clearly — your IT/compliance team can review governance terms before any technical work begins.')
    }
    lines.push('')
  })
  return lines.join('\n')
}

export default function BusinessCase() {
  const [dept, setDept] = useState('')
  const [mot, setMot] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleAud(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function generate() {
    if (!dept && !mot && selected.size === 0) {
      setOutput('Please fill in at least one field and select at least one audience.')
      return
    }
    setLoading(true)
    const audLabels = AUDIENCES.filter(a => selected.has(a.id)).map(a => a.label)
    setTimeout(() => {
      setOutput(genLines(dept, audLabels, mot))
      setLoading(false)
    }, 600)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Build your internal business case</h1>
        <p className="text-gray-600-ban leading-relaxed">
          Onboarding often stalls when one clinician is carrying it alone. Use this tool to generate audience-specific talking points for leadership, finance, legal, IRB, and IT — in language that resonates with each group.
        </p>
      </div>

      <div className="bg-white rounded-[10px] border border-gray-200-ban p-6 mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-4">Generate talking points</div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-900-ban mb-1.5">What department or division is joining BAN?</label>
          <textarea
            value={dept}
            onChange={e => setDept(e.target.value)}
            placeholder="e.g., Department of Psychiatry, University of X Medical Center"
            className="w-full border border-gray-200-ban rounded-lg p-3 text-[13px] resize-none h-16 focus:outline-none focus:border-green-mid"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-gray-900-ban mb-1.5">What is your main motivation for joining?</label>
          <textarea
            value={mot}
            onChange={e => setMot(e.target.value)}
            placeholder="e.g., Our patients with bipolar disorder have high readmission rates and we want to learn from sites that have improved outcomes..."
            className="w-full border border-gray-200-ban rounded-lg p-3 text-[13px] resize-none h-20 focus:outline-none focus:border-green-mid"
          />
        </div>

        <div className="mb-5">
          <label className="block text-[13px] font-medium text-gray-900-ban mb-2">Who do you need to convince internally?</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map(a => (
              <label key={a.id} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={() => toggleAud(a.id)}
                  className="accent-green-mid"
                />
                <span className="text-[13px] text-gray-600-ban">{a.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="bg-green-deep text-white text-[13px] font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate talking points'}
        </button>

        {output && (
          <pre className="mt-5 text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50-ban rounded-lg p-4 font-sans">
            {output}
          </pre>
        )}
      </div>

      <div className="bg-white rounded-[10px] border border-gray-200-ban p-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-4">Questions leadership will ask</div>
        <div className="space-y-4">
          {FAQS.map(item => (
            <div key={item.q} className="border-b border-gray-100-ban last:border-0 pb-4 last:pb-0">
              <div className="font-medium text-[13px] text-gray-900-ban mb-1">{item.q}</div>
              <div className="text-[12px] text-gray-600-ban leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

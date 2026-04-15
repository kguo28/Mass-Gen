import { roles } from '@/data/roles'

const BAN_COMMITMENTS = [
  {
    q: 'Training and coaching',
    a: "QI Fundamentals training series, expert coaching from BAN's Quality Improvement Consultants (QICs), and onboarding support throughout all phases.",
  },
  {
    q: 'Data infrastructure',
    a: 'Access to the Phlox registry via Hive Networks — automated QI reports, population management reports, pre-visit planning tools, outcome dashboards, and data quality reports. All HIPAA-compliant.',
  },
  {
    q: 'Community and collaboration',
    a: 'Bi-annual Community Learning Sessions, monthly network-wide webinars, cross-center Learning Labs, and peer-to-peer sharing via the Phlox Exchange.',
  },
  {
    q: 'Shared change strategies',
    a: 'Evidence-based change packages, care bundles, and implementation guides developed and tested by participating sites — accelerating local improvement and reducing duplication of effort.',
  },
]

export default function TeamRoles() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-gray-900-ban mb-2">Your local team roles</h1>
        <p className="text-gray-600-ban leading-relaxed">
          BAN&apos;s experience across high-performing sites shows that success depends on four key roles. Every site needs these in place — ideally before Phase II begins.
        </p>
      </div>

      <div className="bg-white rounded-[10px] border border-gray-200-ban p-6 mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-4">
          Four roles BAN asks every site to establish
        </div>
        <div className="grid grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.name} className="bg-gray-50-ban rounded-lg p-4">
              <div className="font-semibold text-[13px] text-gray-900-ban mb-2">{r.name}</div>
              <div className="text-[12px] text-gray-600-ban leading-relaxed">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[10px] border border-gray-200-ban p-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400-ban mb-4">
          What BAN commits to providing your team
        </div>
        <div className="space-y-4">
          {BAN_COMMITMENTS.map(item => (
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

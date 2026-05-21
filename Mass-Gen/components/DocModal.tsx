'use client'
import { Doc, docs } from '@/data/docs'

const PDUA_SUMMARY = `<h2 style="font-size:18px;font-weight:600;margin-bottom:12px">PDUA / BAA — Key Provisions Summary</h2>
<p style="margin-bottom:12px">The Participation and Data Use Agreement (PDUA) is the core legal document governing your site's relationship with the Bipolar Action Network. It is executed between your institution and The General Hospital Corporation d/b/a Massachusetts General Hospital (MGH).</p>
<h3 style="font-size:14px;font-weight:600;margin-bottom:8px">Purpose</h3>
<p style="margin-bottom:12px">To facilitate improvement of the quality of care delivered to people with bipolar disorder, and to facilitate research and development of best clinical practices. Participants collect and share clinical and research data and test specific changes in care to determine how to redesign and incorporate improvements.</p>
<h3 style="font-size:14px;font-weight:600;margin-bottom:8px">Key provisions</h3>
<ul style="margin-bottom:12px;padding-left:20px;line-height:1.7">
  <li><strong>Participation fee:</strong> An annual membership fee is specified in the agreement. MGH will provide 30 days written notice of any increases.</li>
  <li><strong>Data sharing:</strong> Participant agrees to securely transmit data to the Hive Outcomes Registry (Phlox) in accordance with Data Standards.</li>
  <li><strong>HIPAA / BAA:</strong> MGH qualifies as a Business Associate with respect to Participant under HIPAA. The BAA is included within the agreement.</li>
  <li><strong>IRB:</strong> Research use of the database is subject to applicable laws. Each participating institution must certify compliance and obtain all necessary approvals.</li>
  <li><strong>Governance:</strong> MGH facilitates a consultation process involving network participant representatives to evaluate requests including data use, research, and publication.</li>
  <li><strong>Term and termination:</strong> Either party may terminate with written notice.</li>
</ul>
<h3 style="font-size:14px;font-weight:600;margin-bottom:8px">Next steps</h3>
<p>To request the full template document, contact your BAN onboarding lead or email bipolaractionnetwork@mgb.org. BAN holds office hours with MGH legal representation available to answer questions from your legal team.</p>`

const PLACEHOLDER_BODY = `<div style="padding:24px;text-align:center;color:#9e9a93">
  <div style="font-size:48px;margin-bottom:16px">📄</div>
  <div style="font-size:14px;margin-bottom:8px">This document is available from your BAN onboarding team.</div>
  <div style="font-size:13px">Email bipolaractionnetwork@mgb.org to request access.</div>
</div>`

export function findDocByName(name: string): Doc | undefined {
  return docs.find(d => d.n === name)
}

export function buildDocBody(d: Doc): { title: string; body: string } | null {
  if (d.type === 'external' && d.url) {
    window.open(d.url, '_blank')
    return null
  }
  if (d.type === 'pdua_text') return { title: d.n, body: PDUA_SUMMARY }
  return { title: d.n, body: PLACEHOLDER_BODY }
}

interface Props {
  title: string
  body: string
  onClose: () => void
}

export default function DocModal({ title, body, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200-ban">
          <div className="font-medium text-[14px] text-gray-900-ban">{title}</div>
          <button onClick={onClose} className="text-gray-400-ban hover:text-gray-900-ban text-lg">✕</button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-6 text-[13px] text-gray-600-ban leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </div>
  )
}

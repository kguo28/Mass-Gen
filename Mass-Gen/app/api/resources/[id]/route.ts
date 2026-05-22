import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { findResource, type ResourceFormat } from '@/data/moduleResources'

const CONTENT_TYPE: Record<ResourceFormat, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf:  'application/pdf',
  html: 'text/html; charset=utf-8',
  md:   'text/markdown; charset=utf-8',
  txt:  'text/plain; charset=utf-8',
}

function dataRoot(): string {
  return path.resolve(process.cwd(), '..', 'rag', 'data')
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const resource = findResource(params.id)
  if (!resource || resource.status !== 'available' || !resource.fileName) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const root = dataRoot()
  const fullPath = path.resolve(root, resource.fileName)
  // Path-traversal defense — the resolved path must stay inside rag/data/.
  if (!fullPath.startsWith(root + path.sep) && fullPath !== root) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  let buf: Buffer
  try {
    buf = await fs.readFile(fullPath)
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // RFC 5987 filename encoding for non-ASCII / spaces.
  const asciiName = resource.fileName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '')
  const utf8Name = encodeURIComponent(resource.fileName)

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': CONTENT_TYPE[resource.format],
      'Content-Length': String(buf.byteLength),
      'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}

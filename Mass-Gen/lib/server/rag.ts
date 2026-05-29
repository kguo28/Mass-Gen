import fs from 'node:fs/promises'
import path from 'node:path'

interface SearchFile {
  absolutePath: string
  source: string
}

interface SearchChunk {
  source: string
  text: string
  normalized: string
}

const SEARCH_ROOTS = [
  { dir: path.join(process.cwd(), 'data'), label: 'app data' },
  { dir: path.join(process.cwd(), 'networks'), label: 'network data' },
  { dir: path.join(process.cwd(), 'rag', 'data'), label: 'rag data' },
  { dir: path.resolve(process.cwd(), '..', 'rag', 'data'), label: 'rag data' },
]

const TEXT_EXTENSIONS = new Set([
  '.csv',
  '.htm',
  '.html',
  '.json',
  '.md',
  '.mdx',
  '.txt',
  '.ts',
  '.tsx',
])

const SKIP_DIRS = new Set(['.git', '.next', '__pycache__', 'node_modules', 'venv'])
const MAX_FILE_BYTES = 500_000
const CHUNK_SIZE = 1400
const CHUNK_OVERLAP = 180

let corpusPromise: Promise<SearchChunk[]> | null = null

async function directoryExists(dir: string) {
  try {
    return (await fs.stat(dir)).isDirectory()
  } catch {
    return false
  }
}

async function walk(root: string, label: string): Promise<SearchFile[]> {
  if (!(await directoryExists(root))) return []
  const entries = await fs.readdir(root, { withFileTypes: true })
  const files = await Promise.all(entries.map(async entry => {
    const absolutePath = path.join(root, entry.name)

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) return []
      return walk(absolutePath, label)
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (!entry.isFile() || !TEXT_EXTENSIONS.has(extension)) return []

    const relativePath = path.relative(process.cwd(), absolutePath)
    return [{ absolutePath, source: `${label}/${relativePath}` }]
  }))

  return files.flat()
}

function cleanText(raw: string) {
  return raw
    .replace(/\r/g, '')
    .replace(/import\s+[^;\n]+[;\n]/g, ' ')
    .replace(/export\s+(const|type|interface|function)\s+/g, '$1 ')
    .replace(/[{}[\]();<>]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function chunkText(source: string, text: string): SearchChunk[] {
  const cleaned = cleanText(text)
  if (!cleaned) return []

  const chunks: SearchChunk[] = []
  for (let start = 0; start < cleaned.length; start += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = cleaned.slice(start, start + CHUNK_SIZE).trim()
    if (chunk.length < 80) continue
    chunks.push({
      source,
      text: chunk,
      normalized: chunk.toLowerCase(),
    })
  }

  return chunks
}

async function buildCorpus() {
  const roots = await Promise.all(SEARCH_ROOTS.map(root => walk(root.dir, root.label)))
  const files = roots.flat()
  const chunks = await Promise.all(files.map(async file => {
    const stat = await fs.stat(file.absolutePath)
    if (stat.size > MAX_FILE_BYTES) return []

    const text = await fs.readFile(file.absolutePath, 'utf8')
    return chunkText(file.source, text)
  }))

  return chunks.flat()
}

function queryTerms(query: string) {
  return Array.from(new Set(
    query
      .toLowerCase()
      .match(/[a-z0-9][a-z0-9'-]{2,}/g) ?? [],
  ))
}

function scoreChunk(chunk: SearchChunk, query: string, terms: string[]) {
  if (!terms.length) return 0

  let score = chunk.normalized.includes(query.toLowerCase()) ? 12 : 0
  for (const term of terms) {
    const sourceHit = chunk.source.toLowerCase().includes(term) ? 2 : 0
    const matches = chunk.normalized.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'))?.length ?? 0
    score += sourceHit + matches
  }

  return score
}

export async function retrieveContext(query: string, k = 5): Promise<string> {
  const terms = queryTerms(query)
  if (!terms.length) return ''

  corpusPromise ??= buildCorpus()
  const corpus = await corpusPromise
  const chunks = corpus
    .map(chunk => ({ chunk, score: scoreChunk(chunk, query, terms) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(result => result.chunk)

  if (!chunks.length) return ''

  return (
    '\n\nRelevant source material:\n' +
    chunks
      .map(chunk => `[${chunk.source}]\n${chunk.text}`)
      .join('\n\n---\n\n')
  )
}

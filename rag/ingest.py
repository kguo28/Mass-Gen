"""
One-time script: chunk all docs in rag/data/, embed with MiniLM, save FAISS index + metadata.json.
Run: python ingest.py
"""
import json
import os
import faiss
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

DATA_DIR = Path(__file__).parent / "data"
INDEX_DIR = Path(__file__).parent / "index"
CHUNK_SIZE = 500
OVERLAP = 100


def chunk_text(text: str, source: str) -> list[dict]:
    chunks = []
    start = 0
    chunk_id = 0
    text = text.strip()
    while start < len(text):
        end = start + CHUNK_SIZE
        chunk = text[start:end].strip()
        if chunk:
            chunks.append({"text": chunk, "source_file": source, "chunk_id": chunk_id})
            chunk_id += 1
        start += CHUNK_SIZE - OVERLAP
    return chunks


def extract_docx(path: Path) -> str:
    from docx import Document
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_pdf(path: Path) -> str:
    from pypdf import PdfReader
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def extract_html(path: Path) -> str:
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
    return soup.get_text(separator="\n")


def extract(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".docx":
        return extract_docx(path)
    elif suffix == ".pdf":
        return extract_pdf(path)
    elif suffix in (".html", ".htm"):
        return extract_html(path)
    else:
        return path.read_text(encoding="utf-8", errors="ignore")


def main():
    INDEX_DIR.mkdir(exist_ok=True)
    all_chunks = []
    for path in sorted(DATA_DIR.iterdir()):
        if path.suffix.lower() not in (".docx", ".pdf", ".html", ".htm", ".txt"):
            continue
        print(f"  Processing {path.name}...")
        try:
            text = extract(path)
            chunks = chunk_text(text, path.name)
            all_chunks.extend(chunks)
            print(f"    → {len(chunks)} chunks")
        except Exception as e:
            print(f"    ERROR: {e}")

    if not all_chunks:
        print("No chunks produced. Did you copy docs into rag/data/?")
        return

    print(f"\nEmbedding {len(all_chunks)} chunks...")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    texts = [c["text"] for c in all_chunks]
    embeddings = model.encode(texts, batch_size=64, show_progress_bar=True, normalize_embeddings=True)
    embeddings = np.array(embeddings, dtype="float32")

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # inner product = cosine for normalized vecs
    index.add(embeddings)

    faiss.write_index(index, str(INDEX_DIR / "faiss.index"))
    with open(INDEX_DIR / "metadata.json", "w") as f:
        json.dump(all_chunks, f)

    print(f"Done. {len(all_chunks)} chunks → rag/index/")


if __name__ == "__main__":
    main()

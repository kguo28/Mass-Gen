import json
import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

INDEX_DIR = os.path.join(os.path.dirname(__file__), "index")
INDEX_PATH = os.path.join(INDEX_DIR, "faiss.index")
META_PATH = os.path.join(INDEX_DIR, "metadata.json")

_model = None
_index = None
_metadata = None


def _load():
    global _model, _index, _metadata
    if _index is None:
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        _index = faiss.read_index(INDEX_PATH)
        with open(META_PATH) as f:
            _metadata = json.load(f)


def search(query: str, k: int = 5) -> list[dict]:
    _load()
    vec = _model.encode([query], normalize_embeddings=True).astype("float32")
    scores, indices = _index.search(vec, k)
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        chunk = _metadata[idx]
        results.append({"text": chunk["text"], "source": chunk["source_file"], "score": float(score)})
    return results

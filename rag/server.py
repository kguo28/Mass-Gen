"""
FastAPI RAG server. Run: python server.py (port 8000)
"""
import json
import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_retriever = None


def get_retriever():
    global _retriever
    if _retriever is None:
        from retriever import search
        _retriever = search
    return _retriever


@app.on_event("startup")
def startup():
    try:
        get_retriever()
        # Warm up
        get_retriever()("test", k=1)
        print("RAG index loaded.")
    except Exception as e:
        print(f"Warning: could not load index at startup: {e}")


@app.get("/health")
def health():
    import json, os
    meta_path = os.path.join(os.path.dirname(__file__), "index", "metadata.json")
    try:
        with open(meta_path) as f:
            chunks = json.load(f)
        return {"status": "ok", "num_chunks": len(chunks)}
    except Exception:
        return {"status": "index_not_found", "num_chunks": 0}


@app.get("/retrieve")
def retrieve(q: str = Query(..., description="Search query"), k: int = Query(5, ge=1, le=20)):
    try:
        search = get_retriever()
        chunks = search(q, k=k)
        return {"chunks": chunks}
    except Exception as e:
        return {"chunks": [], "error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

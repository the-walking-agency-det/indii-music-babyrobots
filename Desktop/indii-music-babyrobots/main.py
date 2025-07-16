from fastapi import FastAPI, Form, UploadFile, File
from agents.crew_runtime import LabelHead
from memory_hub import MemoryHub

app = FastAPI()
mem = MemoryHub()

@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok", "service": "main-api"}

@app.post("/chat")
def chat(message: str = Form(...), file: UploadFile = File(...)):
    lh = LabelHead(memory=mem)
    return lh.handle(message, file)

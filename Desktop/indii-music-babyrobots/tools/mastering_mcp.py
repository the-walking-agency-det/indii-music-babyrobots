import uvicorn
from fastapi import FastAPI, UploadFile, File
import httpx
import tempfile
import os

app = FastAPI(title="Mastering-MCP")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "mastering-mcp"}

@app.post("/master")
async def master(file: UploadFile = File(...),
               target_loudness: float = -14,
               genre: str = "pop"):
    tmp_path = None
    try:
        # 1. Save uploaded file to temp dir
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # 2. For demo purposes, return a mock mastered URL
        # In production, replace with actual mastering service
        # with open(tmp_path, "rb") as f:
        #     r = httpx.post(
        #         "https://api.landr.com/v1/master",
        #         files={"stems": (file.filename, f, file.content_type)},
        #         data={"loudness": target_loudness, "genre": genre}
        #     )
        #     r.raise_for_status()
        #     wav_url = r.json()["download_url"]
        
        # Mock response for demo
        wav_url = f"https://demo-storage.com/mastered/{file.filename}"
        
        return {"wav_url": wav_url}
    except Exception as e:
        return {"error": f"Mastering failed: {str(e)}"}
    finally:
        # 3. Clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

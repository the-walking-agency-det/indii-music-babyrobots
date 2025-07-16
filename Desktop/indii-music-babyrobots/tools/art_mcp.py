import uvicorn
from fastapi import FastAPI, Request
import httpx

app = FastAPI(title="Art-MCP")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "art-mcp"}

@app.post("/art")
async def art(request: Request):
    try:
        data = await request.json()
        prompt = data["prompt"]
        
        # For demo purposes, return a mock cover URL
        # In production, replace with actual AI art service
        # r = httpx.post("https://api.example.com/art", json={"prompt": prompt})
        # r.raise_for_status()
        # cover_url = r.json()["cover_url"]
        
        # Mock response for demo
        cover_url = f"https://demo-storage.com/covers/{hash(prompt)}.jpg"
        
        return {"cover_url": cover_url}
    except Exception as e:
        return {"error": f"Art generation failed: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)

# agents/crew_runtime.py
import httpx
from memory_hub import MemoryHub

class LabelHead:
    def __init__(self, memory: MemoryHub):
        self.memory = memory

    def handle(self, message: str, file) -> dict:
        try:
            # Forward file to the MCP mastering server on port 8001
            files = {"file": (file.filename, file.file, file.content_type)}
            r = httpx.post(
                "http://localhost:8001/master",
                files=files,
                data={"target_loudness": -14, "genre": "pop"}
            )
            r.raise_for_status()
            wav_url = r.json()["wav_url"]

            # Persist & return
            self.memory.save("mastering", "demo", {"wav_url": wav_url})
            return {"card": {"type": "mastering", "wav_url": wav_url}}
        except Exception as e:
            return {"error": f"Mastering failed: {str(e)}"}

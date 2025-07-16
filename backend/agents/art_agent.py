from typing import Dict, List, Optional
from pydantic import BaseModel

class ArtRequest(BaseModel):
    style: str
    theme: str
    size: Dict[str, int]
    additional_params: Optional[Dict] = None

class ArtAgent:
    def __init__(self):
        self.supported_styles = ["pixel", "3d", "abstract", "realistic"]
        self.current_tasks = []
    
    def validate_request(self, request: ArtRequest) -> bool:
        """Validate if the request can be processed"""
        return request.style in self.supported_styles
    
    async def generate_art(self, request: ArtRequest):
        """Generate art based on the request parameters"""
        if not self.validate_request(request):
            raise ValueError(f"Unsupported style: {request.style}")
        
        # Here you would implement the actual art generation logic
        task_id = len(self.current_tasks) + 1
        self.current_tasks.append({
            "id": task_id,
            "request": request,
            "status": "processing"
        })
        
        return {
            "task_id": task_id,
            "status": "processing",
            "estimated_completion": "30 seconds"
        }
    
    def get_task_status(self, task_id: int) -> Dict:
        """Get the status of a specific art generation task"""
        task = next((t for t in self.current_tasks if t["id"] == task_id), None)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        return task

# Initialize the art agent
art_agent = ArtAgent()

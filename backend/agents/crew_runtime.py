from typing import Dict, List, Optional
from pydantic import BaseModel

class AgentMessage(BaseModel):
    sender: str
    content: str
    recipients: List[str]
    silent_observers: Optional[List[str]] = []

class CrewRuntime:
    def __init__(self):
        self.agents = {}
        self.conversations = []
    
    def register_agent(self, agent_id: str, capabilities: List[str]):
        """Register a new agent with specific capabilities"""
        self.agents[agent_id] = {
            "capabilities": capabilities,
            "status": "available"
        }
    
    def broadcast_message(self, message: AgentMessage):
        """Broadcast a message to specified recipients"""
        self.conversations.append(message)
        # Here you would implement the actual message delivery logic
        return {
            "status": "delivered",
            "message_id": len(self.conversations)
        }
    
    def get_agent_status(self, agent_id: str) -> Dict:
        """Get the current status of an agent"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
        return self.agents[agent_id]

# Initialize the crew runtime
crew = CrewRuntime()

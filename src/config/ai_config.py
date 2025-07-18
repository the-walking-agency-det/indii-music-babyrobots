"""Configuration for AI providers"""

import os
import sys
from pathlib import Path

# Add .secrets to path for key_manager
root_dir = Path(__file__).parent.parent.parent
secrets_dir = root_dir / '.secrets'
sys.path.insert(0, str(secrets_dir))

from key_manager import init_key_manager

async def getAIConfig():
    """Get AI provider configuration with secure keys"""
    key_manager = init_key_manager()
    
    return {
        'gemini': {
            'api_key': key_manager.get_api_key("gemini"),
            'base_url': 'https://generativelanguage.googleapis.com/v1beta'
        },
        'moonshot': {
            'api_key': key_manager.get_api_key("moonshot"),
            'base_url': 'https://api.moonshot.ai/v1'
        }
    }

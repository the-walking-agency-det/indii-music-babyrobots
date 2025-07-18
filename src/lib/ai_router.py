"""AI Router for managing multiple LLM providers"""

class AIRouter:
    """Router for managing multiple AI providers with fallback handling"""
    
    def __init__(self):
        self.providers = {
            'gemini': None,
            'moonshot': None,
            'anthropic': None
        }
        self.default_provider = 'gemini'
        self.fallback_order = ['gemini', 'moonshot', 'anthropic']
    
    def initializeProvider(self, provider_name: str, config: dict):
        """Initialize a specific provider with configuration"""
        if provider_name not in self.providers:
            raise ValueError(f"Unknown provider: {provider_name}")
            
        if provider_name == 'gemini':
            self.providers[provider_name] = GeminiProvider(config)
        elif provider_name == 'moonshot':
            self.providers[provider_name] = MoonshotProvider(config)
        elif provider_name == 'anthropic':
            self.providers[provider_name] = AnthropicProvider(config)
    
    async def healthCheck(self):
        """Check health of all initialized providers"""
        status = {}
        for name, provider in self.providers.items():
            if provider:
                try:
                    result = await provider.check()
                    status[name] = {"healthy": True, "details": result}
                except Exception as e:
                    status[name] = {"healthy": False, "error": str(e)}
            else:
                status[name] = {"healthy": False, "reason": "Not initialized"}
        return status

class BaseProvider:
    """Base class for AI providers"""
    def __init__(self, config: dict):
        self.config = config
        self.api_key = config.get('api_key')
        if not self.api_key:
            raise ValueError(f"API key not found in config")
    
    async def check(self):
        """Health check implementation"""
        raise NotImplementedError()

class GeminiProvider(BaseProvider):
    """Google's Gemini API implementation"""
    def __init__(self, config: dict):
        super().__init__(config)
        self.base_url = config.get('base_url', 'https://generativelanguage.googleapis.com/v1beta')
    
    async def check(self):
        """Implement basic health check"""
        # For now, just verify we have credentials
        return {"status": "configured", "model": "gemini-1.5-pro"}

class MoonshotProvider(BaseProvider):
    """Moonshot API implementation"""
    def __init__(self, config: dict):
        super().__init__(config)
        self.base_url = config.get('base_url', 'https://api.moonshot.ai/v1')
    
    async def check(self):
        """Implement basic health check"""
        return {"status": "configured", "model": "moonshot-v1"}

class AnthropicProvider(BaseProvider):
    """Anthropic API implementation"""
    def __init__(self, config: dict):
        super().__init__(config)
        self.base_url = config.get('base_url', 'https://api.anthropic.com/v1')
    
    async def check(self):
        """Implement basic health check"""
        return {"status": "configured", "model": "claude-3"}

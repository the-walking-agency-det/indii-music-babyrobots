// AI Provider Configuration
import { init_key_manager } from '../.secrets/key_manager';

export async function getAIConfig() {
    const keyManager = init_key_manager();
    
    return {
        gemini: {
            apiKey: keyManager.get_api_key("gemini"),
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
        },
        moonshot: {
            apiKey: keyManager.get_api_key("moonshot"),
            baseUrl: 'https://api.moonshot.ai/v1'
        }
    };
}

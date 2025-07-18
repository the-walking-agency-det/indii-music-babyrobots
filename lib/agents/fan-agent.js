// lib/agents/fan-agent.js
import { BaseAgent } from './base-agent.js';
import { FanPersona } from '../mocks/index.js';

export class FanAgent extends BaseAgent {
  constructor(memory, rag, apis, communicator) {
    super('fan', FanPersona, [
      'playlist_management',
      'discovery',
      'social_interaction',
      'preferences_update'
    ], memory, rag, apis, communicator);
  }

  async planActions(request, knowledge) {
    // Fan-specific action planning
    if (request.intent === 'discover_music') {
      return [
        { type: 'api_call', api: 'MUSIC_SERVICES', endpoint: '/search', method: 'GET' },
        { type: 'preference_analysis', table: 'fan_profiles' },
        { type: 'recommendation_generation' }
      ];
    }
    // ... other fan actions
  }
}

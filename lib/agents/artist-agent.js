// lib/agents/artist-agent.js
import { BaseAgent } from './base-agent.js';
import { ArtistPersona } from '../mocks/index.js';

export class ArtistAgent extends BaseAgent {
  constructor(memory, rag, apis, communicator) {
    super('artist', ArtistPersona, [
      'track_management',
      'profile_updates',
      'analytics_review',
      'fan_interaction'
    ], memory, rag, apis, communicator);
  }

  async planActions(request, knowledge) {
    // Artist-specific action planning
    if (request.intent === 'upload_track') {
      return [
        { type: 'api_call', api: 'SUPABASE', endpoint: '/rest/v1/tracks', method: 'POST' },
        { type: 'storage_upload', bucket: 'audio-files' },
        { type: 'metadata_update', table: 'tracks' }
      ];
    }
    // ... other artist actions
  }
}

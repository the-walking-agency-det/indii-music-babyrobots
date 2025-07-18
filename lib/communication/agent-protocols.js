// lib/communication/agent-protocols.js
export class AgentProtocols {
  static MUSIC_DISCOVERY = {
    request: (genre, mood, preferences) => ({
      type: 'music_discovery',
      parameters: { genre, mood, preferences }
    }),
    
    response: (tracks, recommendations) => ({
      type: 'music_discovery_response',
      data: { tracks, recommendations }
    })
  };

  static PROFILE_UPDATE = {
    request: (userId, updates) => ({
      type: 'profile_update',
      parameters: { userId, updates }
    }),
    
    response: (success, updatedProfile) => ({
      type: 'profile_update_response',
      data: { success, updatedProfile }
    })
  };

  static ANALYTICS_REQUEST = {
    request: (metric, timeRange, filters) => ({
      type: 'analytics_request',
      parameters: { metric, timeRange, filters }
    }),
    
    response: (data, insights) => ({
      type: 'analytics_response',
      data: { data, insights }
    })
  };
}

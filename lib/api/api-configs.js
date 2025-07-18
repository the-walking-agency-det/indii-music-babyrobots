// lib/api/api-configs.js
export const APIConfigs = {
  SUPABASE: {
    baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    auth: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    endpoints: {
      users: '/rest/v1/users',
      tracks: '/rest/v1/tracks',
      profiles: '/rest/v1/artist_profiles',
      analytics: '/rest/v1/analytics'
    },
    rateLimit: { requests: 100, window: 60000 }
  },

  MUSIC_SERVICES: {
    baseUrl: 'https://api.music-service.com',
    auth: {
      'X-API-Key': process.env.MUSIC_SERVICE_API_KEY
    },
    endpoints: {
      search: '/search',
      metadata: '/metadata',
      recommendations: '/recommendations'
    },
    rateLimit: { requests: 1000, window: 60000 }
  },

  ANALYTICS_SERVICE: {
    baseUrl: 'https://analytics.service.com',
    auth: {
      'Authorization': `Bearer ${process.env.ANALYTICS_TOKEN}`
    },
    endpoints: {
      events: '/events',
      insights: '/insights',
      reports: '/reports'
    },
    rateLimit: { requests: 500, window: 60000 }
  }
};

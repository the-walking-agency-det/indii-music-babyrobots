import { PrismaClient } from '@prisma/client';
import { getMemoryManager } from '../../src/lib/memory';

const prisma = new PrismaClient();
const memory = getMemoryManager();

export async function getArtistMemoryProfile(artistId) {
  // Fetch all relevant artist data and history
  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistId },
    include: {
      tracks: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      releases: {
        orderBy: { releaseDate: 'desc' },
        take: 5
      },
      projects: {
        where: { status: 'active' }
      },
      analytics: true,
      collaborations: true
    }
  });

  if (!artist) {
    throw new Error(`Artist ${artistId} not found`);
  }

  // Build comprehensive memory profile
  return {
    basics: {
      id: artist.id,
      name: artist.stageName,
      genre: artist.primaryGenre,
      career_start: artist.careerStartDate,
      profile_completion: calculateProfileCompletion(artist)
    },
    
    activity: {
      recent_tracks: artist.tracks.map(formatTrackData),
      active_projects: artist.projects.map(formatProjectData),
      upcoming_releases: artist.releases
        .filter(r => new Date(r.releaseDate) > new Date())
        .map(formatReleaseData),
      recent_collaborations: artist.collaborations.map(formatCollaborationData)
    },
    
    analytics: {
      monthly_listeners: getMonthlyListeners(artist.analytics),
      engagement_rate: calculateEngagementRate(artist.analytics),
      growth_metrics: extractGrowthMetrics(artist.analytics),
      platform_performance: aggregatePlatformMetrics(artist.analytics)
    },
    
    career_context: {
      stage: determineCareerStage(artist),
      milestones: extractCareerMilestones(artist),
      goals: await fetchCareerGoals(artist.id),
      strengths: identifyStrengths(artist),
      areas_for_growth: identifyGrowthAreas(artist)
    },

    market_position: {
      target_audience: analyzeTargetAudience(artist),
      competitive_advantage: identifyUniqueValue(artist),
      market_opportunities: findMarketOpportunities(artist),
      brand_perception: analyzeBrandPerception(artist)
    }
  };
}

export async function updateArtistMemory(artistId, sessionId, updates) {
  const memoryScopes = Object.keys(updates);
  
  for (const scope of memoryScopes) {
    await memory.updateContext(
      sessionId,
      'indii',
      scope,
      updates[scope],
      { persistent: true }
    );
  }
}

export async function searchArtistMemory(artistId, query, options = {}) {
  const {
    includeConversations = true,
    includeActivities = true,
    includeAnalytics = true,
    limit = 10
  } = options;

  const results = [];

  if (includeConversations) {
    const conversationResults = await memory.searchContext(
      query,
      `artist_${artistId}`,
      'conversation',
      { limit }
    );
    results.push(...conversationResults.map(r => ({ ...r, type: 'conversation' })));
  }

  if (includeActivities) {
    const activityResults = await memory.searchContext(
      query,
      `artist_${artistId}`,
      'activities',
      { limit }
    );
    results.push(...activityResults.map(r => ({ ...r, type: 'activity' })));
  }

  if (includeAnalytics) {
    const analyticResults = await memory.searchContext(
      query,
      `artist_${artistId}`,
      'analytics',
      { limit }
    );
    results.push(...analyticResults.map(r => ({ ...r, type: 'analytics' })));
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Helper functions for data formatting and analysis

function calculateProfileCompletion(artist) {
  const requiredFields = [
    'stageName',
    'primaryGenre',
    'bio',
    'profileImage',
    'socialLinks',
    'location'
  ];
  
  const completedFields = requiredFields.filter(field => artist[field]);
  return (completedFields.length / requiredFields.length) * 100;
}

function formatTrackData(track) {
  return {
    id: track.id,
    title: track.title,
    type: track.type,
    status: track.status,
    created_at: track.createdAt,
    genre: track.genre,
    mood: track.mood,
    key_metrics: extractTrackMetrics(track)
  };
}

function formatProjectData(project) {
  return {
    id: project.id,
    title: project.title,
    type: project.type,
    status: project.status,
    deadline: project.deadline,
    collaborators: project.collaborators,
    key_tasks: project.tasks?.map(t => ({
      title: t.title,
      status: t.status,
      due_date: t.dueDate
    }))
  };
}

function formatReleaseData(release) {
  return {
    id: release.id,
    title: release.title,
    type: release.type,
    release_date: release.releaseDate,
    status: release.status,
    platforms: release.platforms,
    marketing_status: release.marketingStatus
  };
}

function formatCollaborationData(collab) {
  return {
    id: collab.id,
    type: collab.type,
    partners: collab.partners,
    status: collab.status,
    start_date: collab.startDate,
    end_date: collab.endDate,
    outcome: collab.outcome
  };
}

function getMonthlyListeners(analytics) {
  return analytics?.monthlyListeners || {
    current: 0,
    previous: 0,
    growth: 0
  };
}

function calculateEngagementRate(analytics) {
  if (!analytics?.engagementMetrics) return 0;
  
  const { likes, comments, shares, totalReach } = analytics.engagementMetrics;
  return totalReach ? ((likes + comments + shares) / totalReach) * 100 : 0;
}

function extractGrowthMetrics(analytics) {
  return {
    listener_growth: calculateGrowthRate(analytics?.monthlyListeners),
    engagement_growth: calculateGrowthRate(analytics?.engagementMetrics),
    platform_growth: calculatePlatformGrowth(analytics?.platformMetrics)
  };
}

function aggregatePlatformMetrics(analytics) {
  return analytics?.platformMetrics || {
    spotify: { listeners: 0, streams: 0, saves: 0 },
    appleMusic: { listeners: 0, streams: 0, saves: 0 },
    soundcloud: { listeners: 0, streams: 0, saves: 0 }
  };
}

function determineCareerStage(artist) {
  // Implement career stage determination logic
  // This is a placeholder - implement actual logic
  return 'emerging';
}

function extractCareerMilestones(artist) {
  // Implement milestone extraction logic
  // This is a placeholder - implement actual logic
  return [];
}

async function fetchCareerGoals(artistId) {
  // Implement goals fetching logic
  // This is a placeholder - implement actual logic
  return [];
}

function identifyStrengths(artist) {
  // Implement strengths identification logic
  // This is a placeholder - implement actual logic
  return [];
}

function identifyGrowthAreas(artist) {
  // Implement growth areas identification logic
  // This is a placeholder - implement actual logic
  return [];
}

function analyzeTargetAudience(artist) {
  // Implement audience analysis logic
  // This is a placeholder - implement actual logic
  return {};
}

function identifyUniqueValue(artist) {
  // Implement unique value identification logic
  // This is a placeholder - implement actual logic
  return {};
}

function findMarketOpportunities(artist) {
  // Implement opportunity identification logic
  // This is a placeholder - implement actual logic
  return [];
}

function analyzeBrandPerception(artist) {
  // Implement brand perception analysis logic
  // This is a placeholder - implement actual logic
  return {};
}

function calculateGrowthRate(metrics) {
  if (!metrics?.current || !metrics?.previous) return 0;
  return ((metrics.current - metrics.previous) / metrics.previous) * 100;
}

function calculatePlatformGrowth(platformMetrics) {
  if (!platformMetrics) return {};
  
  const growth = {};
  for (const [platform, metrics] of Object.entries(platformMetrics)) {
    growth[platform] = {
      listeners: calculateGrowthRate(metrics.listeners),
      streams: calculateGrowthRate(metrics.streams),
      saves: calculateGrowthRate(metrics.saves)
    };
  }
  return growth;
}

function extractTrackMetrics(track) {
  return {
    total_streams: track.streams || 0,
    avg_completion_rate: track.completionRate || 0,
    save_rate: track.saveRate || 0,
    playlist_adds: track.playlistAdds || 0
  };
}

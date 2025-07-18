// Music Industry Knowledge Base
// Core knowledge for artist development, career planning, and industry navigation
// Designed for INDII agent and other music industry AI assistants

export class MusicIndustryKB {
  constructor() {
    this.knowledge = {
      // Artist Development Stages
      artist_development: {
        stages: {
          emerging: {
            description: "First 0-2 years, building foundation",
            key_focus: ["songwriting", "recording", "social_media", "local_networking"],
            typical_challenges: ["finding voice", "building fanbase", "limited budget"],
            success_metrics: ["song completion", "social followers", "local shows"],
            advice: {
              priorities: ["Focus on songwriting quality over quantity", "Build authentic social presence", "Play local venues regularly"],
              avoid: ["Rushing to release everything", "Trying to be on every platform", "Neglecting live performance skills"],
              budget_allocation: { recording: 40, marketing: 30, live_performance: 20, networking: 10 }
            }
          },
          developing: {
            description: "2-5 years, building momentum and professional relationships",
            key_focus: ["professional_recording", "team_building", "regional_touring", "streaming_strategy"],
            typical_challenges: ["scaling operations", "team management", "revenue generation"],
            success_metrics: ["streaming numbers", "touring revenue", "industry connections"],
            advice: {
              priorities: ["Build professional team", "Develop consistent release schedule", "Expand touring radius"],
              avoid: ["Bad contracts", "Overextending financially", "Neglecting business fundamentals"],
              budget_allocation: { recording: 30, marketing: 25, touring: 30, team: 15 }
            }
          },
          established: {
            description: "5+ years, sustainable career with professional infrastructure",
            key_focus: ["brand_expansion", "diversified_revenue", "industry_leadership", "legacy_building"],
            typical_challenges: ["staying relevant", "managing larger operations", "creative evolution"],
            success_metrics: ["revenue diversity", "industry recognition", "sustainable growth"],
            advice: {
              priorities: ["Diversify revenue streams", "Mentor emerging artists", "Invest in long-term projects"],
              avoid: ["Complacency", "Overcomplicating operations", "Losing authentic connection with fans"],
              budget_allocation: { investment: 35, operations: 25, creative: 25, giving_back: 15 }
            }
          }
        },
        
        // Career Milestones
        milestones: {
          first_quality_demo: {
            description: "Professional-quality recordings that represent your sound",
            preparation: ["Choose best 3-5 songs", "Professional mixing/mastering", "Compelling artwork"],
            impact: "Opens doors to industry professionals and better opportunities",
            next_steps: ["Pitch to blogs", "Submit to playlists", "Use for booking shows"]
          },
          consistent_fanbase: {
            description: "Engaged audience that regularly supports your music",
            metrics: ["Email list growth", "Social engagement rates", "Show attendance"],
            strategies: ["Regular content creation", "Fan interaction", "Exclusive content"],
            next_steps: ["Monetize through merchandise", "Crowdfunding campaigns", "VIP experiences"]
          },
          first_tour: {
            description: "Multi-city tour with sustainable logistics and profitability",
            preparation: ["Route planning", "Budget management", "Merchandise strategy"],
            challenges: ["Booking venues", "Transportation costs", "Promotion in new markets"],
            success_factors: ["Strong advance promotion", "Local partnerships", "Realistic expectations"]
          }
        }
      },

      // Revenue Streams
      revenue_streams: {
        streaming: {
          platforms: ["Spotify", "Apple Music", "YouTube Music", "Amazon Music"],
          optimization: {
            playlist_placement: "Key to discovery and revenue growth",
            algorithmic_boost: "Consistent releases help platform algorithms",
            fan_engagement: "Comments, saves, and shares boost visibility"
          },
          realistic_expectations: {
            emerging_artist: "0.003-0.005 per stream",
            developing_artist: "0.005-0.008 per stream",
            note: "Focus on building audience, not just stream counts"
          }
        },
        live_performance: {
          venue_types: {
            house_concerts: { capacity: "20-50", payment: "tips + merchandise", benefits: "intimate connection" },
            coffee_shops: { capacity: "30-80", payment: "tips + exposure", benefits: "regular gigs" },
            clubs: { capacity: "100-500", payment: "guarantee + percentage", benefits: "professional experience" },
            festivals: { capacity: "500+", payment: "flat fee", benefits: "exposure + networking" }
          },
          pricing_strategy: {
            emerging: "Build experience and fanbase first",
            developing: "Guarantee + merchandise sales",
            established: "Higher guarantees + percentage of door"
          }
        },
        sync_licensing: {
          opportunities: ["TV shows", "Films", "Commercials", "Video games", "Podcasts"],
          preparation: ["Instrumental versions", "Different lengths", "Metadata organization"],
          submission_strategy: ["Music libraries", "Sync agents", "Direct pitching", "Networking events"]
        },
        merchandise: {
          essential_items: ["T-shirts", "Stickers", "Digital downloads", "Vinyl/CDs"],
          advanced_items: ["Hoodies", "Accessories", "Limited editions", "Bundles"],
          pricing_psychology: "Price points should reflect fan commitment levels",
          profit_margins: { t_shirts: "40-60%", vinyl: "30-50%", digital: "90-95%" }
        }
      },

      // Industry Relationships
      team_building: {
        essential_roles: {
          manager: {
            when_to_hire: "When opportunities exceed your capacity to handle",
            what_they_do: "Career strategy, deal negotiation, industry relationships",
            compensation: "15-20% of gross income",
            red_flags: ["Demands upfront payment", "No industry connections", "Unrealistic promises"]
          },
          booking_agent: {
            when_to_hire: "When ready to tour beyond local market",
            what_they_do: "Venue relationships, tour routing, contract negotiation",
            compensation: "10-15% of live performance income",
            selection_criteria: ["Territory expertise", "Venue relationships", "Artist roster quality"]
          },
          publicist: {
            when_to_hire: "For major releases or career milestones",
            what_they_do: "Media relationships, press coverage, story development",
            compensation: "Monthly retainer $1,000-5,000+",
            success_metrics: ["Media placements", "Interview quality", "Story amplification"]
          }
        }
      },

      // Business Fundamentals
      business_basics: {
        legal_essentials: {
          business_entity: "LLC for most independent artists",
          copyright_registration: "Protect your original works",
          performance_rights: "Register with ASCAP, BMI, or SESAC",
          trademark: "Consider for band name and logo"
        },
        financial_management: {
          separate_accounts: "Personal and business finances separate",
          expense_tracking: "Everything music-related is potentially deductible",
          tax_considerations: "Quarterly payments for self-employed",
          emergency_fund: "3-6 months of expenses saved"
        },
        contracts: {
          key_terms: ["Payment terms", "Exclusivity", "Territory", "Duration"],
          must_haves: ["Reversion clauses", "Approval rights", "Clear deliverables"],
          red_flags: ["Perpetual terms", "Unrealistic requirements", "Vague language"]
        }
      },

      // Digital Strategy
      digital_presence: {
        social_media: {
          platform_priorities: {
            instagram: "Visual storytelling, behind-the-scenes content",
            tiktok: "Music discovery, trending sounds, viral potential",
            youtube: "Music videos, tutorials, vlogs, longer content",
            twitter: "Industry connections, real-time engagement, news"
          },
          content_strategy: {
            ratio_rule: "80% value/entertainment, 20% promotion",
            consistency: "Regular posting schedule builds audience",
            authenticity: "Genuine personality connects better than perfection"
          }
        },
        email_marketing: {
          importance: "Only channel you truly own",
          growth_tactics: ["Exclusive content", "Early access", "Personal stories"],
          automation: ["Welcome series", "Release announcements", "Tour notifications"]
        }
      },

      // Industry Trends & Opportunities
      current_landscape: {
        streaming_economy: {
          reality: "Streaming pays less per play but offers global reach",
          strategy: "Focus on building engaged fanbase over raw numbers",
          opportunities: ["Playlist placements", "Algorithmic discovery", "Global audiences"]
        },
        direct_to_fan: {
          platforms: ["Bandcamp", "Patreon", "Substack", "Discord"],
          benefits: ["Higher revenue per fan", "Direct relationship", "Creative freedom"],
          requirements: ["Consistent content", "Community management", "Value proposition"]
        },
        nft_and_web3: {
          current_status: "Experimental but growing",
          opportunities: ["Limited edition releases", "Fan ownership", "New revenue models"],
          caution: "Don't alienate traditional fans, treat as addition not replacement"
        }
      }
    };
  }

  // Get knowledge for specific agent context
  getKnowledgeForAgent(agentId, query, context = {}) {
    switch (agentId) {
      case 'indii_agent':
        return this.getIndiiAgentKnowledge(query, context);
      case 'marketing_agent':
        return this.getMarketingAgentKnowledge(query, context);
      default:
        return this.getGeneralKnowledge(query, context);
    }
  }

  // INDII Agent specific knowledge formatting
  getIndiiAgentKnowledge(query, context) {
    const artistStage = context.artist_stage || 'emerging';
    const baseKnowledge = this.knowledge;
    
    return {
      mentoring_context: {
        approach: "Supportive, experienced mentor with industry wisdom",
        tone: "Encouraging but realistic about challenges",
        focus: "Long-term career building over quick wins"
      },
      relevant_knowledge: this.filterKnowledgeByStage(baseKnowledge, artistStage),
      practical_advice: this.generatePracticalAdvice(query, artistStage),
      industry_insights: this.getCurrentInsights(artistStage),
      next_steps: this.suggestNextSteps(query, artistStage, context)
    };
  }

  // Marketing Agent specific knowledge formatting
  getMarketingAgentKnowledge(query, context) {
    const campaignType = context.campaign_type || 'general';
    
    return {
      strategic_context: {
        approach: "Data-driven marketing with creative execution",
        tone: "Professional and results-focused",
        focus: "Measurable outcomes and ROI"
      },
      relevant_strategies: this.getMarketingStrategies(campaignType),
      platform_guidance: this.knowledge.digital_presence.social_media,
      campaign_templates: this.getCampaignTemplates(campaignType),
      success_metrics: this.getMarketingMetrics(campaignType)
    };
  }

  // Filter knowledge by artist development stage
  filterKnowledgeByStage(knowledge, stage) {
    const stageInfo = knowledge.artist_development.stages[stage];
    const relevantStreams = this.getRelevantRevenueStreams(stage);
    const appropriateTeam = this.getAppropriateTeamMembers(stage);
    
    return {
      current_stage: stageInfo,
      revenue_focus: relevantStreams,
      team_priorities: appropriateTeam,
      business_basics: knowledge.business_basics
    };
  }

  // Generate practical advice based on query and stage
  generatePracticalAdvice(query, stage) {
    const stageAdvice = this.knowledge.artist_development.stages[stage]?.advice || {};
    
    // Simple keyword matching for practical advice
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('release') || queryLower.includes('song')) {
      return {
        immediate_actions: stageAdvice.priorities?.filter(p => p.includes('recording') || p.includes('release')) || [],
        avoid: stageAdvice.avoid?.filter(a => a.includes('release') || a.includes('recording')) || [],
        budget_guidance: stageAdvice.budget_allocation
      };
    }
    
    if (queryLower.includes('tour') || queryLower.includes('live') || queryLower.includes('show')) {
      return {
        immediate_actions: ["Research venues in your area", "Prepare professional press kit", "Network with other artists"],
        avoid: ["Overpricing your shows", "Poor sound quality", "Unprofessional presentation"],
        budget_guidance: { venue_fees: 30, travel: 25, merchandise: 25, promotion: 20 }
      };
    }
    
    return {
      immediate_actions: stageAdvice.priorities || [],
      avoid: stageAdvice.avoid || [],
      budget_guidance: stageAdvice.budget_allocation || {}
    };
  }

  // Get current industry insights
  getCurrentInsights(stage) {
    const insights = [];
    
    if (stage === 'emerging') {
      insights.push({
        trend: "Short-form content dominance",
        impact: "TikTok and Instagram Reels are primary discovery channels",
        action: "Create vertical video content showcasing your music"
      });
    }
    
    insights.push({
      trend: "Direct fan relationships",
      impact: "Artists with strong fan connections are more resilient",
      action: "Prioritize email list building and direct fan engagement"
    });
    
    return insights;
  }

  // Suggest next steps based on query and context
  suggestNextSteps(query, stage, context) {
    const steps = [];
    
    // Always include stage-appropriate next steps
    const stageInfo = this.knowledge.artist_development.stages[stage];
    if (stageInfo) {
      steps.push({
        category: "Stage Development",
        actions: stageInfo.key_focus.slice(0, 3) // Top 3 focus areas
      });
    }
    
    // Add query-specific steps
    if (query.toLowerCase().includes('release')) {
      steps.push({
        category: "Release Strategy",
        actions: ["Finalize track selection", "Plan release timeline", "Prepare promotional materials"]
      });
    }
    
    return steps;
  }

  // Get relevant revenue streams for stage
  getRelevantRevenueStreams(stage) {
    const allStreams = this.knowledge.revenue_streams;
    
    switch (stage) {
      case 'emerging':
        return {
          streaming: allStreams.streaming,
          live_performance: {
            ...allStreams.live_performance,
            focus: "house_concerts and coffee_shops"
          },
          merchandise: {
            ...allStreams.merchandise,
            recommended: ["T-shirts", "Stickers", "Digital downloads"]
          }
        };
      case 'developing':
        return allStreams; // All revenue streams relevant
      case 'established':
        return {
          ...allStreams,
          additional_focus: "sync_licensing and diversified_investments"
        };
      default:
        return allStreams;
    }
  }

  // Get appropriate team members for stage
  getAppropriateTeamMembers(stage) {
    const allRoles = this.knowledge.team_building.essential_roles;
    
    switch (stage) {
      case 'emerging':
        return {
          priority: "Handle most things yourself initially",
          consider: "Manager when opportunities exceed capacity",
          avoid: "Hiring too early before revenue justifies cost"
        };
      case 'developing':
        return {
          priority: ["manager", "booking_agent"],
          roles: {
            manager: allRoles.manager,
            booking_agent: allRoles.booking_agent
          }
        };
      case 'established':
        return {
          full_team: allRoles,
          additional: "Consider specialized roles like brand manager"
        };
      default:
        return allRoles;
    }
  }

  // Get marketing strategies by campaign type
  getMarketingStrategies(campaignType) {
    const strategies = {
      release_campaign: {
        pre_release: ["Tease content", "Build anticipation", "Secure playlist placements"],
        release_day: ["Coordinate social posts", "Engage with fans", "Monitor performance"],
        post_release: ["Analyze results", "Continue promotion", "Plan follow-up content"]
      },
      tour_promotion: {
        early_phase: ["Announce dates", "Create event pages", "Reach out to local media"],
        mid_phase: ["Ramp up social content", "Partner with venues", "Offer presales"],
        final_push: ["Daily reminders", "Last-minute promotions", "Create FOMO"]
      },
      general: {
        content_marketing: "Regular, valuable content that showcases personality",
        community_building: "Engage authentically with fans and other artists",
        strategic_partnerships: "Collaborate with complementary artists and brands"
      }
    };
    
    return strategies[campaignType] || strategies.general;
  }

  // Get campaign templates
  getCampaignTemplates(campaignType) {
    // This would contain specific templates for different campaign types
    return {
      social_posts: `Template for ${campaignType} social posts`,
      email_sequences: `Email template for ${campaignType}`,
      press_outreach: `Press kit template for ${campaignType}`
    };
  }

  // Get marketing metrics
  getMarketingMetrics(campaignType) {
    const metrics = {
      release_campaign: ["Streams", "Playlist adds", "Social engagement", "Email opens"],
      tour_promotion: ["Ticket sales", "Event attendance", "Local media coverage"],
      general: ["Follower growth", "Engagement rate", "Email list growth", "Website traffic"]
    };
    
    return metrics[campaignType] || metrics.general;
  }

  // Search functionality for knowledge base
  search(query, agentId = 'indii_agent', options = {}) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    // Search through all knowledge categories
    this.searchInObject(this.knowledge, searchTerm, results, []);
    
    // Format results for specific agent
    return {
      query: query,
      agent_id: agentId,
      results: results.slice(0, options.limit || 10),
      total_found: results.length,
      formatted_response: this.getKnowledgeForAgent(agentId, query, options.context || {})
    };
  }

  // Helper method to search through nested objects
  searchInObject(obj, searchTerm, results, path) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      
      if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
        results.push({
          path: currentPath.join('.'),
          content: value,
          relevance: this.calculateRelevance(value, searchTerm)
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && item.toLowerCase().includes(searchTerm)) {
            results.push({
              path: `${currentPath.join('.')}[${index}]`,
              content: item,
              relevance: this.calculateRelevance(item, searchTerm)
            });
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        this.searchInObject(value, searchTerm, results, currentPath);
      }
    }
  }

  // Calculate relevance score for search results
  calculateRelevance(content, searchTerm) {
    const contentLower = content.toLowerCase();
    const termLower = searchTerm.toLowerCase();
    
    // Simple relevance scoring
    let score = 0;
    if (contentLower.includes(termLower)) score += 10;
    if (contentLower.startsWith(termLower)) score += 5;
    if (contentLower.endsWith(termLower)) score += 3;
    
    // Boost score for exact matches
    if (contentLower === termLower) score += 20;
    
    return score;
  }
}

// Export singleton instance
export const musicIndustryKB = new MusicIndustryKB();
export default musicIndustryKB;

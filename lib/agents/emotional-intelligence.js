import { getMemoryManager } from '../../src/lib/memory';

const memory = getMemoryManager();

const EMOTIONAL_PATTERNS = {
  frustration: {
    keywords: ['frustrated', 'annoying', 'difficult', 'stuck', 'struggling'],
    responses: {
      acknowledgment: "I hear how frustrated you are with {{topic}}. It's a challenging situation.",
      support: "Let's break this down together and find a way forward.",
      action: "First, let's identify what's specifically causing this frustration.",
    }
  },
  anxiety: {
    keywords: ['worried', 'anxious', 'scared', 'nervous', 'stressed'],
    responses: {
      acknowledgment: "I understand that {{topic}} is causing you anxiety. That's completely natural.",
      support: "You don't have to face this alone - I'm here to help you navigate this.",
      action: "Let's create a clear plan to address your concerns one step at a time.",
    }
  },
  excitement: {
    keywords: ['excited', 'happy', 'thrilled', 'great', 'amazing'],
    responses: {
      acknowledgment: "I can feel your excitement about {{topic}}! It's fantastic to see you so energized.",
      support: "Let's channel this positive energy into making the most of this opportunity.",
      action: "I'd love to help you build on this momentum.",
    }
  },
  uncertainty: {
    keywords: ['unsure', 'confused', 'maybe', 'don\'t know', 'unclear'],
    responses: {
      acknowledgment: "It's okay to feel uncertain about {{topic}}. The music industry can be complex.",
      support: "I'm here to help you gain clarity and make informed decisions.",
      action: "Let's explore your options together and find the best path forward.",
    }
  },
  disappointment: {
    keywords: ['disappointed', 'sad', 'upset', 'let down', 'failed'],
    responses: {
      acknowledgment: "I'm sorry to hear about your disappointment with {{topic}}. It's tough when things don't go as planned.",
      support: "Remember that setbacks are a normal part of any music career. What matters is how we move forward.",
      action: "Let's learn from this experience and adjust our approach.",
    }
  }
};

export async function analyzeEmotionalState(input, sessionId) {
  // Get emotional history from memory
  const emotionalState = await memory.getContext(
    sessionId,
    'indii',
    'emotional_state'
  ) || { history: [] };

  // Detect current emotion
  const currentEmotion = detectEmotion(input);
  
  // Update emotional state
  const updatedState = {
    current: currentEmotion,
    previous: emotionalState.current,
    history: [
      ...emotionalState.history,
      {
        emotion: currentEmotion,
        timestamp: new Date(),
        trigger: input
      }
    ].slice(-10) // Keep last 10 emotional states
  };

  // Persist updated state
  await memory.updateContext(
    sessionId,
    'indii',
    'emotional_state',
    updatedState,
    { persistent: true }
  );

  return {
    current: currentEmotion,
    history: updatedState.history,
    trending: analyzeEmotionalTrend(updatedState.history)
  };
}

export function generateEmpatheticResponse(emotion, topic, context = {}) {
  const pattern = EMOTIONAL_PATTERNS[emotion] || EMOTIONAL_PATTERNS.uncertainty;
  
  // Replace placeholders in response templates
  const responses = {
    acknowledgment: replacePlaceholders(pattern.responses.acknowledgment, { topic }),
    support: replacePlaceholders(pattern.responses.support, { topic }),
    action: replacePlaceholders(pattern.responses.action, { topic })
  };

  // Add context-specific additions
  if (context.careerStage) {
    responses.perspective = generateStagePerspective(context.careerStage, emotion);
  }

  if (context.recentWins) {
    responses.encouragement = generateEncouragement(context.recentWins);
  }

  return formatEmpatheticResponse(responses);
}

function detectEmotion(input) {
  // Check each emotional pattern for matches
  for (const [emotion, pattern] of Object.entries(EMOTIONAL_PATTERNS)) {
    if (pattern.keywords.some(keyword => 
      input.toLowerCase().includes(keyword.toLowerCase())
    )) {
      return emotion;
    }
  }
  
  return 'neutral';
}

function analyzeEmotionalTrend(history) {
  if (history.length < 2) return 'stable';

  const recentEmotions = history.slice(-3);
  const emotionalValues = recentEmotions.map(h => getEmotionalValue(h.emotion));
  
  const trend = emotionalValues.reduce((a, b) => b - a);
  
  if (trend > 1) return 'improving';
  if (trend < -1) return 'declining';
  return 'stable';
}

function getEmotionalValue(emotion) {
  const values = {
    excitement: 2,
    neutral: 0,
    uncertainty: -0.5,
    frustration: -1,
    anxiety: -1,
    disappointment: -1.5
  };
  
  return values[emotion] || 0;
}

function replacePlaceholders(template, values) {
  return template.replace(/{{(\w+)}}/g, (match, key) => values[key] || match);
}

function generateStagePerspective(careerStage, emotion) {
  const perspectives = {
    emerging: {
      frustration: "Many emerging artists face similar challenges. It's part of building your foundation.",
      anxiety: "The early stages of a music career often bring uncertainty. That's where growth happens.",
      excitement: "This enthusiasm will help you stand out as you're establishing yourself.",
      uncertainty: "You're in a discovery phase - it's normal to have questions.",
      disappointment: "Early setbacks often lead to the most important lessons."
    },
    established: {
      frustration: "You've overcome challenges before. Let's approach this the same way.",
      anxiety: "Your track record shows you can handle this. Let's build on your experience.",
      excitement: "Your experience helps you recognize great opportunities. Trust that instinct.",
      uncertainty: "You have the skills to figure this out. Let's analyze it together.",
      disappointment: "You know how to bounce back. Let's focus on solutions."
    },
    veteran: {
      frustration: "With your experience, you know challenges are temporary. Let's tackle this.",
      anxiety: "You've navigated countless situations like this. Trust your judgment.",
      excitement: "Your enthusiasm, combined with your experience, is a powerful combination.",
      uncertainty: "You have a wealth of experience to draw from. Let's leverage that.",
      disappointment: "Your resilience is one of your greatest strengths. Let's put it to work."
    }
  };

  return perspectives[careerStage]?.[emotion] || 
    "Your experience in the industry gives you a unique perspective on this.";
}

function generateEncouragement(recentWins) {
  if (!recentWins || recentWins.length === 0) {
    return "Every step forward counts, even the small ones.";
  }

  const win = recentWins[0];
  return `Remember your recent success with ${win.description}. That same determination will help you here.`;
}

function formatEmpatheticResponse(responses) {
  return Object.values(responses)
    .filter(Boolean)
    .join('\n\n');
}

// Export emotion pattern keywords for use in input analysis
export const emotionalKeywords = Object.entries(EMOTIONAL_PATTERNS)
  .reduce((acc, [emotion, pattern]) => {
    acc[emotion] = pattern.keywords;
    return acc;
  }, {});

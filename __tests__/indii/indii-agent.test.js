import IndiiAgent from '../../lib/agents/indii-agent';
import { PrismaClient } from '@prisma/client';
import { KNOWLEDGE_BASE, searchKnowledge } from '../../src/lib/knowledge-base';

// Mock dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    artistProfile: {
      findUnique: jest.fn()
    }
  }))
}));

jest.mock('../../src/lib/knowledge-base', () => ({
  KNOWLEDGE_BASE: {},
  searchKnowledge: jest.fn()
}));

// Mock memory system
jest.mock('../../src/lib/memory', () => ({
  getMemoryManager: jest.fn(() => ({
    storeContext: jest.fn(),
    retrieveContext: jest.fn(),
    updateSessionContext: jest.fn()
  }))
}));

// Mock semantic chunker
jest.mock('../../src/lib/memory/semantic-chunker', () => ({
  SemanticChunker: jest.fn().mockImplementation(() => ({
    chunkText: jest.fn(),
    generateEmbeddings: jest.fn()
  }))
}));

// Mock environment variables
process.env.GOOGLE_GEMINI_API_KEY = 'mock-api-key-for-testing';

describe('IndiiAgent', () => {
  let agent;
  let mockPrisma;
  let mockFindUnique;

  beforeEach(() => {
    mockFindUnique = jest.fn();
    PrismaClient.mockImplementation(() => ({
      artistProfile: {
        findUnique: mockFindUnique
      }
    }));
    mockPrisma = new PrismaClient();
    agent = new IndiiAgent(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Core Initialization', () => {
    test('should instantiate with correct initial state', () => {
      expect(agent.knowledgeBase).toBeDefined();
      expect(agent.currentContext).toBeNull();
      expect(agent.conversationHistory).toEqual([]);
    });

    test('should initialize session with artist data', async () => {
      const mockArtist = {
        id: 'test-id',
        name: 'Test Artist',
        tracks: [],
        projects: [],
        analytics: []
      };

      mockFindUnique.mockResolvedValue(mockArtist);

      const context = await agent.initializeSession('test-id');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          tracks: true,
          projects: true,
          analytics: true
        }
      });
      expect(context.artist).toEqual(mockArtist);
    });
  });

  describe('Response Generation', () => {
    test('should analyze input correctly', async () => {
      const careerInput = 'I need advice about my music career';
const emotionalInput = 'I\'m feeling stressed about my upcoming release';
      const strategyInput = 'Help me plan my album launch';
      const technicalInput = 'How to set up my home studio';
      const generalInput = 'Tell me about music';

      expect((await agent.analyzeInput(careerInput)).type).toBe('career_advice');
      expect((await agent.analyzeInput(emotionalInput)).type).toBe('emotional_support');
      expect((await agent.analyzeInput(strategyInput)).type).toBe('strategic_planning');
      expect((await agent.analyzeInput(technicalInput)).type).toBe('technical_guidance');
      expect((await agent.analyzeInput(generalInput)).type).toBe('general');
    });

    test('should generate response with proper context updates', async () => {
      const input = 'How can I improve my songwriting?';
      const mockContext = {
        artist: { id: 'test-id', name: 'Test Artist' },
        careerStage: 'emerging'
      };

      searchKnowledge.mockReturnValue(['some relevant knowledge']);

      const response = await agent.generateResponse(input, mockContext);

      expect(agent.conversationHistory).toHaveLength(2); // Input and response
      expect(agent.conversationHistory[0]).toEqual({
        role: 'user',
        content: input,
        timestamp: expect.any(Date)
      });
      expect(agent.conversationHistory[1]).toEqual({
        role: 'assistant',
        content: response,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Context Management', () => {
    test('should update context after response generation', async () => {
      const input = 'Tell me about my progress';
      const response = 'Here\'s your progress analysis...';
      
      await agent.updateContext(input, response);

      expect(agent.currentContext?.lastInteraction).toEqual({
        input,
        response,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('Response Formatting', () => {
    test('should format response components correctly', () => {
      const components = {
        empathy: 'I understand your situation',
        insight: 'Based on industry trends',
        action: 'Here are the next steps',
        support: 'I\'m here to help'
      };

      const formatted = agent.formatResponse(components);
      expect(formatted.split('\n\n')).toHaveLength(4);
      expect(formatted).toContain(components.empathy);
      expect(formatted).toContain(components.insight);
    });
  });
});

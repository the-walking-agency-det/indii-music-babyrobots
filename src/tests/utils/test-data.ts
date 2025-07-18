import { mockCrypto } from '../mocks/crypto';

export interface Memory {
  id?: string;
  content: string;
  level: number;
  importance: number;
  context: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VectorDocument {
  id?: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Agent {
  id?: string;
  name: string;
  metadata: Record<string, any>;
  lastActive?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id?: string;
  agentId: string;
  status: string;
  data: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Test data factories
 */
export const testData = {
  /**
   * Create a memory for testing
   */
  createMemory: (
    content: string,
    level = 0,
    importance = 0.5,
    context: string[] = ['test']
  ): Memory => ({
    id: mockCrypto.randomUUID(),
    content,
    level,
    importance,
    context,
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  /**
   * Create a document for testing
   */
  createDocument: (
    content: string,
    metadata: Record<string, any> = {}
  ): VectorDocument => ({
    id: mockCrypto.randomUUID(),
    content,
    metadata: { type: 'test', ...metadata },
    embedding: Array(1536).fill(0), // Default OpenAI embedding size
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  /**
   * Create an agent for testing
   */
  createAgent: (
    name: string,
    metadata: Record<string, any> = {}
  ): Agent => ({
    id: mockCrypto.randomUUID(),
    name,
    metadata,
    lastActive: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  /**
   * Create a task for testing
   */
  createTask: (
    agentId: string,
    status = 'pending',
    data: Record<string, any> = {}
  ): Task => ({
    id: mockCrypto.randomUUID(),
    agentId,
    status,
    data,
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

/**
 * Tests for the test data factories
 */
if (process.env.NODE_ENV === 'test') {
  describe('Test Data Factories', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      const now = new Date(2025, 0, 1);
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('createMemory', () => {
      it('should create a valid memory', () => {
        const memory = testData.createMemory('test content');
        
        expect(memory).toEqual({
          id: expect.any(String),
          content: 'test content',
          level: 0,
          importance: 0.5,
          context: ['test'],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
      });

      it('should use provided values', () => {
        const memory = testData.createMemory(
          'custom content',
          2,
          0.8,
          ['custom']
        );
        
        expect(memory.content).toBe('custom content');
        expect(memory.level).toBe(2);
        expect(memory.importance).toBe(0.8);
        expect(memory.context).toEqual(['custom']);
      });
    });

    describe('createDocument', () => {
      it('should create a valid document', () => {
        const doc = testData.createDocument('test content');
        
        expect(doc).toEqual({
          id: expect.any(String),
          content: 'test content',
          metadata: { type: 'test' },
          embedding: expect.any(Array),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
        
        expect(doc.embedding.length).toBe(1536);
      });

      it('should merge custom metadata', () => {
        const doc = testData.createDocument('test', {
          importance: 0.8,
          tags: ['test']
        });
        
        expect(doc.metadata).toEqual({
          type: 'test',
          importance: 0.8,
          tags: ['test']
        });
      });
    });

    describe('createAgent', () => {
      it('should create a valid agent', () => {
        const agent = testData.createAgent('test-agent');
        
        expect(agent).toEqual({
          id: expect.any(String),
          name: 'test-agent',
          metadata: {},
          lastActive: expect.any(Date),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
      });
    });

    describe('createTask', () => {
      it('should create a valid task', () => {
        const task = testData.createTask('agent-123');
        
        expect(task).toEqual({
          id: expect.any(String),
          agentId: 'agent-123',
          status: 'pending',
          data: {},
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
      });

      it('should use provided status and data', () => {
        const task = testData.createTask(
          'agent-123',
          'completed',
          { result: 'success' }
        );
        
        expect(task.status).toBe('completed');
        expect(task.data).toEqual({ result: 'success' });
      });
    });
  });
}

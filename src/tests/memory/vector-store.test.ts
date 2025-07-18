import { describe, it, beforeEach, expect } from 'vitest';
import { VectorStore } from '../../lib/memory/vector-store';
import { TestDatabaseAdapter } from '../utils/test-db-adapter';

describe('VectorStore Tests', () => {
  let db: TestDatabaseAdapter;
  let vectorStore: VectorStore;

  beforeEach(async () => {
    db = await TestDatabaseAdapter.getInstance();
    await db.reset();
    vectorStore = new VectorStore({
      adapter: db,
      namespace: 'test'
    });
  });

  describe('Document Storage', () => {
    it('should store and retrieve documents', async () => {
      const content = 'Test document content';
      const metadata = { type: 'test', importance: 0.8 };

      const docId = await vectorStore.addDocument(content, metadata);
      expect(docId).toBeDefined();

      const results = await vectorStore.search('test document');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toBe(content);
      expect(results[0].metadata).toMatchObject(metadata);
    });

    it('should handle batch document operations', async () => {
      const docs = [
        { content: 'Document 1', metadata: { type: 'test1' } },
        { content: 'Document 2', metadata: { type: 'test2' } },
        { content: 'Document 3', metadata: { type: 'test3' } }
      ];

      const docIds = await vectorStore.addDocuments(docs);
      expect(docIds).toHaveLength(docs.length);
      
      const results = await vectorStore.search('document');
      expect(results).toHaveLength(docs.length);
      
      const contentMap = new Map(results.map(d => [d.content, d]));
      docs.forEach(doc => {
        const stored = contentMap.get(doc.content);
        expect(stored).toBeDefined();
        expect(stored!.metadata).toEqual(doc.metadata);
      });
    });
  });

  describe('Search Operations', () => {
    it('should search by similarity', async () => {
      const docs = [
        {
          content: 'Project planning meeting notes',
          metadata: { type: 'meeting', topic: 'planning' }
        },
        {
          content: 'Technical design document',
          metadata: { type: 'document', topic: 'design' }
        },
        {
          content: 'Project timeline discussion',
          metadata: { type: 'meeting', topic: 'timeline' }
        }
      ];

      await vectorStore.addDocuments(docs);

      const results = await vectorStore.search('project planning', { limit: 2 });
      expect(results).toHaveLength(2);
      expect(results[0].content).toBe('Project planning meeting notes');
      expect(results[1].content).toBe('Project timeline discussion');
    });

    it('should filter search results by metadata', async () => {
      const docs = [
        {
          content: 'Meeting notes A',
          metadata: { type: 'meeting', project: 'A' }
        },
        {
          content: 'Meeting notes B',
          metadata: { type: 'meeting', project: 'B' }
        },
        {
          content: 'Design doc A',
          metadata: { type: 'document', project: 'A' }
        }
      ];

      await vectorStore.addDocuments(docs);

      const results = await vectorStore.search(
        'meeting',
        {
          filter: { project: 'A' },
          limit: 10
        }
      );

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Meeting notes A');
    });
  });

  describe('Document Management', () => {
    it('should update existing documents', async () => {
      const content = 'Original content';
      const metadata = { version: 1 };

      const docId = await vectorStore.addDocument(content, metadata);
      await vectorStore.updateDocument(docId, {
        content: 'Updated content',
        metadata: { version: 2 }
      });
      
      const results = await vectorStore.search('updated');
      expect(results[0].content).toBe('Updated content');
      expect(results[0].metadata.version).toBe(2);
    });

    it('should delete documents', async () => {
      const docId = await vectorStore.addDocument('Test content', { type: 'test' });
      await vectorStore.deleteDocument(docId);

      const results = await vectorStore.search('test');
      expect(results).toHaveLength(0);
    });

    it('should handle namespaced operations', async () => {
      const store1 = new VectorStore({ adapter: db, namespace: 'ns1' });
      const store2 = new VectorStore({ adapter: db, namespace: 'ns2' });

      await store1.addDocument('Content 1', { ns: 1 });
      await store2.addDocument('Content 2', { ns: 2 });

      const results1 = await store1.search('content');
      const results2 = await store2.search('content');

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
      expect(results1[0].content).toBe('Content 1');
      expect(results2[0].content).toBe('Content 2');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid document data', async () => {
      await expect(
        vectorStore.addDocument('', {})
      ).rejects.toThrow();

      await expect(
        vectorStore.addDocument('test', { invalid: undefined })
      ).rejects.toThrow();
    });

    it('should handle concurrent operations', async () => {
      const content = 'Test content';
      const docId = await vectorStore.addDocument(content, { version: 1 });

      // Try concurrent updates
      const updates = await Promise.allSettled([
        vectorStore.updateDocument(docId, {
          content: 'Update 1',
          metadata: { version: 2 }
        }),
        vectorStore.updateDocument(docId, {
          content: 'Update 2',
          metadata: { version: 3 }
        }),
        vectorStore.deleteDocument(docId)
      ]);

      // At least one operation should succeed
      const succeeded = updates.some(r => r.status === 'fulfilled');
      expect(succeeded).toBe(true);

      // Document should be in a consistent state
      const results = await vectorStore.search(content);
      if (results.length > 0) {
        expect(['Test content', 'Update 1', 'Update 2']).toContain(results[0].content);
      } else {
        // Document was successfully deleted
        expect(results).toHaveLength(0);
      }
    });
  });
});

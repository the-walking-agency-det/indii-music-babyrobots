// Crash Memory - Tree Ring Outer Layer
// Persistent memory storage with database backing
// Based on docs/memory_infra.md - Crash memory system

import sqlite3 from 'sqlite3';
import { TextSplitter, EmbeddingGenerator } from './semantic-utils.js';
sqlite3.verbose();

export class CrashMemory {
  constructor(options = {}) {
    this.db = new sqlite3.Database(options.database || ':memory:', (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      }
    });
    
    // Default query options for semantic search
    this.vectorSearchEnabled = options.vectorSearch || false;
    this.embeddingGenerator = new EmbeddingGenerator(options.apiKey); // Assuming API key is passed
    this.textSplitter = new TextSplitter();
    this.initialize();
  }

  // Initialize database tables
  initialize() {
    this.db.serialize(() => {
      // Create memory entries table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS memory_entries (
        id INTEGER PRIMARY KEY,
        session_id TEXT,
        agent_id TEXT,
        scope TEXT,
        access_level TEXT,
        content_type TEXT,
        content TEXT,
        chunk_content TEXT,
        embedding BLOB,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_crash BOOLEAN DEFAULT FALSE
        )
      `);

      // Add new columns if they don't exist (for existing databases)
      this.db.run(`
        PRAGMA table_info(memory_entries);
      `, (err, rows) => {
        const columns = rows.map(row => row.name);
        if (!columns.includes('chunk_content')) {
          this.db.run('ALTER TABLE memory_entries ADD COLUMN chunk_content TEXT;');
        }
        if (!columns.includes('embedding')) {
          this.db.run('ALTER TABLE memory_entries ADD COLUMN embedding BLOB;');
        }
      });

      // Create indexes for fast lookup
      this.db.run('CREATE INDEX IF NOT EXISTS idx_memory_session_agent ON memory_entries(session_id, agent_id);');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_memory_scope ON memory_entries(scope);');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_memory_created_at ON memory_entries(created_at);');
    });
  }

  // Save memory entry with semantic chunking and embedding
  async save(sessionId, agentId, scope, data, metadata = {}) {
    return new Promise(async (resolve, reject) => {
      const serializedData = JSON.stringify(data);
      const serializedMetadata = JSON.stringify(metadata);

      // Perform semantic chunking
      const chunks = this.textSplitter.splitText(serializedData);

      for (const chunk of chunks) {
        // Generate embedding for each chunk
        const embedding = await this.embeddingGenerator.generateEmbedding(chunk);
        const serializedEmbedding = embedding ? JSON.stringify(embedding) : null;

        const stmt = this.db.prepare(`
          INSERT INTO memory_entries 
          (session_id, agent_id, scope, content, chunk_content, embedding, metadata, is_crash, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, datetime('now'))
        `);

        stmt.run(sessionId, agentId, scope, serializedData, chunk, serializedEmbedding, serializedMetadata, function(err) {
          if (err) {
            console.error('Error saving memory chunk:', err.message);
            reject(err);
          } else {
            // Resolve for each chunk, or collect IDs and resolve once
            // For simplicity, resolving on first successful insert for now
            resolve(this.lastID); 
          }
        });

        stmt.finalize();
      }
    });
  }

  // Retrieve memory entries
  async retrieve(sessionId, agentId, scope, limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM memory_entries 
        WHERE session_id = ? 
        AND scope LIKE ? AND is_crash = TRUE
        ORDER BY created_at DESC LIMIT ?
      `, [sessionId, `${scope}%`, limit], (err, rows) => {
        if (err) {
          console.error('Error retrieving memory:', err.message);
          reject(err);
        } else {
          // Parse the JSON content and return the actual data
          if (rows.length > 0) {
            try {
              const latestRow = rows[0];
              const parsedContent = JSON.parse(latestRow.content);
              const parsedMetadata = JSON.parse(latestRow.metadata);
              const parsedEmbedding = latestRow.embedding ? JSON.parse(latestRow.embedding) : null;
              resolve({
                content: parsedContent,
                chunk_content: latestRow.chunk_content,
                embedding: parsedEmbedding,
                metadata: parsedMetadata,
                id: latestRow.id,
                created_at: latestRow.created_at
              });
            } catch (parseErr) {
              console.error('Error parsing stored content:', parseErr.message);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  // Semantic search using embeddings
  async search(query, sessionId, agentId, scope, limit = 10) {
    if (!this.vectorSearchEnabled) {
      console.warn('Vector search is disabled. Enable to use this feature.');
      return [];
    }

    return new Promise(async (resolve, reject) => {
      const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);
      if (!queryEmbedding) {
        return resolve([]);
      }

      this.db.all(`
        SELECT id, session_id, agent_id, scope, content, chunk_content, embedding, metadata, created_at
        FROM memory_entries
        WHERE session_id = ? AND scope LIKE ? AND is_crash = TRUE
      `, [sessionId, `${scope}%`], (err, rows) => {
        if (err) {
          console.error('Error during semantic search:', err.message);
          return reject(err);
        }

        const results = [];
        for (const row of rows) {
          try {
            const storedEmbedding = JSON.parse(row.embedding);
            const similarity = this._cosineSimilarity(queryEmbedding, storedEmbedding);
            results.push({
              id: row.id,
              sessionId: row.session_id,
              agentId: row.agent_id,
              scope: row.scope,
              content: JSON.parse(row.content),
              chunk_content: row.chunk_content,
              metadata: JSON.parse(row.metadata),
              created_at: row.created_at,
              similarity: similarity
            });
          } catch (parseErr) {
            console.error('Error parsing embedding or metadata:', parseErr.message);
          }
        }

        // Sort by similarity and limit results
        results.sort((a, b) => b.similarity - a.similarity);
        resolve(results.slice(0, limit));
      });
    });
  }

  // Helper for cosine similarity calculation
  _cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) return 0; // Avoid division by zero
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Cleanup expired entries - if implemented
  async cleanup() {
    const now = new Date().toISOString();
    this.db.run('DELETE FROM memory_entries WHERE expires_at < ?', [now]);
  }

  // Get all entries for specific scope
  async getByScope(sessionId, agentId, scope) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM memory_entries 
        WHERE session_id = ? AND agent_id = ? AND scope LIKE ? AND is_crash = TRUE
        ORDER BY created_at DESC
      `, [sessionId, agentId, `${scope}%`], (err, rows) => {
        if (err) {
          console.error('Error retrieving memory by scope:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Memory statistics
  async getStats() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) as count FROM memory_entries', [], (err, row) => {
        if (err) {
          console.error('Error getting stats:', err.message);
          reject(err);
        } else {
          resolve({ count: row.count });
        }
      });
    });
  }
} 
// Initialize a singleton for shared use
let crashMemory = new CrashMemory({ database: 'crash-memory.db' });
export const getCrashMemory = (options = {}) => {
  if (!crashMemory) {
    crashMemory = new CrashMemory(options);
  }
  return crashMemory;
};

export const initializeCrashMemory = (options = {}) => {
  crashMemory = new CrashMemory(options);
  return crashMemory;
};

// Class is already exported directly on line 8


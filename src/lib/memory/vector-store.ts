import { DatabaseAdapter } from '../db-adapter';

interface VectorStoreOptions {
  adapter: DatabaseAdapter;
  namespace?: string;
}

interface SearchOptions {
  limit?: number;
  filter?: Record<string, any>;
}

interface Document {
  id?: string;
  content: string;
  metadata: Record<string, any>;
}

export class VectorStore {
  private adapter: DatabaseAdapter;
  private namespace: string;

  constructor(options: VectorStoreOptions) {
    this.adapter = options.adapter;
    this.namespace = options.namespace || 'default';
  }

  async addDocument(content: string, metadata: Record<string, any>): Promise<string> {
    // Validate document content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Document content must be a non-empty string');
    }

    // Validate metadata
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Document metadata must be an object');
    }

    // Check for undefined values in metadata
    for (const [key, value] of Object.entries(metadata)) {
      if (value === undefined) {
        throw new Error(`Metadata field '${key}' cannot be undefined`);
      }
    }

    const id = this.adapter.generateId();
    const timestamp = new Date().toISOString();

    await this.adapter.run(
      `INSERT INTO vector_documents (id, content, metadata, namespace, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [id, content, JSON.stringify(metadata), this.namespace, timestamp]
    );

    return id;
  }

  async addDocuments(documents: Document[]): Promise<string[]> {
    const ids = [];
    for (const doc of documents) {
      ids.push(await this.addDocument(doc.content, doc.metadata));
    }
    return ids;
  }

  async updateDocument(id: string, updates: { content?: string; metadata?: Record<string, any> }): Promise<void> {
    const timestamp = new Date().toISOString();
    const sets = [];
    const params = [];

    if (updates.content !== undefined) {
      sets.push('content = ?');
      params.push(updates.content);
    }

    if (updates.metadata !== undefined) {
      sets.push('metadata = ?');
      params.push(JSON.stringify(updates.metadata));
    }

    sets.push('timestamp = ?');
    params.push(timestamp);
    params.push(id);
    params.push(this.namespace);

    await this.adapter.run(
      `UPDATE vector_documents
       SET ${sets.join(', ')}
       WHERE id = ? AND namespace = ?`,
      params
    );
  }

  async deleteDocument(id: string): Promise<void> {
    await this.adapter.run(
      'DELETE FROM vector_documents WHERE id = ? AND namespace = ?',
      [id, this.namespace]
    );
  }

  async search(query: string, options: SearchOptions = {}): Promise<Document[]> {
    const { limit = 10, filter } = options;
    const params: any[] = [this.namespace];
    let filterClause = '';

    // Split the query into words
    const searchWords = query.toLowerCase().split(/\s+/);
    params.push(...searchWords.map(word => `%${word}%`));

    if (filter) {
      const filterConditions = [];
      for (const [key, value] of Object.entries(filter)) {
        filterConditions.push(`json_extract(metadata, '$.${key}') = ?`);
        params.push(value);
      }
      if (filterConditions.length > 0) {
        filterClause = `AND ${filterConditions.join(' AND ')}`;
      }
    }

    // Create relevance scoring based on word matches
    const searchScores = searchWords
      .map(word => `(CASE WHEN LOWER(content) LIKE ? THEN 1 ELSE 0 END)`)
      .join(' + ');

    const results = await this.adapter.query<Document>(
      `SELECT id, content, metadata
       FROM vector_documents
       WHERE namespace = ?
       AND (${searchWords.map(() => 'LOWER(content) LIKE ?').join(' OR ')}) ${filterClause}
       ORDER BY (${searchScores}) DESC, timestamp DESC
       LIMIT ?`,
      [...params, limit]
    );

    return results.map(doc => ({
      ...doc,
      metadata: JSON.parse(doc.metadata as string)
    }));
  }

  async clearNamespace(): Promise<void> {
    await this.adapter.run(
      'DELETE FROM vector_documents WHERE namespace = ?',
      [this.namespace]
    );
  }
}

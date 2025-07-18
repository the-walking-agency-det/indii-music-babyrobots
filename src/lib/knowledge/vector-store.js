export class VectorStore {
  constructor() {
    this.vectors = new Map();
    this.metadata = new Map();
  }

  async store(id, vector, metadata = {}) {
    // Store the vector and its metadata
    this.vectors.set(id, vector);
    this.metadata.set(id, metadata);
    return true;
  }

  async retrieve(id) {
    const vector = this.vectors.get(id);
    const metadata = this.metadata.get(id);
    
    if (!vector) return null;
    
    return {
      id,
      vector,
      metadata
    };
  }

  async search(queryVector, k = 5) {
    const results = [];
    
    // Calculate cosine similarity with all stored vectors
    for (const [id, vector] of this.vectors.entries()) {
      const similarity = this.cosineSimilarity(queryVector, vector);
      results.push({
        id,
        similarity,
        vector,
        metadata: this.metadata.get(id)
      });
    }
    
    // Sort by similarity (descending) and return top k
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  async delete(id) {
    this.vectors.delete(id);
    this.metadata.delete(id);
    return true;
  }

  async clear() {
    this.vectors.clear();
    this.metadata.clear();
    return true;
  }

  // Helper: Calculate cosine similarity between two vectors
  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

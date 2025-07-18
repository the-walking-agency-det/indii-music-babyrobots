// src/lib/memory/semantic-utils.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Basic Text Splitter (can be enhanced with more sophisticated logic)
export class TextSplitter {
  constructor(chunkSize = 500, chunkOverlap = 50) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  splitText(text) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      const end = Math.min(i + this.chunkSize, text.length);
      let chunk = text.substring(i, end);

      // Adjust chunk to end at a natural break (e.g., sentence, paragraph)
      if (end < text.length) {
        const lastSpace = chunk.lastIndexOf(' ');
        if (lastSpace > this.chunkSize * 0.8) { // If space is near end of chunk
          chunk = chunk.substring(0, lastSpace);
        }
      }
      chunks.push(chunk);
      i += (this.chunkSize - this.chunkOverlap);
    }
    return chunks;
  }
}

// Embedding Generator using Google Generative AI
export class EmbeddingGenerator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("API Key is required for EmbeddingGenerator");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "embedding-001"});
  }

  async generateEmbedding(text) {
    try {
      const result = await this.model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error("Error generating embedding:", error);
      return null;
    }
  }
}

import { encode } from 'gpt-3-encoder';

interface Chunk {
  text: string;
  tokens: number;
  embedding?: number[];
}

export class SemanticChunker {
  private maxTokens: number;
  private overlapTokens: number;

  constructor(maxTokens = 512, overlapTokens = 50) {
    this.maxTokens = maxTokens;
    this.overlapTokens = overlapTokens;
  }

  /**
   * Chunks text into semantic units respecting token limits
   */
  chunk(text: string): Chunk[] {
    const tokens = encode(text);
    const chunks: Chunk[] = [];
    
    let currentChunk: number[] = [];
    let currentTokens = 0;

    for (let i = 0; i < tokens.length; i++) {
      currentChunk.push(tokens[i]);
      currentTokens++;

      // Check if we've hit the max tokens or end of text
      if (currentTokens >= this.maxTokens || i === tokens.length - 1) {
        // Find a good break point
        const breakPoint = this.findBreakPoint(currentChunk);
        
        // Create the chunk
        const chunkTokens = currentChunk.slice(0, breakPoint);
        chunks.push({
          text: decode(chunkTokens),
          tokens: chunkTokens.length
        });

        // Start new chunk with overlap
        const overlapStart = Math.max(0, breakPoint - this.overlapTokens);
        currentChunk = currentChunk.slice(overlapStart);
        currentTokens = currentChunk.length;
      }
    }

    return chunks;
  }

  /**
   * Finds an appropriate break point in the tokens (sentence or paragraph boundary)
   */
  private findBreakPoint(tokens: number[]): number {
    // Convert tokens back to text to find natural breaks
    const text = decode(tokens);
    
    // Try to break at paragraph
    const paragraphBreak = text.lastIndexOf('\n\n');
    if (paragraphBreak > 0 && paragraphBreak < text.length - 20) {
      return encode(text.slice(0, paragraphBreak)).length;
    }

    // Try to break at sentence
    const sentenceBreak = text.match(/[.!?]\s+/g)?.pop()?.index;
    if (sentenceBreak && sentenceBreak < text.length - 20) {
      return encode(text.slice(0, sentenceBreak + 1)).length;
    }

    // Fall back to token limit
    return tokens.length;
  }

  /**
   * Embeds chunks using specified embedding model
   */
  async embedChunks(chunks: Chunk[], embedFn: (text: string) => Promise<number[]>): Promise<Chunk[]> {
    const embeddedChunks = await Promise.all(
      chunks.map(async chunk => ({
        ...chunk,
        embedding: await embedFn(chunk.text)
      }))
    );

    return embeddedChunks;
  }

  /**
   * Merges small chunks to optimize token usage
   */
  mergeChunks(chunks: Chunk[], minTokens = 256): Chunk[] {
    const merged: Chunk[] = [];
    let current: Chunk | null = null;

    for (const chunk of chunks) {
      if (!current || current.tokens + chunk.tokens > this.maxTokens) {
        if (current) merged.push(current);
        current = {...chunk};
      } else {
        current.text += ' ' + chunk.text;
        current.tokens += chunk.tokens;
      }
    }

    if (current) merged.push(current);
    return merged;
  }
}

// Helper function to decode tokens back to text
function decode(tokens: number[]): string {
  // This is a simplified version - in practice you'd want to use the actual GPT tokenizer's decode
  return tokens.map(t => String.fromCharCode(t)).join('');
}

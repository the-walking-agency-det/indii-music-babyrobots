import { Prisma } from '@prisma/client';

export interface MemoryStore {
  id: string;
  level: number;
  importance: number;
  context: string[];
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  name: string;
  metadata: Record<string, any>;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  agentId: string;
  status: string;
  priority: number;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockStore<T> {
  get(id: string): T | undefined;
  set(id: string, value: T): void;
  delete(id: string): boolean;
  clear(): void;
  values(): IterableIterator<T>;
  entries(): IterableIterator<[string, T]>;
}

export class TypedMap<T> implements MockStore<T> {
  private store = new Map<string, T>();

  get(id: string): T | undefined {
    return this.store.get(id);
  }

  set(id: string, value: T): void {
    this.store.set(id, value);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  clear(): void {
    this.store.clear();
  }

  values(): IterableIterator<T> {
    return this.store.values();
  }

  entries(): IterableIterator<[string, T]> {
    return this.store.entries();
  }
}

export type PrismaMockQueryParams = {
  where?: Record<string, any>;
  data?: Record<string, any>;
  update?: Record<string, any>;
  create?: Record<string, any>;
  take?: number;
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
};

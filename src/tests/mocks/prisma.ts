import { mockCrypto } from './crypto';
import { 
  MemoryStore,
  VectorDocument,
  Agent,
  Task,
  TypedMap,
  PrismaMockQueryParams
} from './prisma.types';

export class MockPrismaClient {
  private memoryStore = new TypedMap<MemoryStore>();
  private vectorStore = new TypedMap<VectorDocument>();
  private agentStore = new TypedMap<Agent>();
  private taskStore = new TypedMap<Task>();

  memory = {
    create: async (data: any) => {
      const id = data.data.id || crypto.randomUUID();
      this.memoryStore.set(id, { id, ...data.data });
      return this.memoryStore.get(id);
    },
    findMany: async (query: any) => {
      return Array.from(this.memoryStore.values()).filter(item => {
        if (query.where?.context?.hasSome) {
          return query.where.context.hasSome.some((tag: string) => 
            item.context.includes(tag)
          );
        }
        if (query.where?.level !== undefined) {
          return item.level === query.where.level;
        }
        return true;
      });
    },
    update: async (query: any) => {
      const item = this.memoryStore.get(query.where.id);
      if (!item) throw new Error('Memory not found');
      const updated = { ...item, ...query.data };
      this.memoryStore.set(query.where.id, updated);
      return updated;
    },
    deleteMany: async (query: any) => {
      let count = 0;
      for (const [id, item] of this.memoryStore) {
        if (query.where?.AND) {
          const matches = query.where.AND.every((condition: any) => {
            if (condition.level) {
              return item.level > condition.level.gt;
            }
            if (condition.importance) {
              return item.importance < condition.importance.lt;
            }
            return true;
          });
          if (matches) {
            this.memoryStore.delete(id);
            count++;
          }
        }
      }
      return { count };
    }
  };

  vectorDocument = {
    create: async (data: any) => {
      const id = data.data.id || crypto.randomUUID();
      this.vectorStore.set(id, { id, ...data.data });
      return this.vectorStore.get(id);
    },
    findMany: async (query: any) => {
      let results = Array.from(this.vectorStore.values());
      if (query.where?.metadata?.path) {
        results = results.filter(item => 
          item.metadata[query.where.metadata.path[0]] === query.where.metadata.equals
        );
      }
      if (query.take) {
        results = results.slice(0, query.take);
      }
      return results;
    },
    deleteMany: async (query: any) => {
      if (!query.where) {
        this.vectorStore.clear();
        return { count: 0 };
      }
      let count = 0;
      for (const [id, item] of this.vectorStore) {
        if (query.where.metadata?.path) {
          if (item.metadata[query.where.metadata.path[0]] === query.where.metadata.equals) {
            this.vectorStore.delete(id);
            count++;
          }
        }
      }
      return { count };
    },
    updateMany: async (query: any) => {
      let count = 0;
      for (const [id, item] of this.vectorStore) {
        if (query.where.metadata?.path) {
          if (item.metadata[query.where.metadata.path[0]] === query.where.metadata.equals) {
            this.vectorStore.set(id, { ...item, ...query.data });
            count++;
          }
        }
      }
      return { count };
    }
  };

  agent = {
    upsert: async (data: any) => {
      const existingAgent = this.agentStore.get(data.where.name);
      if (existingAgent) {
        const updated = { ...existingAgent, ...data.update };
        this.agentStore.set(data.where.name, updated);
        return updated;
      }
      this.agentStore.set(data.where.name, data.create);
      return data.create;
    },
    update: async (data: any) => {
      const agent = this.agentStore.get(data.where.name);
      if (!agent) throw new Error('Agent not found');
      const updated = { ...agent, ...data.data };
      this.agentStore.set(data.where.name, updated);
      return updated;
    }
  };

  task = {
    create: async (data: any) => {
      const id = data.data.id || crypto.randomUUID();
      this.taskStore.set(id, { id, ...data.data });
      return this.taskStore.get(id);
    },
    update: async (data: any) => {
      const task = this.taskStore.get(data.where.id);
      if (!task) throw new Error('Task not found');
      const updated = { ...task, ...data.data };
      this.taskStore.set(data.where.id, updated);
      return updated;
    },
    findMany: async (query: any) => {
      return Array.from(this.taskStore.values()).filter(task => {
        if (query.where?.agentId && query.where?.status) {
          return task.agentId === query.where.agentId && 
                 task.status === query.where.status;
        }
        return true;
      });
    }
  };

  clear() {
    this.memoryStore.clear();
    this.vectorStore.clear();
    this.agentStore.clear();
    this.taskStore.clear();
  }
}

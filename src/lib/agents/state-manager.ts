import { PrismaClient } from '@prisma/client';
import { TreeRingsMemory } from '../memory/tree-rings';

export interface AgentState {
  id: string;
  agentId: string;
  name: string;
  data: any;
  timestamp: Date;
  version: number;
}

export class StateManager {
  private static instance: StateManager;
  private prisma: PrismaClient;
  private memory: TreeRingsMemory;
  private stateCache: Map<string, AgentState>;

  private constructor() {
    this.prisma = new PrismaClient();
    this.memory = new TreeRingsMemory();
    this.stateCache = new Map();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  /**
   * Save agent state
   */
  async saveState(agentId: string, name: string, data: any): Promise<void> {
    const timestamp = new Date();
    const currentState = this.stateCache.get(`${agentId}:${name}`);
    const version = (currentState?.version || 0) + 1;

    const state: AgentState = {
      id: `${agentId}:${name}:${version}`,
      agentId,
      name,
      data,
      timestamp,
      version
    };

    // Store in database
    await this.prisma.agentState.create({
      data: {
        id: state.id,
        agentId: state.agentId,
        name: state.name,
        data: state.data,
        timestamp: state.timestamp,
        version: state.version
      }
    });

    // Store in memory system
    await this.memory.store(
      state,
      ['state', agentId, name],
      0.7  // High importance for state
    );

    // Update cache
    this.stateCache.set(`${agentId}:${name}`, state);
  }

  /**
   * Load agent state
   */
  async loadState(agentId: string, name: string): Promise<any> {
    // Check cache first
    const cachedState = this.stateCache.get(`${agentId}:${name}`);
    if (cachedState) {
      return cachedState.data;
    }

    // Query database for latest state
    const state = await this.prisma.agentState.findFirst({
      where: {
        agentId,
        name
      },
      orderBy: {
        version: 'desc'
      }
    });

    if (state) {
      this.stateCache.set(`${agentId}:${name}`, state);
      return state.data;
    }

    return null;
  }

  /**
   * Get state history
   */
  async getStateHistory(agentId: string, name: string): Promise<AgentState[]> {
    return await this.prisma.agentState.findMany({
      where: {
        agentId,
        name
      },
      orderBy: {
        version: 'desc'
      }
    });
  }

  /**
   * Rollback state to specific version
   */
  async rollbackState(agentId: string, name: string, version: number): Promise<void> {
    const targetState = await this.prisma.agentState.findFirst({
      where: {
        agentId,
        name,
        version
      }
    });

    if (targetState) {
      await this.saveState(agentId, name, targetState.data);
    }
  }

  /**
   * Delete state
   */
  async deleteState(agentId: string, name: string): Promise<void> {
    await this.prisma.agentState.deleteMany({
      where: {
        agentId,
        name
      }
    });

    this.stateCache.delete(`${agentId}:${name}`);
  }

  /**
   * Clear state cache
   */
  clearCache(): void {
    this.stateCache.clear();
  }

  /**
   * Get all states for an agent
   */
  async getAllStates(agentId: string): Promise<Map<string, any>> {
    const states = await this.prisma.agentState.findMany({
      where: {
        agentId
      },
      orderBy: {
        version: 'desc'
      },
      distinct: ['name']
    });

    const stateMap = new Map();
    for (const state of states) {
      stateMap.set(state.name, state.data);
    }

    return stateMap;
  }

  /**
   * Watch state changes
   */
  async watchState(agentId: string, name: string, callback: (state: AgentState) => void): Promise<() => void> {
    const eventName = `stateChange:${agentId}:${name}`;
    
    // Set up watcher
    const unsubscribe = this.memory.on(eventName, callback);

    // Return cleanup function
    return () => {
      unsubscribe();
    };
  }

  /**
   * Merge states
   */
  async mergeStates(agentId: string, name: string, newData: any): Promise<void> {
    const currentState = await this.loadState(agentId, name);
    const mergedData = {
      ...(currentState || {}),
      ...newData
    };

    await this.saveState(agentId, name, mergedData);
  }

  /**
   * Check if state exists
   */
  async hasState(agentId: string, name: string): Promise<boolean> {
    return this.stateCache.has(`${agentId}:${name}`) || 
           !!(await this.prisma.agentState.findFirst({
             where: {
               agentId,
               name
             }
           }));
  }

  /**
   * Get state metadata
   */
  async getStateMetadata(agentId: string, name: string): Promise<{
    lastUpdated: Date;
    version: number;
    size: number;
  } | null> {
    const state = await this.prisma.agentState.findFirst({
      where: {
        agentId,
        name
      },
      orderBy: {
        version: 'desc'
      }
    });

    if (!state) return null;

    return {
      lastUpdated: state.timestamp,
      version: state.version,
      size: JSON.stringify(state.data).length
    };
  }
}

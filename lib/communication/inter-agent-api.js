// lib/communication/inter-agent-api.js
export class InterAgentAPI {
  constructor() {
    this.agents = new Map();
    this.messageQueue = [];
    this.routingTable = new Map();
  }

  registerAgent(agentId, agent, capabilities) {
    this.agents.set(agentId, {
      agent,
      capabilities,
      status: 'active',
      lastSeen: Date.now()
    });
    
    // Update routing table
    capabilities.forEach(capability => {
      if (!this.routingTable.has(capability)) {
        this.routingTable.set(capability, []);
      }
      this.routingTable.get(capability).push(agentId);
    });
  }

  async sendMessage(fromAgent, toAgent, message) {
    const recipient = this.agents.get(toAgent);
    if (!recipient) {
      throw new Error(`Agent ${toAgent} not found`);
    }

    const response = await recipient.agent.handleMessage({
      from: fromAgent,
      to: toAgent,
      message,
      timestamp: Date.now()
    });

    return response;
  }

  async requestCapability(requesterAgent, capability, parameters) {
    const capableAgents = this.routingTable.get(capability) || [];
    
    if (capableAgents.length === 0) {
      throw new Error(`No agents available for capability: ${capability}`);
    }

    // Load balancing - pick least busy agent
    const selectedAgent = this.selectBestAgent(capableAgents);
    
    return await this.sendMessage(requesterAgent, selectedAgent, {
      type: 'capability_request',
      capability,
      parameters
    });
  }
}

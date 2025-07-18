// lib/protocols/mcp-messages.js
export const MCPMessageTypes = {
  AGENT_QUERY: 'agent_query',
  AGENT_RESPONSE: 'agent_response',
  ACTION_REQUEST: 'action_request',
  ACTION_RESULT: 'action_result',
  CONTEXT_SHARE: 'context_share',
  MEMORY_UPDATE: 'memory_update',
  CAPABILITY_REQUEST: 'capability_request',
  SYSTEM_EVENT: 'system_event'
};

export class MCPMessage {
  constructor(type, payload, metadata = {}) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.payload = payload;
    this.metadata = {
      timestamp: Date.now(),
      sender: metadata.sender,
      recipient: metadata.recipient,
      priority: metadata.priority || 'normal'
    };
  }
}

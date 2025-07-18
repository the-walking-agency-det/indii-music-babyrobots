// lib/protocols/mcp-protocol.js
import { MCPConnection } from '../mocks/index.js';

export class MCPProtocol {
  constructor() {
    this.connections = new Map();
    this.messageQueue = [];
    this.handlers = new Map();
  }

  async connect(endpoint, capabilities) {
    const connection = new MCPConnection(endpoint, capabilities);
    await connection.initialize();
    this.connections.set(endpoint, connection);
    return connection;
  }

  async sendMessage(recipient, message) {
    const connection = this.connections.get(recipient);
    if (!connection) {
      throw new Error(`No MCP connection to ${recipient}`);
    }
    
    return await connection.send({
      type: 'agent_message',
      payload: message,
      timestamp: Date.now(),
      sender: this.agentId
    });
  }

  registerHandler(messageType, handler) {
    this.handlers.set(messageType, handler);
  }

  async handleMessage(message) {
    const handler = this.handlers.get(message.type);
    if (handler) {
      return await handler(message);
    }
    throw new Error(`No handler for message type: ${message.type}`);
  }
}

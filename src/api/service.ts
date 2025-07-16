import { ApiRequest, ApiResponse } from './types';

export interface ApiService {
  name: string;
  handleRequest(request: ApiRequest): Promise<ApiResponse>;
}

export class ApiServiceRegistry {
  private services: Map<string, ApiService>;

  constructor() {
    this.services = new Map();
  }

  registerService(service: ApiService): void {
    this.services.set(service.name, service);
  }

  getService(name: string): ApiService | undefined {
    return this.services.get(name);
  }

  async routeToService(serviceName: string, request: ApiRequest): Promise<ApiResponse> {
    const service = this.getService(serviceName);
    if (!service) {
      return {
        status: 404,
        body: { error: `Service '${serviceName}' not found` }
      };
    }

    try {
      return await service.handleRequest(request);
    } catch (error) {
      return {
        status: 500,
        body: { error: 'Service error' }
      };
    }
  }
}

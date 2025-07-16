import { ApiRequest, ApiResponse, Route, RouteHandler, RequestMiddleware } from './types';

export class BaseRouter {
  private routes: Map<string, Map<string, RouteHandler>>;
  private middlewares: RequestMiddleware[];

  constructor() {
    this.routes = new Map();
    this.middlewares = [];
  }

  addRoute(route: Route): void {
    const { path, method, handler } = route;
    if (!this.routes.has(path)) {
      this.routes.set(path, new Map());
    }
    this.routes.get(path)!.set(method.toUpperCase(), handler);
  }

  addMiddleware(middleware: RequestMiddleware): void {
    this.middlewares.push(middleware);
  }

  private async applyMiddlewares(request: ApiRequest, handler: RouteHandler): Promise<ApiResponse> {
    let currentHandler: RouteHandler = handler;
    
    // Apply middlewares in reverse order
    for (const middleware of [...this.middlewares].reverse()) {
      const nextHandler = currentHandler;
      currentHandler = async (req: ApiRequest) => middleware(req, nextHandler);
    }

    return currentHandler(request);
  }

  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    const { path, method } = request;
    
    const routeMethods = this.routes.get(path);
    if (!routeMethods) {
      return { status: 404, body: { error: 'Not Found' } };
    }

    const handler = routeMethods.get(method.toUpperCase());
    if (!handler) {
      return { status: 405, body: { error: 'Method Not Allowed' } };
    }

    try {
      return await this.applyMiddlewares(request, handler);
    } catch (error) {
      return {
        status: 500,
        body: { error: 'Internal Server Error' }
      };
    }
  }
}

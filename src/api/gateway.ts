import { BaseRouter } from './base-router';
import { ApiServiceRegistry } from './service';
import { ApiRequest, ApiResponse, Route } from './types';
import { AuthService } from './auth/service';
import { createAuthMiddleware } from './auth/middleware';
import { RateLimiter } from './rate-limit/limiter';
import { createRateLimitMiddleware } from './rate-limit/middleware';
import { PlaylistRoutes } from './playlists/routes';

export class ApiGateway {
  private router: BaseRouter;
  private serviceRegistry: ApiServiceRegistry;
  private authService: AuthService;
  private rateLimiter: RateLimiter;

  constructor() {
    this.router = new BaseRouter();
    this.serviceRegistry = new ApiServiceRegistry();
    this.authService = new AuthService();
    this.rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
    
    // Add middlewares in correct order: rate limiting first, then auth
    this.router.addMiddleware(createRateLimitMiddleware(this.rateLimiter));
    this.router.addMiddleware(createAuthMiddleware(this.authService));
    this.setupRoutes();
    this.addPlaylistRoutes();
  }

  private addPlaylistRoutes(): void {
    const playlistService = this.serviceRegistry.getService('PlaylistService');
    const playlistRoutes = new PlaylistRoutes(playlistService);
    playlistRoutes.getRoutes().forEach(route => this.router.addRoute(route));
  }

  private setupRoutes(): void {
    // Auth routes
    this.router.addRoute({
      path: '/api/auth/login',
      method: 'POST',
      handler: async (request: ApiRequest): Promise<ApiResponse> => {
        const authResponse = await this.authService.login(request.body);
        return {
          status: authResponse.success ? 200 : 401,
          body: authResponse
        };
      }
    });

    // Route for service-specific endpoints
    this.router.addRoute({
      path: '/api/services/:service/*',
      method: 'ANY',
      handler: async (request: ApiRequest): Promise<ApiResponse> => {
        const pathParts = request.path.split('/');
        const serviceName = pathParts[3];
        const serviceRequest = {
          ...request,
          path: '/' + pathParts.slice(4).join('/')
        };
        
        return this.serviceRegistry.routeToService(serviceName, serviceRequest);
      }
    });
  }

  registerService(service: ApiService): void {
    this.serviceRegistry.registerService(service);
  }

  addRoute(route: Route): void {
    this.router.addRoute(route);
  }

  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    return this.router.handleRequest(request);
  }
}

import { ApiRequest, ApiResponse, RequestMiddleware, RouteHandler } from '../types';
import { AuthService } from './service';

export function createAuthMiddleware(authService: AuthService): RequestMiddleware {
  return async (request: ApiRequest, next: RouteHandler): Promise<ApiResponse> => {
    // Skip authentication for login endpoint
    if (request.path === '/api/auth/login') {
      return next(request);
    }

    return authService.authenticate(request, next);
  };
}

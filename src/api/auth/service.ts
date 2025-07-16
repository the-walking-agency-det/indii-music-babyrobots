import { AuthRequest, AuthResponse, AuthToken } from './types';
import { ApiRequest, ApiResponse, RequestMiddleware } from '../types';

export class AuthService {
  private tokenMap: Map<string, AuthToken>;

  constructor() {
    this.tokenMap = new Map();
  }

  async login(request: AuthRequest): Promise<AuthResponse> {
    // Simulating user login and token creation
    if (request.userId && request.password === 'secret') {
      const token = this.generateToken(request.userId);
      this.tokenMap.set(token.token, token);
      return { success: true, token };
    }

    return { success: false, error: 'Invalid credentials' };
  }

  async verifyToken(token: string): Promise<boolean> {
    const authToken = this.tokenMap.get(token);
    return authToken ? authToken.expiresAt > new Date() : false;
  }

  async authenticate(request: ApiRequest, next: RequestMiddleware): Promise<ApiResponse> {
    const authHeader = request.headers['Authorization'];
    if (!authHeader || !await this.verifyToken(authHeader.replace('Bearer ', ''))) {
      return { status: 401, body: { error: 'Unauthorized' } };
    }

    return next(request);
  }

  private generateToken(userId: string): AuthToken {
    return {
      token: `token-${Math.random().toString(36).substr(2)}`,
      type: 'Bearer',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
      userId
    };
  }
}

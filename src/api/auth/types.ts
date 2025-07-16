export interface AuthToken {
  token: string;
  type: string;
  expiresAt: Date;
  userId: string;
  scopes?: string[];
}

export interface AuthRequest {
  userId: string;
  password?: string;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: AuthToken;
  error?: string;
}

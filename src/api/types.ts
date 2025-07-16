export interface ApiRequest {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers: Record<string, string>;
  query?: Record<string, string>;
  params?: Record<string, string>;
  user?: {
    id: string;
    [key: string]: any;
  };
}

export interface ApiResponse {
  status: number;
  body?: any;
  headers?: Record<string, string>;
}

export type RouteHandler = (request: ApiRequest) => Promise<ApiResponse>;
export type RequestMiddleware = (request: ApiRequest, next: RouteHandler) => Promise<ApiResponse>;

export interface Route {
  path: string;
  method: string;
  handler: RouteHandler;
}

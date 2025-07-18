const securityHeaders = require('../../src/middleware/securityHeaders');

describe('Security Headers Middleware', () => {
  let mockReq;
  let mockRes;
  let mockHandler;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      headers: {},
      setHeader: function(name, value) {
        this.headers[name] = value;
      },
      getHeader: function(name) {
        return this.headers[name];
      }
    };
    mockHandler = jest.fn((req, res) => 'handler executed');
  });

  it('should set all required security headers', async () => {
    const middleware = securityHeaders(mockHandler);
    await middleware(mockReq, mockRes);

    // Test basic security headers
    expect(mockRes.headers['X-Content-Type-Options']).toBe('nosniff');
    expect(mockRes.headers['X-Frame-Options']).toBe('DENY');
    expect(mockRes.headers['X-XSS-Protection']).toBe('1; mode=block');
    expect(mockRes.headers['X-DNS-Prefetch-Control']).toBe('off');
    expect(mockRes.headers['X-Download-Options']).toBe('noopen');
    expect(mockRes.headers['X-Permitted-Cross-Domain-Policies']).toBe('none');

    // Test HSTS
    expect(mockRes.headers['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains; preload');

    // Test CSP
    const csp = mockRes.headers['Content-Security-Policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");

    // Test Referrer Policy
    expect(mockRes.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');

    // Test Permissions Policy
    const permissionsPolicy = mockRes.headers['Permissions-Policy'];
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('geolocation=()');
  });

  it('should allow development-specific CSP rules when in development', () => {
    process.env.NODE_ENV = 'development';
    const middleware = securityHeaders(mockHandler);
    middleware(mockReq, mockRes);

    const csp = mockRes.headers['Content-Security-Policy'];
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws:');
  });

  it('should not allow unsafe-eval in production', () => {
    process.env.NODE_ENV = 'production';
    const middleware = securityHeaders(mockHandler);
    middleware(mockReq, mockRes);

    const csp = mockRes.headers['Content-Security-Policy'];
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain('ws:');
  });

  it('should execute the wrapped handler', async () => {
    const middleware = securityHeaders(mockHandler);
    const result = await middleware(mockReq, mockRes);
    
    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(result).toBe('handler executed');
  });
});

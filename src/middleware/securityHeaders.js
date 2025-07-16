'use strict';

const getCspDirectives = (isDev) => ({
  'default-src': ["'self'"],
  'script-src': ["'self'", isDev && "'unsafe-eval'", "'strict-dynamic'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https:'],
  'connect-src': ["'self'", 'https:', isDev && 'ws:'],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
});

const buildCspString = (directives) => {
  return Object.entries(directives)
    .map(([key, values]) => {
      const filteredValues = values.filter(Boolean);
      return filteredValues.length ? `${key} ${filteredValues.join(' ')}` : key;
    })
    .join('; ');
};

function securityHeaders(handler) {
  return async (req, res) => {
    // Basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    
    // HSTS configuration
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Content Security Policy
    const isDev = process.env.NODE_ENV === 'development';
    res.setHeader('Content-Security-Policy', buildCspString(getCspDirectives(isDev)));
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader('Permissions-Policy', 
      'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), ' +
      'display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), gamepad=(), ' +
      'geolocation=(), gyroscope=(), layout-animations=(), legacy-image-formats=(), ' +
      'magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), ' +
      'publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), ' +
      'web-share=(), xr-spatial-tracking=()'
    );

    return handler(req, res);
  };
}

module.exports = securityHeaders;

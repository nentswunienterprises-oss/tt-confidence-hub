// Runtime configuration for API URL
// API routes are now served from the same domain via Vercel serverless functions

export function getApiUrl(): string {
  // In production (Vercel), API is on same domain - use relative URLs
  // In local dev, use localhost:5000
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  // Production: same origin, no prefix needed
  return '';
}

// Use the getter function to ensure runtime evaluation
export const API_URL = getApiUrl();

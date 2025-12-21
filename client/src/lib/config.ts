// Runtime configuration for API URL

const RAILWAY_URL = 'https://tt-confidence-hub-production.up.railway.app';

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  // Production: use Railway backend
  return RAILWAY_URL;
}

// Use the getter function to ensure runtime evaluation
export const API_URL = getApiUrl();

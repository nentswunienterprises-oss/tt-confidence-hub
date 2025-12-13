// Runtime configuration for API URL
// This determines the backend URL based on the current hostname

export function getApiUrl(): string {
  // If running locally, use local backend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // Production - Vercel frontend connects to Railway backend
    if (hostname.includes('vercel.app') || hostname.includes('tt-confidence-hub')) {
      return 'https://tt-confidence-hub-production.up.railway.app';
    }
  }
  
  // Fallback to env var or empty string
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
}

export const API_URL = getApiUrl();

// Runtime configuration for API URL


// Use the custom API domain for production
const RENDER_URL = 'https://api.responseintegrity.co.za';


export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  // Production: use Render backend
  return RENDER_URL;
}

// Use a getter function to ensure runtime evaluation
export const API_URL = getApiUrl();

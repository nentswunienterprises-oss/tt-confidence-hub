// Runtime configuration for API URL
var RENDER_URL = 'https://api.territorialtutoring.co.za';
export function getApiUrl() {
    if (typeof window !== 'undefined') {
        var hostname = window.location.hostname;
        // Local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
    }
    // Production: use Render backend
    return RENDER_URL;
}
// Use the getter function to ensure runtime evaluation
export var API_URL = getApiUrl();

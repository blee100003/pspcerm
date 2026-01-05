const getApiUrl = () => {
    // If env var is set (e.g. for Netlify), use it
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // Otherwise, construct based on current browser location
    // This allows it to work on localhost AND on 192.168.x.x for mobile
    // Use relative path to leverage Vite proxy
    return '/api';
};

const API_BASE_URL = getApiUrl();

export default API_BASE_URL;

// Base URL configuration
// Can be set via:
// 1. Environment variable at build time: REACT_APP_API_BASE_URL
// 2. Runtime toggle in the UI (stored in localStorage)

export const getApiBaseUrl = () => {
  // Check localStorage first (runtime override)
  const runtimeBaseUrl = localStorage.getItem('apiBaseUrl');
  if (runtimeBaseUrl !== null) {
    return runtimeBaseUrl;
  }
  
  // Fall back to environment variable or empty string (relative URLs)
  return process.env.REACT_APP_API_BASE_URL || '';
};

// Set the API base URL (called from UI toggle)
export const setApiBaseUrl = (url) => {
  localStorage.setItem('apiBaseUrl', url);
  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('apiBaseUrlChanged', { detail: url }));
};

// Get current API mode
export const getApiMode = () => {
  const baseUrl = getApiBaseUrl();
  if (baseUrl === '' || baseUrl === window.location.origin) {
    return 'local';
  }
  return 'remote';
};

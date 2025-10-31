export const API_ENDPOINTS = {
  HELLO: {
    url: '/api/hello',
    name: 'Hello API',
    description: 'Basic health check endpoint'
  },
  HELLO_DELAY_SHORT: {
    url: '/api/hello/delay/short',
    name: 'Short Delayed Hello API',
    description: 'Hello endpoint with a short delay'
  },
  HELLO_DELAY_LONG: {
    url: '/api/hello/delay/long',
    name: 'Long Delayed Hello API',
    description: 'Hello endpoint with a long delay'
  },
  HELLO_ERROR_CLIENT: {
    url: '/api/hello/error/client',
    name: 'Client Error Hello API',
    description: 'Hello endpoint that returns a client error'
  },
  HELLO_ERROR_SERVER: {
    url: '/api/hello/error/server',
    name: 'Server Error Hello API',
    description: 'Hello endpoint that returns a server error'
  },
};

export const getEndpointKeys = () => Object.keys(API_ENDPOINTS);
export const getEndpointByKey = (key) => API_ENDPOINTS[key];
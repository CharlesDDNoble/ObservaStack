import { useState, useEffect } from 'react';

// List of services to fetch OpenAPI schemas from
const SERVICES = ['api', 'orchestrator'];

/**
 * Hook to fetch and parse FastAPI's OpenAPI schemas from multiple services
 * @param {string} baseUrl - The base URL of the API
 * @returns {Object} - { endpoints, loading, error }
 */
export const useOpenApiSchema = (baseUrl = '') => {
  const [endpoints, setEndpoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        setLoading(true);
        
        // Fetch all service schemas in parallel
        const fetchPromises = SERVICES.map(async (service) => {
          try {
            const schemaUrl = baseUrl 
              ? `${baseUrl}/${service}/openapi.json` 
              : `/${service}/openapi.json`;
            const response = await fetch(schemaUrl);
            
            if (!response.ok) {
              console.warn(`Failed to fetch ${service} OpenAPI schema: ${response.statusText}`);
              return { service, endpoints: {} };
            }

            const schema = await response.json();
            const parsedEndpoints = parseOpenApiSchema(schema, service);
            return { service, endpoints: parsedEndpoints };
          } catch (err) {
            console.warn(`Error fetching ${service} OpenAPI schema:`, err);
            return { service, endpoints: {} };
          }
        });

        const results = await Promise.all(fetchPromises);
        
        // Combine all endpoints from all services
        const combinedEndpoints = {};
        results.forEach(({ service, endpoints }) => {
          Object.assign(combinedEndpoints, endpoints);
        });

        setEndpoints(combinedEndpoints);
        setError(null);
      } catch (err) {
        console.error('Error fetching OpenAPI schemas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemas();
  }, [baseUrl]);

  return { endpoints, loading, error };
};

/**
 * Parse OpenAPI schema into our endpoint format
 * @param {Object} schema - OpenAPI 3.0 schema
 * @param {string} service - Service name (e.g., 'sut', 'orchestrator')
 * @returns {Object} - Parsed endpoints in API_ENDPOINTS format
 */
const parseOpenApiSchema = (schema, service) => {
  const endpoints = {};
  const paths = schema.paths || {};

  Object.entries(paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, details]) => {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        const key = generateEndpointKey(path, details, service);
        const parameters = parseParameters(details.parameters || [], path, details, method);
        
        // Add service prefix to the URL
        const urlWithPrefix = path.startsWith(`/${service}`) ? path : `/${service}${path}`;
        
        endpoints[key] = {
          url: urlWithPrefix,
          name: details.summary || formatPathName(path, service),
          description: details.description || '',
          parameters: parameters,
          method: method.toUpperCase(),
          service: service, // Add service identifier
          requestBody: details.requestBody || null, // Include request body schema for POST/PUT
        };
      }
    });
  });

  return endpoints;
};

/**
 * Generate a consistent key for an endpoint
 * @param {string} path - API path
 * @param {Object} details - OpenAPI endpoint details
 * @param {string} service - Service name
 */
const generateEndpointKey = (path, details, service) => {
  // Use operationId if available, otherwise generate from path
  if (details.operationId) {
    return `${service.toUpperCase()}_${details.operationId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
  }
  
  const pathKey = path
    .replace(new RegExp(`^/${service}/`), '')
    .replace(/\//g, '_')
    .replace(/\{|\}/g, '')
    .toUpperCase();
  
  return `${service.toUpperCase()}_${pathKey}`;
};

/**
 * Format path into a human-readable name
 * @param {string} path - API path
 * @param {string} service - Service name
 */
const formatPathName = (path, service) => {
  const servicePrefix = service.charAt(0).toUpperCase() + service.slice(1);
  const cleanPath = path
    .replace(new RegExp(`^/${service}/`), '')
    .replace(/\//g, ' ')
    .replace(/\{|\}/g, '');
    
  const formattedPath = cleanPath
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return formattedPath ? `${servicePrefix}: ${formattedPath}` : servicePrefix;
};

/**
 * Convert OpenAPI path to our template format
 * /api/hello/delay/{delay} -> /api/hello/delay/{delay}
 */
const convertPathToTemplate = (path) => {
  return path; // Already in the right format
};

/**
 * Parse OpenAPI parameters into our format
 */
const parseParameters = (params, path, details, method) => {
  const parameters = [];

  // Extract path parameters from the path string
  const pathParams = path.match(/\{([^}]+)\}/g)?.map(p => p.slice(1, -1)) || [];

  pathParams.forEach(paramName => {
    const param = params.find(p => p.name === paramName) || {};
    const schema = param.schema || {};

    // Determine a sensible default value
    let defaultValue = schema.default;
    if (defaultValue === undefined) {
      if (paramName === 'delay') {
        defaultValue = 100; // Default delay of 100ms
      } else if (paramName === 'code') {
        defaultValue = 200; // Default status code
      } else if (schema.type === 'integer' || schema.type === 'number') {
        // Use minimum if available, otherwise a reasonable default
        defaultValue = schema.minimum || 1;
      } else {
        defaultValue = '';
      }
    }

    parameters.push({
      name: paramName,
      type: schema.type || 'string',
      required: param.required !== false, // Path params are required by default
      min: schema.minimum,
      max: schema.maximum,
      default: defaultValue,
      description: param.description || `${paramName} parameter`,
    });
  });

  // For POST/PUT/PATCH, also parse request body schema
  if (['post', 'put', 'patch'].includes(method) && details?.requestBody) {
    const requestBody = details.requestBody;
    const jsonContent = requestBody.content?.['application/json'];
    
    if (jsonContent?.schema) {
      const schema = jsonContent.schema;
      
      // If it's a reference to a model, extract it
      if (schema.$ref) {
        // For now, just mark that a request body is required
        parameters.push({
          name: 'body',
          type: 'object',
          required: requestBody.required !== false,
          schema: schema,
          description: 'Request body',
          isRequestBody: true,
        });
      } else if (schema.type === 'object' && schema.properties) {
        // Parse object properties
        Object.entries(schema.properties).forEach(([propName, propSchema]) => {
          parameters.push({
            name: propName,
            type: propSchema.type || 'string',
            required: schema.required?.includes(propName) ?? false,
            description: propSchema.description || propName,
            default: propSchema.default,
            isBodyProperty: true,
          });
        });
      }
    }
  }

  return parameters;
};

export default useOpenApiSchema;

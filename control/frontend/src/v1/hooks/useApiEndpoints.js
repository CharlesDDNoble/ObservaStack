import { useOpenApiSchema } from './useOpenApiSchema';
import { getApiBaseUrl } from '../config/apiEndpoints';

/**
 * Hook that provides API endpoints from OpenAPI schema only
 * @returns {Object} - { endpoints, loading, error }
 */
export const useApiEndpoints = () => {
  const baseUrl = getApiBaseUrl();
  const { endpoints, loading, error } = useOpenApiSchema(baseUrl);

  return { 
    endpoints, 
    loading, 
    error
  };
};

export default useApiEndpoints;

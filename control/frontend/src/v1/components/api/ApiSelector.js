import React, { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import ParameterForm from './ParameterForm';
import Toast from '../shared/Toast';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { validateParameters } from '../../lib/validation';

const ApiSelector = ({ 
  endpoints, 
  selectedEndpoint, 
  onEndpointChange, 
  onEndpointUpdate,
  onCallEndpoint,
  isLoading 
}) => {
  const [selectedEndpointKey, setSelectedEndpointKey] = useState('');
  const [parameters, setParameters] = useState({});
  const [toast, setToast] = useState(null);

  // Helper function to get endpoint by key from dynamic endpoints
  const getEndpointByKey = (key) => {
    return endpoints[key];
  };

  // Helper function to build URL with parameters
  const buildEndpointUrl = (endpointKey, params = {}) => {
    const endpoint = getEndpointByKey(endpointKey);
    if (!endpoint) return null;
    
    let url = endpoint.url;
    
    // Replace path parameters
    endpoint.parameters?.forEach(param => {
      const value = params[param.name] ?? param.default;
      url = url.replace(`{${param.name}}`, value);
    });
    
    return url;
  };

  const handleEndpointSelect = (endpointKey) => {
    setSelectedEndpointKey(endpointKey);
    
    if (endpointKey) {
      const endpoint = getEndpointByKey(endpointKey);
      onEndpointChange(endpoint?.url || '');
      
      // Initialize parameters with default values
      const defaultParams = {};
      endpoint?.parameters?.forEach(param => {
        defaultParams[param.name] = param.default || '';
      });
      setParameters(defaultParams);
      
      // Automatically build URL with default parameters for load testing
      const builtUrl = buildEndpointUrl(endpointKey, defaultParams);
      if (onEndpointUpdate) {
        onEndpointUpdate(endpoint?.url || '', builtUrl);
      }
    } else {
      setParameters({});
      onEndpointChange('');
      if (onEndpointUpdate) {
        onEndpointUpdate('', '');
      }
    }
  };

  const handleParametersChange = (newParameters) => {
    setParameters(newParameters);
    
    // Update the built URL whenever parameters change
    if (selectedEndpointKey && onEndpointUpdate) {
      const endpoint = getEndpointByKey(selectedEndpointKey);
      const builtUrl = buildEndpointUrl(selectedEndpointKey, newParameters);
      onEndpointUpdate(endpoint?.url || '', builtUrl);
    }
  };

  const handleCallEndpoint = () => {
    if (!selectedEndpointKey) return;

    const endpoint = getEndpointByKey(selectedEndpointKey);
    if (!endpoint) {
      setToast({
        message: 'Invalid endpoint selected',
        type: 'error'
      });
      return;
    }
    
    console.log('Calling endpoint:', endpoint);
    console.log('Endpoint method:', endpoint.method);

    const validation = validateParameters(endpoint.parameters || [], parameters);
    if (!validation.valid) {
      setToast({
        message: `Parameter errors: ${validation.errors.join(', ')}`,
        type: 'error'
      });
      return;
    }

    const fullUrl = buildEndpointUrl(selectedEndpointKey, parameters);
    
    // Prepare request options for non-GET methods
    const options = {};
    if (endpoint.method && endpoint.method !== 'GET') {
      options.method = endpoint.method;
      
      // Check if there's a request body parameter (schema with $ref)
      const requestBodyParam = endpoint.parameters?.find(p => p.isRequestBody);
      
      if (requestBodyParam) {
        // For raw request body (like TestConfig with $ref), use the parsed JSON from parameters
        // The parameter will be named 'body' and contain the full object
        options.body = parameters['body'];
      } else {
        // Build request body from individual body properties
        const bodyParams = endpoint.parameters?.filter(p => p.isBodyProperty) || [];
        if (bodyParams.length > 0) {
          const body = {};
          bodyParams.forEach(param => {
            const value = parameters[param.name];
            // Convert string values to appropriate types
            if (param.type === 'number') {
              body[param.name] = value ? Number(value) : undefined;
            } else if (param.type === 'boolean') {
              body[param.name] = value === 'true' || value === true;
            } else {
              body[param.name] = value;
            }
          });
          options.body = body;
        }
      }
    }
    
    console.log('Request options:', options);
    console.log('Full URL:', fullUrl);
    
    onCallEndpoint(fullUrl, options);
  };

  const selectedEndpointObj = selectedEndpointKey ? getEndpointByKey(selectedEndpointKey) : null;
  
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
      <div className="space-y-4">
        <div>
          <Label htmlFor="endpoint-select" className="text-sm text-muted-foreground mb-2 block">
            Select API Endpoint
          </Label>
          
          <div className="flex gap-2">
            <Select value={selectedEndpointKey} onValueChange={handleEndpointSelect} disabled={isLoading}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select an endpoint...">
                  {selectedEndpointKey && selectedEndpointObj && (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                        selectedEndpointObj.service === 'api' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {selectedEndpointObj.service?.toUpperCase() || 'API'}
                      </span>
                      <span>{selectedEndpointObj.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(endpoints).map(([key, endpoint]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                        endpoint.service === 'api' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {endpoint.service?.toUpperCase() || 'API'}
                      </span>
                      <span>{endpoint.name}</span>
                      {endpoint.description && (
                        <span className="text-muted-foreground">- {endpoint.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleCallEndpoint}
              disabled={isLoading || !selectedEndpointKey}
              size="default"
              className="w-[108px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Calling...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Test
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Parameter Form */}
        {selectedEndpointObj && (
          <ParameterForm
            endpoint={selectedEndpointObj}
            onParametersChange={handleParametersChange}
            disabled={isLoading}
          />
        )}

        {/* URL Preview */}
        {selectedEndpointKey && (
          <div className="text-xs text-muted-foreground/70">
            URL: <code className="bg-input px-2 py-1 rounded font-mono">
              {buildEndpointUrl(selectedEndpointKey, parameters)}
            </code>
          </div>
        )}
      </div>
    </>
  );
};

export default ApiSelector;

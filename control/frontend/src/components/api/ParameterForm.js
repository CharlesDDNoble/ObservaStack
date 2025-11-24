import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { validateParameter } from '../../lib/validation';

export default function ParameterForm({ endpoint, onParametersChange, disabled }) {
  const [parameters, setParameters] = useState({});
  const [errors, setErrors] = useState({});
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [useRawJson, setUseRawJson] = useState(false);

  // Initialize parameters with default values when endpoint changes
  useEffect(() => {
    if (endpoint?.parameters) {
      const defaultParams = {};
      endpoint.parameters.forEach(param => {
        defaultParams[param.name] = param.default || '';
      });
      setParameters(defaultParams);
      setErrors({});
      
      // Initialize raw JSON with default values
      const bodyParams = endpoint.parameters.filter(p => p.isBodyProperty);
      if (bodyParams.length > 0) {
        const defaultBody = {};
        bodyParams.forEach(param => {
          if (param.default !== undefined) {
            defaultBody[param.name] = param.default;
          }
        });
        setRawJson(JSON.stringify(defaultBody, null, 2));
      }
    } else {
      setParameters({});
      setErrors({});
      setRawJson('');
    }
    setJsonError('');
  }, [endpoint]);

  // Notify parent of parameter changes
  useEffect(() => {
    if (useRawJson) {
      // Parse raw JSON and merge with path parameters
      try {
        const pathParams = endpoint?.parameters?.filter(p => !p.isBodyProperty) || [];
        const parsedBody = rawJson ? JSON.parse(rawJson) : {};
        const merged = { ...parameters };
        
        // Keep path parameters, add parsed body
        pathParams.forEach(p => {
          merged[p.name] = parameters[p.name];
        });
        Object.assign(merged, parsedBody);
        
        onParametersChange?.(merged);
        setJsonError('');
      } catch (e) {
        setJsonError(e.message);
      }
    } else {
      onParametersChange?.(parameters);
    }
  }, [parameters, rawJson, useRawJson, onParametersChange, endpoint]);

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));

    // Clear error for this parameter when user starts typing
    if (errors[paramName]) {
      setErrors(prev => ({
        ...prev,
        [paramName]: null
      }));
    }
  };

  const handleRawJsonChange = (value) => {
    setRawJson(value);
    setJsonError('');
  };

  const handleBlur = (param) => {
    const error = validateParameter(param, parameters[param.name]);
    setErrors(prev => ({
      ...prev,
      [param.name]: error
    }));
  };

  if (!endpoint?.parameters || endpoint.parameters.length === 0) {
    return null;
  }

  // Separate path parameters from body parameters
  const pathParams = endpoint.parameters.filter(p => !p.isBodyProperty);
  const bodyParams = endpoint.parameters.filter(p => p.isBodyProperty);
  const hasBodyParams = bodyParams.length > 0;

  return (
    <div className="space-y-4 p-3 bg-input rounded-lg border border-border">
      <h4 className="text-sm font-medium text-foreground">Parameters</h4>
      
      {/* Path/Query Parameters */}
      {pathParams.map((param) => (
        <div key={param.name} className="space-y-2">
          <Label htmlFor={param.name} className="text-sm text-muted-foreground">
            {param.name}
            {param.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          
          <Input
            id={param.name}
            type={param.type === 'number' ? 'number' : 'text'}
            value={parameters[param.name] || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            onBlur={() => handleBlur(param)}
            disabled={disabled}
            min={param.min}
            max={param.max}
            placeholder={param.default?.toString() || ''}
            className={errors[param.name] ? 'border-destructive' : ''}
          />
          
          {param.description && (
            <p className="text-xs text-muted-foreground/70">{param.description}</p>
          )}
          
          {errors[param.name] && (
            <p className="text-xs text-destructive">{errors[param.name]}</p>
          )}
        </div>
      ))}

      {/* Request Body Parameters */}
      {hasBodyParams && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-foreground">Request Body</h5>
            <button
              type="button"
              onClick={() => setUseRawJson(!useRawJson)}
              className="text-xs text-primary hover:underline"
              disabled={disabled}
            >
              {useRawJson ? 'Use Form' : 'Use Raw JSON'}
            </button>
          </div>

          {useRawJson ? (
            <div className="space-y-2">
              <textarea
                value={rawJson}
                onChange={(e) => handleRawJsonChange(e.target.value)}
                disabled={disabled}
                placeholder='{"users": 100, "spawn_rate": 10, "run_time": "5m"}'
                rows={10}
                className="w-full p-2 text-sm font-mono bg-background border border-border rounded resize-vertical focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {jsonError && (
                <p className="text-xs text-destructive">Invalid JSON: {jsonError}</p>
              )}
              <p className="text-xs text-muted-foreground/70">
                Enter raw JSON for the request body
              </p>
            </div>
          ) : (
            bodyParams.map((param) => (
              <div key={param.name} className="space-y-2 mb-4">
                <Label htmlFor={param.name} className="text-sm text-muted-foreground">
                  {param.name}
                  {param.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                <Input
                  id={param.name}
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  onBlur={() => handleBlur(param)}
                  disabled={disabled}
                  min={param.min}
                  max={param.max}
                  placeholder={param.default?.toString() || ''}
                  className={errors[param.name] ? 'border-destructive' : ''}
                />
                
                {param.description && (
                  <p className="text-xs text-muted-foreground/70">{param.description}</p>
                )}
                
                {errors[param.name] && (
                  <p className="text-xs text-destructive">{errors[param.name]}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

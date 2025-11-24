import React, { useState } from 'react';
import { getApiMode, setApiBaseUrl } from '../../config/apiEndpoints';
import Toast from '../shared/Toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const ApiModeSelector = () => {
  const [mode, setMode] = useState(getApiMode());
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('apiBaseUrl') || 'http://localhost:8080');
  const [showToast, setShowToast] = useState(false);

  const handleApply = () => {
    if (mode === 'local') {
      setApiBaseUrl('');
    } else if (mode === 'remote') {
      setApiBaseUrl(customUrl);
    }
    
    // Show toast notification
    setShowToast(true);
  };

  return (
    <>
      {showToast && (
        <Toast
          message="API configuration updated successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-end">
        {/* Pane 1: Radio buttons */}
        <div className="flex flex-col gap-3 pb-1">
          <RadioGroup value={mode} onValueChange={setMode}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local" id="local" />
              <Label htmlFor="local" className="text-sm font-medium text-foreground cursor-pointer">
                Local
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="remote" />
              <Label htmlFor="remote" className="text-sm font-medium text-foreground cursor-pointer">
                Remote
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Pane 2: Backend URL input */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="backend-url" className="text-xs text-muted-foreground">
            Backend URL
          </Label>
          <Input
            id="backend-url"
            type="text"
            value={mode === 'local' ? 'http://localhost' : customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            disabled={mode === 'local'}
            placeholder="http://localhost:8080"
            className="font-mono text-sm h-9"
          />
        </div>

        {/* Pane 3: Apply button */}
        <div className="pb-[2px]">
          <Button
            onClick={handleApply}
            className="h-9 px-6"
            size="sm"
          >
            Apply
          </Button>
        </div>
      </div>
    </>
  );
};

export default ApiModeSelector;

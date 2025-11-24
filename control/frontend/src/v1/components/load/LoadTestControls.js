import React, { useState } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

const LoadTestControls = ({ 
  onRunTest, 
  onStopTest, 
  onClearResults, 
  isRunning, 
  selectedEndpoint,
  hasResults = false
}) => {
  const [config, setConfig] = useState({
    count: 100,
    concurrency: 10,
    delay: 100,
    adaptiveConcurrency: true
  });

  const handleRunTest = () => {
    if (!selectedEndpoint) return;
    onRunTest({
      endpoint: selectedEndpoint,
      ...config
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="total-requests" className="text-sm text-muted-foreground mb-2">
            Total Requests
          </Label>
          <Input
            id="total-requests"
            type="number"
            min="1"
            max="10000"
            value={config.count}
            onChange={(e) => setConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
            disabled={isRunning}
          />
        </div>
        
        <div>
          <Label htmlFor="concurrency" className="text-sm text-muted-foreground mb-2">
            Concurrency: {config.concurrency}
          </Label>
          <Slider
            id="concurrency"
            min={1}
            max={20}
            step={1}
            value={config.concurrency}
            onChange={(value) => setConfig(prev => ({ ...prev, concurrency: value }))}
            disabled={isRunning}
          />
          <div className="text-xs text-muted-foreground/70 mt-1">
            Recommended: 8-16 for high performance
          </div>
        </div>
        
        <div>
          <Label htmlFor="batch-delay" className="text-sm text-muted-foreground mb-2">
            Batch Delay: {config.delay}ms
          </Label>
          <Slider
            id="batch-delay"
            min={100}
            max={1000}
            step={50}
            value={config.delay}
            onChange={(value) => setConfig(prev => ({ ...prev, delay: value }))}
            disabled={isRunning}
          />
          <div className="text-xs text-muted-foreground/70 mt-1">
            Lower = faster, higher = safer
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleRunTest}
          disabled={isRunning || !selectedEndpoint}
          className="h-10 px-6 bg-success hover:bg-success/90 text-white"
        >
          <Play className="mr-2 h-4 w-4" />
          Start
        </Button>
        
        <Button
          onClick={onStopTest}
          disabled={!isRunning}
          variant="destructive"
          className="h-10 px-6"
        >
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
        
        <Button
          onClick={onClearResults}
          disabled={isRunning || !hasResults}
          className="h-10 px-6 bg-alert hover:bg-alert/90 text-white border-alert"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      {!selectedEndpoint && (
        <p className="text-warning text-sm">
          Please select an API endpoint first
        </p>
      )}
    </div>
  );
};

export default LoadTestControls;

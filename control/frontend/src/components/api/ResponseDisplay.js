import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ResponseDisplay = ({ data, error, isLoading, endpoint }) => {
  if (!endpoint) {
    return (
      <div className="bg-input border border-border rounded-lg p-4 text-muted-foreground/70 text-center">
        Select an API endpoint to see the response
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-input border border-border rounded-lg p-4 flex items-center gap-3">
        <Clock size={20} className="text-info animate-pulse" />
        <span className="text-foreground">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <XCircle size={20} className="text-destructive" />
          <span className="text-destructive font-medium">Error</span>
        </div>
        <pre className="text-destructive text-sm whitespace-pre-wrap break-words">
          {error}
        </pre>
      </div>
    );
  }

  if (data) {
    return (
      <div className="bg-success/10 border border-success rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle size={20} className="text-success" />
          <span className="text-success font-medium">Success</span>
        </div>
        <pre className="bg-input border border-border rounded p-3 text-foreground text-sm overflow-x-auto whitespace-pre-wrap break-words">
          {typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-input border border-border rounded-lg p-4 text-muted-foreground/70 text-center">
      No response yet
    </div>
  );
};

export default ResponseDisplay;

import ResponseDisplay from '../../api/ResponseDisplay';
import { Panel } from '../../shared/Panel';

export function ApiResponsePanel({ currentEndpoint, data, error, isLoading, endpointLabel }) {
  return (
    <Panel title="API Response">
      <div className="h-full flex flex-col">
        {currentEndpoint && (
          <div className="text-xs text-muted-foreground mb-3 flex-shrink-0">
            <code className="bg-input px-2 py-1 rounded">{currentEndpoint}</code>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <ResponseDisplay
            data={data}
            error={error}
            isLoading={isLoading}
            endpoint={endpointLabel}
          />
        </div>
      </div>
    </Panel>
  );
}

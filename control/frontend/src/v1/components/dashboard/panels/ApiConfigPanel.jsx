import ApiSelector from '../../api/ApiSelector';
import LoadingSkeleton from '../../shared/LoadingSkeleton';
import { Panel } from '../../shared/Panel';

export function ApiConfigPanel({
  endpoints,
  selectedEndpoint,
  endpointsLoading,
  endpointsError,
  onEndpointChange,
  onEndpointUpdate,
  onCallEndpoint,
  isLoading
}) {
  return (
    <Panel title="Endpoint Configuration">
      {endpointsLoading && <LoadingSkeleton type="endpoints" />}

      {endpointsError && (
        <div className="text-destructive text-sm p-3 bg-destructive/10 rounded border border-destructive/30">
          Error loading endpoints: {endpointsError}
        </div>
      )}

      {!endpointsLoading && !endpointsError && (
        <ApiSelector
          endpoints={endpoints}
          selectedEndpoint={selectedEndpoint}
          onEndpointChange={onEndpointChange}
          onEndpointUpdate={onEndpointUpdate}
          onCallEndpoint={onCallEndpoint}
          isLoading={isLoading}
        />
      )}
    </Panel>
  );
}

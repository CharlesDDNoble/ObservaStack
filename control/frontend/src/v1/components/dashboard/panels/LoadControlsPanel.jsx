import LoadTestControls from '../../load/LoadTestControls';
import { Panel } from '../../shared/Panel';

export function LoadControlsPanel({
  onRunTest,
  onStopTest,
  onClearResults,
  isRunning,
  selectedEndpoint,
  hasResults
}) {
  return (
    <Panel title="Load Testing Controls">
      <LoadTestControls
        onRunTest={onRunTest}
        onStopTest={onStopTest}
        onClearResults={onClearResults}
        isRunning={isRunning}
        selectedEndpoint={selectedEndpoint}
        hasResults={hasResults}
      />
    </Panel>
  );
}

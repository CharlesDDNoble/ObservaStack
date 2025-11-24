import LoadTestResults from '../../load/LoadTestResults';
import { Panel } from '../../shared/Panel';

export function LoadResultsPanel({ results, isRunning, progress, summary }) {
  return (
    <Panel title="Test Results">
      <LoadTestResults
        results={results}
        isRunning={isRunning}
        progress={progress}
        summary={summary}
      />
    </Panel>
  );
}

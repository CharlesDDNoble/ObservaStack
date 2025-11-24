import LoadTestCharts from '../../load/LoadTestCharts';
import { Panel } from '../../shared/Panel';

export function LoadChartsPanel({ chartData, isRunning }) {
  return (
    <Panel title="Live Metrics">
      <LoadTestCharts chartData={chartData} isRunning={isRunning} />
    </Panel>
  );
}

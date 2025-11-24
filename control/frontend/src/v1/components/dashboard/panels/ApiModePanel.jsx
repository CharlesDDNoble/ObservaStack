import ApiModeSelector from '../../api/ApiModeSelector';
import { Panel } from '../../shared/Panel';

export function ApiModePanel() {
  return (
    <Panel title="API Mode">
      <ApiModeSelector />
    </Panel>
  );
}

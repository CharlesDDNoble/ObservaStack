import { Responsive, WidthProvider } from 'react-grid-layout';
import { ApiModePanel } from './panels/ApiModePanel';
import { ApiConfigPanel } from './panels/ApiConfigPanel';
import { ApiResponsePanel } from './panels/ApiResponsePanel';
import { LoadControlsPanel } from './panels/LoadControlsPanel';
import { LoadChartsPanel } from './panels/LoadChartsPanel';
import { LoadResultsPanel } from './panels/LoadResultsPanel';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DashboardGrid({ layouts, panels }) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768 }}
      cols={{ lg: 12, md: 10, sm: 6 }}
      rowHeight={50}
      isDraggable={false}
      isResizable={false}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      compactType={null}
      preventCollision={false}
      useCSSTransforms
    >
      <div key="mode-selector" className="h-full">
        <ApiModePanel {...panels.modeSelector} />
      </div>

      <div key="api-config" className="h-full">
        <ApiConfigPanel {...panels.apiConfig} />
      </div>

      <div key="api-testing" className="h-full">
        <ApiResponsePanel {...panels.apiResponse} />
      </div>

      <div key="load-controls" className="h-full">
        <LoadControlsPanel {...panels.loadControls} />
      </div>

      <div key="load-charts" className="h-full">
        <LoadChartsPanel {...panels.loadCharts} />
      </div>

      <div key="load-results" className="h-full">
        <LoadResultsPanel {...panels.loadResults} />
      </div>
    </ResponsiveGridLayout>
  );
}

export default DashboardGrid;

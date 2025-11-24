import StatusIndicator from '../shared/StatusIndicator';
import DashboardGrid from './DashboardGrid';

export function DashboardPage({ status, layouts, panels }) {
  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Application Control Panel
        </h1>
        <StatusIndicator status={status} />
      </div>

      <DashboardGrid layouts={layouts} panels={panels} />
    </div>
  );
}

export default DashboardPage;

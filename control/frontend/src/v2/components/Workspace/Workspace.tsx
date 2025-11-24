import React from 'react';
import { TabType, RequestFeedItem, BusinessMetrics } from '../../types';
import { TabBar } from './TabBar';
import { UserTab } from '../Tabs/UserTab';
import { ObservabilityTab } from '../Tabs/ObservabilityTab';
import { TestTab } from '../Tabs/TestTab';

interface WorkspaceProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  scenario: any;
  requestFeed: RequestFeedItem[];
  metrics: BusinessMetrics;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  activeTab,
  onTabChange,
  scenario,
  requestFeed,
  metrics
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      
      <div className="flex-1 overflow-auto bg-slate-950">
        {activeTab === 'user' && (
          <UserTab scenario={scenario} requestFeed={requestFeed} metrics={metrics} />
        )}
        {activeTab === 'observability' && (
          <ObservabilityTab scenario={scenario} />
        )}
        {activeTab === 'test' && (
          <TestTab scenario={scenario} />
        )}
      </div>
    </div>
  );
};

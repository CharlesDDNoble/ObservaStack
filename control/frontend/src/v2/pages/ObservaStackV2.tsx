import React, { useState } from 'react';
import { Scenario, TabType } from '../types';
import { SCENARIOS } from '../constants';
import { useTimer, useRequestFeed, useIncidentUpdates } from '../hooks';
import { IncidentSidebar } from '../components/Sidebar';
import { Workspace } from '../components/Workspace';
import '../styles/animations.css';
import LoadingScreen from '../../common/ui/LoadingScreen';

const ObservaStackV2: React.FC = () => {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('user');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { elapsedTime, reset: resetTimer } = useTimer(isRunning);
  const { requestFeed, metrics, reset: resetRequestFeed } = useRequestFeed({ isRunning });
  const { updates, addUpdate, clearUpdates } = useIncidentUpdates();

  // Start scenario
  const startScenario = (selectedScenario: Scenario) => {
    setScenario(selectedScenario);
    setIsRunning(true);
    resetTimer();
    resetRequestFeed();
    clearUpdates();
    
    addUpdate(0, 'incident', '🚨', `Incident started: ${selectedScenario.description}`);
    
    // Simulate progressive updates
    setTimeout(() => {
      if (isRunning) {
        addUpdate(45, 'hint', '💡', 'Start by checking the Golden Signals dashboard');
      }
    }, 45000);
    
    setTimeout(() => {
      if (isRunning) {
        addUpdate(90, 'metric', '📊', 'P95 latency: 450ms (elevated)');
      }
    }, 90000);
  };

  // Stop scenario
  const stopScenario = () => {
    if (scenario && isRunning) {
      addUpdate(elapsedTime, 'incident', '⏹️', 'Scenario stopped by user');
    }
    setIsRunning(false);
  };

  // Back to scenarios
  const backToScenarios = () => {
    stopScenario();
    setScenario(null);
  };

  return (
    <>
      {showLoadingScreen && (
        <LoadingScreen onLoadComplete={() => setShowLoadingScreen(false)} duration={4500} />
      )}
      <div className="flex h-screen bg-slate-950 text-gray-100 font-mono">
        <IncidentSidebar
          scenario={scenario}
          scenarios={SCENARIOS}
          isRunning={isRunning}
          elapsedTime={elapsedTime}
          updates={updates}
          onSelectScenario={startScenario}
          onStopScenario={stopScenario}
          onBackToScenarios={backToScenarios}
        />
        
        <Workspace
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scenario={scenario}
          requestFeed={requestFeed}
          metrics={metrics}
        />
      </div>
    </>
  );
};

export default ObservaStackV2;

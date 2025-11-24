import React from 'react';
import ObservaStackV2 from './v2';
import ObservaStackV1 from './v1/App';

/**
 * AppRouter - Simple routing component for ObservaStack
 * 
 * Usage:
 * - Navigate to /v1 route to see the original dashboard
 * - Default route (/) and /v2 show the new UI
 * 
 * To enable routing:
 * 1. Install react-router-dom: npm install react-router-dom
 * 2. Replace this file's content with proper routing
 * 3. Update src/index.js to use this component
 */

const AppRouter = () => {
  // Simple hash-based routing (no dependencies needed)
  const [currentRoute, setCurrentRoute] = React.useState(
    window.location.hash.slice(1) || '/'
  );

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation component
  const Navigation = () => (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <a
        href="#/v1"
        className={`px-4 py-2 rounded transition-colors ${
          currentRoute === '/v1' 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
        }`}
      >
        Dashboard v1
      </a>
      <a
        href="#/v2"
        className={`px-4 py-2 rounded transition-colors ${
          currentRoute === '/v2' || currentRoute === '/'
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
        }`}
      >
        Dashboard v2
      </a>
    </div>
  );

  return (
    <>
      <Navigation />
      
      {currentRoute === '/v1' ? (
        <ObservaStackV1 />
      ) : (
        <ObservaStackV2 />
      )}
    </>
  );
};

export default AppRouter;

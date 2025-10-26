import React, { useState, useEffect } from 'react';
import { Server, AlertCircle, BarChart3, Settings } from 'lucide-react';

/* --- Reusable Card Component --- */
const Card = ({ icon, title, description, buttonText, status }) => {
  
  // Choose icon color based on status
  let iconColor = 'text-indigo-400'; // Default
  if (status === 'error') {
    iconColor = 'text-red-400';
  } else if (status === 'ok') {
    iconColor = 'text-green-400';
  }

  return (
    <div className="flex flex-col justify-between bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
      <div>
        <div className={`p-2 bg-gray-800 rounded-full w-min ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mt-4">{title}</h3>
        <p className="text-gray-400 mt-2">{description}</p>
      </div>
      <button className="w-full text-center px-4 py-2.5 mt-6 rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-500">
        {buttonText}
      </button>
    </div>
  );
};


/* --- App Component --- */
export default function App() {
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the backend API
    fetch('/api/hello')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setApiData(data);
      })
      .catch(error => {
        console.error('Failed to fetch:', error);
        setApiError('Failed to fetch data.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Helper to determine the API card's content
  const getApiCardDescription = () => {
    if (isLoading) return "Loading data from backend...";
    if (apiError) return apiError;
    if (apiData) return apiData.message;
    return "No data found.";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-6">
      <div className="w-full max-w-5xl">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Application Control Panel
        </h1>
        
        {/* Grid for the three cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: API Status */}
          <Card
            icon={isLoading ? <Server size={24} /> : (apiError ? <AlertCircle size={24} /> : <Server size={24} />)}
            title="Backend Status"
            description={getApiCardDescription()}
            buttonText="Check Connection"
            status={isLoading ? 'loading' : (apiError ? 'error' : 'ok')}
          />
          
          {/* Card 2: Placeholder */}
          <Card
            icon={<BarChart3 size={24} />}
            title="Analytics"
            description="View application usage, user metrics, and performance analytics."
            buttonText="View Analytics"
          />
          
          {/* Card 3: Placeholder */}
          <Card
            icon={<Settings size={24} />}
            title="Settings"
            description="Configure application settings, manage user permissions, and set up integrations."
            buttonText="Go to Settings"
          />

        </div>
      </div>
    </div>
  );
}


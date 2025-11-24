import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onLoadComplete, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onLoadComplete) {
        onLoadComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onLoadComplete]);

  if (!isVisible) return null;

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" style="width: 100%; height: auto;">
      <rect width="1200" height="800" fill="#0f172a"/>
      
      <defs>
        <linearGradient id="serverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
        </linearGradient>
        
        <radialGradient id="glassGrad" cx="30%" cy="30%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.1" />
        </radialGradient>
      </defs>
      
      <g id="serverStack" transform="translate(400, 250)">
        <g id="server1">
          <rect x="0" y="120" width="280" height="80" rx="8" fill="url(#serverGrad)" stroke="#3b82f6" stroke-width="3"/>
          <rect x="10" y="130" width="260" height="60" rx="4" fill="#1e293b" opacity="0.7"/>
          
          <circle cx="30" cy="150" r="6" class="server-light-1 server-light-pulse"/>
          <circle cx="50" cy="150" r="6" class="server-light-1 server-light-pulse"/>
          <circle cx="70" cy="150" r="6" class="server-light-1 server-light-pulse"/>
          
          <line x1="100" y1="135" x2="260" y2="135" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="145" x2="260" y2="145" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="155" x2="260" y2="155" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="165" x2="260" y2="165" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="175" x2="260" y2="175" stroke="#475569" stroke-width="2"/>
        </g>
        
        <g id="server2">
          <rect x="0" y="40" width="280" height="80" rx="8" fill="url(#serverGrad)" stroke="#3b82f6" stroke-width="3"/>
          <rect x="10" y="50" width="260" height="60" rx="4" fill="#1e293b" opacity="0.7"/>
          
          <circle cx="30" cy="70" r="6" class="server-light-2 server-light-pulse"/>
          <circle cx="50" cy="70" r="6" class="server-light-2 server-light-pulse"/>
          <circle cx="70" cy="70" r="6" class="server-light-2 server-light-pulse"/>
          
          <line x1="100" y1="55" x2="260" y2="55" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="65" x2="260" y2="65" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="75" x2="260" y2="75" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="85" x2="260" y2="85" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="95" x2="260" y2="95" stroke="#475569" stroke-width="2"/>
        </g>
        
        <g id="server3">
          <rect x="0" y="-40" width="280" height="80" rx="8" fill="url(#serverGrad)" stroke="#3b82f6" stroke-width="3"/>
          <rect x="10" y="-30" width="260" height="60" rx="4" fill="#1e293b" opacity="0.7"/>
          
          <circle cx="30" cy="-10" r="6" class="server-light-3 server-light-pulse"/>
          <circle cx="50" cy="-10" r="6" class="server-light-3 server-light-pulse"/>
          <circle cx="70" cy="-10" r="6" class="server-light-3 server-light-pulse"/>
          
          <line x1="100" y1="-25" x2="260" y2="-25" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="-15" x2="260" y2="-15" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="-5" x2="260" y2="-5" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="5" x2="260" y2="5" stroke="#475569" stroke-width="2"/>
          <line x1="100" y1="15" x2="260" y2="15" stroke="#475569" stroke-width="2"/>
        </g>
      </g>
      
      <g id="magnifyingGlass" transform="translate(650, 300)">
        <path d="M 110 110 L 190 190 L 200 180 L 120 100 Z" fill="#64748b" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>
        <path d="M 112 112 L 188 188 L 198 178 L 122 102 Z" fill="#52606d" opacity="0.5"/>
        
        <circle cx="50" cy="50" r="85" fill="none" stroke="#64748b" stroke-width="8"/>
        <circle cx="50" cy="50" r="77" fill="url(#glassGrad)" opacity="0.3"/>
      </g>
      
      <text x="600" y="580" font-family="Consolas, Monaco, 'Courier New', monospace" font-size="72" font-weight="bold" fill="#3b82f6" text-anchor="middle">
        ObservaStack
      </text>
      
      <text x="600" y="630" font-family="Consolas, Monaco, 'Courier New', monospace" font-size="28" fill="#94a3b8" text-anchor="middle">
        A Reliability Engineer Training Sim
      </text>
      
      <g opacity="0.5">
        <line x1="300" y1="100" x2="350" y2="100" stroke="#3b82f6" stroke-width="2" class="data-stream data-stream-1"/>
        <line x1="300" y1="400" x2="350" y2="400" stroke="#3b82f6" stroke-width="2" class="data-stream data-stream-2"/>
        <line x1="750" y1="200" x2="850" y2="200" stroke="#3b82f6" stroke-width="2" class="data-stream data-stream-3"/>
        <line x1="750" y1="500" x2="850" y2="500" stroke="#3b82f6" stroke-width="2" class="data-stream data-stream-4"/>
        
        <circle cx="320" cy="100" r="4" fill="#3b82f6" class="data-point-pulse"/>
        <circle cx="320" cy="400" r="4" fill="#3b82f6" class="data-point-pulse"/>
        <circle cx="800" cy="200" r="4" fill="#3b82f6" class="data-point-pulse"/>
        <circle cx="800" cy="500" r="4" fill="#3b82f6" class="data-point-pulse"/>
      </g>
    </svg>
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]">
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes bootSequence {
          0% { fill: #64748b; }
          50% { fill: #f59e0b; }
          100% { fill: #10b981; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes dataFlow {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }

        .animate-fadeOut {
          animation: fadeOut 0.5s ease-out forwards;
          animation-delay: 4s;
        }

        /* Server lights boot sequence - slower timing */
        .server-light-1 {
          animation: bootSequence 1.5s ease-in-out forwards;
          animation-delay: 0.8s;
          fill: #64748b;
        }

        .server-light-2 {
          animation: bootSequence 1.5s ease-in-out forwards;
          animation-delay: 1.5s;
          fill: #64748b;
        }

        .server-light-3 {
          animation: bootSequence 1.5s ease-in-out forwards;
          animation-delay: 2.2s;
          fill: #64748b;
        }

        /* Pulse effect after boot */
        .server-light-pulse {
          animation: bootSequence 1.5s ease-in-out forwards, pulse 1.5s ease-in-out infinite;
          animation-delay: 0.8s, 3.5s;
        }

        .server-light-2.server-light-pulse {
          animation: bootSequence 1.5s ease-in-out forwards, pulse 1.5s ease-in-out infinite;
          animation-delay: 1.5s, 3.8s;
        }

        .server-light-3.server-light-pulse {
          animation: bootSequence 1.5s ease-in-out forwards, pulse 1.5s ease-in-out infinite;
          animation-delay: 2.2s, 4.1s;
        }

        /* Data stream animations */
        .data-stream {
          stroke-dasharray: 100;
          animation: dataFlow 2s ease-in-out infinite;
        }

        .data-stream-1 { animation-delay: 0s; }
        .data-stream-2 { animation-delay: 0.5s; }
        .data-stream-3 { animation-delay: 1s; }
        .data-stream-4 { animation-delay: 1.5s; }

        .data-point-pulse {
          animation: pulse 1.5s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>

      <div 
        className="w-full max-w-5xl px-4 animate-fadeOut" 
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

export default LoadingScreen;
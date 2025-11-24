import React from 'react';

export const InputSkeleton = () => (
  <div className="space-y-2">
    <div className="h-4 w-24 bg-gray-700 rounded skeleton" />
    <div className="h-10 w-full bg-gray-700 rounded skeleton" />
  </div>
);

export const EndpointListSkeleton = () => (
  <div className="space-y-3">
    <div className="h-4 w-32 bg-gray-700 rounded skeleton" />
    <div className="h-12 w-full bg-gray-700 rounded skeleton" />
    <div className="h-24 bg-gray-800 rounded p-4 space-y-2">
      <div className="h-4 w-full bg-gray-700 rounded skeleton" />
      <div className="h-4 w-3/4 bg-gray-700 rounded skeleton" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
    <div className="h-4 w-20 bg-gray-700 rounded skeleton" />
    <div className="h-6 w-16 bg-gray-700 rounded skeleton" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-2">
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
      <div className="grid grid-cols-6 gap-4 mb-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded skeleton" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 py-3 border-t border-gray-700">
          {[...Array(6)].map((_, j) => (
            <div key={j} className="h-4 bg-gray-700 rounded skeleton" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const LoadingSkeleton = ({ type = 'card', ...props }) => {
  switch (type) {
    case 'input':
      return <InputSkeleton {...props} />;
    case 'endpoints':
      return <EndpointListSkeleton {...props} />;
    case 'stats':
      return <StatCardSkeleton {...props} />;
    case 'table':
      return <TableSkeleton {...props} />;
    default:
      return <div className="h-32 w-full bg-gray-700 rounded skeleton" />;
  }
};

export default LoadingSkeleton;

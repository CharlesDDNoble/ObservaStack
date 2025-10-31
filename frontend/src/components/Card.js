import React from 'react';

export const CARD_STATUS = {
  LOADING: 'loading',
  ERROR: 'error',
  OK: 'ok'
};

export const ICON_COLORS = {
  [CARD_STATUS.LOADING]: 'text-indigo-400',
  [CARD_STATUS.ERROR]: 'text-red-400',
  [CARD_STATUS.OK]: 'text-green-400',
  default: 'text-indigo-400'
};

const Card = ({ icon, title, description, buttonText, status, onButtonClick }) => {
  const iconColor = ICON_COLORS[status] || ICON_COLORS.default;

  return (
    <div className="flex flex-col justify-between bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6">
      <div>
        <div className={`p-2 bg-gray-800 rounded-full w-min ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mt-4">{title}</h3>
        <p className="text-gray-400 mt-2">{description}</p>
      </div>
      <button 
        className="w-full text-center px-4 py-2.5 mt-6 rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-500"
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default Card;
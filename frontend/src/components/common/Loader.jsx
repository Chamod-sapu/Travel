import React from 'react';

const Loader = ({ fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
      <p className="text-on-surface-variant font-medium animate-pulse">Prepping your next journey...</p>
    </div>
  );

  if (fullPage) {
    return <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-[100] flex items-center justify-center">{content}</div>;
  }

  return content;
};

export default Loader;

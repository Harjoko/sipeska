import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customUrl?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  customUrl,
}) => {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt="Logo SDN 1 Keden"
        className={`object-contain rounded-full shadow-xs ${className}`}
      />
    );
  }

  const dimensionClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-amber-700 text-white font-bold shadow-md ring-2 ring-amber-400/50 flex-shrink-0 ${dimensionClass} ${className}`}
      title="SDN 1 Keden - Pedan, Klaten"
    >
      <div className="absolute inset-0.5 rounded-xl border border-amber-300/40 pointer-events-none flex items-center justify-center" />
      <div className="flex flex-col items-center justify-center leading-none text-center select-none">
        <span className="text-[0.6em] tracking-tighter text-amber-300 font-black">SDN 1</span>
        <span className="text-[0.75em] font-extrabold tracking-tight">KEDEN</span>
      </div>
    </div>
  );
};

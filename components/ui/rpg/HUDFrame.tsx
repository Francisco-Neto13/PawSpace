import React from 'react';

export function HUDFrame() {
  const cornerClass = "absolute w-4 h-4 border-[#c8b89a]";
  const dotClass = "absolute w-1.5 h-1.5 bg-[#c8b89a] shadow-[2px_2px_0px_rgba(0,0,0,0.5)]";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />

      <div className="absolute top-0 left-0 m-8 w-24 h-24">
        <div className={`${cornerClass} top-0 left-0 border-t-4 border-l-4`} />
        <div className={`${dotClass} top-0 left-0 -translate-x-1 -translate-y-1`} />
      </div>
      
      <div className="absolute top-0 right-0 m-8 w-24 h-24">
        <div className={`${cornerClass} top-0 right-0 border-t-4 border-r-4`} />
        <div className={`${dotClass} top-0 right-0 translate-x-1 -translate-y-1`} />
      </div>

      <div className="absolute bottom-0 left-0 m-8 w-24 h-24">
        <div className={`${cornerClass} bottom-0 left-0 border-b-4 border-l-4`} />
        <div className={`${dotClass} bottom-0 left-0 -translate-x-1 translate-y-1`} />
      </div>

      <div className="absolute bottom-0 right-0 m-8 w-24 h-24">
        <div className={`${cornerClass} bottom-0 right-0 border-b-4 border-r-4`} />
        <div className={`${dotClass} bottom-0 right-0 translate-x-1 translate-y-1`} />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
import React from 'react';

const Loader3D: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-24 w-full">
      <div className="relative w-24 h-24 preserve-3d animate-spin-slow">
        <div className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-secondary border-l-secondary rounded-full animate-spin-fast shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        <div className="absolute inset-2 border-4 border-t-secondary border-r-secondary border-b-primary border-l-primary rounded-full animate-spin-reverse opacity-70"></div>
        <div className="absolute inset-4 border-4 border-dashed border-primary rounded-full animate-spin-slow opacity-50"></div>
      </div>
      <p className="mt-6 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default Loader3D;

import React from 'react';

const ButtonBox = ({ children, className = "", style = {} }) => {
  return (
    <div className={`relative inline-flex items-center justify-center w-[280px] h-[84px] sm:w-[320px] sm:h-[96px] md:w-[380px] md:h-[114px] lg:w-[500px] lg:h-[150px] ${className}`} style={style}>
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/buttonbox.svg')", 
          backgroundSize: "180% 466%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0
        }}
      />
      <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3 md:py-4 lg:py-6">
        {children}
      </div>
    </div>
  );
};

export default ButtonBox;

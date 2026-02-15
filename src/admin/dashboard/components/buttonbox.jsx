import React from 'react';

const ButtonBox = ({ children, className = "", style = {} }) => {
  return (
    <div className={`relative inline-flex items-center justify-center w-[500px] h-[150px] ${className}`} style={style}>
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/buttonbox.svg')", 
          backgroundSize: "900px 466%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0
        }}
      />
      <div className="relative z-10 px-12 py-6">
        {children}
      </div>
    </div>
  );
};

export default ButtonBox;

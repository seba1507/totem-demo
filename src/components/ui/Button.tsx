'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary';
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  ariaLabel,
  variant = 'primary',
  style
}) => {
  // Aurora Glass UI Base Styles
  const baseStyles = `
    relative
    text-center 
    py-[18px]
    px-[28px] 
    rounded-full 
    font-bold 
    text-xl
    text-white 
    transition-all 
    duration-300
    ease-out
    transform
    hover:scale-[1.03]
    active:scale-95
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:transform-none
    focus:outline-none
    focus:ring-4
    focus:ring-offset-2
    focus:ring-offset-transparent
    will-change-transform
    border
    overflow-hidden
  `;

  // Aurora Glass UI Variant Styles
  const variantStyles = {
    primary: `
      bg-gradient-conic 
      from-cyan-400 
      via-purple-600 
      to-pink-500
      hover:from-cyan-300 
      hover:via-purple-500 
      hover:to-pink-400
      border-white/20
      shadow-[0_0_20px_rgba(0,230,255,0.4),0_0_40px_rgba(0,230,255,0.2)]
      hover:shadow-[0_0_30px_rgba(122,0,255,0.6),0_0_60px_rgba(122,0,255,0.3)]
      focus:ring-cyan-400/50
      backdrop-blur-sm
    `,
    secondary: `
      bg-white/10 
      backdrop-blur-md 
      border-white/20
      hover:bg-white/20
      hover:border-white/30
      shadow-[0_8px_32px_rgba(0,0,0,0.25)]
      hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]
      focus:ring-white/30
    `
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{
        background: variant === 'primary' ? 'var(--conic-gradient)' : undefined,
        animation: variant === 'primary' ? 'var(--animate-pulse-glow)' : undefined,
        ...style
      }}
    >
      {/* Inner border glow effect */}
      <span 
        className="absolute inset-[1px] rounded-full bg-transparent pointer-events-none"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.22)',
          background: variant === 'primary' 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)'
            : undefined
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10 tracking-wide">
        {children}
      </span>
    </button>
  );
};

export default Button;
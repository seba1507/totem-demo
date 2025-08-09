'use client';

import React from 'react';

interface LoadingProgressProps {
  progress?: number; // 0-100
  message: string;
  subMessage?: string;
  showPercentage?: boolean;
  variant?: 'circular' | 'linear';
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress,
  message,
  subMessage,
  showPercentage = true,
  variant = 'linear'
}) => {
  const hasProgress = progress !== undefined;
  
  return (
    <div 
      className="flex flex-col items-center justify-center p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Mensaje principal */}
      <p className="text-subtitle text-subtitle-color mb-4 text-center">
        {message}
      </p>
      
      {/* Barra de progreso o spinner */}
      {variant === 'linear' ? (
        <div className="w-64 md:w-80">
          {hasProgress ? (
            <>
              <div 
                className="w-full bg-gray-700 rounded-full h-3 overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso: ${progress}%`}
              >
                <div 
                  className="h-full transition-all duration-300 ease-out rounded-full"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: 'var(--accent-cyan)'
                  }}
                />
              </div>
              {showPercentage && (
                <p className="text-center mt-2 text-primary">
                  {Math.round(progress)}%
                </p>
              )}
            </>
          ) : (
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-red-500 to-transparent animate-shimmer rounded-full" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {hasProgress ? (
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="var(--accent-cyan)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (progress || 0) / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-16 h-16 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin" />
          )}
        </div>
      )}
      
      {/* Submensaje */}
      {subMessage && (
        <p className="text-sm mt-4 text-center text-glass-muted max-w-md">
          {subMessage}
        </p>
      )}
      
      {/* Texto oculto para lectores de pantalla */}
      <span className="sr-only">
        {hasProgress 
          ? `Cargando: ${Math.round(progress)}% completado` 
          : 'Cargando, por favor espera'}
      </span>
    </div>
  );
};

export default LoadingProgress;
'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: 'cyan' | 'magenta';
  animationDelay: number;
  animationDuration: number;
}

interface ParticleLayerProps {
  particleCount?: number;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function ParticleLayer({ 
  particleCount = 25, 
  className = '',
  intensity = 'medium'
}: ParticleLayerProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles with random properties
  const generateParticles = useMemo(() => {
    // Enhanced for 47" TOTEM display
    const intensityMultiplier = {
      low: 0.8,
      medium: 1.2,
      high: 1.6
    };

    return Array.from({ length: Math.floor(particleCount * intensityMultiplier[intensity]) }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Percentage position
      y: Math.random() * 100,
      size: Math.random() * 6 + 3, // 3-9px for large screen
      opacity: Math.random() * 0.5 + 0.4, // 0.4-0.9 higher visibility
      color: Math.random() > 0.5 ? 'cyan' : 'magenta' as 'cyan' | 'magenta',
      animationDelay: Math.random() * 4, // 0-4s delay
      animationDuration: Math.random() * 3 + 4, // 4-7s duration for smoother motion
    }));
  }, [particleCount, intensity]);

  useEffect(() => {
    setParticles(generateParticles);
  }, [generateParticles]);

  const getParticleColor = (color: 'cyan' | 'magenta') => {
    return color === 'cyan' ? '#00E6FF' : '#FF2E93';
  };

  const getParticleGlow = (color: 'cyan' | 'magenta') => {
    return color === 'cyan' 
      ? '0 0 8px rgba(0, 230, 255, 0.6), 0 0 16px rgba(0, 230, 255, 0.3)'
      : '0 0 8px rgba(255, 46, 147, 0.6), 0 0 16px rgba(255, 46, 147, 0.3)';
  };

  return (
    <div 
      className={`pointer-events-none fixed inset-0 z-10 ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full will-change-transform gpu-accelerated"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: getParticleColor(particle.color),
            opacity: particle.opacity,
            boxShadow: getParticleGlow(particle.color),
            animation: `float ${particle.animationDuration}s ease-in-out infinite`,
            animationDelay: `${particle.animationDelay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Additional floating elements for depth */}
      <div
        className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(0, 230, 255, 0.1) 0%, transparent 70%)',
          animation: 'aurora 6s ease-in-out infinite alternate',
          animationDelay: '1s',
        }}
      />
      
      <div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(255, 46, 147, 0.1) 0%, transparent 70%)',
          animation: 'aurora 5s ease-in-out infinite alternate-reverse',
          animationDelay: '2s',
        }}
      />
      
      <div
        className="absolute top-2/3 left-1/5 w-20 h-20 rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(122, 0, 255, 0.08) 0%, transparent 70%)',
          animation: 'aurora 7s ease-in-out infinite alternate',
          animationDelay: '0.5s',
        }}
      />
    </div>
  );
}

// Hook for lazy loading particles
export function useParticleLayer(enabled: boolean = true) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    
    // Lazy load particles after a short delay to prioritize main content
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [enabled]);

  return shouldRender;
}
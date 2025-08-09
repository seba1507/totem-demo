'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import ParticleLayer, { useParticleLayer } from '@/components/effects/ParticleLayer';

interface BienvenidaScreenProps {
  onNavigate: () => void;
}

const BienvenidaScreen: React.FC<BienvenidaScreenProps> = ({ onNavigate }) => {
  const [messageIndex, setMessageIndex] = React.useState(0);
  const shouldRenderParticles = useParticleLayer(true);
  
  const messages = [
    {
      lines: ["¡VIVE LA", "EXPERIENCIA!"],
      emphasis: [true, true]
    },
    {
      lines: ["QUE TU MARCA", "MERECE."],
      emphasis: [true, true]
    },
    {
      lines: ["CAPTURA.", "TRANSFORMA.", "COMPARTE."],
      emphasis: [true, true, true]
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500); // Slightly faster rotation for more dynamic feel
    
    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[messageIndex];
  
  return (
    <section 
      className="h-screen w-full bg-gradient-to-b from-[#0A0B0F] via-[#11122A] to-[#1B0B33] overflow-hidden"
      aria-label="Pantalla de bienvenida Aurora Glass UI"
    >
      {/* Contenedor principal 9:16 */}
      <div className="h-full w-full max-w-[1080px] mx-auto flex flex-col relative">
        
        {/* Aurora Glass UI Particles */}
        {shouldRenderParticles && (
          <ParticleLayer 
            particleCount={25} 
            intensity="high"
            className="absolute inset-0 z-0"
          />
        )}
        
        {/* Header Zone (20% de altura) */}
        <div className="h-[20%] flex items-center justify-center relative z-20">
          <div className="text-center">
            <p className="text-cyan-400 text-2xl lg:text-3xl font-bold animate-pulse"
               style={{ fontFamily: 'Futura Std' }}>
              BIENVENIDO A LA EXPERIENCIA
            </p>
          </div>
        </div>
        
        {/* Main Message Zone (50% de altura) */}
        <div className="h-[50%] flex items-center justify-center relative z-20">
          <div className="text-center space-y-8 max-w-[900px] px-4" aria-live="polite" aria-atomic="true">
            <h1 
              className="font-bold tracking-tight leading-[0.85] transition-all duration-500 will-change-transform"
              style={{ 
                fontSize: 'clamp(4rem, 8vw, 7rem)',
                fontWeight: 800,
                fontFamily: 'Futura Std',
                textShadow: '0 0 60px rgba(0, 230, 255, 0.6), 0 0 120px rgba(122, 0, 255, 0.4)',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #00E6FF 40%, #7A00FF 70%, #FF2E93 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {currentMessage.lines.map((line, index) => (
                <div 
                  key={index} 
                  className={`${index === 0 ? "" : "mt-6"}`}
                >
                  {currentMessage.emphasis[index] ? <strong>{line}</strong> : line}
                </div>
              ))}
            </h1>
            
            {/* Enhanced Tagline */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 inline-block px-8 py-6 mx-auto max-w-[700px]">
              <p 
                className="font-medium text-white text-center"
                style={{ 
                  fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
                  lineHeight: 1.4,
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                  letterSpacing: '0.05em'
                }}
              >
                IA AVANZADA • DESCARGA INSTANTÁNEA • EXPERIENCIA ÚNICA
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Zone (30% de altura) */}
        <div className="h-[30%] flex flex-col items-center justify-center space-y-6 relative z-20">
          <Button
            onClick={onNavigate}
            className="min-h-[80px] px-16 text-2xl lg:text-3xl transform hover:scale-105 transition-all"
            ariaLabel="Iniciar la experiencia de transformación con IA"
          >
            INICIAR EXPERIENCIA
          </Button>
          
          {/* Touch Instruction for TOTEM */}
          <div className="text-center">
            <p 
              className="text-white/70 font-medium animate-pulse"
              style={{
                fontSize: '1.5rem',
                letterSpacing: '0.1em'
              }}
            >
              TOCA LA PANTALLA PARA COMENZAR
            </p>
          </div>
          
          {/* Additional instruction */}
          <div className="text-center">
            <p className="text-cyan-400/80 text-lg">
              Transforma tu foto con inteligencia artificial
            </p>
          </div>
        </div>
      </div>
      
      {/* Accessibility Text */}
      <div className="sr-only" role="status">
        Bienvenido a la experiencia Aurora Glass UI. Una plataforma de transformación visual con inteligencia artificial.
        Presiona el botón Iniciar para comenzar tu experiencia personalizada.
      </div>
    </section>
  );
};

export default BienvenidaScreen;
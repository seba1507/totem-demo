"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import ParticleLayer, { useParticleLayer } from "@/components/effects/ParticleLayer";

interface ReviewScreenProps {
  imageUrl: string | null;
  onAccept: () => void;
  onRetake: () => void;
}

export default function ReviewScreen({ imageUrl, onAccept, onRetake }: ReviewScreenProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const shouldRenderParticles = useParticleLayer(true);
  
  if (!imageUrl) return null;

  const handleAccept = () => {
    if (!isAccepting) {
      setIsAccepting(true);
      onAccept();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'r' || e.key === 'R') {
      onRetake();
    } else if (e.key === 'Enter' || e.key === ' ') {
      handleAccept();
    }
  };

  return (
    <section 
      className="h-screen w-full bg-gradient-to-b from-[#0A0B0F] via-[#11122A] to-[#1B0B33] overflow-hidden"
      aria-label="Pantalla de revisión de fotografía Aurora Glass UI"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Contenedor principal 9:16 */}
      <div className="h-full w-full max-w-[1080px] mx-auto flex flex-col relative">
        
        {/* Header Zone (12% de altura) */}
        <div className="h-[12%] flex items-center justify-center relative z-20">
          <h1 
            className="text-6xl lg:text-7xl font-bold text-white text-center" 
            style={{ 
              fontFamily: 'Futura Std',
              textShadow: 'var(--text-hero-glow)'
            }}
          >
            ¿TE GUSTA TU FOTO?
          </h1>
        </div>
        
        {/* Photo Zone (60% de altura) */}
        <div className="h-[60%] relative flex items-center justify-center">
          {/* Efectos de partículas de fondo */}
          {shouldRenderParticles && (
            <ParticleLayer 
              particleCount={12} 
              intensity="medium"
              className="absolute inset-0 z-0"
            />
          )}
          
          {/* Photo Container 2:3 */}
          <div className="relative z-10 w-[85%] max-w-[675px] aspect-[2/3]">
            {/* Glass card effect mejorado para mostrar la foto */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30"
                 style={{
                   boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                 }} />
            
            {/* Photo preview */}
            <div className="relative p-2 h-full">
              <div 
                className="w-full h-full bg-black/20 rounded-xl overflow-hidden shadow-2xl relative"
                role="img"
                aria-label="Tu fotografía capturada"
              >
                <Image
                  src={imageUrl}
                  alt="Tu fotografía capturada para procesar"
                  fill
                  sizes="100vw"
                  className="object-cover rounded-xl"
                  priority
                />
                
                {/* Frame decorativo dorado */}
                <div className="absolute inset-0 border-2 border-yellow-400/40 rounded-xl pointer-events-none" 
                     style={{
                       boxShadow: 'inset 0 0 30px rgba(255,215,0,0.3)'
                     }}/>
              </div>
            </div>
            
            {/* Indicadores de esquinas dorados para destacar */}
            <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl" />
            <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl" />
            <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-yellow-400 rounded-br-xl" />
          </div>
        </div>
        
        {/* Controls Zone (20% de altura) */}
        <div className="h-[20%] flex flex-col items-center justify-center gap-6 relative z-20">
          {/* Botones optimizados para touch */}
          <div 
            className="flex gap-12"
            role="group"
            aria-label="Opciones de fotografía"
          >
            <button
              onClick={onRetake}
              disabled={isAccepting}
              className="min-h-[80px] px-12 py-5 rounded-full font-bold text-xl text-white uppercase tracking-wider
                       transition-all duration-300 transform hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed
                       bg-white/10 backdrop-blur-md border border-white/20
                       hover:bg-white/20 hover:border-white/30
                       shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
              aria-label="Tomar otra fotografía"
            >
              REPETIR
            </button>
            
            <Button 
              onClick={handleAccept}
              disabled={isAccepting}
              ariaLabel="Aceptar fotografía y continuar"
              className="min-h-[80px] px-16 text-xl transform hover:scale-105 transition-all"
            >
              {isAccepting ? "PROCESANDO..." : "ACEPTAR"}
            </Button>
          </div>

          {/* Instrucciones de teclado */}
          <p className="text-white/60 text-lg text-center">
            Presiona R para repetir • Enter para aceptar
          </p>
        </div>
        
        {/* Bottom Zone (8% de altura) - Espacio para efectos */}
        <div className="h-[8%] flex items-center justify-center">
          <p className="text-cyan-400 text-lg animate-pulse">
            {isAccepting ? "Preparando para procesamiento..." : "Elige una opción"}
          </p>
        </div>
      </div>
    </section>
  );
}
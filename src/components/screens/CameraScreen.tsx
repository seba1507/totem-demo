"use client";

import { useRef, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ParticleLayer, { useParticleLayer } from "@/components/effects/ParticleLayer";
import { useCamera } from "@/contexts/CameraContext";

interface CameraScreenProps {
  onStartCountdown: () => void;
}

export default function CameraScreen({ onStartCountdown }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, isReady, error, initializeCamera } = useCamera();
  const [videoReady, setVideoReady] = useState(false);
  const shouldRenderParticles = useParticleLayer(true);

  useEffect(() => {
    initializeCamera();
  }, [initializeCamera]);

  useEffect(() => {
    if (videoRef.current && stream && isReady) {
      console.log("CameraScreen: Conectando stream al video");
      videoRef.current.srcObject = stream;
      videoRef.current.play()
        .then(() => {
          console.log("CameraScreen: Video reproduciendo");
          setVideoReady(true);
        })
        .catch(err => console.error("Error al reproducir:", err));
    }
  }, [stream, isReady]);

  return (
    <section 
      className="h-screen w-full bg-gradient-to-b from-[#0A0B0F] via-[#11122A] to-[#1B0B33] overflow-hidden"
      aria-label="Pantalla de cámara Aurora Glass UI"
    >
      {/* Contenedor principal 9:16 */}
      <div className="h-full w-full max-w-[1080px] mx-auto flex flex-col relative">
        
        {/* Header Zone (15% de altura) */}
        <div className="h-[15%] flex flex-col items-center justify-center relative z-20">
          <h1 className="text-6xl lg:text-7xl font-bold text-white mb-2"
              style={{ 
                fontFamily: 'Futura Std',
                textShadow: 'var(--text-hero-glow)'
              }}>
            PONTE EN POSICIÓN
          </h1>
          <p className="text-2xl lg:text-3xl text-cyan-400 font-bold">
            Y PREPÁRATE PARA LA FOTO
          </p>
        </div>
        
        {/* Camera Zone (63% de altura) */}
        <div className="h-[63%] relative flex items-center justify-center">
          {/* Efectos de partículas de fondo */}
          {shouldRenderParticles && (
            <ParticleLayer 
              particleCount={20} 
              intensity="medium"
              className="absolute inset-0 z-0"
            />
          )}
          
          {/* Camera Preview Container 2:3 */}
          <div className="relative z-10 w-[80%] max-w-[675px] aspect-[2/3]">
            {/* Glass card effect */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20" />
            
            {/* Camera preview */}
            <div className="relative p-3 h-full">
              <div 
                className="w-full h-full bg-black/50 rounded-xl overflow-hidden shadow-2xl relative"
                role="region"
                aria-label="Vista previa de la cámara"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="-scale-x-100 w-full h-full object-cover"
                  aria-label="Vista de cámara en tiempo real"
                />
                
                {/* Frame decorativo luminoso */}
                <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-xl pointer-events-none" 
                     style={{
                       boxShadow: 'inset 0 0 30px rgba(0,230,255,0.2)'
                     }}/>
                
                {(!videoReady || !isReady) && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
                    <div className="text-center">
                      <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white text-xl">Iniciando cámara...</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
                    <div className="text-center p-6">
                      <p className="text-white text-xl mb-6">{error}</p>
                      <button 
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                        onClick={() => window.location.reload()}
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Indicadores de esquinas para enmarcar */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-cyan-400 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-cyan-400 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl" />
          </div>
        </div>
        
        {/* Controls Zone (22% de altura) */}
        <div className="h-[22%] flex flex-col items-center justify-center gap-4 relative z-20">
          <p className="text-xl lg:text-2xl text-white/80 mb-2">
            Cuando estés listo, presiona:
          </p>
          
          <Button 
            onClick={onStartCountdown} 
            disabled={!videoReady || !!error}
            className="min-h-[80px] px-16 text-2xl lg:text-3xl transform hover:scale-105 transition-all"
            style={{
              fontSize: '1.875rem',
              padding: '1.25rem 4rem'
            }}
          >
            TOMAR FOTO
          </Button>
          
          <p className="text-cyan-400 text-lg lg:text-xl animate-pulse">
            Toca el botón para iniciar la cuenta regresiva
          </p>
        </div>
      </div>
    </section>
  );
}
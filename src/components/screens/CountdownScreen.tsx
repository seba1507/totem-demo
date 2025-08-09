"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useCamera } from "@/contexts/CameraContext";
import { useFocusTrap, useAnnouncement } from "@/hooks/useAccessibility";
import ParticleLayer, { useParticleLayer } from "@/components/effects/ParticleLayer";

interface CountdownScreenProps {
  onCapture: (data: string) => void;
}

export default function CountdownScreen({ onCapture }: CountdownScreenProps) {
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  
  const { stream, isReady } = useCamera();
  const focusTrapRef = useFocusTrap(true);
  const announce = useAnnouncement();
  const shouldRenderParticles = useParticleLayer(true);

  // Conectar stream al video cuando se monte el componente
  useEffect(() => {
    if (videoRef.current && stream && isReady) {
      console.log("CountdownScreen: Conectando stream al video");
      videoRef.current.srcObject = stream;
      videoRef.current.play()
        .then(() => {
          console.log("CountdownScreen: Video reproduciendo");
          setVideoReady(true);
          announce("Cámara lista. Iniciando cuenta regresiva", "polite");
        })
        .catch(err => console.error("Error al reproducir:", err));
    }
  }, [stream, isReady, announce]);

  /* ----------------------------- Captura ------------------------------ */
  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !videoReady) {
      console.error("Refs not available for capture or video not ready");
      return;
    }

    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = 1024;
    c.height = 1536;

    const ctx = c.getContext("2d")!;
    const aspectTarget = 2 / 3;
    const aspectVideo = v.videoWidth / v.videoHeight;

    let sx = 0,
      sy = 0,
      sw = v.videoWidth,
      sh = v.videoHeight;

    if (aspectVideo > aspectTarget) {
      // Recortar horizontal
      sh = v.videoHeight;
      sw = sh * aspectTarget;
      sx = (v.videoWidth - sw) / 2;
    } else {
      // Recortar vertical
      sw = v.videoWidth;
      sh = sw / aspectTarget;
      sy = (v.videoHeight - sh) / 2;
    }

    ctx.save();
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
    ctx.restore();

    announce("¡Foto capturada!", "assertive");
    onCapture(c.toDataURL("image/jpeg", 0.9));
  }, [onCapture, videoReady, announce]);

  /* --------------------- Lógica unificada de temporizador -------------- */
  useEffect(() => {
    // No iniciar la cuenta regresiva hasta que el video esté listo
    if (!videoReady) return;
    
    // Anunciar cada número del countdown
    if (count > 0) {
      announce(`${count}`, "assertive");
    }
    
    if (count === 0) {
      // Momento "flash" => capturar y avisar al padre
      setFlash(true);
      capture();
      const off = setTimeout(() => setFlash(false), 120);
      return () => clearTimeout(off);
    }

    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, capture, videoReady, announce]);

  /* -------------------------------- UI -------------------------------- */
  return (
    <section 
      ref={focusTrapRef}
      className="h-screen w-full bg-gradient-to-b from-[#0A0B0F] via-[#11122A] to-[#1B0B33] overflow-hidden"
      aria-label="Captura de fotografía con cuenta regresiva"
      tabIndex={-1}
    >
      {/* Contenedor principal 9:16 */}
      <div className="h-full w-full max-w-[1080px] mx-auto flex flex-col relative">
        
        {/* Header Zone (15% de altura) */}
        <div className="h-[15%] flex items-center justify-center relative z-20">
          <h1 
            className="text-6xl lg:text-7xl font-bold text-white animate-pulse" 
            style={{ 
              fontFamily: 'Futura Std',
              textShadow: 'var(--text-hero-glow)'
            }}
          >
            ¡PREPÁRATE!
          </h1>
        </div>
        
        {/* Camera Zone (70% de altura) */}
        <div className="h-[70%] relative flex items-center justify-center">
          {/* Efectos de partículas de fondo */}
          {shouldRenderParticles && (
            <ParticleLayer 
              particleCount={15} 
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
                aria-label="Vista previa de cámara con cuenta regresiva"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="-scale-x-100 w-full h-full object-cover"
                  aria-hidden="true"
                />
                
                {/* Frame decorativo luminoso */}
                <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-xl pointer-events-none" 
                     style={{
                       boxShadow: 'inset 0 0 30px rgba(0,230,255,0.2)'
                     }}/>

                {/* Estado de carga de la cámara */}
                {!videoReady && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white text-xl">Preparando cámara...</p>
                    </div>
                  </div>
                )}

                {/* Número de cuenta regresiva - Aurora Style */}
                {videoReady && count > 0 && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    role="timer"
                    aria-live="assertive"
                    aria-atomic="true"
                  >
                    <div className="relative">
                      <span className="text-[180px] lg:text-[200px] font-bold text-white animate-pulse z-20"
                            style={{
                              textShadow: '0 0 60px rgba(0,230,255,0.8), 0 0 120px rgba(122,0,255,0.5)',
                              fontFamily: 'Futura Std'
                            }}>
                        {count}
                      </span>
                      {/* Efecto de anillo alrededor del número */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-8 border-cyan-400/50 rounded-full animate-ping" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Indicadores de esquinas para enmarcar */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl animate-pulse" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-cyan-400 rounded-tr-2xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-cyan-400 rounded-bl-2xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl animate-pulse" />
          </div>
        </div>
        
        {/* Bottom Zone (15% de altura) */}
        <div className="h-[15%] flex items-center justify-center relative z-20">
          <p className="text-2xl lg:text-3xl text-cyan-400 animate-pulse">
            {videoReady && count > 0 ? "Mantén la posición..." : ""}
          </p>
        </div>
        
        {/* Texto de estado para lectores de pantalla */}
        <div className="sr-only" role="status" aria-live="polite">
          {videoReady 
            ? count > 0 
              ? `Cuenta regresiva: ${count} segundos para la captura`
              : "Capturando fotografía..."
            : "Preparando cámara para la captura..."
          }
        </div>
      </div>

      {/* Flash effect con anuncio */}
      {flash && (
        <div 
          className="absolute inset-0 bg-white z-30 animate-[blink_120ms_ease-out]"
          role="status"
          aria-live="assertive"
          aria-label="Fotografía capturada"
        />
      )}

      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}
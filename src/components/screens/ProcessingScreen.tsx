'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Lottie from 'lottie-react';
import LoadingProgress from '@/components/ui/LoadingProgress';
import ParticleLayer, { useParticleLayer } from '@/components/effects/ParticleLayer';
import { compressImage } from '@/utils/imageCompression';

interface ProcessingScreenProps {
  imageUrl: string | null;
  requestId: string | null;
  onProcessingComplete: (imageUrl: string, s3Url?: string, s3Key?: string, fileName?: string) => void;
  onProcessingError: (error: string) => void;
  brandVideoUrl?: string;
  welcomeMessage?: string;
}

export default function ProcessingScreen({ 
  imageUrl, 
  requestId,
  onProcessingComplete, 
  onProcessingError,
  brandVideoUrl = '/videos/brand_video.mp4',
  welcomeMessage = 'Mientras tu imagen es procesada, te invitamos a ver el siguiente video'
}: ProcessingScreenProps) {
  const [processingStatus, setProcessingStatus] = useState<string>("Preparando imagen...");
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoEnded, setVideoEnded] = useState<boolean>(false);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldRenderParticles = useParticleLayer(true);
  
  // Referencias para control de ciclo de vida
  const isCompletedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mensajes rotativos
  const messages = [
    {
      lines: ["APLICANDO", "MAGIA DE IA..."],
      emphasis: [true, true]
    },
    {
      lines: ["DETECTANDO", "RASGOS Y LUZ..."],
      emphasis: [true, true]
    },
    {
      lines: ["INTEGRANDO", "ESTILO DE MARCA..."],
      emphasis: [true, true]
    },
    {
      lines: ["AFINANDO", "DETALLES..."],
      emphasis: [true, true]
    },
    {
      lines: ["PREPARANDO TU", "MOMENTO WOW..."],
      emphasis: [true, true]
    }
  ];
  
  // Cargar animación Lottie
  useEffect(() => {
    fetch('/lottie/loading.json')
      .then(response => response.json())
      .then(data => setLottieData(data))
      .catch(err => console.error('Error loading Lottie animation:', err));
  }, []);

  // Manejar interacción del usuario
  const handleUserInteraction = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
      if (videoRef.current && videoRef.current.paused && !videoError && !videoEnded) {
        videoRef.current.play().catch(error => {
          console.warn('Error al reproducir video después de interacción:', error);
        });
      }
    }
  }, [userInteracted, videoError, videoEnded]);

  // Mensaje de bienvenida
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);
    return () => clearTimeout(welcomeTimer);
  }, []);

  // Listener para interacción
  useEffect(() => {
    const handleClick = () => handleUserInteraction();
    const handleTouch = () => handleUserInteraction();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('touchstart', handleTouch);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [handleUserInteraction]);

  // Handlers de video
  const handleVideoError = () => {
    console.warn('Error al cargar el video, usando fallback');
    setVideoError(true);
  };

  const handleVideoEnded = () => {
    console.log('Video terminado, mostrando contenido alternativo');
    setVideoEnded(true);
  };

  const handleVideoCanPlay = () => {
    console.log('Video listo para reproducir');
  };

  // Rotación de mensajes
  useEffect(() => {
    if (!showWelcome) {
      const interval = setInterval(() => {
        setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showWelcome, messages.length]);

  // Procesamiento principal
  useEffect(() => {
    let isMounted = true;

    const processImage = async () => {
      if (!imageUrl || !isMounted || isCompletedRef.current || isProcessingRef.current) {
        return;
      }

      isProcessingRef.current = true;
      
      try {
        setProcessingStatus("Optimizando imagen...");
        setProcessingProgress(5);
        
        let compressedImageUrl = imageUrl;
        try {
          compressedImageUrl = await compressImage(imageUrl, 1024, 1536, 0.9);
          console.log('Imagen comprimida exitosamente');
          setProcessingProgress(15);
        } catch (compressionError) {
          console.warn('No se pudo comprimir la imagen, usando original:', compressionError);
        }
        
        const response = await fetch(compressedImageUrl);
        const blob = await response.blob();
        console.log(`Tamaño de imagen a enviar: ${blob.size} bytes`);
        setProcessingProgress(20);

        const formData = new FormData();
        formData.append('image', blob, 'captured-image.jpg');
        formData.append('timestamp', Date.now().toString());
        
        if (requestId) {
          formData.append('requestId', requestId);
        }

        if (!isMounted) return;
        setProcessingStatus("Aplicando inteligencia artificial...");
        setProcessingProgress(30);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 250000);
        
        try {
          const processResponse = await fetch('/api/process-aging', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store',
              'Pragma': 'no-cache',
              'X-Request-Time': Date.now().toString()
            }
          });
          
          clearTimeout(timeoutId);

          if (!processResponse.ok) {
            const errorData = await processResponse.json();
            throw new Error(errorData.error || 'Error al procesar la imagen');
          }

          const data = await processResponse.json();
          
          if (!data.success) {
            throw new Error('Error en el procesamiento de la imagen');
          }

          if (isCompletedRef.current || !isMounted) {
            console.log("Ignorando resultado porque el componente ya no está montado");
            return;
          }

          if (!isMounted) return;
          setProcessingStatus("¡Imagen lista!");
          setProcessingProgress(100);
          
          const processedImageUrl = data.imageUrl;
          const s3Url = data.s3Url;
          const s3Key = data.s3Key;
          const fileName = data.fileName;
          console.log("URL de imagen procesada:", processedImageUrl);
          console.log("S3 URL:", s3Url);
          console.log("S3 Key:", s3Key);
          
          isCompletedRef.current = true;
          
          setTimeout(() => {
            if (isMounted) {
              onProcessingComplete(processedImageUrl, s3Url, s3Key, fileName);
            }
          }, 500);
          
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('El procesamiento tardó demasiado tiempo. Por favor intenta nuevamente.');
          }
          
          throw fetchError;
        }
        
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        if (!isMounted) return;
        
        setProcessingStatus("Error al procesar la imagen");
        setProcessingProgress(0);
        
        onProcessingError(
          error instanceof Error 
            ? error.message 
            : 'Ocurrió un error inesperado al procesar la imagen'
        );
      } finally {
        isProcessingRef.current = false;
      }
    };
    
    processingTimeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.log("⏱️ Iniciando procesamiento después del timeout");
        processImage();
      }
    }, 500);
    
    return () => {
      console.log("🧹 Desmontando ProcessingScreen, limpiando recursos");
      isMounted = false;
      
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!imageUrl) {
      onProcessingError("No hay imagen para procesar");
    }
  }, [imageUrl, onProcessingError]);

  const currentMessage = messages[messageIndex];

  return (
    <section 
      className="h-screen w-full bg-gradient-to-b from-[#0A0B0F] via-[#11122A] to-[#1B0B33] overflow-hidden"
      aria-label="Procesando tu imagen"
    >
      {/* Contenedor principal 9:16 */}
      <div className="h-full w-full max-w-[1080px] mx-auto flex flex-col relative">
        
        {/* Aurora Glass UI Particles */}
        {shouldRenderParticles && (
          <ParticleLayer 
            particleCount={20} 
            intensity="medium"
            className="absolute inset-0 z-0"
          />
        )}
        
        {/* Content container */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-8 py-6">
          {/* Welcome Message Phase */}
          {showWelcome ? (
            <div className="h-full flex flex-col justify-center items-center">
              {/* Header Zone */}
              <div className="h-[25%] flex items-center justify-center">
                <h1 
                  className="text-4xl lg:text-5xl font-bold text-white text-center px-4"
                  style={{ 
                    fontFamily: 'Futura Std',
                    textShadow: 'var(--text-hero-glow)'
                  }}
                  aria-live="polite"
                >
                  {welcomeMessage}
                </h1>
              </div>
              
              {/* Progress Zone */}
              <div className="h-[50%] flex items-center justify-center">
                <div className="w-[80%] max-w-[600px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
                  <LoadingProgress
                    progress={processingProgress}
                    message={processingStatus}
                    subMessage="Preparando experiencia con IA..."
                    variant="circular"
                  />
                </div>
              </div>
              
              {/* Bottom Zone */}
              <div className="h-[25%] flex items-center justify-center">
                <p className="text-cyan-400 text-xl animate-pulse">
                  Tu imagen está siendo procesada...
                </p>
              </div>
            </div>
          ) : (
            // Main Processing Content
            <div className="h-full flex flex-col">
              {/* Brand Video */}
              {brandVideoUrl && !videoError && !videoEnded ? (
                <>
                  {/* Header Zone (10%) */}
                  <div className="h-[10%] flex items-center justify-center">
                    <h2 className="text-2xl lg:text-3xl text-white font-bold"
                        style={{ fontFamily: 'Futura Std' }}>
                      MIENTRAS PROCESAMOS TU IMAGEN
                    </h2>
                  </div>
                  
                  {/* Video Zone (65%) */}
                  <div className="h-[65%] flex items-center justify-center px-4">
                    <div className="w-full max-w-[700px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-3">
                      <video
                        ref={videoRef}
                        className="w-full h-full rounded-xl shadow-2xl"
                        style={{
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onError={handleVideoError}
                        onEnded={handleVideoEnded}
                        onCanPlay={handleVideoCanPlay}
                        preload="auto"
                        muted={false}
                        playsInline={true}
                        autoPlay={true}
                        controls={false}
                      >
                        <source src={brandVideoUrl} type="video/mp4" />
                        Tu navegador no soporta la reproducción de video.
                      </video>
                    </div>
                  </div>
                  
                  {/* Progress Zone (25%) */}
                  <div className="h-[25%] flex items-center justify-center px-4">
                    <div className="w-full max-w-[700px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                      <LoadingProgress
                        progress={processingProgress}
                        message={processingStatus}
                        subMessage="Tu imagen está siendo transformada con IA"
                        variant="linear"
                        showPercentage={true}
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Fallback: Enhanced Rotating Messages for 9:16 layout
                <>
                  {/* Header Zone (15%) */}
                  <div className="h-[15%] flex items-center justify-center">
                    <h2 className="text-3xl lg:text-4xl text-white font-bold text-center"
                        style={{ fontFamily: 'Futura Std' }}>
                      PROCESANDO TU IMAGEN
                    </h2>
                  </div>
                  
                  {/* Message Zone (35%) */}
                  <div className="h-[35%] flex items-center justify-center px-4">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center max-w-[700px] w-full">
                      <h1 
                        className="font-bold tracking-tight leading-tight transition-all duration-500 text-white"
                        style={{ 
                          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                          fontWeight: 800,
                          fontFamily: 'Futura Std',
                          textShadow: 'var(--text-hero-glow)',
                          lineHeight: 1.1
                        }}
                        aria-live="polite"
                      >
                        {currentMessage.lines.map((line, index) => (
                          <div key={index} className={index === 0 ? "" : "mt-4"}>
                            {currentMessage.emphasis[index] ? <strong>{line}</strong> : line}
                          </div>
                        ))}
                      </h1>
                    </div>
                  </div>
                  
                  {/* Animation Zone (50%) */}
                  <div className="h-[50%] flex items-center justify-center px-4">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-[600px] w-full">
                      {lottieData ? (
                        <div className="flex flex-col items-center space-y-8">
                          <div className="w-56 h-56 lg:w-72 lg:h-72">
                            <Lottie 
                              animationData={lottieData as object}
                              loop={true}
                              autoplay={true}
                            />
                          </div>
                          <div className="w-full">
                            <LoadingProgress
                              progress={processingProgress}
                              message=""
                              subMessage="Procesando con IA..."
                              variant="linear"
                              showPercentage={true}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-8">
                          <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 animate-spin flex items-center justify-center">
                            <div className="w-36 h-36 lg:w-42 lg:h-42 rounded-full bg-[#0A0B0F] flex items-center justify-center">
                              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full animate-pulse" />
                            </div>
                          </div>
                          
                          <div className="w-full">
                            <LoadingProgress
                              progress={processingProgress}
                              message={processingStatus}
                              subMessage="Transformación en progreso..."
                              variant="linear"
                              showPercentage={true}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
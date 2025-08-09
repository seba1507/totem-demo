import { useEffect, useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import ParticleLayer, { useParticleLayer } from '@/components/effects/ParticleLayer';

interface ResultScreenProps {
  processedImageUrl: string | null;
  s3Url?: string | null;
  s3Key?: string | null;
  fileName?: string | null;
  onReset: () => void;
}

export default function ResultScreen({ processedImageUrl, s3Url, s3Key, fileName, onReset }: ResultScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(true);
  const shouldRenderParticles = useParticleLayer(true);
  
  // Timer de 30 segundos con control de pausa
  useEffect(() => {
    if (!autoCloseEnabled || isPaused) return;
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset, isPaused, autoCloseEnabled]);

  // Generar URL de descarga con endpoint que fuerza descarga
  useEffect(() => {
    if (fileName) {
      const baseUrl = window.location.origin;
      
      if (s3Key) {
        // Usar S3 key para generar URL firmada de descarga
        const downloadEndpoint = `${baseUrl}/api/download?s3Key=${encodeURIComponent(s3Key)}&name=${encodeURIComponent(fileName)}`;
        setDownloadUrl(downloadEndpoint);
        console.log('URL de descarga generada (S3 Key):', downloadEndpoint);
      } else if (s3Url) {
        // Fallback a URL directa de S3
        const downloadEndpoint = `${baseUrl}/api/download?url=${encodeURIComponent(s3Url)}&name=${encodeURIComponent(fileName)}`;
        setDownloadUrl(downloadEndpoint);
        console.log('URL de descarga generada (S3 URL):', downloadEndpoint);
      } else if (processedImageUrl) {
        // Fallback final a data URL
        const downloadEndpoint = `${baseUrl}/api/download?url=${encodeURIComponent(processedImageUrl)}&name=${encodeURIComponent(fileName)}`;
        setDownloadUrl(downloadEndpoint);
        console.log('URL de descarga generada (Data URL):', downloadEndpoint);
      }
    }
  }, [s3Url, s3Key, fileName, processedImageUrl]);

  // Manejar carga de imagen
  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(null);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError('Error al cargar la imagen procesada');
  };

  // Funciones de control de tiempo
  const handleExtendTime = useCallback(() => {
    setTimeRemaining(prev => prev + 30);
  }, []);

  const handleTogglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handleDisableAutoClose = useCallback(() => {
    setAutoCloseEnabled(false);
    setIsPaused(true);
  }, []);

  // Navegación por teclado
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleTogglePause();
    } else if (e.key === 'e' || e.key === 'E') {
      handleExtendTime();
    } else if (e.key === 'd' || e.key === 'D') {
      handleDisableAutoClose();
    }
  }, [handleTogglePause, handleExtendTime, handleDisableAutoClose]);

  if (!processedImageUrl) {
    return (
      <div className="relative flex flex-col h-full w-full">
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <p className="text-subtitle text-error">No hay imagen para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <section 
      className="h-screen w-full bg-gradient-to-b from-[#0A0B0F] via-[#11122A] to-[#1B0B33] overflow-hidden"
      aria-label="Resultado Aurora Glass UI - Tu imagen transformada"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Contenedor principal 9:16 */}
      <div className="h-full w-full max-w-[1080px] mx-auto flex flex-col relative">
        
        {/* Aurora Glass UI Particles */}
        {shouldRenderParticles && (
          <ParticleLayer 
            particleCount={18} 
            intensity="medium"
            className="absolute inset-0 z-0"
          />
        )}
        
        {/* Header Zone (12% de altura) */}
        <div className="h-[12%] flex items-center justify-center relative z-20">
          <h1 
            className="font-bold text-4xl lg:text-5xl text-center"
            style={{ 
              background: 'var(--conic-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: 'none',
              fontWeight: 800,
              lineHeight: 1.1,
              fontFamily: 'Futura Std'
            }}
          >
            ¡LISTO PARA COMPARTIR!
          </h1>
        </div>
        
        {/* Vertical Layout for 9:16 TOTEM Display */}
        <div className="flex-1 flex flex-col items-center justify-between w-full max-w-3xl space-y-8">
          
          {/* Top Section - Enhanced QR Code and Controls */}
          <div className="flex flex-row items-center justify-center gap-12 w-full">
            
            {/* QR Code Section - Positioned Top Left */}
            {downloadUrl && (
              <div className="glass-card py-6 px-8 text-center"
                   style={{ boxShadow: 'var(--shadow-glass), 0 0 40px rgba(255, 46, 147, 0.2)' }}>
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl mb-4 inline-block"
                     style={{ boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)' }}>
                  <QRCodeSVG 
                    value={downloadUrl}
                    size={180}
                    level="H"
                    includeMargin={true}
                    aria-label="Código QR para descargar tu foto"
                  />
                </div>
                <p className="text-white/95 font-bold" 
                   style={{ 
                     fontSize: '1.2rem',
                     lineHeight: 1.3,
                     textShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
                     letterSpacing: '0.05em'
                   }}>
                  ESCANEA PARA<br/>DESCARGAR
                </p>
              </div>
            )}
            
            {/* Timer Controls - Positioned Top Right */}
            <div className="glass-card py-6 px-8 text-center" role="timer" aria-live="polite">
              {autoCloseEnabled ? (
                <>
                  <p className="mb-4 font-bold text-white" 
                     style={{ 
                       fontSize: '1.2rem',
                       color: 'var(--accent-cyan)',
                       textShadow: '0 0 15px rgba(0, 230, 255, 0.4)'
                     }}>
                    {isPaused ? '⏸️ PAUSADO' : '⏰ TIEMPO'}<br/>{timeRemaining}s
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleTogglePause}
                      className="glass px-6 py-3 text-white rounded-xl transition-all hover:scale-105 will-change-transform font-semibold"
                      style={{ 
                        fontSize: '1rem',
                        boxShadow: 'var(--shadow-glow-cyan)',
                        border: '1px solid rgba(0, 230, 255, 0.4)',
                        minWidth: '140px'
                      }}
                      aria-label={isPaused ? "Reanudar cuenta regresiva" : "Pausar cuenta regresiva"}
                    >
                      {isPaused ? '▶ Reanudar' : '⏸ Pausar'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleExtendTime}
                        className="glass px-4 py-2 text-white rounded-lg transition-all hover:scale-105 will-change-transform font-semibold"
                        style={{ 
                          fontSize: '0.9rem',
                          boxShadow: 'var(--shadow-glow-magenta)',
                          border: '1px solid rgba(255, 46, 147, 0.4)',
                          minWidth: '65px'
                        }}
                        aria-label="Añadir 30 segundos más"
                      >
                        +30s
                      </button>
                      <button
                        onClick={handleDisableAutoClose}
                        className="glass px-4 py-2 text-white rounded-lg transition-all hover:scale-105 will-change-transform font-semibold"
                        style={{ 
                          fontSize: '0.9rem',
                          boxShadow: '0 0 20px rgba(122, 0, 255, 0.5)',
                          border: '1px solid rgba(122, 0, 255, 0.4)',
                          minWidth: '65px'
                        }}
                        aria-label="Desactivar cierre automático"
                      >
                        Sin timer
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="font-bold" 
                   style={{ 
                     fontSize: '1.2rem',
                     color: 'var(--accent-cyan)',
                     textShadow: '0 0 15px rgba(0, 230, 255, 0.4)'
                   }}>
                  ✓ CIERRE AUTOMÁTICO<br/>DESACTIVADO
                </p>
              )}
            </div>
          </div>
          
          {/* Center Section - Main Image Display */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="glass-card p-6" 
                 style={{ boxShadow: 'var(--shadow-glass), 0 0 60px rgba(0, 230, 255, 0.2)' }}>
              <div className="w-full aspect-[2/3] bg-black rounded-2xl overflow-hidden relative"
                   style={{ maxWidth: '500px', maxHeight: '50vh' }}>
                {isImageLoading && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="text-center text-white">
                      <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <span className="text-lg">Cargando imagen...</span>
                    </div>
                  </div>
                )}
                
                {imageError ? (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-80"
                    role="alert"
                  >
                    <div className="text-center text-white p-6">
                      <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-base">{imageError}</span>
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={processedImageUrl}
                    alt="Tu imagen procesada mostrando cómo te verás en el futuro"
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced CTA Button */}
        <div className="pb-8 pt-6">
          <Button 
            onClick={onReset}
            className="will-change-transform gpu-accelerated scale-125 hover:scale-[1.35] active:scale-[1.15]"
            ariaLabel="Finalizar y crear nueva experiencia"
            style={{
              fontSize: '1.8rem',
              padding: '24px 48px',
              minWidth: '280px',
              minHeight: '80px'
            }}
          >
            NUEVA FOTO
          </Button>
        </div>

        {/* Instrucciones de teclado ocultas */}
        <div className="sr-only">
          Atajos de teclado: Espacio para pausar/reanudar, E para extender tiempo, D para desactivar timer
        </div>
      </div>
    </section>
  );
}
import { useEffect, useState } from 'react';
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

export default function ResultScreen({ processedImageUrl, s3Url, onReset }: ResultScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 segundos
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const shouldRenderParticles = useParticleLayer(true);
  
  // Timer de 60 segundos - automático sin controles
  useEffect(() => {
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
  }, [onReset]);

  // Manejar carga de imagen
  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(null);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError('Error al cargar la imagen procesada');
  };

  if (!processedImageUrl) {
    return (
      <div className="relative flex flex-col h-full w-full">
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <p className="text-subtitle text-error">No hay imagen para mostrar</p>
        </div>
      </div>
    );
  }

  // URL para el QR - usar directamente s3Url si está disponible
  const qrUrl = s3Url || processedImageUrl;

  return (
    <section 
      className="h-screen w-full bg-gradient-to-b from-[#0A0B0F] via-[#11122A] to-[#1B0B33] overflow-hidden"
      aria-label="Resultado - Tu imagen transformada"
    >
      {/* Contenedor principal 9:16 */}
      <div className="h-full w-full max-w-[1080px] mx-auto flex flex-col relative">
        
        {/* Aurora Glass UI Particles */}
        {shouldRenderParticles && (
          <ParticleLayer 
            particleCount={15} 
            intensity="low"
            className="absolute inset-0 z-0"
          />
        )}
        
        {/* Header Zone (10%) */}
        <div className="h-[10%] flex items-center justify-center relative z-20 px-4">
          <h1 
            className="font-bold text-5xl lg:text-6xl text-center"
            style={{ 
              background: 'var(--conic-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 800,
              fontFamily: 'Futura Std'
            }}
          >
            ¡LISTO PARA COMPARTIR!
          </h1>
        </div>
        
        {/* Image Zone (40%) */}
        <div className="h-[40%] flex items-center justify-center relative z-20 px-4">
          <div className="glass-card p-4 h-full flex items-center" 
               style={{ boxShadow: 'var(--shadow-glass), 0 0 60px rgba(0, 230, 255, 0.2)' }}>
            <div className="h-full aspect-[2/3] bg-black rounded-xl overflow-hidden relative">
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
                  alt="Tu imagen transformada"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* QR Zone (25%) */}
        <div className="h-[25%] flex items-center justify-center relative z-20">
          {qrUrl && (
            <div className="glass-card py-4 px-6 text-center">
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl inline-block"
                   style={{ boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)' }}>
                <QRCodeSVG 
                  value={qrUrl}
                  size={140}
                  level="H"
                  includeMargin={true}
                  aria-label="Código QR para ver tu foto"
                />
              </div>
              <p className="text-white/90 font-bold mt-3" 
                 style={{ 
                   fontSize: '1rem',
                   textShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
                   letterSpacing: '0.05em'
                 }}>
                ESCANEA PARA VER
              </p>
            </div>
          )}
        </div>
        
        {/* Timer Zone (10%) */}
        <div className="h-[10%] flex items-center justify-center relative z-20">
          <div className="text-center" role="timer" aria-live="polite">
            <p className="text-3xl font-bold" 
               style={{ 
                 color: timeRemaining > 10 ? 'var(--accent-cyan)' : '#FF2E93',
                 textShadow: '0 0 20px rgba(0, 230, 255, 0.4)',
                 fontFamily: 'Futura Std'
               }}>
              {timeRemaining} segundos
            </p>
          </div>
        </div>
        
        {/* CTA Zone (15%) */}
        <div className="h-[15%] flex items-center justify-center relative z-20 pb-4">
          <Button 
            onClick={onReset}
            className="min-h-[80px] px-12 text-xl lg:text-2xl"
            ariaLabel="Tomar nueva fotografía"
          >
            NUEVA FOTO
          </Button>
        </div>
      </div>
    </section>
  );
}
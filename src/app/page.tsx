"use client";

import { useState, useEffect, useCallback } from 'react';
import BienvenidaScreen from '@/components/screens/BienvenidaScreen';
import CameraScreen from '@/components/screens/CameraScreen';
import CountdownScreen from '@/components/screens/CountdownScreen';
import ReviewScreen from '@/components/screens/ReviewScreen';
import ProcessingScreen from '@/components/screens/ProcessingScreen';
import ResultScreen from '@/components/screens/ResultScreen';
import Button from '@/components/ui/Button';
import { CameraProvider } from '@/contexts/CameraContext';
import { v4 as uuidv4 } from 'uuid';

// Define los estados posibles
type AppState =
  | 'bienvenida'     // Pantalla inicial
  | 'camera'         // Pantalla de cámara
  | 'countdown'      // Cuenta regresiva
  | 'review'         // Revisión de foto
  | 'processing'     // Procesando con IA
  | 'result'         // Resultado final con imagen
  | 'error';         // Pantalla de error

export default function Home() {
  // Estado principal de la aplicación
  const [currentState, setCurrentState] = useState<AppState>('bienvenida');

  // Estados para guardar datos de la aplicación
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [s3Url, setS3Url] = useState<string | null>(null);
  const [s3Key, setS3Key] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // Estado para prevenir múltiples transiciones
  const [isNavigating, setIsNavigating] = useState(false);

  // Función para navegar entre estados con protección - versión mejorada
  const navigateTo = useCallback((state: AppState, force = false) => {
    console.log(`Intentando navegar a: ${state} (Forzado: ${force})`);

    if (isNavigating && !force) {
      console.log("Navegación bloqueada por isNavigating");
      return;
    }

    console.log(`Navegando de ${currentState} a ${state}`);
    setIsNavigating(true);
    setCurrentState(state);

    // Desbloquear después de un breve periodo
    setTimeout(() => {
      setIsNavigating(false);
      console.log("Navegación desbloqueada");
    }, 500);
  }, [currentState, isNavigating]);

  // Función para reiniciar la aplicación
  const handleReset = useCallback(() => {
    console.log("Reiniciando aplicación");
    setCapturedImage(null);
    setProcessedImageUrl(null);
    setS3Url(null);
    setS3Key(null);
    setFileName(null);
    setErrorMessage(null);
    setCurrentRequestId(null);
    navigateTo('bienvenida', true);
  }, [navigateTo]);

  // Función para capturar imagen - versión mejorada
  const handleImageCapture = useCallback((imageData: string) => {
    console.log("handleImageCapture llamado con datos de imagen",
                imageData.substring(0, 50) + "...");

    // Guardar la imagen primero
    setCapturedImage(imageData);
    
    // Generar UUID único para esta captura
    const requestId = uuidv4();
    setCurrentRequestId(requestId);
    console.log("UUID generado para la captura:", requestId);

    // Forzar la navegación, incluso si está bloqueada
    setTimeout(() => {
      navigateTo('review', true);
    }, 100);
  }, [navigateTo]);

  // Función para procesar imagen cuando el usuario acepta en review
  const handleAcceptImage = useCallback(() => {
    console.log("Imagen aceptada, navegando a la pantalla de procesamiento");
    
    // Limpiar la imagen procesada anterior
    setProcessedImageUrl(null);
    setS3Url(null);
    setS3Key(null);
    setFileName(null);
    
    navigateTo('processing', true);
  }, [navigateTo]);

  // Función para manejar el resultado del procesamiento
  const handleProcessingComplete = useCallback((imageUrl: string, s3UrlParam?: string, s3KeyParam?: string, fileNameParam?: string) => {
    console.log("Procesamiento completado, URL de imagen procesada:", imageUrl);
    console.log("S3 URL:", s3UrlParam);
    console.log("S3 Key:", s3KeyParam);
    
    // Actualizar primero el estado de la imagen procesada
    setProcessedImageUrl(imageUrl);
    setS3Url(s3UrlParam || null);
    setS3Key(s3KeyParam || null);
    setFileName(fileNameParam || null);
    
    // Esperar brevemente para que React actualice el estado
    setTimeout(() => {
      navigateTo('result', true);
    }, 100);
  }, [navigateTo]);

  // Función para manejar errores de procesamiento
  const handleProcessingError = useCallback((error: string) => {
    console.error("Error durante el procesamiento:", error);
    setErrorMessage(error);
    navigateTo('error', true);
  }, [navigateTo]);

  // Registro para depuración
  useEffect(() => {
    console.log("Estado actual:", currentState);
    
    // Anunciar cambios de estado para lectores de pantalla
    const announcement = document.getElementById('state-announcement');
    if (announcement) {
      const stateMessages: Record<AppState, string> = {
        'bienvenida': 'Pantalla de bienvenida',
        'camera': 'Pantalla de cámara activa',
        'countdown': 'Cuenta regresiva iniciada',
        'review': 'Revisando tu fotografía',
        'processing': 'Procesando tu imagen con inteligencia artificial',
        'result': 'Resultado listo',
        'error': 'Ha ocurrido un error'
      };
      announcement.textContent = stateMessages[currentState];
    }
  }, [currentState]);

  // Navegación por teclado global
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Tecla ESC para volver al inicio (excepto durante procesamiento)
      if (e.key === 'Escape' && currentState !== 'processing') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentState, handleReset]);

  // Renderizado condicional basado en el estado actual
  return (
    <CameraProvider>
      <div className="relative w-full h-full overflow-hidden">
        
        {/* Anuncio de estado para lectores de pantalla */}
        <div 
          id="state-announcement" 
          className="sr-only" 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
        />
        
        {/* Contenido principal */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">

          {currentState === 'bienvenida' && (
            <BienvenidaScreen onNavigate={() => navigateTo('camera')} />
          )}

          {currentState === 'camera' && (
            <CameraScreen
              onStartCountdown={() => navigateTo('countdown')}
            />
          )}

          {currentState === 'countdown' && (
            <CountdownScreen
              onCapture={handleImageCapture}
            />
          )}

          {currentState === 'review' && (
            <ReviewScreen
              imageUrl={capturedImage}
              onAccept={handleAcceptImage}
              onRetake={() => navigateTo('camera')}
            />
          )}

          {currentState === 'processing' && (
            <ProcessingScreen
              imageUrl={capturedImage}
              requestId={currentRequestId}
              onProcessingComplete={handleProcessingComplete}
              onProcessingError={handleProcessingError}
            />
          )}

          {currentState === 'result' && (
            <ResultScreen
              processedImageUrl={processedImageUrl}
              s3Url={s3Url}
              s3Key={s3Key}
              fileName={fileName}
              onReset={handleReset}
            />
          )}

          {currentState === 'error' && (
            <section 
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6"
              role="alert"
              aria-live="assertive"
            >
              <h1 className="text-hero font-bold text-center mb-8 text-error">
                ¡UPS! ALGO SALIÓ MAL
              </h1>

              <div className="bg-red-500/80 p-4 rounded-xl mb-8 max-w-md">
                <p className="text-subtitle text-secondary text-center">
                  {errorMessage || "Error desconocido al procesar la imagen"}
                </p>
              </div>

              <Button 
                onClick={handleReset}
                ariaLabel="Volver a intentar desde el inicio"
              >
                Volver a intentar
              </Button>
            </section>
          )}

        </div>

        {/* Instrucciones de navegación ocultas */}
        <div className="sr-only">
          Puedes presionar la tecla Escape en cualquier momento para volver al inicio.
        </div>
      </div>
    </CameraProvider>
  );
}
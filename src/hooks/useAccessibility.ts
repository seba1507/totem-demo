import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para crear un focus trap dentro de un elemento
 * Útil para modales, diálogos y pantallas que requieren mantener el foco contenido
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Obtener elementos enfocables dentro del contenedor
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'video[controls]',
      'audio[controls]',
      '[contenteditable]'
    ];
    
    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors.join(','))
    ) as HTMLElement[];
  }, []);

  // Manejar navegación con Tab
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Si Shift+Tab en el primer elemento, ir al último
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // Si Tab en el último elemento, ir al primero
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, [isActive, getFocusableElements]);

  // Activar/desactivar el focus trap
  useEffect(() => {
    if (!isActive) return;
    
    // Guardar el elemento con foco actual
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Enfocar el primer elemento enfocable o el contenedor
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        focusableElements[0].focus();
      }, 50);
    } else if (containerRef.current) {
      containerRef.current.focus();
    }
    
    // Añadir listener de teclado
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restaurar el foco previo
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, handleKeyDown, getFocusableElements]);

  return containerRef;
}

/**
 * Hook para auto-enfocar un elemento cuando se monta
 */
export function useAutoFocus<T extends HTMLElement = HTMLElement>(
  delay: number = 100
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (elementRef.current && elementRef.current.focus) {
        elementRef.current.focus();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return elementRef;
}

/**
 * Hook para anunciar cambios a lectores de pantalla
 */
export function useAnnouncement() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remover después de un tiempo para limpiar el DOM
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
}
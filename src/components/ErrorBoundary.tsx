'use client';

import React, { Component, ReactNode } from 'react';
import Button from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // Opcionalmente, recargar la página
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="flex flex-col items-center justify-center min-h-screen p-6 bg-[var(--background-color)]"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center">
            <h1 className="text-hero font-bold mb-4 text-error">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-subtitle mb-8 text-secondary">
              Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-8 text-left max-w-2xl mx-auto">
                <summary className="cursor-pointer text-muted hover:text-primary">
                  Detalles del error (solo desarrollo)
                </summary>
                <pre className="mt-2 p-4 glass rounded overflow-auto text-sm text-glass-muted">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <Button 
              onClick={this.handleReset}
              ariaLabel="Reiniciar aplicación"
            >
              Reiniciar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
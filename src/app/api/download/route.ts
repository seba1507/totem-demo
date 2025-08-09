import { NextRequest, NextResponse } from 'next/server';
import { generateDownloadUrl, validateS3Config } from '@/utils/s3Storage';

// Security configuration
const ALLOWED_DOMAINS = [
  'blob.vercel-storage.com',
  // S3 domains will be validated dynamically
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Utility functions
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .substring(0, 100);
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTPS and data URLs
    if (!['https:', 'data:'].includes(parsed.protocol)) {
      return false;
    }
    
    // For HTTPS URLs, check domain whitelist and S3 domains
    if (parsed.protocol === 'https:') {
      // Allow S3 domains if configured
      const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
      const awsRegion = process.env.AWS_REGION || 'us-east-1';
      const s3Domain = `${s3BucketName}.s3.${awsRegion}.amazonaws.com`;
      
      return ALLOWED_DOMAINS.some(domain => 
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      ) || parsed.hostname === s3Domain;
    }
    
    // For data URLs, validate format
    if (parsed.protocol === 'data:') {
      return url.startsWith('data:image/');
    }
    
    return false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');
    const s3Key = searchParams.get('s3Key');
    const fileName = searchParams.get('name') || 'tu_futuro.jpg';

    // Si tenemos S3 key, generar URL firmada para descarga
    if (s3Key && validateS3Config()) {
      try {
        const signedUrl = await generateDownloadUrl(s3Key, fileName);
        
        // Redireccionar a la URL firmada de S3
        return NextResponse.redirect(signedUrl);
      } catch (error) {
        console.error('Error al generar URL firmada de S3:', error);
        return NextResponse.json({ 
          error: 'Error al generar enlace de descarga' 
        }, { status: 500 });
      }
    }

    // Enhanced validation for regular URLs
    if (!imageUrl) {
      return NextResponse.json({ error: 'URL o S3 key no proporcionada' }, { status: 400 });
    }

    // Validate URL against whitelist
    if (!isValidUrl(imageUrl)) {
      return NextResponse.json({ 
        error: 'URL no válida o dominio no permitido' 
      }, { status: 400 });
    }

    // Sanitize filename
    const safeFileName = sanitizeFileName(fileName);

    let imageBuffer: ArrayBuffer;

    if (imageUrl.startsWith('data:')) {
      // Process data URL with validation
      if (!imageUrl.startsWith('data:image/')) {
        return NextResponse.json({ 
          error: 'Formato de imagen no válido' 
        }, { status: 400 });
      }

      const base64Data = imageUrl.split(',')[1];
      if (!base64Data) {
        return NextResponse.json({ 
          error: 'Datos de imagen inválidos' 
        }, { status: 400 });
      }

      try {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageBuffer = bytes.buffer;
      } catch {
        return NextResponse.json({ 
          error: 'Error al decodificar imagen' 
        }, { status: 400 });
      }
    } else {
      // Fetch with timeout and size limits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'totem-claude/1.0',
          },
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          return NextResponse.json({ 
            error: 'No se pudo obtener la imagen' 
          }, { status: 404 });
        }

        // Validate content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !ALLOWED_CONTENT_TYPES.some(type => contentType.includes(type))) {
          return NextResponse.json({ 
            error: 'Tipo de contenido no válido' 
          }, { status: 400 });
        }

        // Check content length
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
          return NextResponse.json({ 
            error: 'Imagen demasiado grande' 
          }, { status: 413 });
        }

        imageBuffer = await response.arrayBuffer();

        // Double-check size after download
        if (imageBuffer.byteLength > MAX_FILE_SIZE) {
          return NextResponse.json({ 
            error: 'Imagen demasiado grande' 
          }, { status: 413 });
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return NextResponse.json({ 
            error: 'Timeout al obtener imagen' 
          }, { status: 504 });
        }
        
        return NextResponse.json({ 
          error: 'Error al obtener imagen' 
        }, { status: 500 });
      }
    }

    // Security headers for download
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'none'",
      },
    });

  } catch (error) {
    // Secure error logging - no sensitive data exposure
    const errorId = Math.random().toString(36).substring(7);
    console.error(`Download error [${errorId}]:`, error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      errorId 
    }, { status: 500 });
  }
}
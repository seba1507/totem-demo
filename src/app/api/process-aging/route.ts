// app/api/process-aging/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { put } from '@vercel/blob';

// Configuración de OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY no está configurada en las variables de entorno');
}

// Mapa para rastrear solicitudes procesadas y evitar duplicados
// Almacena requestId -> resultados procesados
const processedRequests = new Map<string, { imageUrl: string; fileName: string; timestamp: string }>();

// Limpiar entradas antiguas cada 5 minutos
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 300000;
  processedRequests.forEach((value, key) => {
    if (parseInt(value.timestamp) < fiveMinutesAgo) {
      processedRequests.delete(key);
    }
  });
}, 300000);

export async function POST(request: NextRequest) {
  console.log('Recibida solicitud en API process-aging');
  
  try {
    // Obtener datos de la petición
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const clientRequestId = formData.get('requestId');
    
    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json({ error: 'No se proporcionó ninguna imagen válida' }, { status: 400 });
    }
    
    // Si tenemos un requestId del cliente, verificar si ya fue procesado
    if (clientRequestId && typeof clientRequestId === 'string') {
      const existingResult = processedRequests.get(clientRequestId);
      if (existingResult) {
        console.log(`Solicitud duplicada detectada para requestId: ${clientRequestId}, devolviendo resultado existente`);
        return NextResponse.json({ 
          success: true,
          ...existingResult
        });
      }
    }
    
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'API de OpenAI no configurada. Por favor configure OPENAI_API_KEY.' 
      }, { status: 500 });
    }

    console.log(`Tamaño de imagen recibida: ${imageFile.size} bytes`);

    // Si la imagen es muy grande, rechazarla
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: 'La imagen es demasiado grande. Por favor usa una imagen menor a 5MB.' 
      }, { status: 400 });
    }

    // Preparar el FormData para OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('image', imageFile);
    openAIFormData.append('prompt', 'Transform the scene into a dramatic Jurassic Park-style dinosaur chase: dress the subject in casual outdoor adventure clothing — weathered cargo shirt, utility vest, and rugged pants, with realistic dirt and rain stains. Set the background as a dense, humid jungle at night during a tropical storm, lit by flickering floodlights and lightning flashes. Behind and slightly to the side of the subject, depict a massive, photorealistic Tyrannosaurus rex in mid-stride, mouth open with sharp teeth visible, illuminated by a mix of backlighting and environmental light. Add motion blur to the dinosaur and splashes of rain to convey speed and chaos. Integrate mist, wet foliage, and muddy ground for realism. Ensure the face of the subject is perfectly recognisable and sharp, with lighting consistent with the storm and floodlights. No zoom, no recentering, no outpainting, no new limbs, no text or watermarks.Negatives: no fantasy creatures, no cartoon style, no gore, no unrealistic anatomy, no gender change.');
    openAIFormData.append('model', 'gpt-image-1');
    openAIFormData.append('n', '1');
    openAIFormData.append('size', '1024x1536'); // Tamaño 2:3 optimizado para GPT-Image
    openAIFormData.append('quality', 'medium'); 
    openAIFormData.append('background', 'auto');
    openAIFormData.append('moderation', 'auto');
    openAIFormData.append('input_fidelity', 'high'); // Reducido de 'high' a 'medium'

    // Llamar a la API de OpenAI con timeout específico
    console.log('Enviando imagen a OpenAI para procesamiento...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 240 segundos (4 minutos)
    
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: openAIFormData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.json();
        console.error('Error de OpenAI:', errorData);
        
        if (openAIResponse.status === 401) {
          return NextResponse.json({ 
            error: 'Error de autenticación con OpenAI. Verifique su API key.' 
          }, { status: 401 });
        }
        
        return NextResponse.json({ 
          error: errorData.error?.message || 'Error al procesar la imagen con OpenAI',
          details: errorData
        }, { status: openAIResponse.status });
      }

      const responseData = await openAIResponse.json();
      console.log('Respuesta recibida de OpenAI');

      // La respuesta puede contener una URL o datos en base64
      if (!responseData.data || !responseData.data[0]) {
        console.error('Respuesta inesperada de OpenAI:', responseData);
        return NextResponse.json({ 
          error: 'No se recibió la imagen procesada de OpenAI' 
        }, { status: 500 });
      }

      let imageBuffer: ArrayBuffer;
      
      // Verificar si la respuesta contiene base64 o URL
      if (responseData.data[0].b64_json) {
        // La imagen viene en formato base64
        console.log('Imagen recibida en formato base64');
        const base64Data = responseData.data[0].b64_json;
        
        // Convertir base64 a buffer
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        imageBuffer = bytes.buffer;
        
      } else if (responseData.data[0].url) {
        // La imagen viene como URL
        console.log('URL de imagen procesada recibida:', responseData.data[0].url);
        
        // Descargar la imagen de la URL
        const imageResponse = await fetch(responseData.data[0].url);
        if (!imageResponse.ok) {
          throw new Error('No se pudo descargar la imagen procesada');
        }
        imageBuffer = await imageResponse.arrayBuffer();
      } else {
        console.error('Formato de respuesta no reconocido:', responseData);
        return NextResponse.json({ 
          error: 'Formato de respuesta no reconocido de OpenAI' 
        }, { status: 500 });
      }

      console.log('Imagen procesada, tamaño:', imageBuffer.byteLength, 'bytes');

      // Generar información de la imagen
      const timestamp = format(new Date(), 'ddMMyyyyHHmmss');
      const fileName = `tu_futuro_${timestamp}.jpg`;
      
      // Convertir el buffer a base64 para mostrar preview en frontend
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      
      let blobUrl: string | null = null;
      
      // Intentar subir a Vercel Blob si está disponible
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          console.log('Subiendo imagen a Vercel Blob...');
          const blob = await put(fileName, imageBuffer, {
            access: 'public',
            contentType: 'image/jpeg',
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
          
          blobUrl = blob.url;
          console.log('Imagen subida a Vercel Blob:', blobUrl);
        } catch (blobError) {
          console.error('Error al subir a Vercel Blob:', blobError);
          console.log('Continuando sin Vercel Blob, usando data URL para descarga');
        }
      } else {
        console.log('BLOB_READ_WRITE_TOKEN no configurado, usando data URL para descarga');
      }
      
      console.log('Imagen procesada lista para enviar al frontend');
      
      // Preparar resultado con o sin URL de Blob
      const result = {
        imageUrl: dataUrl, // Para mostrar en pantalla
        blobUrl: blobUrl, // URL de Vercel Blob para QR (puede ser null)
        fileName: fileName,
        timestamp: timestamp
      };
      
      // Si tenemos un requestId, guardar el resultado para evitar reprocesar
      if (clientRequestId && typeof clientRequestId === 'string') {
        processedRequests.set(clientRequestId, result);
        console.log(`Resultado guardado para requestId: ${clientRequestId}`);
      }
      
      // Devolver la imagen con ambas URLs
      return NextResponse.json({ 
        success: true,
        ...result
      });
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Timeout en la solicitud a OpenAI');
        return NextResponse.json({ 
          error: 'La solicitud tardó demasiado tiempo. Por favor intenta nuevamente.' 
        }, { status: 504 });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error("Error general:", error);
    
    // Manejo seguro del error desconocido
    let errorMessage = 'Error general en el procesamiento';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({
      error: errorMessage,
      details: 'Ocurrió un error al procesar la imagen'
    }, { status: 500 });
  }
}
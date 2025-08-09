// app/api/upload-blob/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToS3, validateS3Config } from '@/utils/s3Storage';

export async function POST(request: NextRequest) {
  try {
    // Obtener la imagen desde la solicitud
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ninguna imagen' }, { status: 400 });
    }
    
    // Verificar configuración de S3
    if (!validateS3Config()) {
      return NextResponse.json({ 
        error: 'S3 no está configurado correctamente' 
      }, { status: 500 });
    }
    
    // Convertir File a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Crear un nombre de archivo único
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileName = `${uniqueId}.jpg`;
    
    // Subir el archivo a S3
    const s3Result = await uploadImageToS3(arrayBuffer, fileName, 'image/jpeg');
    
    // Devolver las URLs de acceso
    return NextResponse.json({
      success: true,
      url: s3Result.url,        // URL para ver la imagen
      s3Key: s3Result.key,      // Key de S3 para generar download URLs
      fileName: fileName
    });
  } catch (error) {
    console.error('Error al subir imagen a S3:', error);
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
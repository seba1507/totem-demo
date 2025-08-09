// app/api/test-blob/route.ts - Test S3 connectivity
import { NextResponse } from 'next/server';
import { uploadImageToS3, getS3BucketInfo } from '@/utils/s3Storage';

export async function GET() {
  try {
    // Verificar configuración de S3
    const bucketInfo = getS3BucketInfo();
    
    if (!bucketInfo.configured) {
      return NextResponse.json({ 
        success: false, 
        error: 'S3 no está configurado correctamente',
        bucketInfo
      }, { status: 500 });
    }
    
    // Crear un archivo de prueba simple
    const testContent = 'Este es un archivo de prueba para S3';
    const testBuffer = Buffer.from(testContent);
    const testFileName = `test-${Date.now()}.txt`;
    
    const result = await uploadImageToS3(testBuffer.buffer, testFileName, 'text/plain');
    
    console.log("Archivo de prueba subido a S3:", result);
    
    return NextResponse.json({ 
      success: true, 
      s3Url: result.url,
      s3Key: result.key,
      bucketInfo
    });
  } catch (error) {
    console.error("Error al conectar con S3:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido',
      bucketInfo: getS3BucketInfo()
    }, { status: 500 });
  }
}
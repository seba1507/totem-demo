// utils/s3Storage.ts - AWS S3 Storage utilities for totem images
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

if (!BUCKET_NAME) {
  console.warn('AWS_S3_BUCKET_NAME no está configurado en las variables de entorno');
}

/**
 * Sube una imagen a S3 y devuelve la URL pública
 */
export async function uploadImageToS3(
  buffer: ArrayBuffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ url: string; key: string }> {
  try {
    const key = `totem-fotos/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 año de cache
      Metadata: {
        uploadedAt: new Date().toISOString(),
        source: 'totem-ia',
      },
    });

    await s3Client.send(command);
    
    // Construir URL pública
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    console.log(`Imagen subida a S3: ${url}`);
    
    return { url, key };
  } catch (error) {
    console.error('Error al subir imagen a S3:', error);
    throw new Error('Error al subir la imagen a S3');
  }
}

/**
 * Genera una URL firmada para descarga directa
 */
export async function generateDownloadUrl(
  key: string,
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
      ResponseContentType: 'image/jpeg',
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`URL de descarga generada para ${fileName}`);
    
    return signedUrl;
  } catch (error) {
    console.error('Error al generar URL de descarga:', error);
    throw new Error('Error al generar URL de descarga');
  }
}

/**
 * Elimina una imagen de S3
 */
export async function deleteImageFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Imagen eliminada de S3: ${key}`);
  } catch (error) {
    console.error('Error al eliminar imagen de S3:', error);
    throw new Error('Error al eliminar la imagen de S3');
  }
}

/**
 * Verifica la configuración de S3
 */
export function validateS3Config(): boolean {
  const requiredVars = [
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Variables de entorno faltantes para S3:', missing);
    return false;
  }
  
  return true;
}

/**
 * Obtiene información del bucket S3
 */
export function getS3BucketInfo() {
  return {
    bucket: BUCKET_NAME,
    region: process.env.AWS_REGION || 'us-east-1',
    configured: validateS3Config(),
  };
}
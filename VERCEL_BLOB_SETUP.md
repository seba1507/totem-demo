# 🔧 Configuración de Vercel Blob Storage

## El Problema
Si ves el error: `Vercel Blob: No token found`, significa que Vercel Blob no está correctamente conectado a tu proyecto.

## Solución Paso a Paso

### Opción A: Configurar Vercel Blob (Recomendado)

1. **Ve al Dashboard de Vercel**
   - Entra a tu proyecto en [vercel.com](https://vercel.com)
   - Ve a la pestaña **Storage**

2. **Crear Blob Storage**
   - Click en **"Create Database"**
   - Selecciona **"Blob"**
   - Elige un nombre (ej: `totem-blob`)
   - Selecciona la región más cercana
   - Click en **"Create"**

3. **Conectar al Proyecto**
   - Vercel te preguntará si quieres conectar el storage al proyecto
   - Selecciona tu proyecto `totem-claude`
   - Click en **"Connect"**

4. **Variables de Entorno Automáticas**
   - Vercel agregará automáticamente `BLOB_READ_WRITE_TOKEN`
   - Ve a **Settings → Environment Variables** para verificar

5. **Redeploy**
   - Ve a **Deployments**
   - Click en los 3 puntos del último deployment
   - Selecciona **"Redeploy"**

### Opción B: Funcionar sin Vercel Blob

Si prefieres no usar Vercel Blob (o para desarrollo local), la app funcionará sin él:

1. **Funcionamiento sin Blob:**
   - Las imágenes se mostrarán correctamente en pantalla
   - El QR seguirá funcionando para descargas
   - Las descargas usarán data URLs en lugar de Blob URLs
   - **Limitación:** Las URLs serán más largas y las imágenes no se guardarán en la nube

2. **Para desarrollo local:**
   - No necesitas configurar nada
   - La app detectará automáticamente la ausencia del token
   - Funcionará con data URLs localmente

## Verificar que Funciona

1. **Con Vercel Blob configurado:**
   - En los logs verás: `"Subiendo imagen a Vercel Blob..."`
   - Seguido de: `"Imagen subida a Vercel Blob: https://..."`

2. **Sin Vercel Blob:**
   - En los logs verás: `"BLOB_READ_WRITE_TOKEN no configurado, usando data URL para descarga"`
   - La app funcionará normalmente pero sin almacenamiento en la nube

## Variables de Entorno Necesarias

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | ✅ Sí | API key de OpenAI para procesamiento |
| `BLOB_READ_WRITE_TOKEN` | ❌ Opcional | Token de Vercel Blob (se crea automáticamente) |

## Ventajas de usar Vercel Blob

- ✅ URLs más cortas y limpias para QR
- ✅ Imágenes almacenadas en la nube
- ✅ Mejor rendimiento de descarga
- ✅ Historial de imágenes procesadas
- ✅ CDN global de Vercel

## Troubleshooting

### Error: "No token found" pero ya configuré la variable
- Verifica que el Storage esté **conectado** al proyecto, no solo creado
- Redeploy después de conectar el storage
- Verifica en Settings → Environment Variables que `BLOB_READ_WRITE_TOKEN` existe

### Error al subir a Blob
- Verifica los límites de tu plan de Vercel
- El plan gratuito incluye 1GB de almacenamiento Blob

### Las descargas no funcionan
- Asegúrate de que el QR apunte a tu dominio de Vercel
- Verifica que el endpoint `/api/download` esté funcionando
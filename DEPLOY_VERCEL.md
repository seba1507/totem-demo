# 🚀 Guía de Deploy en Vercel

## Prerrequisitos
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [OpenAI](https://platform.openai.com) con acceso a gpt-image-1
- Repositorio en GitHub (ya configurado: https://github.com/seba1507/totem_claude.git)

## Pasos para el Deploy

### 1. Importar Proyecto en Vercel

1. Ve a [https://vercel.com/new](https://vercel.com/new)
2. Haz clic en "Import Git Repository"
3. Autoriza Vercel para acceder a tu GitHub si es necesario
4. Busca y selecciona el repositorio `seba1507/totem_claude`

### 2. Configurar el Proyecto

En la pantalla de configuración:

**Project Name:** `totem-claude` (o el nombre que prefieras)

**Framework Preset:** Next.js (se detectará automáticamente)

**Root Directory:** `.` (dejar vacío o punto)

**Build Settings:** (Se configurarán automáticamente)
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 3. Configurar Variables de Entorno

Haz clic en "Environment Variables" y agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Tu API key de OpenAI |

**IMPORTANTE:** 
- Vercel Blob Storage se configura automáticamente al deployar
- No necesitas configurar `BLOB_READ_WRITE_TOKEN` manualmente

### 4. Deploy

1. Haz clic en "Deploy"
2. Espera a que el build termine (5-10 minutos aproximadamente)
3. Vercel te proporcionará una URL de producción

### 5. Verificar Vercel Blob Storage

Después del primer deploy:
1. Ve al dashboard de tu proyecto en Vercel
2. Ve a la pestaña "Storage"
3. Vercel Blob debería estar configurado automáticamente
4. Si no está activo, haz clic en "Create Database" → "Blob"

## URLs del Proyecto

Una vez deployado tendrás:
- **URL de Producción:** `https://totem-claude.vercel.app` (o similar)
- **URLs de Preview:** Se crean automáticamente para cada PR

## Configuración Post-Deploy

### Dominio Personalizado (Opcional)
1. Ve a Settings → Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

### Límites de Functions
El archivo `vercel.json` ya está configurado con:
- `process-aging`: 300 segundos (5 minutos) para procesamiento con IA
- `download`: 60 segundos para descargas

## Monitoreo

En el dashboard de Vercel puedes ver:
- **Functions:** Logs y métricas de las API routes
- **Analytics:** Uso y rendimiento
- **Storage:** Estado y uso de Vercel Blob

## Troubleshooting

### Error: "OPENAI_API_KEY not configured"
- Verifica que agregaste la variable de entorno en Vercel
- Redeploy después de agregar variables de entorno

### Error: "Vercel Blob not configured"
- Ve a Storage → Create Database → Blob
- Espera unos minutos y redeploy

### Timeout en procesamiento
- El límite está configurado en 300 segundos
- Si necesitas más tiempo, necesitarás un plan Pro de Vercel

## Actualizar el Deploy

Para actualizar la aplicación:
```bash
git add .
git commit -m "Update: descripción del cambio"
git push origin main
```

Vercel detectará el push y re-deployará automáticamente.

## Comandos Útiles

```bash
# Ver logs localmente
npm run dev

# Build local para testing
npm run build
npm run start

# Verificar que todo esté listo
npm run lint
```

## Soporte

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
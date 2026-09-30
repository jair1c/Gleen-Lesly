# Invitación de boda — Gleen y Lesly

Invitación interactiva de una sola página. El sobre animado, el collage, Detalles, Nuestra historia y el formulario RSVP viven en `Home.html` (también servido desde `/`).

## Características
- Animación de apertura de sobre con video.
- Secciones completas dentro de la página principal, sin páginas separadas de Detalles, Historia o RSVP.
- Formulario RSVP simplificado conectado a WhatsApp con validación de datos.
- Diseño 100% responsivo y adaptado para dispositivos móviles y escritorio.

## Despliegue en Vercel
Este repositorio está listo para desplegar en Vercel:
1. Importa el repositorio en Vercel.
2. Mantén la configuración por defecto y haz clic en **Deploy**.
# Confirmación personalizada

El formulario integrado en `Home.html` usa `?invite=TOKEN` y consulta `GET /api/invitation` para mostrar el nombre, los cupos y la respuesta previa. Al enviar, `POST /api/invitation` guarda la confirmación en las tablas `invitations` y `rsvps` del mismo proyecto Supabase que demo33 y luego prepara WhatsApp. No se guarda en los archivos CSV/JSON antiguos.

Configura `SUPABASE_URL`, `SUPABASE_SECRET_KEY` y `WHATSAPP_NUMBER` como variables de entorno del despliegue. Para el servidor local, cópialas a `.env.local` (ignorado por Git), usando `.env.example` como plantilla. Los enlaces personalizados deben apuntar a demo2 con el parámetro `invite`; los enlaces generados con dominio de demo33 no cambian automáticamente.

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

## Detalles para nuestro hogar

`regalos.html?invite=TOKEN` muestra las ideas de regalos compartidas por los novios, con enlaces originales de compra. `assets/gift-catalog.json` contiene el catálogo importado el 14 de octubre de 2026; cambios posteriores en Google Sheets deben importarse nuevamente.

Las elecciones y propuestas se guardan en Supabase, en `gift_reservations` y `gift_suggestions`. El SQL de configuración reproducible está en `gift-registry-setup.sql` y ya se ejecutó en el proyecto lesly-gleen. Las tablas tienen RLS y solo el servidor puede acceder. Una clave única evita elecciones simultáneas del mismo regalo. Los invitados pueden liberar sus propias elecciones; el panel privado muestra quién eligió cada regalo y las propuestas adicionales. La hoja original no se modifica automáticamente.

Requiere las mismas variables Supabase del RSVP. Pruebas: `node --test tests/gifts.test.js`.

El formulario integrado en `Home.html` usa `?invite=TOKEN` y consulta `GET /api/invitation` para mostrar el nombre, los cupos y la respuesta previa. Al enviar, `POST /api/invitation` guarda la confirmación en las tablas `invitations` y `rsvps` del mismo proyecto Supabase que demo33 y luego prepara WhatsApp. No se guarda en los archivos CSV/JSON antiguos.

Configura `SUPABASE_URL`, `SUPABASE_SECRET_KEY` y `WHATSAPP_NUMBER` como variables de entorno del despliegue. Para el servidor local, cópialas a `.env.local` (ignorado por Git), usando `.env.example` como plantilla. Los enlaces personalizados deben apuntar a demo2 con el parámetro `invite`; los enlaces generados con dominio de demo33 no cambian automáticamente.

## Panel privado

`/admin` abre el panel de invitados y moderación de fotografías migrado de demo33. Además de las variables anteriores, configura `SUPABASE_PUBLISHABLE_KEY` y `ADMIN_EMAILS` (correos autorizados, separados por comas). Alternativamente, la cuenta puede tener `app_metadata.role=admin` en Supabase Auth. La clave secreta permanece exclusivamente en el servidor.

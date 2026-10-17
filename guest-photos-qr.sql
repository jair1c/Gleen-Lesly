-- Acceso por QR sin crear invitaciones ficticias. Solo el backend accede a la tabla.
alter table public.guest_photos alter column invitation_id drop not null;
alter table public.guest_photos add column if not exists uploader_name text;
alter table public.guest_photos enable row level security;
revoke all on public.guest_photos from anon, authenticated;
grant all on public.guest_photos to service_role;

-- Catálogo en assets/gift-catalog.json; reservas privadas, accesibles solo por el servidor.
create table if not exists public.gift_reservations (
  gift_id text primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists gift_reservations_invitation_idx on public.gift_reservations(invitation_id);
create table if not exists public.gift_suggestions (
  invitation_id uuid primary key references public.invitations(id) on delete cascade,
  description text not null check (char_length(description) between 1 and 500),
  updated_at timestamptz not null default now()
);
alter table public.gift_reservations enable row level security;
alter table public.gift_suggestions enable row level security;
revoke all on public.gift_reservations, public.gift_suggestions from anon, authenticated;
grant select, insert, update, delete on public.gift_reservations, public.gift_suggestions to service_role;

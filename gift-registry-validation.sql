-- Bloquea las elecciones por nombre entre el catálogo y «otro detalle».
-- No modifica invitaciones ni elecciones existentes.
begin;
create table if not exists public.gift_catalog_rules (
  gift_id text primary key,
  name text not null,
  aliases text[] not null default '{}',
  reserved_externally boolean not null default false
);
alter table public.gift_catalog_rules enable row level security;
revoke all on public.gift_catalog_rules from public, anon, authenticated;
grant select, insert, update, delete on public.gift_catalog_rules to service_role;

insert into public.gift_catalog_rules (gift_id,name,aliases,reserved_externally) select gift_id,name,aliases,reserved_externally from jsonb_to_recordset('[{"gift_id":"regalo-1","name":"Hervidor","aliases":["hervidor"],"reserved_externally":false},{"gift_id":"regalo-2","name":"Juego de Platos Blancos","aliases":["platos","vajilla"],"reserved_externally":false},{"gift_id":"regalo-30","name":"Set de 4 vasos Clear Roma de 330 ml","aliases":["vasos"],"reserved_externally":false},{"gift_id":"regalo-4","name":"Licuadora","aliases":["licuadora"],"reserved_externally":false},{"gift_id":"regalo-5","name":"Freidora de aire","aliases":["freidora de aire","air fryer"],"reserved_externally":false},{"gift_id":"regalo-6","name":"Cocina de 4 hornillas","aliases":["cocina","encimera"],"reserved_externally":false},{"gift_id":"regalo-7","name":"Olla arrocera","aliases":["arrocera"],"reserved_externally":false},{"gift_id":"regalo-8","name":"Plancha","aliases":["plancha"],"reserved_externally":false},{"gift_id":"regalo-9","name":"Plancha a vapor","aliases":["plancha a vapor","vaporizador"],"reserved_externally":false},{"gift_id":"regalo-10","name":"Sandwichera","aliases":["sandwichera"],"reserved_externally":false},{"gift_id":"regalo-11","name":"Cafetera","aliases":["cafetera"],"reserved_externally":false},{"gift_id":"regalo-12","name":"Cortinas color perla","aliases":["cortina","cortinas","cortina perla"],"reserved_externally":true},{"gift_id":"regalo-13","name":"Plancha Freidora","aliases":["plancha freidora","parrilla","grill"],"reserved_externally":false},{"gift_id":"regalo-14","name":"Juego comedor","aliases":["comedor"],"reserved_externally":false},{"gift_id":"regalo-15","name":"Sofá blanco perlado","aliases":["sofa","sillon","mueble"],"reserved_externally":false},{"gift_id":"regalo-16","name":"Refrigeradora","aliases":["refrigeradora","nevera"],"reserved_externally":false},{"gift_id":"regalo-17","name":"Juego de Ollas antiadherentes","aliases":["ollas"],"reserved_externally":false},{"gift_id":"regalo-18","name":"Tetera","aliases":["tetera"],"reserved_externally":false},{"gift_id":"regalo-19","name":"Lavadora","aliases":["lavadora"],"reserved_externally":false},{"gift_id":"regalo-20","name":"Set de 12 Utensilios de Silicona","aliases":["utensilios"],"reserved_externally":false},{"gift_id":"regalo-21","name":"Espejo decorativo de forma irregular","aliases":["espejo","espejo decorativo","espejo irregular"],"reserved_externally":false},{"gift_id":"regalo-22","name":"Edredón + Juego de sábanas King size 100% Algodón","aliases":["edredon","sabana","sabanas"],"reserved_externally":false},{"gift_id":"regalo-23","name":"Panel para TV de 65 pulgadas Cartagena","aliases":["panel para tv","panel de tv","panel tv"],"reserved_externally":false},{"gift_id":"regalo-24","name":"Ducha flexible con manguera","aliases":["ducha","manguera de ducha"],"reserved_externally":false},{"gift_id":"regalo-25","name":"Set de 2 cojines Flanel grafito","aliases":["cojin","cojines"],"reserved_externally":false},{"gift_id":"regalo-26","name":"Set de accesorios de baño de cerámica blanca","aliases":["accesorios de bano"],"reserved_externally":false},{"gift_id":"regalo-28","name":"Mesa lateral blanca","aliases":["mesa lateral"],"reserved_externally":false},{"gift_id":"regalo-29","name":"Juego de cubiertos Benetton de 24 piezas","aliases":["cubiertos"],"reserved_externally":false},{"gift_id":"regalo-27","name":"Espejo LED BRUCE de 50 × 70 cm","aliases":["espejo led","espejo bruce"],"reserved_externally":false}]'::jsonb) as data(gift_id text,name text,aliases text[],reserved_externally boolean) on conflict (gift_id) do update set name=excluded.name,aliases=excluded.aliases,reserved_externally=excluded.reserved_externally;

create or replace function public.gift_normalized_words(value text)
returns text language sql immutable parallel safe set search_path = pg_catalog as $$
  select coalesce(string_agg(regexp_replace(word, '^([a-z0-9]{3,})s$', '\1'), ' ' order by position), '')
  from regexp_split_to_table(
    regexp_replace(translate(lower(normalize(coalesce(value,''), NFC)), 'áéíóúüñ', 'aeiouun'), '[^a-z0-9]+', ' ', 'g'), ' '
  ) with ordinality as parts(word,position)
  where word <> '' and word <> all(array['de','del','la','las','el','los','un','una','unos','unas','para','por','con','y','en','al']);
$$;

create or replace function public.gift_matching_ids(description text)
returns text[] language sql stable set search_path = pg_catalog as $$
  with matches as (
    select c.gift_id, public.gift_normalized_words(alias) as name
    from public.gift_catalog_rules c,
      lateral unnest(array_prepend(c.name,c.aliases)) as names(alias)
    where public.gift_normalized_words(alias) <> ''
      and strpos(' ' || public.gift_normalized_words(description) || ' ', ' ' || public.gift_normalized_words(alias) || ' ') > 0
  )
  select coalesce(array_agg(distinct m.gift_id), array[]::text[]) from matches m
  where not exists(select 1 from matches other where length(other.name)>length(m.name)
    and strpos(' ' || other.name || ' ', ' ' || m.name || ' ') > 0);
$$;

create or replace function public.validate_gift_choice()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare ids text[];
begin
  -- Serializa las escrituras de las dos tablas para cerrar la carrera cruzada.
  perform pg_advisory_xact_lock(2026101601);
  if TG_OP = 'DELETE' then return OLD; end if;
  if TG_TABLE_NAME = 'gift_suggestions' then
    ids := public.gift_matching_ids(NEW.description);
    if exists(select 1 from public.gift_catalog_rules c where c.gift_id=any(ids)
      and (c.reserved_externally or exists(select 1 from public.gift_reservations r where r.gift_id=c.gift_id))) then
      raise exception 'Ya hay un regalo escogido con ese nombre. Por favor, elige otro detalle.' using errcode='23505';
    end if;
    if exists(select 1 from public.gift_suggestions s where s.invitation_id<>NEW.invitation_id
      and public.gift_matching_ids(s.description) && ids) then
      raise exception 'Ya hay un regalo escogido con ese nombre. Por favor, elige otro detalle.' using errcode='23505';
    end if;
  else
    if exists(select 1 from public.gift_catalog_rules c where c.gift_id=NEW.gift_id and c.reserved_externally)
      or exists(select 1 from public.gift_suggestions s where NEW.gift_id=any(public.gift_matching_ids(s.description))) then
      raise exception 'Ya hay un regalo escogido con ese nombre. Por favor, elige otro detalle.' using errcode='23505';
    end if;
  end if;
  return NEW;
end;
$$;

revoke all on function public.gift_normalized_words(text), public.gift_matching_ids(text), public.validate_gift_choice() from public, anon, authenticated;
grant execute on function public.gift_normalized_words(text), public.gift_matching_ids(text), public.validate_gift_choice() to service_role;

create or replace trigger gift_suggestions_validate_choice
before insert or update or delete on public.gift_suggestions
for each row execute function public.validate_gift_choice();
create or replace trigger gift_reservations_validate_choice
before insert or update or delete on public.gift_reservations
for each row execute function public.validate_gift_choice();
commit;

select gift_id, name, reserved_externally as reservado from public.gift_catalog_rules where gift_id='regalo-12';

-- Evita también duplicados cuando dos invitados guardan al mismo tiempo.
-- No elimina ni modifica las dedicatorias o regalos existentes.
-- Si ya hay nombres duplicados, el índice no se crea hasta resolverlos.
create unique index if not exists gift_suggestions_unique_name
on public.gift_suggestions (
  translate(lower(btrim(regexp_replace(description, '\s+', ' ', 'g'))),
    'áéíóúüñ', 'aeiouun')
);

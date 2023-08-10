create table
  public.accounts (
    id uuid not null,
    created_at timestamp with time zone null default now(),
    name text null,
    user_apikey text not null,
    credits_total_cents_10k integer not null default 10000,
    constraint accounts_pkey primary key (id),
    constraint accounts_id_fkey foreign key (id) references auth.users (id)
  ) tablespace pg_default;
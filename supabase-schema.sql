-- ===========================================================
-- JubluTech — Schéma Supabase
-- À coller dans : Dashboard Supabase → SQL Editor → New query → Run
-- ===========================================================

-- 1) Table des profils (1 ligne par utilisateur inscrit)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nom text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Table des demandes (formulaire "besoin client")
create table if not exists public.demandes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nom text not null,
  email text not null,
  structure text,
  besoin text not null,
  status text not null default 'nouveau', -- nouveau | en_cours | termine
  created_at timestamptz not null default now()
);

-- 3) Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nom)
  values (new.id, new.email, new.raw_user_meta_data->>'nom');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Sécurité (Row Level Security)
alter table public.profiles enable row level security;
alter table public.demandes enable row level security;

-- Un utilisateur voit et modifie son propre profil
create policy "profil: lecture propre" on public.profiles
  for select using (auth.uid() = id);

create policy "profil: maj propre" on public.profiles
  for update using (auth.uid() = id);

-- Un admin peut tout lire dans profiles
create policy "profil: lecture admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Un utilisateur peut créer et lire ses propres demandes
create policy "demandes: creation propre" on public.demandes
  for insert with check (auth.uid() = user_id);

create policy "demandes: lecture propre" on public.demandes
  for select using (auth.uid() = user_id);

-- Un admin peut tout lire et tout modifier dans demandes
create policy "demandes: lecture admin" on public.demandes
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "demandes: maj admin" on public.demandes
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- ===========================================================
-- Après avoir créé ton propre compte sur le site (auth.html),
-- passe-toi admin en remplaçant l'email ci-dessous puis en
-- exécutant cette ligne dans le SQL Editor :
-- ===========================================================
-- update public.profiles set is_admin = true where email = 'ton-email@exemple.com';

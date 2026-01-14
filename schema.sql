-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null, -- Note: In real production, use Supabase Auth
  role text default 'USER' check (role in ('USER', 'ADMIN')),
  credits int default 3,
  created_at timestamp with time zone default now()
);

-- CERTIFICATES TABLE
create table public.certificates (
  id text primary key, -- Custom ID like 'AUTH-X92...'
  user_id uuid references public.users(id),
  content_hash text not null,
  tx_hash text, -- Blockchain Transaction Hash
  verdict text,
  storage_path text,
  metadata jsonb,
  issue_date timestamp with time zone,
  owner text,
  content_preview text,
  content_type text
);

-- RLS POLICIES (Example)
alter table public.certificates enable row level security;

create policy "Certificates are viewable by everyone" 
on public.certificates for select 
using (true);

create policy "Users can insert their own certificates" 
on public.certificates for insert 
with check (true); -- Simplified for this demo

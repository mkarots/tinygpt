-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Enable Vector Extension
create extension if not exists vector;

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- AGENTS
create table agents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  config jsonb default '{}'::jsonb, -- Stores tone, primaryColor, etc.
  knowledge jsonb default '[]'::jsonb, -- Full source texts for context stuffing (MVP; not RAG chunks)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- KNOWLEDGE BASE (Vector RAG)
create table knowledge (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) on delete cascade not null,
  name text not null,
  type text not null, -- 'url', 'file', 'text'
  content text not null, -- The chunk text
  status text default 'active',
  embedding vector(768), -- Gemini text-embedding-004 dimension
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster vector search
create index on knowledge using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- CHATS
create table chats (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references agents(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade, 
  session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES
create table messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES
alter table profiles enable row level security;
alter table agents enable row level security;
alter table knowledge enable row level security;
alter table chats enable row level security;
alter table messages enable row level security;

-- Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Agents
create policy "Users can view own agents." on agents for select using ( auth.uid() = user_id );
create policy "Users can insert own agents." on agents for insert with check ( auth.uid() = user_id );
create policy "Users can update own agents." on agents for update using ( auth.uid() = user_id );
create policy "Users can delete own agents." on agents for delete using ( auth.uid() = user_id );
create policy "Public can view agents." on agents for select using ( true ); 

-- Knowledge
create policy "Users can view own knowledge." on knowledge for select using ( exists ( select 1 from agents where agents.id = knowledge.agent_id and agents.user_id = auth.uid() ) );
create policy "Users can insert own knowledge." on knowledge for insert with check ( exists ( select 1 from agents where agents.id = knowledge.agent_id and agents.user_id = auth.uid() ) );

-- Chats/Messages
create policy "Public can create chats." on chats for insert with check ( true );
create policy "Public can read chats." on chats for select using ( true );
create policy "Public can create messages." on messages for insert with check ( true );
create policy "Public can read messages." on messages for select using ( true );

-- FUNCTION: Match Documents (Vector Search)
create or replace function match_rag_documents(
  query_embedding vector(768),
  match_count int,
  filter_agent_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    k.id,
    k.content,
    1 - (k.embedding <=> query_embedding) as similarity
  from knowledge k
  where k.agent_id = filter_agent_id
  order by k.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- TRIGGER: Create Profile
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

-- One hosted thread per visitor session and agent. Preview chats are not rows.
create unique index chats_agent_session_idx on chats (agent_id, session_id)
where session_id is not null;

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
-- Knowledge embeddings stay on `knowledge`. No anonymous policy, so anon cannot read them.
create policy "Users can view own knowledge." on knowledge for select using ( exists ( select 1 from agents where agents.id = knowledge.agent_id and agents.user_id = auth.uid() ) );
create policy "Users can insert own knowledge." on knowledge for insert with check ( exists ( select 1 from agents where agents.id = knowledge.agent_id and agents.user_id = auth.uid() ) );

revoke all on table knowledge from anon;
revoke select on table agents from anon;
revoke all on table chats from anon;
revoke all on table messages from anon;

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

revoke all on function match_rag_documents(vector(768), int, uuid) from public, anon;

-- One public agent by id. Callers cannot list the table.
create or replace function public.get_public_agent(agent_id uuid)
returns table (
  id uuid,
  config jsonb,
  knowledge jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select a.id, a.config, a.knowledge, a.created_at
  from agents a
  where a.id = agent_id
  limit 1;
$$;

revoke all on function public.get_public_agent(uuid) from public;
grant execute on function public.get_public_agent(uuid) to anon, authenticated;

-- Chat rows are reachable only with the visitor session id.
create or replace function public.ensure_visitor_chat(p_agent_id uuid, p_session_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  chat uuid;
begin
  if p_session_id is null or p_session_id !~ '^[A-Za-z0-9_-]{8,128}$' then
    raise exception 'invalid session';
  end if;
  if not exists (select 1 from agents where id = p_agent_id) then
    raise exception 'agent not found';
  end if;
  select c.id into chat from chats c
  where c.agent_id = p_agent_id and c.session_id = p_session_id
  order by c.created_at
  limit 1;
  if chat is null then
    begin
      insert into chats (agent_id, session_id) values (p_agent_id, p_session_id)
      returning id into chat;
    exception when unique_violation then
      select c.id into chat from chats c
      where c.agent_id = p_agent_id and c.session_id = p_session_id
      limit 1;
    end;
  end if;
  return chat;
end;
$$;

create or replace function public.find_visitor_chat(p_agent_id uuid, p_session_id text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select c.id from chats c
  where c.agent_id = p_agent_id
    and c.session_id = p_session_id
    and p_session_id ~ '^[A-Za-z0-9_-]{8,128}$'
  order by c.created_at
  limit 1;
$$;

create or replace function public.append_visitor_message(
  p_chat_id uuid,
  p_session_id text,
  p_role text,
  p_content text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_role not in ('user', 'model') or length(btrim(p_content)) = 0 then
    return;
  end if;
  if not exists (
    select 1 from chats c
    where c.id = p_chat_id and c.session_id = p_session_id
  ) then
    raise exception 'chat not found';
  end if;
  insert into messages (chat_id, role, content) values (p_chat_id, p_role, btrim(p_content));
end;
$$;

create or replace function public.list_visitor_messages(p_chat_id uuid, p_session_id text)
returns table (
  id uuid,
  role text,
  content text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select m.id, m.role, m.content, m.created_at
  from messages m
  join chats c on c.id = m.chat_id
  where c.id = p_chat_id and c.session_id = p_session_id
  order by m.created_at;
$$;

revoke all on function public.ensure_visitor_chat(uuid, text) from public;
revoke all on function public.find_visitor_chat(uuid, text) from public;
revoke all on function public.append_visitor_message(uuid, text, text, text) from public;
revoke all on function public.list_visitor_messages(uuid, text) from public;
grant execute on function public.ensure_visitor_chat(uuid, text) to anon, authenticated;
grant execute on function public.find_visitor_chat(uuid, text) to anon, authenticated;
grant execute on function public.append_visitor_message(uuid, text, text, text) to anon, authenticated;
grant execute on function public.list_visitor_messages(uuid, text) to anon, authenticated;

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

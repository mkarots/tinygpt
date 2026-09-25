-- Run once on a database that already has 20260918000000_initial_schema.sql.
-- Public chat loads one agent and one visitor session. Anonymous clients cannot list tables.

drop policy if exists "Public can view agents." on agents;
drop policy if exists "Public can create chats." on chats;
drop policy if exists "Public can read chats." on chats;
drop policy if exists "Public can create messages." on messages;
drop policy if exists "Public can read messages." on messages;

revoke all on table knowledge from anon;
revoke select on table agents from anon;
revoke all on table chats from anon;
revoke all on table messages from anon;

revoke all on function match_rag_documents(vector(768), int, uuid) from public, anon;

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

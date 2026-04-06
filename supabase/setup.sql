create extension if not exists pgcrypto;

do $$
begin
  create type public.task_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz,
  priority public.task_priority not null default 'medium',
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  content text,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.tasks add column if not exists id uuid default gen_random_uuid();
alter table public.tasks add column if not exists user_id uuid;
alter table public.tasks add column if not exists title text;
alter table public.tasks add column if not exists description text;
alter table public.tasks add column if not exists due_date timestamptz;
alter table public.tasks add column if not exists priority public.task_priority default 'medium';
alter table public.tasks add column if not exists completed boolean default false;
alter table public.tasks add column if not exists created_at timestamptz default timezone('utc', now());

alter table public.notes add column if not exists id uuid default gen_random_uuid();
alter table public.notes add column if not exists user_id uuid;
alter table public.notes add column if not exists title text;
alter table public.notes add column if not exists content text;
alter table public.notes add column if not exists tags text[] default '{}';
alter table public.notes add column if not exists created_at timestamptz default timezone('utc', now());

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'priority'
      and udt_name <> 'task_priority'
  ) then
    execute $sql$
      alter table public.tasks
      alter column priority type public.task_priority
      using (
        case
          when priority is null then 'medium'::public.task_priority
          when lower(priority::text) in ('low', 'medium', 'high') then lower(priority::text)::public.task_priority
          else 'medium'::public.task_priority
        end
      )
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'due_date'
      and udt_name = 'timestamp'
  ) then
    execute 'alter table public.tasks alter column due_date type timestamptz using timezone(''utc'', due_date)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'created_at'
      and udt_name = 'timestamp'
  ) then
    execute 'alter table public.tasks alter column created_at type timestamptz using timezone(''utc'', created_at)';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notes'
      and column_name = 'tags'
      and udt_name <> '_text'
  ) then
    execute $sql$
      alter table public.notes
      alter column tags type text[]
      using (
        case
          when tags is null then '{}'::text[]
          when btrim(tags::text) = '' then '{}'::text[]
          else string_to_array(replace(tags::text, ' ', ''), ',')
        end
      )
    $sql$;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notes'
      and column_name = 'created_at'
      and udt_name = 'timestamp'
  ) then
    execute 'alter table public.notes alter column created_at type timestamptz using timezone(''utc'', created_at)';
  end if;
end $$;

update public.tasks set completed = false where completed is null;
update public.tasks set priority = 'medium' where priority is null;
update public.tasks set created_at = timezone('utc', now()) where created_at is null;
update public.notes set tags = '{}'::text[] where tags is null;
update public.notes set created_at = timezone('utc', now()) where created_at is null;

alter table public.tasks alter column id set default gen_random_uuid();
alter table public.tasks alter column priority set default 'medium';
alter table public.tasks alter column completed set default false;
alter table public.tasks alter column created_at set default timezone('utc', now());
alter table public.notes alter column id set default gen_random_uuid();
alter table public.notes alter column tags set default '{}';
alter table public.notes alter column created_at set default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tasks'::regclass
      and contype = 'p'
  ) then
    alter table public.tasks add constraint tasks_pkey primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.notes'::regclass
      and contype = 'p'
  ) then
    alter table public.notes add constraint notes_pkey primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_user_id_fkey'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notes_user_id_fkey'
      and conrelid = 'public.notes'::regclass
  ) then
    alter table public.notes
      add constraint notes_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end $$;

alter table public.tasks alter column user_id set not null;
alter table public.tasks alter column title set not null;
alter table public.tasks alter column priority set not null;
alter table public.tasks alter column completed set not null;
alter table public.tasks alter column created_at set not null;
alter table public.notes alter column user_id set not null;
alter table public.notes alter column tags set not null;
alter table public.notes alter column created_at set not null;

comment on column public.notes.tags is 'Use the reserved pinned tag to surface a note in Focus Mode.';

create index if not exists tasks_user_due_date_idx on public.tasks (user_id, due_date);
create index if not exists tasks_user_completed_idx on public.tasks (user_id, completed);
create index if not exists tasks_user_created_idx on public.tasks (user_id, created_at desc);
create index if not exists notes_user_created_idx on public.notes (user_id, created_at desc);
create index if not exists notes_tags_gin_idx on public.notes using gin (tags);

alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.tasks force row level security;
alter table public.notes force row level security;

drop policy if exists "Users can view their own tasks" on public.tasks;
drop policy if exists "Users can insert their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;

create policy "Users can view their own tasks"
on public.tasks
for select
using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
on public.tasks
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
on public.tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
on public.tasks
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own notes" on public.notes;
drop policy if exists "Users can insert their own notes" on public.notes;
drop policy if exists "Users can update their own notes" on public.notes;
drop policy if exists "Users can delete their own notes" on public.notes;

create policy "Users can view their own notes"
on public.notes
for select
using (auth.uid() = user_id);

create policy "Users can insert their own notes"
on public.notes
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own notes"
on public.notes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own notes"
on public.notes
for delete
using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.notes to authenticated;

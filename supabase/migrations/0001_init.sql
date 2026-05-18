-- Personal Al-Baqarah Hifz tracker — schema, RLS, and seed function.

create table public.pages (
  user_id       uuid not null references auth.users on delete cascade,
  page_number   smallint not null check (page_number between 1 and 48),
  status        text not null check (status in ('red','ram','trigger','cold','new')),
  last_reviewed timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (user_id, page_number)
);

create table public.daily_done (
  user_id     uuid not null references auth.users on delete cascade,
  done_date   date not null,
  page_number smallint not null check (page_number between 1 and 48),
  marked_at   timestamptz not null default now(),
  primary key (user_id, done_date, page_number)
);

alter table public.pages      enable row level security;
alter table public.daily_done enable row level security;

create policy "own pages" on public.pages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own done" on public.daily_done
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.seed_pages_for_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from public.pages where user_id = uid) then
    return;
  end if;

  insert into public.pages (user_id, page_number, status)
  select uid, g, 'new' from generate_series(1, 48) g;

  update public.pages set status = 'red'
    where user_id = uid and page_number in (18, 26);
  update public.pages set status = 'ram'
    where user_id = uid and page_number in (13, 14, 22, 23, 24);
  update public.pages set status = 'trigger'
    where user_id = uid and page_number in (7, 9, 15, 17, 19, 25, 27);
  update public.pages set status = 'cold'
    where user_id = uid and page_number in (2, 3, 4, 5, 6, 8, 10, 11, 12, 16, 20, 21);
end;
$$;

grant execute on function public.seed_pages_for_current_user() to authenticated;

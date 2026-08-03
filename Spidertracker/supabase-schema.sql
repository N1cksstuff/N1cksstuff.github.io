create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Explorer' check (char_length(display_name) between 1 and 20),
  username text not null default 'explorer',
  pronouns text not null default '',
  avatar_url text not null default '',
  banner_url text not null default '',
  character_color text not null default 'violet' check (character_color in ('violet', 'coral', 'ocean', 'moss')),
  character_style text not null default 'orbit' check (character_style in ('orbit', 'glow', 'sunset')),
  bio text not null default '',
  website_url text not null default '',
  social_handle text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Public bucket for profile avatar and banner uploads.
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

create policy "Anyone can view profile images"
  on storage.objects for select
  using (bucket_id = 'profile-images');

create policy "Users can upload their own profile images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own profile images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own profile images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

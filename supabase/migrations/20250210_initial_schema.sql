-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create subscription tiers enum
create type subscription_tier as enum ('free', 'creator', 'pro', 'enterprise');

-- Create custom roles enum
create type user_role as enum ('user', 'admin', 'superadmin');

-- Create profiles table with roles and subscription info
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role user_role default 'user' not null,
  subscription_tier subscription_tier default 'free' not null,
  subscription_status text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  daily_upload_count int default 0,
  daily_upload_reset timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stores table
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  platform text not null,
  credentials jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create collections table
create table if not exists public.collections (
  id uuid default uuid_generate_v4() primary key not null,
  store_id uuid references public.stores on delete cascade not null,
  name text not null,
  settings jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create blueprints table
create table if not exists public.blueprints (
  id uuid default uuid_generate_v4() primary key not null,
  type text not null,
  metadata jsonb,
  placeholders jsonb[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create templates table with item count tracking
create table if not exists public.templates (
  id uuid default uuid_generate_v4() primary key not null,
  collection_id uuid references public.collections on delete cascade not null,
  blueprint_id uuid references public.blueprints on delete restrict not null,
  variants jsonb[],
  item_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscription limits table
create table if not exists public.subscription_limits (
  tier subscription_tier primary key,
  max_items_per_template int not null,
  max_templates int not null,
  max_daily_uploads int not null,
  has_ads boolean not null default true
);

-- Insert subscription tier limits
insert into public.subscription_limits (tier, max_items_per_template, max_templates, max_daily_uploads, has_ads) values
  ('free', 5, 3, 10, true),
  ('creator', 10, 10, -1, false),
  ('pro', 30, 20, -1, false),
  ('enterprise', -1, -1, -1, false);

-- Create RLS policies

-- Profiles policies
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Stores policies
alter table public.stores enable row level security;

create policy "Users can view their own stores"
  on public.stores for select
  using ( auth.uid() = user_id );

create policy "Users can create their own stores"
  on public.stores for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own stores"
  on public.stores for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own stores"
  on public.stores for delete
  using ( auth.uid() = user_id );

-- Collections policies with subscription limits
alter table public.collections enable row level security;

create policy "Users can view collections in their stores"
  on public.collections for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = store_id
      and stores.user_id = auth.uid()
    )
  );

create policy "Users can create collections in their stores"
  on public.collections for insert
  with check (
    exists (
      select 1 from public.stores
      where stores.id = store_id
      and stores.user_id = auth.uid()
    )
  );

create policy "Users can update collections in their stores"
  on public.collections for update
  using (
    exists (
      select 1 from public.stores
      where stores.id = store_id
      and stores.user_id = auth.uid()
    )
  );

create policy "Users can delete collections in their stores"
  on public.collections for delete
  using (
    exists (
      select 1 from public.stores
      where stores.id = store_id
      and stores.user_id = auth.uid()
    )
  );

-- Create functions

-- Function to handle user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    role,
    subscription_tier,
    daily_upload_count,
    daily_upload_reset
  )
  values (
    new.id,
    new.email,
    'user',
    'free',
    0,
    timezone('utc'::text, now())
  );
  return new;
end;
$$;

-- Function to check template limits
create or replace function public.check_template_limits()
returns trigger
language plpgsql
security definer
as $$
declare
  user_tier subscription_tier;
  template_count int;
  max_templates int;
begin
  -- Get user's subscription tier
  select subscription_tier into user_tier
  from public.profiles
  where id = auth.uid();

  -- Get max templates allowed for tier
  select max_templates into max_templates
  from public.subscription_limits
  where tier = user_tier;

  -- Count user's existing templates
  select count(*) into template_count
  from public.templates t
  join public.collections c on t.collection_id = c.id
  join public.stores s on c.store_id = s.id
  where s.user_id = auth.uid();

  -- Check if creating new template would exceed limit
  if TG_OP = 'INSERT' and max_templates != -1 and template_count >= max_templates then
    raise exception 'Template limit reached for your subscription tier';
  end if;

  return new;
end;
$$;

-- Function to check item limits per template
create or replace function public.check_item_limits()
returns trigger
language plpgsql
security definer
as $$
declare
  user_tier subscription_tier;
  max_items int;
begin
  -- Get user's subscription tier
  select p.subscription_tier into user_tier
  from public.profiles p
  join public.stores s on s.user_id = p.id
  join public.collections c on c.store_id = s.id
  join public.templates t on t.collection_id = c.id
  where t.id = new.id;

  -- Get max items allowed for tier
  select max_items_per_template into max_items
  from public.subscription_limits
  where tier = user_tier;

  -- Check if updating would exceed limit
  if max_items != -1 and new.item_count > max_items then
    raise exception 'Item limit reached for your subscription tier';
  end if;

  return new;
end;
$$;

-- Function to check daily upload limits
create or replace function public.check_daily_upload_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  user_tier subscription_tier;
  max_uploads int;
  current_count int;
  last_reset timestamp with time zone;
begin
  -- Get user's subscription tier and upload info
  select
    p.subscription_tier,
    p.daily_upload_count,
    p.daily_upload_reset
  into
    user_tier,
    current_count,
    last_reset
  from public.profiles p
  where id = auth.uid();

  -- Get max uploads allowed for tier
  select max_daily_uploads into max_uploads
  from public.subscription_limits
  where tier = user_tier;

  -- Reset counter if day has changed
  if last_reset < date_trunc('day', now()) then
    update public.profiles
    set
      daily_upload_count = 1,
      daily_upload_reset = timezone('utc'::text, now())
    where id = auth.uid();
  else
    -- Check if update would exceed limit
    if max_uploads != -1 and current_count >= max_uploads then
      raise exception 'Daily upload limit reached for your subscription tier';
    end if;

    -- Increment upload counter
    update public.profiles
    set daily_upload_count = daily_upload_count + 1
    where id = auth.uid();
  end if;

  return new;
end;
$$;

-- Function to automatically update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger check_template_limits
  before insert on public.templates
  for each row execute procedure public.check_template_limits();

create trigger check_item_limits
  before update of item_count on public.templates
  for each row execute procedure public.check_item_limits();

-- Add updated_at triggers to all tables
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_stores_updated_at
  before update on public.stores
  for each row execute procedure public.update_updated_at_column();

create trigger update_collections_updated_at
  before update on public.collections
  for each row execute procedure public.update_updated_at_column();

create trigger update_blueprints_updated_at
  before update on public.blueprints
  for each row execute procedure public.update_updated_at_column();

create trigger update_templates_updated_at
  before update on public.templates
  for each row execute procedure public.update_updated_at_column();
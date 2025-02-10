-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create admin specific tables
create table if not exists public.admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references auth.users on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.admin_sessions (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references auth.users on delete cascade not null,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

create table if not exists public.system_metrics (
  id uuid primary key default uuid_generate_v4(),
  metric_type text not null,
  value numeric not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  resource text not null,
  limit_type text not null,
  max_requests integer not null,
  window_seconds integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index admin_logs_admin_id_idx on public.admin_logs(admin_id);
create index admin_logs_created_at_idx on public.admin_logs(created_at);
create index admin_sessions_admin_id_idx on public.admin_sessions(admin_id);
create index admin_sessions_expires_at_idx on public.admin_sessions(expires_at);
create index system_metrics_type_created_at_idx on public.system_metrics(metric_type, created_at);
create index rate_limits_resource_idx on public.rate_limits(resource);

-- Create admin log function
create or replace function public.log_admin_action()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.admin_logs (
    admin_id,
    action,
    target_type,
    target_id,
    metadata
  ) values (
    auth.uid(),
    TG_ARGV[0],
    TG_ARGV[1],
    new.id,
    row_to_json(new)::jsonb
  );
  return new;
end;
$$;

-- Add RLS policies
alter table public.admin_logs enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.system_metrics enable row level security;
alter table public.rate_limits enable row level security;

-- Admin logs policies
create policy "Admins can view all logs"
  on public.admin_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'superadmin')
    )
  );

-- Admin sessions policies
create policy "Admins can view their own sessions"
  on public.admin_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'superadmin')
    )
    and admin_id = auth.uid()
  );

-- System metrics policies
create policy "Admins can view metrics"
  on public.system_metrics for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'superadmin')
    )
  );

create policy "Superadmins can insert metrics"
  on public.system_metrics for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'superadmin'
    )
  );

-- Rate limits policies
create policy "Admins can view rate limits"
  on public.rate_limits for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'superadmin')
    )
  );

create policy "Superadmins can manage rate limits"
  on public.rate_limits for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'superadmin'
    )
  );

-- Add triggers for admin logging
create trigger log_profile_changes
  after insert or update or delete on public.profiles
  for each row execute procedure public.log_admin_action('profile_change', 'profile');

create trigger log_subscription_changes
  after insert or update or delete on public.subscription_limits
  for each row execute procedure public.log_admin_action('subscription_change', 'subscription');

create trigger log_rate_limit_changes
  after insert or update or delete on public.rate_limits
  for each row execute procedure public.log_admin_action('rate_limit_change', 'rate_limit');
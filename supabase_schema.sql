-- Reset Tables (CAUTION: Deletes all data)
drop table if exists public.sets cascade;
drop table if exists public.workouts cascade;
drop table if exists public.exercises cascade;
drop table if exists public.profiles cascade;

-- Create Profiles Table (Managed by Supabase Auth usually, but we define the public table)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text,
  body_weight float,
  updated_at timestamp with time zone,
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create Exercises Table (Personal Library)


create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- Added for RLS
  external_api_id text,
  name text not null,
  body_part text,
  gif_url text,
  current_pr float default 0
);

-- RLS
alter table public.exercises enable row level security;
create policy "Users can see own exercises" on exercises for select using (auth.uid() = user_id);
create policy "Users can insert own exercises" on exercises for insert with check (auth.uid() = user_id);
create policy "Users can update own exercises" on exercises for update using (auth.uid() = user_id);

-- Create Workouts Table
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text,
  status text check (status in ('in_progress', 'completed')),
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  volume_load float default 0
);

alter table public.workouts enable row level security;

create policy "Users can view own workouts" on workouts for select using (auth.uid() = user_id);
create policy "Users can insert own workouts" on workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts" on workouts for update using (auth.uid() = user_id);

-- Create Sets Table
create table public.sets (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  exercise_id uuid references public.exercises not null,
  reps int not null,
  weight float not null,
  rpe float,
  estimated_1rm float
);

alter table public.sets enable row level security;

-- Sets are accessible if the user owns the workout
create policy "Users can view sets of own workouts" on sets for select using (
  exists ( select 1 from workouts w where w.id = sets.workout_id and w.user_id = auth.uid() )
);

create policy "Users can insert sets to own workouts" on sets for insert with check (
  exists ( select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid() )
);

create policy "Users can update sets of own workouts" on sets for update using (
    exists ( select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid() )
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, body_weight)
  values (new.id, new.raw_user_meta_data->>'username', 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

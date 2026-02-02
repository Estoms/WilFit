-- Module 6 Migration: Planning & Scheduling

-- 1. Update workouts table
alter table public.workouts 
add column scheduled_date timestamp with time zone;

-- Update status check constraint to include 'planned'
-- First drop the existing constraint (name might vary, Supabase usually names it workouts_status_check)
alter table public.workouts drop constraint if exists workouts_status_check;
alter table public.workouts add constraint workouts_status_check 
check (status in ('planned', 'in_progress', 'completed'));

-- 2. Create workout_exercises table (For planning exercises without sets)
create table public.workout_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  exercise_id uuid references public.exercises not null,
  created_at timestamp with time zone default now()
);

-- RLS for workout_exercises
alter table public.workout_exercises enable row level security;

create policy "Users can view own workout exercises" on workout_exercises for select using (
  exists ( select 1 from workouts w where w.id = workout_exercises.workout_id and w.user_id = auth.uid() )
);

create policy "Users can manage own workout exercises" on workout_exercises for insert with check (
  exists ( select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid() )
);

create policy "Users can delete own workout exercises" on workout_exercises for delete using (
  exists ( select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid() )
);

--rien à faire

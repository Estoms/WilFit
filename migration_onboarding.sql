-- Add preferred_unit to profiles
ALTER TABLE profiles 
ADD COLUMN preferred_unit text CHECK (preferred_unit IN ('kg', 'lbs')) DEFAULT 'kg';

-- Policy is already ensuring users can update their own profile so no new RLS needed for this column specifically if the row exists.

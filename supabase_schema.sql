-- Create the registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  occupation TEXT,
  interests TEXT[] DEFAULT '{}',
  personality_traits TEXT[] DEFAULT '{}',
  looking_for TEXT,
  additional_notes TEXT,
  height TEXT,
  body_type TEXT,
  hair_color TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'approved'
);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (register)
CREATE POLICY "Allow public inserts" ON registrations
  FOR INSERT WITH CHECK (true);

-- Policy: Allow anyone to read (for the landing page counter and checking uniqueness if needed, 
-- though typically we'd restrict this to admin. For this MVP, public read is used for the counter)
CREATE POLICY "Allow public read" ON registrations
  FOR SELECT USING (true);

-- Storage setup for photos
-- Note: You'll need to create a bucket named 'photos' in the dashboard first if this script is run in SQL editor, 
-- or use the UI to create it.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow public uploads to 'photos'
CREATE POLICY "Public Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'photos' );

-- Storage Policy: Allow public read of 'photos'
CREATE POLICY "Public Read" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'photos' );

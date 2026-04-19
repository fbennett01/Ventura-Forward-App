# Supabase Setup

1. Create a Supabase project.
2. Open the SQL Editor and run [migrations/0001_init.sql](./migrations/0001_init.sql).
3. Create a storage bucket named report-photos and enable public read.
4. Add a storage policy so anon can insert objects to report-photos.
5. Copy your project URL, anon key, and service role key into .env.local.

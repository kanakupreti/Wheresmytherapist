create table if not exists therapists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialties text[] not null default '{}',
  languages text[] not null default '{}',
  price_inr int,
  bio text
);

alter table therapists enable row level security;
create policy "Public can read therapists" on therapists
  for select using (true);

insert into therapists (name, specialties, languages, price_inr, bio) values
 ('Demo Therapist A', '{anxiety,stress}', '{English,Hindi}', 800, 'Helps with anxiety and work stress.'),
 ('Demo Therapist B', '{depression,grief}', '{English,Tamil}', 1000, 'Supports people through low mood and loss.'),
 ('Demo Therapist C', '{relationships,family}', '{Hindi,Punjabi}', 700, 'Couples and family counselling.'),
 ('Demo Therapist D', '{trauma,anxiety}', '{English,Bengali}', 1200, 'Trauma-informed therapy.'),
 ('Demo Therapist E', '{career,stress}', '{English,Hindi,Marathi}', 500, 'Career pressure and burnout.');
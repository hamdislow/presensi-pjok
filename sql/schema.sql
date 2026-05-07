create table if not exists profiles (
  id uuid primary key,
  name text not null,
  email text unique not null,
  role text not null check(role in ('admin','pjmk','student')),
  rombel_id text,
  created_at timestamptz default now()
);

create table if not exists attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  rombel_id text not null check(rombel_id in ('153','154','155')),
  status_open boolean default true,
  lat_target double precision not null,
  long_target double precision not null,
  radius_meter integer default 500,
  created_by uuid not null,
  created_at timestamptz default now()
);

create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  rombel_id text not null,
  session_id uuid references attendance_sessions(id),
  status text not null check(status in ('HADIR','SAKIT','IZIN','DISPENSASI')),
  method text,
  latitude double precision,
  longitude double precision,
  distance_meter double precision,
  file_link text,
  notes text,
  created_at timestamptz default now()
);

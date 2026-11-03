-- 010: interesse voor clubshirts (verzamelen tot er genoeg zijn voor een bestelling)
create table if not exists shirt_interest (
  device_id text not null,
  item text not null,            -- 'kort' of 'lang'
  size text not null,
  qty int default 1,
  name text default '',
  updated_at timestamptz default now(),
  primary key (device_id, item)
);
alter table shirt_interest enable row level security;

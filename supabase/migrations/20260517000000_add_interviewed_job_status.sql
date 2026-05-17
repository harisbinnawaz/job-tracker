do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.jobs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.jobs drop constraint %I', constraint_record.conname);
  end loop;
end $$;

alter table public.jobs
  add constraint jobs_status_check
  check (status in ('Applied', 'Interviewing', 'Interviewed', 'Offer', 'Rejected'));

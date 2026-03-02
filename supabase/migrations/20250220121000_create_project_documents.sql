-- Store signed legal documents per project (links to Supabase Storage paths)
create table if not exists project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_at timestamptz not null default timezone('utc', now())
);

create index if not exists project_documents_project_id_idx
  on project_documents(project_id);


-- Referencia del esquema para Equafy
-- Ejecuta esto en el SQL Editor de Supabase para actualizar tus tablas

-- 1. TABLA DE PROYECTOS
-- Sincronizada con tu interfaz 'Project' y 'ProjectModel' en TypeScript
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Vinculamos el proyecto al usuario creador
  
  -- Modelos de reparto: JUST_SPLIT, FLAT, CUSTOM
  model_type TEXT NOT NULL DEFAULT 'CUSTOM' CHECK (model_type IN ('JUST_SPLIT', 'FLAT', 'CUSTOM')),
  
  -- Multiplicadores de riesgo (Nombres exactos según tu types/database.ts)
  mult_cash NUMERIC DEFAULT 4,
  mult_work NUMERIC DEFAULT 2,
  mult_tangible NUMERIC DEFAULT 1,
  mult_intangible NUMERIC DEFAULT 2,
  mult_others NUMERIC DEFAULT 1, -- Agregado: Soporte para 'others'
  
  use_log_risk BOOLEAN DEFAULT false,
  current_valuation NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE APORTACIONES
-- Sincronizada con tu interfaz 'Contribution' y 'ContributionType'
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contributor_name TEXT NOT NULL,
  
  -- Tipos actualizados para coincidir con TS: 'cash', 'work', 'tangible', 'intangible', 'others', 'legacy_contribution'
  type TEXT NOT NULL CHECK (type IN ('cash', 'work', 'tangible', 'intangible', 'others', 'legacy_contribution')),
  
  concept TEXT, -- Agregado: Para describir la aportación
  amount NUMERIC NOT NULL,
  multiplier NUMERIC NOT NULL, -- Agregado: Guardamos el multiplicador que se usó
  risk_adjusted_value NUMERIC NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEGURIDAD (Row Level Security)
-- Esto protege los datos para que solo el dueño pueda verlos/editarlos

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propios proyectos
CREATE POLICY "Users can CRUD their own projects" 
ON projects 
USING (auth.uid() = owner_id);

-- Política: Las aportaciones son visibles si el usuario es dueño del proyecto
CREATE POLICY "Users can CRUD contributions of their projects" 
ON contributions 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = contributions.project_id 
    AND projects.owner_id = auth.uid()
  )
);

-- Si project_members existe pero no tiene fixed_equity, ejecuta:
-- ALTER TABLE project_members ADD COLUMN IF NOT EXISTS fixed_equity NUMERIC DEFAULT 0;

-- RBAC: Si project_members no tiene access_level, ejecuta:
-- ALTER TABLE project_members ADD COLUMN IF NOT EXISTS access_level TEXT NOT NULL DEFAULT 'editor';

-- Limited Equity: Si project_members no tiene equity_cap, ejecuta:
-- ALTER TABLE project_members ADD COLUMN IF NOT EXISTS equity_cap NUMERIC DEFAULT NULL;

-- 4. TABLA DE AUDITORÍA (Audit Trail)
CREATE TABLE IF NOT EXISTS project_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la tabla project_audit_log ya existía sin user_email, ejecuta:
-- ALTER TABLE project_audit_log ADD COLUMN IF NOT EXISTS user_email TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_log_project_id ON project_audit_log(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON project_audit_log(created_at DESC);

ALTER TABLE project_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read audit log of their projects"
ON project_audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_audit_log.project_id
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert audit log for their projects"
ON project_audit_log FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_audit_log.project_id
    AND projects.owner_id = auth.uid()
  )
);
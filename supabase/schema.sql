-- Referencia del esquema para Equily
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
  
  -- Tipos actualizados para coincidir con TS: 'cash', 'work', 'tangible', 'intangible', 'others'
  type TEXT NOT NULL CHECK (type IN ('cash', 'work', 'tangible', 'intangible', 'others')),
  
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
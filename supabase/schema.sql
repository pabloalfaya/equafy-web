-- Referencia del esquema para Equily
-- Ejecuta en Supabase SQL Editor si necesitas crear las tablas

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model_type TEXT DEFAULT 'standard',
  mult_cash NUMERIC DEFAULT 4,
  mult_labor NUMERIC DEFAULT 2,
  mult_ip NUMERIC DEFAULT 2,
  mult_assets NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contributor_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'labor', 'ip', 'assets')),
  amount NUMERIC NOT NULL,
  risk_multiplier NUMERIC NOT NULL,
  risk_adjusted_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si RLS está activo y no ves datos, ejecuta estas políticas:
-- Permiten lectura/escritura pública (ajusta según tu seguridad)
/*
CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "Allow public insert contributions" ON contributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete contributions" ON contributions FOR DELETE USING (true);
*/

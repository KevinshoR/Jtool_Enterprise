-- Planes de membresía
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL,        -- basica | pro | empresarial
  name VARCHAR(80) NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,          -- en COP, sin decimales
  price_annual INTEGER,                    -- COP, con descuento ya aplicado
  is_featured BOOLEAN NOT NULL DEFAULT false, -- para destacar "Recomendado"
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Qué productos incluye cada plan
CREATE TABLE IF NOT EXISTS plan_products (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(plan_id, product_id)
);

-- La empresa tiene un plan de membresía activo
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL;

-- Marca en company_products si el acceso viene de un plan o fue asignado individual
ALTER TABLE company_products ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'individual'; -- plan | individual

-- Catálogo inicial de planes
INSERT INTO plans (code, name, description, price_monthly, price_annual, is_featured, sort_order) VALUES
  ('basica', 'Básica', 'Ideal para empezar con un solo programa', 79000, 758400, false, 1),
  ('pro', 'Pro', 'Para negocios que necesitan más de un programa', 149000, 1430400, true, 2),
  ('empresarial', 'Empresarial', 'Todos los programas, soporte prioritario', 249000, 2390400, false, 3)
ON CONFLICT (code) DO NOTHING;
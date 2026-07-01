-- Empresas clientes (tenants)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  nit VARCHAR(50),
  email VARCHAR(150),
  phone VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | inactive | trial
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Catálogo de programas
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Qué empresa contrató qué producto
CREATE TABLE IF NOT EXISTS company_products (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active | trial | suspended | cancelled
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  UNIQUE(company_id, product_id)
);

-- Vincular usuarios a una empresa (el super admin no tiene company_id)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Catálogo inicial de productos
INSERT INTO products (code, name, description) VALUES
  ('jtools', 'JTools', 'Gestión de repuestos e inventario'),
  ('barberpro', 'BarberPro', 'Gestión de barberías'),
  ('catalogapp', 'CatalogApp', 'Catálogo digital de productos')
ON CONFLICT (code) DO NOTHING;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline VARCHAR(160);
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_audience VARCHAR(220);
ALTER TABLE products ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS accent VARCHAR(20) NOT NULL DEFAULT 'esmeralda';

UPDATE products SET
  tagline = 'Controla repuestos, compras y ventas sin depender de una hoja de cálculo',
  target_audience = 'Talleres, ferreterías y distribuidoras que gestionan inventario físico a diario',
  features = '["Control de stock en tiempo real", "Ficha técnica en PDF por producto", "Catálogo con carrito para clientes vía WhatsApp", "Gestión de pagos y proveedores"]'::jsonb,
  accent = 'esmeralda'
WHERE code = 'jtools';

UPDATE products SET
  tagline = 'Agenda citas, gestiona clientes y controla tu barbería desde el celular',
  target_audience = 'Barberías y peluquerías que quieren dejar de agendar citas por WhatsApp a mano',
  features = '["Agenda de citas y turnos", "Registro de clientes e historial", "Administración de servicios y precios", "Panel de control para el barbero", "App móvil incluida"]'::jsonb,
  accent = 'naranja'
WHERE code = 'barberpro';

UPDATE products SET
  tagline = 'Un catálogo digital para que tus clientes vean y pidan tus productos sin llamarte',
  target_audience = 'Negocios que venden por catálogo y quieren automatizar los pedidos por WhatsApp',
  features = '["Catálogo digital enlazable", "Carrito de compras integrado", "Pedidos directos a WhatsApp", "Actualización de precios en un clic"]'::jsonb,
  accent = 'profundo'
WHERE code = 'catalogapp';
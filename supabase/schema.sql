-- =========================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS PARA "AQUÍ ESTAMOS" EN SUPABASE (POSTGRESQL)
-- =========================================================================

-- 1. TABLA DE USUARIOS (Clientes y Administradores)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    image TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    phone TEXT,
    address TEXT,
    ruc TEXT,
    tax_name TEXT,
    reset_token TEXT,
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE EMPLEADOS (Personal de Limpieza Verificado)
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ci TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    image TEXT,
    zone TEXT DEFAULT 'Asunción y Gran Asunción',
    ips_verified BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3,2) DEFAULT 5.00,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE RESERVAS DE LIMPIEZA
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    booking_number TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    service_hours INTEGER NOT NULL,
    frequency TEXT NOT NULL,
    extras JSONB DEFAULT '[]'::jsonb,
    service_date DATE NOT NULL,
    service_time TEXT NOT NULL,
    total_price INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'PENDING',
    status TEXT DEFAULT 'PENDING',
    assigned_cleaner TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE LEADS CORPORATIVOS (Empresas y Oficinas)
CREATE TABLE IF NOT EXISTS public.corporate_leads (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    ruc TEXT,
    facility_type TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    requirements TEXT,
    status TEXT DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE RESEÑAS Y TESTIMONIOS
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_image TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    service_type TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- Permite que la API de la aplicación lea y guarde datos
-- =========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access users" ON public.users;
CREATE POLICY "Public full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access employees" ON public.employees;
CREATE POLICY "Public full access employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access bookings" ON public.bookings;
CREATE POLICY "Public full access bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access corporate_leads" ON public.corporate_leads;
CREATE POLICY "Public full access corporate_leads" ON public.corporate_leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access reviews" ON public.reviews;
CREATE POLICY "Public full access reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- DATOS INICIALES SEMBRADOS (Administrador, Empleados y Reseñas)
-- =========================================================================

-- Administrador Maestro (juanas89@gmail.com / DjangoPY89)
INSERT INTO public.users (id, name, email, password_hash, role, phone)
VALUES (
    'usr_admin_master',
    'Administrador Juan',
    'juanas89@gmail.com',
    '$2a$10$w0uRkl1W/i/K0J55uA5WzO.b8VnE/H3U42d9v5ZtqLpUeZzW1.g0e', -- DjangoPY89
    'ADMIN',
    '0984320528'
) ON CONFLICT (email) DO NOTHING;

-- Empleadas Iniciales con IPS Verificado
INSERT INTO public.employees (id, name, ci, phone, email, zone, ips_verified, rating, status)
VALUES 
    ('emp_carmen', 'Carmen Benítez', '3.456.789', '0981 234 567', 'carmen.benitez@aquiestamos.com', 'Asunción (Villa Morra / Ykua Satî)', TRUE, NULL, 'ACTIVE'),
    ('emp_rosa', 'Rosa María González', '4.123.456', '0982 987 654', 'rosa.gonzalez@aquiestamos.com', 'Asunción (Centro / Barrio Jara)', TRUE, NULL, 'ACTIVE'),
    ('emp_mirna', 'Mirna Rolón', '3.789.012', '0985 345 678', 'mirna.rolon@aquiestamos.com', 'Gran Asunción (Lambaré / Fdo. de la Mora)', TRUE, NULL, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Reseñas Destacadas
INSERT INTO public.reviews (id, user_id, user_name, rating, comment, service_type, is_published)
VALUES
    ('rev_1', 'seed_1', 'Carolina M. (Villa Morra)', 5, 'Excelente servicio. La puntualidad y la atención al detalle de Carmen superaron mis expectativas. El piso y la cocina quedaron relucientes.', 'Integral (6 Horas)', TRUE),
    ('rev_2', 'seed_2', 'Esteban R. (Ykua Satî)', 5, 'Increíble cómo cambió la casa después de 8 horas de limpieza profunda. Muy confiable el personal y 100% profesionales.', 'Full Day (8 Horas)', TRUE),
    ('rev_3', 'seed_3', 'Valeria D. (Mcal. López)', 5, 'Tengo contratado el plan recurrente 3 veces por semana y no lo cambio por nada. Me ahorra horas de vida y la facturación es impecable.', 'Plan Recurrente (15% OFF)', TRUE)
ON CONFLICT (id) DO NOTHING;

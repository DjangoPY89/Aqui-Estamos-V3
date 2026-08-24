# Aquí Estamos 3.0 - Plataforma Web y Backend de Limpieza Profesional

Plataforma web de última generación y backend completo para la empresa de servicios de limpieza **"Aquí Estamos"** (Asunción y Gran Asunción, Paraguay), desarrollada con Next.js 14, React, TypeScript, Tailwind CSS, NextAuth (Google y Apple ID) y SQLite relacional.

---

## 🚀 Características Principales

### 1. Frontend Moderno & Experiencia de Usuario (UI/UX)
- **Landing Page de Alto Impacto**:
  - Branding oficial con el logo original (`/images/logo.jpeg`) y favicon.
  - Insignia de 4.9/5 estrellas en Google Reviews.
  - Paquetes de servicios claros: **Express (4h - 120.000 Gs.)**, **Integral (6h - 160.000 Gs.)** y **Full Day (8h - 200.000 Gs.)**.
  - Cotizador y Calculador instantáneo con cálculo dinámico en Guaraníes (Gs.) y descuento del 15% por servicio recurrente.
  - Zonas de cobertura detalladas en Asunción, Luque, San Lorenzo, Lambaré, Villa Morra, Ykua Satî, etc.
  - Botón flotante y enlaces directos a WhatsApp `(0984) 320-528`.

- **Flujo de Reserva Paso a Paso (`/reservar`)**:
  - Selección de horas y extras (Heladera, Horno, Lavandería, etc.).
  - Selector de turnos (08:00 AM, 09:00 AM, 13:00 PM, 14:00 PM) y fechas disponibles.
  - Georreferenciación con coordenadas GPS.
  - Métodos de pago (Efectivo contra entrega, Transferencia SIPAP, Tarjeta).
  - Generación de código único de reserva (ej: `AE-2026-0823-XXXX`).

- **Portal Corporativo B2B (`/corporativo`)**:
  - Propuesta de valor empresarial (facturación legal con RUC, cumplimiento IPS/MTESS, horarios nocturnos o tempranos).
  - Formulario de solicitud de propuesta técnica y comercial con guardado directo en backend.

- **Páginas Informativas y Legales**:
  - `/preguntas-frecuentes`: Acordeón interactivo con buscador por palabras clave.
  - `/terminos-y-condiciones`
  - `/privacidad`
  - `/politica-calidad`

---

### 2. Backend, Base de Datos y APIs RESTful
- **Base de Datos Relacional SQLite (`data/aquiestamos.db`)**:
  - Tablas para `users`, `bookings`, `corporate_leads`, `reviews`.
  - Capa de persistencia tipada y segura con `better-sqlite3`.
  - Semillero automático con datos iniciales de prueba y reseñas verificadas.
- **Rutas de API REST**:
  - `POST /api/bookings` & `GET /api/bookings`: Creación y consulta de reservas con recálculo seguro de precios.
  - `GET /api/bookings/[id]` & `PATCH /api/bookings/[id]`: Reprogramación, cancelación y asignación de personal.
  - `POST /api/corporate` & `GET /api/corporate` & `PATCH /api/corporate`: Gestión del embudo de ventas B2B.
  - `GET /api/admin/stats`: Métricas en tiempo real (ingresos en Gs., reservas confirmadas, leads).
  - `POST /api/reviews` & `GET /api/reviews`: Calificación de servicios y reseñas de clientes.
  - `POST /api/seed`: Reinicio y sembrado de datos demo.

---

### 3. Autenticación con Google y Apple ID (`/login`, `/register`)
- **Acceso con Google**: Integración OAuth 2.0 con Google Provider.
- **Acceso con Apple ID**: Integración Sign in with Apple OAuth.
- **Email & Contraseña**: Registro de clientes con hash bcrypt.
- **Modo Demo con 1 Clic**: Botones de acceso rápido para probar inmediatamente:
  - 👤 **Cliente Demo**: `cliente@ejemplo.com` / `clientepassword`
  - 🛡️ **Administrador**: `admin@aquiestamos.com` / `adminpassword2026`
  - 🔵 **Google Demo**: `usuario.google@aquiestamos.com`
  - ⚫ **Apple Demo**: `usuario.apple@icloud.com`

---

### 4. Portal del Cliente (`/portal`) y Panel de Administración (`/admin`)
- **Portal del Cliente**:
  - Visualización de próximas reservas con estado (Pendiente, Confirmada, En Curso).
  - Profesional asignado (con ID y verificación de antecedentes).
  - Cancelación directa (política de 24h sin costo).
  - Historial y modal para calificar servicios de 1 a 5 estrellas.
- **Panel Administrativo**:
  - Métricas de ingresos en Guaraníes, total de servicios y solicitudes pendientes.
  - Tabla de reservas con filtros por estado y buscador.
  - Modal para asignar limpiadores (`Carmen Benítez`, `María González`, etc.) y cambiar estados.
  - Gestión de leads corporativos y enlace directo a WhatsApp del cliente.

---

## 🛠️ Instrucciones de Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno** (opcional para producción):
   Copia `.env.example` a `.env.local` y agrega tus credenciales si deseas activar las API keys reales de Google o Apple:
   ```env
   GOOGLE_CLIENT_ID=tu_google_client_id
   GOOGLE_CLIENT_SECRET=tu_google_client_secret
   APPLE_ID=tu_apple_service_id
   APPLE_SECRET=tu_apple_secret
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   npm start
   ```

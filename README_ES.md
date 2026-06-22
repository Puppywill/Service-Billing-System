# Service Billing System

Idioma: [Espanol](README_ES.md) | [English](README.MD)

Service Billing System es una aplicacion web en proceso de migracion desde un proyecto de tickets Help Desk hacia un sistema para registrar servicios por hora, revisar registros operativos y preparar reportes de facturacion.

## Nota de Migracion

Este repositorio ha completado la Fase 4 de la migracion. La identidad del producto, el nuevo esquema SQL Server, la conexion a la base de datos y la API de Clientes estan disponibles, mientras varios modulos internos y pantallas frontend todavia usan la estructura original basada en tickets del sistema Help Desk.

Endpoints legacy como `/api/tickets` se mantienen temporalmente para no romper la aplicacion mientras se introducen de forma segura los nuevos modulos de Service Billing.

## Progreso Del Proyecto

- Fase 1: Identidad y documentacion ✅
- Fase 2: Base de datos ServiceBillingDB ✅
- Fase 3: Conexion a ServiceBillingDB ✅
- Fase 4: CRUD de Clientes ✅

## Capacidades Actuales

- Login con sesiones.
- Control de acceso por roles `Admin` y `User`.
- Administracion de usuarios.
- API CRUD de clientes con desactivacion logica.
- Flujo de solicitud de recuperacion de password.
- Notificaciones para actividad administrativa.
- Flujo actual de registros todavia basado internamente en el modulo legacy de tickets.
- Exportacion de reportes PDF y Excel.
- Interfaz web responsive para desktop, tablet y movil.

## Direccion Del Sistema

El sistema se esta convirtiendo hacia estas funcionalidades de Service Billing:

- Registros de servicio en lugar de tickets.
- Usuarios como usuarios y tecnicos.
- Catalogos de clientes y proyectos.
- Registro de servicios por hora con horarios de manana y tarde.
- Calculo automatico de total de horas.
- Reportes por tecnico, cliente, proyecto y rango de fechas.
- Preparacion de facturas desde registros facturables.
- Resumen de horas, clientes, proyectos y facturacion.

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- SQL Server
- mssql
- ExcelJS
- PDFKit

## Estructura Del Proyecto

- `index.html`: estructura principal de la aplicacion, login, tabs, tablas, formularios y modales.
- `style.css`: tema oscuro responsive, tarjetas, tablas, formularios, botones y estados visuales.
- `app.js`: logica del frontend, llamadas API, traducciones, filtros, UI por roles y renderizado dinamico.
- `server.js`: backend Express con conexion SQL Server, autenticacion, registros legacy de tickets, usuarios, notificaciones, recuperacion de password y API de reportes.
- `service-billing-schema.sql`: crea `ServiceBillingDB`, sus tablas, relaciones, indices y datos demo.
- `seed.js`: crea usuarios demo y registros legacy de tickets.
- `seed-demo-data.js`: crea datos demo adicionales para la estructura legacy actual.
- `audit-migration.sql`: script legacy de migracion de auditoria.

## Como Correr El Proyecto

1. Instalar dependencias:

```bash
npm install
```

2. Correr seed data si tu base local de SQL Server ya tiene el esquema legacy esperado:

```bash
npm run seed
```

3. Iniciar el servidor:

```bash
npm start
```

4. Abrir la aplicacion:

```text
http://localhost:3000
```

## Cuentas Demo

Administrador de Service Billing:

```text
Email: william@servicebilling.local
Password: Admin123!
```

Tecnico de Service Billing:

```text
Email: carlos@servicebilling.local
Password: Tech123!
```

Las cuentas demo adicionales estan definidas en `service-billing-schema.sql`.

## Estado Actual De Base De Datos

Configuracion actual del backend:

- Server: `localhost`
- Database: `ServiceBillingDB` por defecto
- Variable de entorno opcional: `DB_NAME`
- Authentication: Windows Authentication

Tablas actuales usadas por la aplicacion:

- `Users`
- `Notifications`
- `PasswordResetRequests`
- `Clients`
- `Projects`
- `ServiceRecords`
- `Invoices`
- `InvoiceLines`
- `AppSettings`

Las tablas y endpoints legacy no se eliminan durante la migracion.

## Estado Actual De API

La API existente se mantiene disponible y en la Fase 4 se agrego la API de Clientes.

Clientes:

- `GET /api/clients`: devuelve clientes activos; permite `?search=` o `?q=`.
- `GET /api/clients/:id`: devuelve un cliente activo.
- `POST /api/clients`: crea un cliente.
- `PUT /api/clients/:id`: actualiza un cliente.
- `DELETE /api/clients/:id`: establece `IsActive = 0` sin borrar fisicamente la fila.

Registros legacy:

- `GET /api/tickets`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PUT /api/tickets/:id/close`
- `DELETE /api/tickets/:id`

Usuarios:

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Autenticacion y recuperacion:

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `POST /api/forgot-password`
- `GET /api/password-resets`
- `PUT /api/password-resets/:id/resolve`

Reportes:

- `GET /api/reports/tickets`
- `GET /api/reports/tickets/pdf`
- `GET /api/reports/tickets/excel`

## Fase 4: CRUD De Clientes

### Permisos

- Usuarios autenticados con rol `Admin`, `Technician` y personal actual pueden listar y consultar clientes.
- Solo usuarios `Admin` pueden crear, editar o desactivar clientes.
- La desactivacion es logica: la API establece `IsActive` en `0`.

### Tabla Clients

La tabla `dbo.Clients` incluye:

- `ClientID`: llave primaria identity.
- `ClientName`: nombre requerido y unico.
- `ContactName`: contacto principal.
- `Email`: correo del contacto.
- `Phone`: telefono del contacto.
- `BillingName`: nombre legal o de facturacion.
- `TaxID`: identificador contributivo.
- `AddressLine1`, `AddressLine2`, `City`, `StateProvince`, `PostalCode`, `Country`: datos de direccion. La API actual expone `AddressLine1` como `Address`.
- `IsActive`: controla si el cliente esta activo o desactivado.
- `CreatedAt`, `UpdatedAt`: fechas de auditoria.
- `CreatedByUserID`: llave foranea hacia `dbo.Users`.

### Ejemplos De API

Primero inicia sesion para que el cliente HTTP guarde la cookie de sesion:

```http
POST /api/login
Content-Type: application/json

{
  "email": "william@servicebilling.local",
  "password": "Admin123!"
}
```

Listar o buscar clientes activos:

```http
GET /api/clients
GET /api/clients?search=acme
GET /api/clients/1
```

Crear un cliente:

```http
POST /api/clients
Content-Type: application/json

{
  "ClientName": "Empresa Ejemplo",
  "ContactName": "Ana Perez",
  "Email": "ana@ejemplo.com",
  "Phone": "787-555-1000",
  "Address": "100 Main Street",
  "BillingName": "Empresa Ejemplo LLC",
  "TaxID": "66-1234567",
  "IsActive": true
}
```

Editar o desactivar un cliente:

```http
PUT /api/clients/1
DELETE /api/clients/1
```

## Autor

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

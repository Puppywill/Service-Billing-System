# Service Billing System

Idioma: [Espanol](README_ES.md) | [English](README.MD)

Service Billing System es una aplicacion web en proceso de migracion desde un proyecto de tickets Help Desk hacia un sistema para registrar servicios por hora, revisar registros operativos y preparar reportes de facturacion.

## Nota de Migracion

Este repositorio esta actualmente en la Fase 1 de la migracion. La identidad visible del producto ya fue actualizada a Service Billing System, pero varios modulos internos, tablas de base de datos, endpoints API, scripts seed y exportaciones todavia usan la estructura original basada en tickets del sistema Help Desk.

En esta fase no se hicieron cambios a la base de datos. Endpoints como `/api/tickets` y tablas como `Tickets` se mantienen temporalmente para no romper la aplicacion mientras se introduce de forma segura el nuevo modelo de registro de servicios y facturacion.

## Capacidades Actuales

- Login con sesiones.
- Control de acceso por roles `Admin` y `User`.
- Administracion de usuarios.
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

Admin:

```text
Email: admin@helpdesk.local
Password: Admin123!
```

User:

```text
Email: user@helpdesk.local
Password: User123!
```

Estas cuentas todavia usan los valores demo heredados de Help Desk durante la Fase 1.

## Estado Actual De Base De Datos

La configuracion del backend no cambia en la Fase 1:

- Server: `localhost`
- Database: `HelpDeskDB`
- Authentication: Windows Authentication

Tablas actuales usadas por la aplicacion:

- `Tickets`
- `Users`
- `Notifications`
- `PasswordResetRequests`

Tablas planificadas para fases futuras:

- `Clients`
- `Projects`
- `ServiceRecords`
- `Invoices`
- `InvoiceLines`

## Estado Actual De API

La API se mantiene sin cambios en la Fase 1.

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

## Alcance De Fase 1

Alcance completado para esta fase:

- Nombre del paquete cambiado a Service Billing System.
- Identidad visible de la aplicacion actualizada.
- Documentacion actualizada para explicar la migracion.
- Sin cambios de esquema de base de datos.
- Sin cambios de endpoints.
- Sin eliminar modulos.
- Sin cambios a la logica de login, usuarios, reportes ni modulo legacy de tickets.

## Autor

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

# Service Billing System

Idioma: [Espanol](README_ES.md) | [English](README.MD)

Service Billing System es una aplicacion web en proceso de migracion desde un proyecto de tickets Help Desk hacia un sistema para registrar servicios por hora, revisar registros operativos y preparar reportes de facturacion.

## Nota de Migracion

Este repositorio ha completado la Fase 9 de la migracion. La identidad del producto, el esquema SQL Server, la conexion a la base de datos y las API de Clientes, Proyectos, Registros de Servicio, Facturas, Reportes y Dashboard estan disponibles, mientras las pantallas frontend todavia usan la estructura original basada en tickets del sistema Help Desk.

Endpoints legacy como `/api/tickets` se mantienen temporalmente para no romper la aplicacion mientras se introducen de forma segura los nuevos modulos de Service Billing.

## Progreso Del Proyecto

- Fase 1: Identidad y documentacion ✅
- Fase 2: Base de datos ServiceBillingDB ✅
- Fase 3: Conexion a ServiceBillingDB ✅
- Fase 4: CRUD de Clientes ✅
- Fase 5: CRUD de Proyectos ✅
- Fase 6: CRUD de Registros de Servicio ✅
- Fase 7: CRUD de Facturas y generacion desde registros ✅
- Fase 8: Reportes de horas y facturacion ✅
- Fase 9: Dashboard API ✅

## Capacidades Actuales

- Login con sesiones.
- Control de acceso por roles `Admin` y `User`.
- Administracion de usuarios.
- API CRUD de clientes con desactivacion logica.
- API CRUD de proyectos relacionados con clientes.
- API CRUD de registros de servicio con calculo automatico de horas.
- API CRUD de facturas con lineas de factura y generacion desde registros facturables.
- API de reportes de horas de servicio y facturacion con resumenes y filtros.
- API de dashboard con resumen, graficas y actividad reciente.
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

Proyectos:

- `GET /api/projects`: devuelve proyectos activos; permite busqueda y filtro por cliente.
- `GET /api/projects/:id`: devuelve un proyecto activo.
- `POST /api/projects`: crea un proyecto para un cliente activo.
- `PUT /api/projects/:id`: actualiza un proyecto.
- `DELETE /api/projects/:id`: establece `IsActive = 0` sin borrar fisicamente la fila.

Registros de servicio:

- `GET /api/service-records`: devuelve registros con busqueda y filtros opcionales.
- `GET /api/service-records/:id`: devuelve un registro.
- `POST /api/service-records`: crea un registro y calcula `TotalHours`.
- `PUT /api/service-records/:id`: actualiza un registro y recalcula `TotalHours`.
- `DELETE /api/service-records/:id`: cambia el estado a `Canceled` sin borrar la fila.

Facturas:

- `GET /api/invoices`: devuelve facturas con busqueda y filtros opcionales.
- `GET /api/invoices/:id`: devuelve una factura con sus lineas.
- `POST /api/invoices`: crea un encabezado de factura manual.
- `PUT /api/invoices/:id`: actualiza el encabezado de factura y recalcula totales desde sus lineas.
- `DELETE /api/invoices/:id`: cancela la factura sin borrar fisicamente la fila.
- `POST /api/invoices/generate`: genera una factura desde registros de servicio en estado `Recorded`.

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

- `GET /api/reports/service-hours`
- `GET /api/reports/service-hours/summary`
- `GET /api/reports/invoices`
- `GET /api/reports/invoices/summary`
- `GET /api/reports/tickets`
- `GET /api/reports/tickets/pdf`
- `GET /api/reports/tickets/excel`

Dashboard:

- `GET /api/dashboard/summary`
- `GET /api/dashboard/charts`
- `GET /api/dashboard/recent-activity`

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

## Fase 5: CRUD De Proyectos

Los proyectos pertenecen a clientes mediante `Projects.ClientID`, que referencia `Clients.ClientID`. Cada operacion de creacion o edicion valida que el cliente seleccionado exista y este activo.

### Permisos

- Usuarios autenticados con rol `Admin`, `Technician` y personal actual pueden listar y consultar proyectos.
- Solo usuarios `Admin` pueden crear, editar o desactivar proyectos.
- La desactivacion es logica mediante `IsActive = 0`.

### Filtros Disponibles

- Busqueda por `ProjectName`, `ClientName` o `Description` usando `?search=` o `?q=`.
- Filtro por cliente usando `?clientId=` o `?ClientID=`.
- Las respuestas GET incluyen `ClientName`.

### Ejemplos De API

```http
GET /api/projects
GET /api/projects?search=migracion
GET /api/projects?clientId=1
GET /api/projects/1
```

```http
POST /api/projects
Content-Type: application/json

{
  "ClientID": 1,
  "ProjectName": "Soporte Mensual",
  "Description": "Soporte y mantenimiento recurrente",
  "HourlyRate": 95.50,
  "IsActive": true
}
```

```http
PUT /api/projects/1
DELETE /api/projects/1
```

`HourlyRate` permite decimales y no puede ser negativo.

## Fase 6: CRUD De Registros De Servicio

Cada registro relaciona un tecnico, cliente y proyecto activos mediante `TechnicianUserID`, `ClientID` y `ProjectID`. El proyecto debe estar activo y pertenecer al cliente seleccionado.

### Calculo De TotalHours

La API calcula `TotalHours`; el cliente no envia el valor final. Se suman los intervalos validos de manana y tarde:

```text
(MorningEnd - MorningStart) + (AfternoonEnd - AfternoonStart)
```

Las horas aceptan formato `HH:mm` o `HH:mm:ss`. Cada intervalo requiere entrada y salida, y la salida debe ser posterior a la entrada.

### Filtros Disponibles

- Busqueda por descripcion del servicio, tecnico, cliente y proyecto.
- `TechnicianUserID`
- `ClientID`
- `ProjectID`
- `ServiceDate` en formato `YYYY-MM-DD`
- `Status`: `Recorded`, `Billed` o `Canceled`

Las respuestas GET incluyen `TechnicianName`, `ClientName` y `ProjectName`.

### Permisos Por Rol

- `Admin`: puede crear, consultar, editar y cancelar registros.
- `Technician`: puede consultar y crear registros bajo su propio `TechnicianUserID`.
- Solo `Admin` puede cancelar un registro.
- La cancelacion establece `Status = 'Canceled'`; no borra fisicamente los datos.

### Ejemplos De API

```http
GET /api/service-records
GET /api/service-records?search=mantenimiento
GET /api/service-records?ClientID=1&Status=Recorded
GET /api/service-records?TechnicianUserID=3&ServiceDate=2026-06-22
GET /api/service-records/1
```

```http
POST /api/service-records
Content-Type: application/json

{
  "TechnicianUserID": 3,
  "ClientID": 1,
  "ProjectID": 1,
  "ServiceDate": "2026-06-22",
  "MorningStart": "08:30",
  "MorningEnd": "12:00",
  "AfternoonStart": "13:00",
  "AfternoonEnd": "16:30",
  "ServiceDescription": "Mantenimiento y soporte tecnico",
  "Status": "Recorded"
}
```

El ejemplo produce `TotalHours: 7.00`.

```http
PUT /api/service-records/1
DELETE /api/service-records/1
```

## Fase 7: CRUD De Facturas

Las facturas usan la tabla `dbo.Invoices` para los encabezados y `dbo.InvoiceLines` para los detalles. Las lineas generadas se relacionan nuevamente con `ServiceRecords` mediante `ServiceRecordID`, conservando trazabilidad entre el trabajo registrado y la facturacion.

### Generacion De Facturas

`POST /api/invoices/generate` crea una factura desde registros de servicio facturables:

- Selecciona registros por `ClientID`, `PeriodFrom` y `PeriodTo`.
- Incluye solo registros con `Status = 'Recorded'`.
- Excluye registros cancelados y registros que ya tengan `InvoiceID`.
- Crea un encabezado en `Invoices`.
- Crea una linea por cada registro de servicio en `InvoiceLines`.
- Calcula `Subtotal`, `TaxAmount` y `TotalAmount`.
- Actualiza los `ServiceRecords` incluidos de `Recorded` a `Billed`.
- Guarda el `InvoiceID` generado en cada registro facturado.

### Estados De Factura

Los estados permitidos de factura son:

- `Draft`
- `Issued`
- `Paid`
- `Canceled`

Cancelar una factura establece `Status = 'Canceled'` e `IsActive = 0`; no borra fisicamente los datos de facturacion.

### Permisos

- `Admin`: puede crear, consultar, editar, cancelar y generar facturas.
- `Technician`: puede consultar facturas.
- La generacion de facturas esta restringida a `Admin`.

### Ejemplos De API

```http
GET /api/invoices
GET /api/invoices?ClientID=1&Status=Issued
GET /api/invoices?periodFrom=2026-06-01&periodTo=2026-06-30
GET /api/invoices/1
```

Generar una factura desde registros de servicio:

```http
POST /api/invoices/generate
Content-Type: application/json

{
  "ClientID": 1,
  "PeriodFrom": "2026-06-01",
  "PeriodTo": "2026-06-30",
  "TaxRate": 0.18,
  "Notes": "Factura generada desde registros de servicio"
}
```

Crear un encabezado de factura manual:

```http
POST /api/invoices
Content-Type: application/json

{
  "InvoiceNumber": "INV-2026-00099",
  "ClientID": 1,
  "InvoiceDate": "2026-06-30",
  "PeriodFrom": "2026-06-01",
  "PeriodTo": "2026-06-30",
  "TaxRate": 0.18,
  "Status": "Draft",
  "Notes": "Encabezado de factura manual"
}
```

Editar o cancelar una factura:

```http
PUT /api/invoices/1
DELETE /api/invoices/1
```

## Fase 8: Reportes

La Fase 8 agrega endpoints backend para reportes de horas de servicio y facturacion. Estos reportes usan las tablas actuales de Service Billing: `Users`, `Clients`, `Projects`, `ServiceRecords`, `Invoices` e `InvoiceLines`.

### Reporte De Horas De Servicio

`GET /api/reports/service-hours` devuelve registros de servicio con:

- `ServiceRecordID`
- `TechnicianName`
- `ClientName`
- `ProjectName`
- `ServiceDate`
- `MorningStart`, `MorningEnd`
- `AfternoonStart`, `AfternoonEnd`
- `TotalHours`
- `ServiceDescription`
- `Status`

Filtros disponibles:

- `from`
- `to`
- `technicianUserId`
- `clientId`
- `projectId`
- `status`: `Recorded`, `Billed` o `Canceled`

### Resumen De Horas

`GET /api/reports/service-hours/summary` devuelve:

- `TotalRecords`
- `TotalHours`
- `BilledHours`
- `UnbilledHours`
- `CanceledHours`
- `HoursByTechnician`
- `HoursByClient`
- `HoursByProject`

### Reporte De Facturas

`GET /api/reports/invoices` devuelve facturas con:

- `InvoiceID`
- `InvoiceNumber`
- `ClientName`
- `InvoiceDate`
- `PeriodFrom`
- `PeriodTo`
- `Subtotal`
- `TaxAmount`
- `TotalAmount`
- `Status`

Filtros disponibles:

- `from`
- `to`
- `clientId`
- `status`: `Draft`, `Issued`, `Paid` o `Canceled`

### Resumen De Facturacion

`GET /api/reports/invoices/summary` devuelve:

- `TotalInvoices`
- `DraftInvoices`
- `IssuedInvoices`
- `PaidInvoices`
- `CanceledInvoices`
- `TotalSubtotal`
- `TotalTax`
- `TotalAmount`
- `AmountByClient`
- `AmountByStatus`

### Permisos

- `Admin`: puede ver todos los reportes de horas y facturas.
- `Technician`: solo puede ver sus propios registros de servicio.
- `Technician`: solo puede ver facturas relacionadas con sus registros mediante `InvoiceLines`.

### Ejemplos De API

```http
GET /api/reports/service-hours
GET /api/reports/service-hours?from=2026-06-01&to=2026-06-30
GET /api/reports/service-hours?technicianUserId=3&status=Billed
GET /api/reports/service-hours?clientId=1&projectId=1
GET /api/reports/service-hours/summary
GET /api/reports/service-hours/summary?from=2026-06-01&to=2026-06-30&clientId=1
```

```http
GET /api/reports/invoices
GET /api/reports/invoices?from=2026-06-01&to=2026-06-30
GET /api/reports/invoices?clientId=1&status=Issued
GET /api/reports/invoices/summary
GET /api/reports/invoices/summary?from=2026-06-01&to=2026-06-30
```

## Fase 9: Dashboard API

La Fase 9 agrega endpoints backend para alimentar un dashboard moderno del Service Billing System. Estos endpoints estan pensados para tarjetas de resumen, graficas y paneles de actividad reciente sin modificar todavia el frontend.

### Dashboard Summary

`GET /api/dashboard/summary` devuelve:

- `TotalClients`
- `TotalProjects`
- `TotalServiceRecords`
- `TotalInvoices`
- `TotalHours`
- `UnbilledHours`
- `BilledHours`
- `TotalBilledAmount`
- `PendingInvoiceAmount`
- `PaidAmount`

### Dashboard Charts

`GET /api/dashboard/charts` devuelve:

- `HoursByMonth`
- `BillingByMonth`
- `HoursByClient`
- `HoursByProject`
- `HoursByTechnician`
- `InvoicesByStatus`

### Recent Activity

`GET /api/dashboard/recent-activity` devuelve los ultimos:

- `ServiceRecords`
- `Invoices`
- `Clients`
- `Projects`

### Permisos

- `Admin`: puede ver todos los datos del dashboard.
- `Technician`: solo puede ver sus propios registros de servicio y datos relacionados con esos registros.
- Los datos de facturas para `Technician` se limitan mediante `InvoiceLines` relacionados con sus `ServiceRecords`.

### Ejemplos De API

```http
GET /api/dashboard/summary
GET /api/dashboard/charts
GET /api/dashboard/recent-activity
```

Probar como administrador:

```http
POST /api/login
Content-Type: application/json

{
  "email": "william@servicebilling.local",
  "password": "Admin123!"
}
```

Probar como tecnico:

```http
POST /api/login
Content-Type: application/json

{
  "email": "carlos@servicebilling.local",
  "password": "Tech123!"
}
```

## Autor

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

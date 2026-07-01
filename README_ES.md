# Service Billing System

Idioma: [Espanol](README_ES.md) | [English](README.MD)

Service Billing System es una aplicacion web en proceso de migracion desde un proyecto de tickets Help Desk hacia un sistema para registrar servicios por hora, revisar registros operativos y preparar reportes de facturacion.

## Nota de Migracion

Este repositorio ha completado la Fase 15 de la migracion. La identidad del producto, el esquema SQL Server, las APIs backend, la API de dashboard, la base inicial del frontend y las pantallas Dashboard, Clients, Projects, Service Records e Invoices conectadas al backend real estan disponibles mientras los modulos legacy se mantienen para una migracion segura.

Endpoints legacy como `/api/tickets` se mantienen temporalmente para no romper la aplicacion mientras se introducen de forma segura los nuevos modulos de Service Billing.

## Nota De Presentacion

Para la demo local actual, los valores monetarios estan ocultos intencionalmente en la interfaz. Tarifas, impuestos, subtotales, totales, montos facturados, montos pendientes, montos pagados y simbolos de moneda se conservan en la base de datos y en las APIs backend, pero no se muestran en Dashboard, Projects, Invoices, lineas de factura, Reports ni Settings.

Invoices tambien queda oculto de la navegacion visible del frontend para la demo actual, de forma que el flujo se concentre en clientes, proyectos, registros de servicio y reportes de horas trabajadas. Las APIs backend y tablas SQL de facturas se mantienen intactas.

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
- Fase 10: Frontend Foundation ✅
- Fase 11: Clients Frontend ✅
- Fase 12: Projects Frontend ✅
- Fase 13: Service Records Frontend ✅
- Fase 14: Invoices Frontend ✅
- Fase 15: Dashboard Frontend ✅
- Fase 17A: Migracion SQL de contratos por proyecto ✅
- Fase 17B: Backend de contratos por proyecto ✅
- Fase 17C: Frontend de contratos en Projects ✅

Proxima fase: Fase 17D - Advertencias contractuales en Service Records

## Estado Actual Del Proyecto

- ✅ ServiceBillingDB
- ✅ Authentication
- ✅ Users
- ✅ Clients
- ✅ Projects
- ✅ Service Records
- ✅ Invoices
- ✅ Reports API
- ✅ Dashboard API
- ✅ Dashboard Frontend
- ✅ Clients Frontend
- ✅ Projects Frontend
- ✅ Service Records Frontend
- ✅ Invoices Frontend

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
- Frontend Foundation con branding Service Billing, nueva navegacion y pantallas iniciales.
- Clients Frontend conectado al backend real con busqueda, crear, editar y desactivacion logica.
- Projects Frontend conectado al backend real con busqueda, filtro por cliente, crear, editar y desactivacion logica.
- Projects Frontend ahora muestra resumen contractual, informacion contractual editable para Admin y alertas visuales de contrato.
- Service Records Frontend conectado al backend real con busqueda, filtros, modal de crear/editar, cancelacion logica, vista previa automatica de horas y acciones segun rol.
- La implementacion frontend de Invoices permanece en el codigo, pero queda oculta de la navegacion visible para la demo actual.
- Dashboard Frontend conectado al backend real con tarjetas y secciones enfocadas en servicios, actividad reciente, manejo de errores de API y datos limitados por rol.
- Reports Frontend ahora usa reportes de horas de servicio en lugar de reportes legacy de tickets.
- Flujo de solicitud de recuperacion de password.
- Notificaciones para actividad administrativa.
- Flujo actual de registros todavia basado internamente en el modulo legacy de tickets.
- Los controles de exportacion quedan limitados a botones deshabilitados `PDF (Proximamente)` y `Excel (Proximamente)` para la demo.
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

## Fase 10: Frontend Foundation

La Fase 10 inicia la transicion visual desde la interfaz Help Desk hacia el frontend de Service Billing System. En esta fase no se agregaron nuevas conexiones frontend a APIs; el trabajo se enfoca en estructura, branding y navegacion segura.

### Frontend Foundation Completada

- Branding visible actualizado a `Service Billing System`.
- Nueva estructura de navegacion principal.
- Login y autenticacion existentes conservados.
- Dashboard existente mantenido por ahora.
- Modulos legacy conservados internamente sin borrar codigo viejo.
- Pantallas frontend iniciales agregadas para futuros modulos de Service Billing.
- Comportamiento responsive mantenido para desktop, tablet y movil.

### Navegacion

La navegacion principal ahora incluye:

- `Dashboard`
- `Clients`
- `Projects`
- `Service Records`
- `Invoices`
- `Reports`
- `Users`
- `Settings`

### Pantallas Iniciales

- `Clients`: area inicial para catalogo y administracion de clientes.
- `Projects`: area inicial para proyectos de clientes y tarifas por hora.
- `Service Records`: flujo actual legacy, renombrado visualmente para Service Billing.
- `Invoices`: area inicial para listas de facturas, lineas y generacion.
- `Reports`: area de reportes conservada para flujos de facturacion y analitica.
- `Users`: administracion de usuarios existente.
- `Settings`: area inicial para cuenta, notificaciones y valores por defecto de facturacion.

## Fase 11: Clients Frontend

La Fase 11 conecta la pantalla `Clients` al backend real. La pantalla ahora carga clientes reales y permite administracion por rol, sin tocar Projects, Service Records, Invoices ni la logica legacy de tickets.

### Clients Frontend Completado

- Carga la lista de clientes con `GET /api/clients`.
- Agrega busqueda de clientes usando el query de busqueda del backend.
- Agrega boton `Add Client` para administradores.
- Agrega modal para crear cliente.
- Agrega modal para editar cliente.
- Soporta desactivacion logica con `DELETE /api/clients/:id`.
- Muestra `ClientName`, `ContactName`, `Email`, `Phone`, `BillingName`, `TaxID` e `IsActive`.
- Usa la sesion actual para controlar acciones por rol.
- Mantiene diseno responsive en la pantalla Clients.

### Validaciones

- `ClientName` es requerido.
- `Email` es opcional y se muestra limpio en el formulario.
- La desactivacion pide confirmacion antes de llamar la API.
- Se muestran mensajes de exito y error en la pantalla Clients o en el modal.

### Permisos Por Rol

- `Admin`: puede crear, editar y desactivar clientes.
- `Technician` / staff: solo lectura en la lista de clientes.

### Uso De API

El frontend usa:

```http
GET /api/clients
GET /api/clients?search=acme
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id
```

### Flujo De Prueba

1. Iniciar sesion como administrador.
2. Abrir `Clients`.
3. Buscar un cliente existente.
4. Crear un cliente nuevo con `ClientName`.
5. Editar contacto, facturacion, telefono, email o tax ID.
6. Desactivar un cliente y confirmar el mensaje.
7. Iniciar sesion como tecnico y verificar que la lista sea solo lectura.

## Fase 12: Projects Frontend

La Fase 12 conecta la pantalla `Projects` al backend real. La pantalla ahora carga proyectos reales, permite busqueda y filtro por cliente, y mantiene acciones de administracion segun el rol de la sesion actual.

### Projects Frontend Completado

- Carga la lista de proyectos con `GET /api/projects`.
- Permite busqueda por nombre de proyecto, cliente o descripcion.
- Agrega filtro por cliente.
- Carga clientes activos desde `GET /api/clients` para el filtro y el dropdown del formulario.
- Agrega boton `Add Project` para administradores.
- Agrega modal para crear proyecto.
- Agrega modal para editar proyecto.
- Soporta desactivacion logica con `DELETE /api/projects/:id`.
- Muestra `ProjectName`, `ClientName`, `Description` e `IsActive`.
- Mantiene valores internos de tarifa disponibles para compatibilidad con la API, pero los oculta en la UI para la demo actual.
- Usa la sesion actual para controlar acciones por rol.
- Mantiene diseno responsive y consistente con la pantalla Clients.

### Validaciones

- `ClientID` es requerido.
- `ProjectName` es requerido.
- Los valores internos del proyecto siguen validados para compatibilidad con la API.
- La desactivacion pide confirmacion antes de llamar la API.
- Se muestran mensajes de exito y error en la pantalla Projects o en el modal.

### Permisos Por Rol

- `Admin`: puede crear, editar y desactivar proyectos.
- `Technician` / staff: solo lectura en la lista de proyectos.

### Uso De API

El frontend usa:

```http
GET /api/projects
GET /api/projects?search=support
GET /api/projects?clientId=1
GET /api/clients
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id
```

### Flujo De Prueba

1. Iniciar sesion como administrador.
2. Abrir `Projects`.
3. Buscar por proyecto, cliente o descripcion.
4. Filtrar por cliente.
5. Crear un proyecto seleccionando `ClientID` y entrando `ProjectName`.
6. Editar cliente, nombre, descripcion o estado activo del proyecto.
7. Desactivar un proyecto y confirmar el mensaje.
8. Iniciar sesion como tecnico y verificar que la lista sea solo lectura.

## Fase 13: Service Records Frontend

La Fase 13 conecta la pantalla `Service Records` al backend real. La pantalla ahora carga registros de servicio reales, permite busqueda y filtros operacionales, y ofrece flujos de creacion, edicion y cancelacion logica segun el rol de la sesion actual.

### Service Records Frontend Completado

- Carga la lista de registros con `GET /api/service-records`.
- Permite busqueda por tecnico, cliente, proyecto o descripcion del servicio.
- Agrega filtros por tecnico, cliente, proyecto, fecha de servicio y estado.
- Agrega boton `Add Service Record` para los roles permitidos.
- Agrega modal para crear registros de servicio.
- Agrega modal para editar registros de servicio.
- Soporta cancelacion logica con `DELETE /api/service-records/:id`.
- Muestra `TechnicianName`, `ClientName`, `ProjectName`, `ServiceDate`, `MorningStart`, `MorningEnd`, `AfternoonStart`, `AfternoonEnd`, `TotalHours`, `ServiceDescription` y `Status`.
- Calcula automaticamente una vista previa de `TotalHours` usando los rangos de horas ingresados antes de guardar.
- Carga tecnicos dinamicamente desde usuarios, clientes desde `GET /api/clients` y proyectos desde `GET /api/projects`.
- Filtra el dropdown de proyectos segun el cliente seleccionado.
- Valida campos requeridos y rangos de horarios antes de enviar la solicitud.
- Usa la sesion actual para controlar las acciones disponibles por rol.
- Mantiene diseno responsive y consistente con Clients y Projects.

### Filtros De Service Records

`GET /api/service-records` puede llamarse desde el frontend con:

- `search`
- `technicianUserId`
- `clientId`
- `projectId`
- `serviceDate`
- `status`

Ejemplo:

```http
GET /api/service-records?clientId=1&status=Recorded
```

### Permisos Por Rol

- `Admin`: puede crear, editar y cancelar registros de servicio.
- `Technician`: puede crear y visualizar registros de servicio.
- La UI usa la sesion activa para mostrar u ocultar acciones y mantener el flujo del tecnico asociado al usuario autenticado cuando aplica.

### Flujo De Prueba

1. Iniciar sesion como administrador.
2. Abrir `Service Records`.
3. Confirmar que la tabla carga registros desde `GET /api/service-records`.
4. Usar busqueda y filtros por tecnico, cliente, proyecto, fecha y estado.
5. Hacer clic en `Add Service Record`, completar el modal y verificar que `TotalHours` se actualiza segun los horarios.
6. Guardar el registro y confirmar que aparece en la lista.
7. Editar el registro como administrador.
8. Cancelar el registro y confirmar el mensaje.
9. Iniciar sesion como tecnico y verificar que la pantalla permite crear y visualizar sin acciones exclusivas de Admin.

## Fase 14: Invoices Frontend

La Fase 14 conecta la pantalla `Invoices` al backend real. La pantalla ahora carga facturas reales, permite filtros de facturacion, genera facturas desde horas de servicio registradas y ofrece flujos de detalle, estado y cancelacion segun el rol de la sesion actual.

### Invoices Frontend Completado

- Carga la lista de facturas con `GET /api/invoices`.
- Permite busqueda por numero de factura, cliente o notas.
- Agrega filtros por cliente, estado y rango de fechas.
- Agrega `Generate Invoice` para administradores.
- Genera facturas con `POST /api/invoices/generate`.
- Agrega modal para generar facturas desde `ServiceRecords`.
- Usa `ClientID`, `PeriodFrom`, `PeriodTo` y `Notes` en el flujo visible de generacion.
- Mantiene valores internos de impuesto disponibles para compatibilidad con la API, pero los oculta en la UI para la demo actual.
- Agrega vista de detalle de factura.
- Muestra `InvoiceLines` desde `GET /api/invoices/:id`.
- Permite editar estado de factura para administradores.
- Soporta cancelacion logica con `DELETE /api/invoices/:id`.
- Carga clientes dinamicamente para filtros y el modal de generacion.
- Muestra `InvoiceNumber`, `ClientName`, `InvoiceDate`, `PeriodFrom`, `PeriodTo` y `Status`.
- Muestra `InvoiceLines` sin columnas monetarias.
- Usa la sesion actual para controlar acciones disponibles por rol.
- Mantiene diseno responsive y consistente con los modulos conectados.

### Filtros De Invoices

`GET /api/invoices` puede llamarse desde el frontend con:

- `search`
- `clientId`
- `periodFrom`
- `periodTo`
- `status`

Ejemplo:

```http
GET /api/invoices?clientId=1&status=Issued&periodFrom=2026-06-01&periodTo=2026-06-30
```

### Ejemplo Para Generar Factura

```http
POST /api/invoices/generate
Content-Type: application/json

{
  "ClientID": 1,
  "PeriodFrom": "2026-06-01",
  "PeriodTo": "2026-06-30",
  "Notes": "Facturacion de servicios de junio"
}
```

### Permisos Por Rol

- `Admin`: puede generar, editar estado y cancelar facturas.
- `Technician` / `Staff`: acceso de solo lectura a facturas.
- La UI usa la sesion activa para mostrar u ocultar acciones de generacion, estado y cancelacion.

### Flujo De Prueba

1. Iniciar sesion como administrador.
2. Abrir `Invoices`.
3. Confirmar que la tabla carga facturas desde `GET /api/invoices`.
4. Usar busqueda y filtros por cliente, estado y rango de fechas.
5. Hacer clic en `Generate Invoice`, seleccionar un cliente y un periodo con registros `Recorded`, y guardar.
6. Abrir el detalle de la factura y confirmar que se muestran las `InvoiceLines`.
7. Editar el estado de la factura como administrador.
8. Cancelar una factura y confirmar el mensaje.
9. Iniciar sesion como tecnico y verificar que la pantalla de facturas sea solo lectura.

## Fase 15: Dashboard Frontend

La Fase 15 conecta la pantalla `Dashboard` a las APIs reales del dashboard. El dashboard ahora muestra metricas del negocio, secciones visuales y actividad reciente desde los modulos de Service Billing.

Ajuste de demo: las tarjetas, graficas y actividad reciente especificas de facturas quedan ocultas del frontend visible por ahora. El Dashboard permanece enfocado en clientes, proyectos, registros de servicio y horas.

### Dashboard Frontend Completado

- Conecta el Dashboard frontend con `GET /api/dashboard/summary`.
- Conecta las secciones visuales con `GET /api/dashboard/charts`.
- Conecta la actividad reciente con `GET /api/dashboard/recent-activity`.
- Usa la sesion activa para cargar el alcance correcto del dashboard.
- Muestra dashboard completo para `Admin`.
- Muestra dashboard limitado para `Technician` segun permisos del backend.
- Maneja errores de API con un mensaje visible en el dashboard.
- Mantiene diseno responsive enfocado en Clients, Projects, Service Records y horas de servicio.

### Tarjetas De Resumen

El dashboard muestra:

- `TotalClients`
- `TotalProjects`
- `TotalServiceRecords`
- `TotalHours`
- `CurrentMonthHours`
- `UnbilledHours` mostrado como horas pendientes.
- `BilledHours` mostrado como horas procesadas.
- Los valores de facturas y montos monetarios estan ocultos en la UI para la demo actual.
- Las tarjetas de horas del mes actual, horas pendientes, horas procesadas, proyectos y registros de servicio abren un panel de detalle relacionado.

### Secciones Visuales

El dashboard incluye secciones visuales ligeras sin agregar librerias nuevas:

- `HoursByMonth`
- `HoursByClient`
- `HoursByProject`
- `HoursByTechnician`

### Actividad Reciente

El dashboard muestra actividad reciente de:

- `ServiceRecords`
- `Clients`
- `Projects`

### Detalles Interactivos Del Dashboard

- `Horas del mes actual`: muestra registros de servicio del mes actual.
- `Horas pendientes`: muestra registros `Recorded`.
- `Horas procesadas`: muestra registros `Billed`.
- `Proyectos`: muestra resumen de proyectos con horas y estado contractual.
- `Registros de servicio`: muestra los registros de servicio mas recientes.

### Project Dashboard

El Dashboard incluye un panel interno `Project Dashboard` para revision de demo:

- Permite buscar proyectos por `ProjectName` o `ClientName`.
- Permite seleccionar un proyecto desde un dropdown filtrado.
- Muestra detalles del proyecto y contrato: `ContractNumber`, `ContractType`, `ContractStartDate`, `ContractEndDate`, `ContractedHours`, `UsedHours`, `RemainingHours`, `HoursAlertStatus`, `ExpirationAlertStatus`, `ContractStatus` e `IsActive`.
- Muestra resumen de horas del proyecto: total, mes actual, pendientes, procesadas y canceladas.
- Muestra los ultimos registros de servicio del proyecto seleccionado.
- Usa solo endpoints existentes: `GET /api/projects` y `GET /api/reports/service-hours?projectId=`.
- No muestra dinero, facturas, tarifas ni totales monetarios.

### Technician Dashboard

El Dashboard tambien incluye un panel interno `Technician Dashboard`:

- Usuarios Admin pueden buscar tecnicos por nombre y seleccionar uno desde un dropdown filtrado.
- Usuarios Technician ven su propio alcance de dashboard.
- Despues de seleccionar un tecnico, el dropdown `Proyecto` muestra `Todos los proyectos` y solo los proyectos donde ese tecnico tiene registros de servicio.
- Al cambiar el proyecto seleccionado se recalculan automaticamente los totales del tecnico, horas del mes actual, horas pendientes/procesadas/canceladas, total de registros, horas por cliente y ultimos registros de servicio.
- Muestra tecnico, rol, estado activo/inactivo, total de horas trabajadas, horas del mes actual, horas pendientes, horas procesadas, horas canceladas y total de registros.
- Muestra `Horas por proyecto` con `ProjectName`, `ClientName`, `TotalHours` y `LastServiceDate`; si se selecciona un proyecto, esta tabla muestra el alcance del proyecto seleccionado.
- Muestra `Horas por cliente` con `ClientName`, `TotalHours` y `TotalRecords`.
- Muestra los ultimos registros de servicio del tecnico seleccionado.
- Usa endpoints existentes: `GET /api/users` para seleccion Admin y `GET /api/reports/service-hours?technicianUserId=`.
- No muestra dinero, facturas, tarifas ni totales monetarios.

### Fase 27: Proyectos Activos Del Dashboard Y Filtros De Fecha Por Tecnico

- El Dashboard visible ahora enfoca sus graficas de resumen, Project Dashboard, paneles de detalle y actividad reciente en la lista oficial de proyectos activos:
  - `WIOA de Bayamón`
  - `Departamento de la Familia COC`
  - `WIOA de Humacao`
  - `WIOA de San Juan`
- Este filtro es solo de presentacion en Dashboard/frontend. No se eliminan ni modifican registros de base de datos.
- Technician Dashboard ahora incluye filtros `Fecha desde` y `Fecha hasta`.
- Usuarios Admin pueden combinar tecnico, proyecto y rango de fechas para revisar horas trabajadas, totales por cliente, ultimos registros, total de registros, horas pendientes, horas procesadas y horas canceladas.
- El dropdown de proyecto sigue mostrando solo proyectos donde el tecnico seleccionado tiene registros, limitado a la lista oficial del dashboard.
- Se crean notificaciones para Admin cuando registros de servicio se marcan como `Billed`/procesados, incluyendo tecnico, proyecto, cliente, fecha de servicio y cantidad de registros procesados.
- Dinero, pantallas de invoices, tarifas y totales monetarios permanecen ocultos en el dashboard visible.

### Fase 27.1: Service Records, Users Y Limpieza De Descripcion

- Las descripciones de Service Records se limpian al mostrarse para que etiquetas HTML heredadas como `<div>`, `</div>` y `<br>` no aparezcan visibles en tablas, dashboard o reportes.
- El valor original en base de datos no se modifica; la limpieza es solo visual y conserva saltos de linea legibles.
- Service Records se pueden editar desde la tabla de Service Records.
- Usuarios Admin pueden editar cualquier Service Record y cambiar estado cuando aplique.
- Roles Technician/User pueden editar sus propios registros sin cambiar tecnico asignado ni estado.
- Users ahora muestra estado `Active`/`Inactive` en la tabla.
- Usuarios Admin pueden activar o desactivar usuarios sin borrar filas de la base de datos.
- Usuarios inactivos no pueden iniciar sesion, pero sus registros historicos permanecen disponibles.
- Los dropdowns de tecnicos prefieren usuarios activos para ocultar personal inactivo de nuevas selecciones operativas.

## Ajuste De Demo: Reports E Invoices

- La pantalla visible `Reports` ahora usa `GET /api/reports/service-hours` y `GET /api/reports/service-hours/summary`.
- Reports muestra tecnico, cliente, proyecto, fecha de servicio, horas trabajadas, descripcion del servicio y estado del registro.
- Reports ya no llama endpoints legacy de reportes de tickets desde el frontend.
- Los botones temporales de imprimir/exportar hoja quedan ocultos para la demo.
- Los botones PDF y Excel permanecen visibles, deshabilitados y rotulados `PDF (Proximamente)` y `Excel (Proximamente)` hasta implementar exportacion de horas de servicio.
- La navegacion visible del frontend oculta `Invoices` temporalmente para claridad de demo.
- Las APIs de Invoices, la logica backend, las tablas SQL y la implementacion frontend existente permanecen en el codigo.

## Fase 17C: Frontend De Contratos En Projects

- Projects ahora muestra resumen contractual: `ContractNumber`, `ContractedHours`, `UsedHours`, `RemainingHours`, `ContractEndDate` y `ContractStatus`.
- El modal de Project incluye la seccion `Contract Information` para usuarios Admin.
- Los valores calculados permanecen solo lectura: `UsedHours`, `RemainingHours`, `HoursAlertStatus`, `ExpirationAlertStatus` y `ContractStatus`.
- Las alertas visuales usan verde para `OK`, amarillo para `LOW_HOURS`, naranja para `EXPIRING_SOON`, rojo para estados sin horas/expirados y gris para `NO_CONTRACT`.
- No se muestran campos monetarios ni tarifas por hora.

### Ejemplos De API

```http
GET /api/dashboard/summary
```

```http
GET /api/dashboard/charts
```

```http
GET /api/dashboard/recent-activity
```

### Flujo De Prueba

1. Iniciar sesion como administrador.
2. Abrir `Dashboard`.
3. Confirmar que todas las tarjetas de resumen cargan datos.
4. Confirmar que las secciones visuales muestran datos o estados vacios.
5. Confirmar que la actividad reciente muestra registros de servicio, clientes y proyectos.
6. Usar `Project Dashboard`, buscar por proyecto o cliente, seleccionar un proyecto y confirmar alertas contractuales y totales de horas.
7. Usar `Technician Dashboard`, buscar por nombre de tecnico, seleccionar uno, filtrar por `Proyecto`, `Fecha desde` y `Fecha hasta`, y confirmar que totales, horas por cliente, horas por proyecto y ultimos registros se actualizan.
8. Iniciar sesion como tecnico y confirmar que el dashboard esta limitado por permisos del backend.
9. Interrumpir temporalmente una API o conexion local de base de datos durante pruebas y confirmar que aparece el mensaje de error del dashboard.

Proxima fase: Fase 17D - Advertencias contractuales en Service Records.

## Autor

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

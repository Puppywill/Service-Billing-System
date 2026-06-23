# Service Billing System

Language: [English](README.MD) | [Espanol](README_ES.md)

Service Billing System is a web application being migrated from a Help Desk ticket project into a system for registering hourly service work, reviewing operational records, and preparing billing reports.

## Migration Notice

This repository has completed Phase 7 of the migration. The product identity, SQL Server schema, database connection, Clients API, Projects API, Service Records API, and Invoices API are available, while the frontend screens still use the original ticket-based Help Desk structure.

Legacy endpoints such as `/api/tickets` remain in place temporarily to avoid breaking the application while the new service billing modules are introduced safely.

## Project Progress

- Phase 1: Identity and documentation ✅
- Phase 2: ServiceBillingDB database ✅
- Phase 3: ServiceBillingDB connection ✅
- Phase 4: Clients CRUD ✅
- Phase 5: Projects CRUD ✅
- Phase 6: Service Records CRUD ✅
- Phase 7: Invoices CRUD and invoice generation ✅

## Current Capabilities

- Session-based login.
- Role-based access control for `Admin` and `User`.
- User administration.
- Client CRUD API with soft deletion.
- Project CRUD API linked to clients.
- Service Records CRUD API with automatic hour calculation.
- Invoices CRUD API with invoice lines and generation from billable service records.
- Password recovery request workflow.
- Notifications for administrative activity.
- Existing record workflow still powered internally by the legacy ticket module.
- PDF and Excel report exports.
- Responsive web interface for desktop, tablet, and mobile.

## Target Direction

The system is being converted toward these Service Billing features:

- Service records instead of tickets.
- Users as users and technicians.
- Client and project catalogs.
- Hourly service entry with morning and afternoon time ranges.
- Automatic total hour calculation.
- Reports by technician, client, project, and date range.
- Invoice preparation from billable service records.
- Dashboard summary for hours, clients, projects, and billing.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- SQL Server
- mssql
- ExcelJS
- PDFKit

## Project Structure

- `index.html`: main application layout, login screen, tabs, tables, forms, and modals.
- `style.css`: responsive dark theme, cards, tables, forms, buttons, and visual states.
- `app.js`: frontend logic, API calls, translations, filters, role-based UI, and dynamic rendering.
- `server.js`: Express backend with SQL Server connection, authentication, legacy ticket records, users, notifications, password recovery, and reports API.
- `service-billing-schema.sql`: creates `ServiceBillingDB`, its service billing tables, relationships, indexes, and demo data.
- `seed.js`: creates demo users and legacy ticket records.
- `seed-demo-data.js`: creates additional demo data for the current legacy structure.
- `audit-migration.sql`: legacy audit migration script.

## How to Run the Project

1. Install dependencies:

```bash
npm install
```

2. Run seed data if your local SQL Server database already has the expected legacy schema:

```bash
npm run seed
```

3. Start the server:

```bash
npm start
```

4. Open the application:

```text
http://localhost:3000
```

## Demo Accounts

Service Billing admin:

```text
Email: william@servicebilling.local
Password: Admin123!
```

Service Billing technician:

```text
Email: carlos@servicebilling.local
Password: Tech123!
```

Additional demo accounts are defined in `service-billing-schema.sql`.

## Current Database State

Current backend configuration:

- Server: `localhost`
- Database: `ServiceBillingDB` by default
- Environment override: `DB_NAME`
- Authentication: Windows Authentication

Current tables used by the application:

- `Users`
- `Notifications`
- `PasswordResetRequests`
- `Clients`
- `Projects`
- `ServiceRecords`
- `Invoices`
- `InvoiceLines`
- `AppSettings`

Legacy tables and endpoints are not removed during the migration.

## Current API State

The existing API remains available, with the Clients API added in Phase 4.

Clients:

- `GET /api/clients`: returns active clients; supports `?search=` or `?q=`.
- `GET /api/clients/:id`: returns one active client.
- `POST /api/clients`: creates a client.
- `PUT /api/clients/:id`: updates a client.
- `DELETE /api/clients/:id`: sets `IsActive = 0` without physically deleting the row.

Projects:

- `GET /api/projects`: returns active projects; supports search and client filtering.
- `GET /api/projects/:id`: returns one active project.
- `POST /api/projects`: creates a project for an active client.
- `PUT /api/projects/:id`: updates a project.
- `DELETE /api/projects/:id`: sets `IsActive = 0` without physically deleting the row.

Service records:

- `GET /api/service-records`: returns service records with optional search and filters.
- `GET /api/service-records/:id`: returns one service record.
- `POST /api/service-records`: creates a record and calculates `TotalHours`.
- `PUT /api/service-records/:id`: updates a record and recalculates `TotalHours`.
- `DELETE /api/service-records/:id`: changes the status to `Canceled` without deleting the row.

Invoices:

- `GET /api/invoices`: returns invoices with optional search and filters.
- `GET /api/invoices/:id`: returns one invoice with its invoice lines.
- `POST /api/invoices`: creates a manual invoice header.
- `PUT /api/invoices/:id`: updates an invoice header and recalculates totals from its lines.
- `DELETE /api/invoices/:id`: cancels the invoice without physically deleting the row.
- `POST /api/invoices/generate`: generates an invoice from recorded service records.

Legacy records:

- `GET /api/tickets`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PUT /api/tickets/:id/close`
- `DELETE /api/tickets/:id`

Users:

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Authentication and recovery:

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `POST /api/forgot-password`
- `GET /api/password-resets`
- `PUT /api/password-resets/:id/resolve`

Reports:

- `GET /api/reports/tickets`
- `GET /api/reports/tickets/pdf`
- `GET /api/reports/tickets/excel`

## Phase 4: Clients CRUD

### Permissions

- Authenticated `Admin`, `Technician`, and current staff users can list and view clients.
- Only `Admin` users can create, update, or deactivate clients.
- Deactivation is a soft delete: the API sets `IsActive` to `0`.

### Clients Table

The `dbo.Clients` table includes:

- `ClientID`: identity primary key.
- `ClientName`: required and unique client name.
- `ContactName`: primary contact.
- `Email`: contact email.
- `Phone`: contact phone number.
- `BillingName`: legal or billing name.
- `TaxID`: tax identifier.
- `AddressLine1`, `AddressLine2`, `City`, `StateProvince`, `PostalCode`, `Country`: address data. The current API exposes `AddressLine1` as `Address`.
- `IsActive`: controls active or deactivated state.
- `CreatedAt`, `UpdatedAt`: audit timestamps.
- `CreatedByUserID`: foreign key to `dbo.Users`.

### API Examples

Log in first so the HTTP client stores the session cookie:

```http
POST /api/login
Content-Type: application/json

{
  "email": "william@servicebilling.local",
  "password": "Admin123!"
}
```

List or search active clients:

```http
GET /api/clients
GET /api/clients?search=acme
GET /api/clients/1
```

Create a client:

```http
POST /api/clients
Content-Type: application/json

{
  "ClientName": "Example Company",
  "ContactName": "Ana Perez",
  "Email": "ana@example.com",
  "Phone": "787-555-1000",
  "Address": "100 Main Street",
  "BillingName": "Example Company LLC",
  "TaxID": "66-1234567",
  "IsActive": true
}
```

Update or deactivate a client:

```http
PUT /api/clients/1
DELETE /api/clients/1
```

## Phase 5: Projects CRUD

Projects belong to clients through `Projects.ClientID`, which references `Clients.ClientID`. Every create or update operation verifies that the selected client exists and is active.

### Permissions

- Authenticated `Admin`, `Technician`, and current staff users can list and view projects.
- Only `Admin` users can create, update, or deactivate projects.
- Project deactivation is a soft delete using `IsActive = 0`.

### Available Filters

- Search by `ProjectName`, `ClientName`, or `Description` with `?search=` or `?q=`.
- Filter by client with `?clientId=` or `?ClientID=`.
- GET responses include `ClientName`.

### API Examples

```http
GET /api/projects
GET /api/projects?search=migration
GET /api/projects?clientId=1
GET /api/projects/1
```

```http
POST /api/projects
Content-Type: application/json

{
  "ClientID": 1,
  "ProjectName": "Monthly Support",
  "Description": "Recurring support and maintenance",
  "HourlyRate": 95.50,
  "IsActive": true
}
```

```http
PUT /api/projects/1
DELETE /api/projects/1
```

`HourlyRate` accepts decimals and cannot be negative.

## Phase 6: Service Records CRUD

Each service record links one active technician, client, and project through `TechnicianUserID`, `ClientID`, and `ProjectID`. The project must be active and belong to the selected client.

### TotalHours Calculation

The API calculates `TotalHours`; clients do not supply the final value. It adds the valid morning and afternoon intervals:

```text
(MorningEnd - MorningStart) + (AfternoonEnd - AfternoonStart)
```

Times accept `HH:mm` or `HH:mm:ss`. Each interval requires both start and end, and an end time must be later than its start time.

### Filters

- Full-text search across service description, technician, client, and project.
- `TechnicianUserID`
- `ClientID`
- `ProjectID`
- `ServiceDate` in `YYYY-MM-DD` format
- `Status`: `Recorded`, `Billed`, or `Canceled`

GET responses include `TechnicianName`, `ClientName`, and `ProjectName`.

### Role Permissions

- `Admin`: can create, view, edit, and cancel service records.
- `Technician`: can view records and create records under their own `TechnicianUserID`.
- Only `Admin` can cancel a record.
- Cancellation sets `Status = 'Canceled'`; it does not physically delete data.

### API Examples

```http
GET /api/service-records
GET /api/service-records?search=maintenance
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
  "ServiceDescription": "Maintenance and technical support",
  "Status": "Recorded"
}
```

The example produces `TotalHours: 7.00`.

```http
PUT /api/service-records/1
DELETE /api/service-records/1
```

## Phase 7: Invoices CRUD

Invoices use the `dbo.Invoices` table for invoice headers and `dbo.InvoiceLines` for line details. Generated lines are linked back to `ServiceRecords` through `ServiceRecordID`, preserving traceability between recorded work and billing.

### Invoice Generation

`POST /api/invoices/generate` creates an invoice from billable service records:

- Selects records by `ClientID`, `PeriodFrom`, and `PeriodTo`.
- Includes only records with `Status = 'Recorded'`.
- Excludes canceled records and records that already have an `InvoiceID`.
- Creates one invoice header in `Invoices`.
- Creates one line per service record in `InvoiceLines`.
- Calculates `Subtotal`, `TaxAmount`, and `TotalAmount`.
- Updates the included `ServiceRecords` from `Recorded` to `Billed`.
- Saves the generated `InvoiceID` in each billed service record.

### Invoice Statuses

Allowed invoice statuses are:

- `Draft`
- `Issued`
- `Paid`
- `Canceled`

Canceling an invoice sets `Status = 'Canceled'` and `IsActive = 0`; it does not physically delete invoice data.

### Permissions

- `Admin`: can create, view, edit, cancel, and generate invoices.
- `Technician`: can view invoices.
- Generating invoices is restricted to `Admin`.

### API Examples

```http
GET /api/invoices
GET /api/invoices?ClientID=1&Status=Issued
GET /api/invoices?periodFrom=2026-06-01&periodTo=2026-06-30
GET /api/invoices/1
```

Generate an invoice from service records:

```http
POST /api/invoices/generate
Content-Type: application/json

{
  "ClientID": 1,
  "PeriodFrom": "2026-06-01",
  "PeriodTo": "2026-06-30",
  "TaxRate": 0.18,
  "Notes": "Invoice generated from recorded service work"
}
```

Create a manual invoice header:

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
  "Notes": "Manual invoice header"
}
```

Update or cancel an invoice:

```http
PUT /api/invoices/1
DELETE /api/invoices/1
```

## Author

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

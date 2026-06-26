# Service Billing System

Language: [English](README.MD) | [Espanol](README_ES.md)

Service Billing System is a web application being migrated from a Help Desk ticket project into a system for registering hourly service work, reviewing operational records, and preparing billing reports.

## Migration Notice

This repository has completed Phase 15 of the migration. The product identity, SQL Server schema, backend APIs, dashboard API, frontend foundation, and connected Dashboard, Clients, Projects, Service Records, and Invoices frontends are available while legacy modules remain in place for a safe migration.

Legacy endpoints such as `/api/tickets` remain in place temporarily to avoid breaking the application while the new service billing modules are introduced safely.

## Presentation Note

For the current local demo, monetary values are intentionally hidden from the user interface. Rates, taxes, subtotals, totals, billed amounts, pending amounts, paid amounts, and currency symbols remain available in the database and backend APIs, but they are not displayed in Dashboard, Projects, Invoices, invoice lines, Reports, or Settings screens.

Invoices are also hidden from the visible frontend navigation for the current demo to keep the workflow focused on clients, projects, service records, and worked-hours reports. The invoice backend APIs and SQL tables remain intact.

## Project Progress

- Phase 1: Identity and documentation ✅
- Phase 2: ServiceBillingDB database ✅
- Phase 3: ServiceBillingDB connection ✅
- Phase 4: Clients CRUD ✅
- Phase 5: Projects CRUD ✅
- Phase 6: Service Records CRUD ✅
- Phase 7: Invoices CRUD and invoice generation ✅
- Phase 8: Service hours and billing reports ✅
- Phase 9: Dashboard API ✅
- Phase 10: Frontend Foundation ✅
- Phase 11: Clients Frontend ✅
- Phase 12: Projects Frontend ✅
- Phase 13: Service Records Frontend ✅
- Phase 14: Invoices Frontend ✅
- Phase 15: Dashboard Frontend ✅
- Phase 17A: Project Contract SQL Migration ✅
- Phase 17B: Project Contract Backend ✅
- Phase 17C: Projects Contract Frontend ✅

Next phase: Phase 17D - Service Record contract warnings

## Current Project Status

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

## Current Capabilities

- Session-based login.
- Role-based access control for `Admin` and `User`.
- User administration.
- Client CRUD API with soft deletion.
- Project CRUD API linked to clients.
- Service Records CRUD API with automatic hour calculation.
- Invoices CRUD API with invoice lines and generation from billable service records.
- Service hours and invoice reporting APIs with summaries and filters.
- Dashboard API with summary cards, chart data, and recent activity.
- Frontend foundation with Service Billing branding, navigation, and initial module screens.
- Connected Clients frontend with search, create, edit, and logical deactivation.
- Connected Projects frontend with search, client filtering, create, edit, and logical deactivation.
- Projects frontend now shows contract summary fields, editable contract information for Admin, and visual contract alerts.
- Connected Service Records frontend with search, filters, create/edit modal, logical cancellation, automatic hour preview, and role-aware actions.
- Invoices frontend implementation remains in the codebase but is hidden from visible navigation for the current demo.
- Connected Dashboard frontend with service-focused summary cards, visual chart sections, recent activity, API error handling, and role-limited data.
- Reports frontend now uses service-hour reports instead of legacy ticket reports.
- Password recovery request workflow.
- Notifications for administrative activity.
- Existing record workflow still powered internally by the legacy ticket module.
- Report export controls are limited to disabled `PDF (Coming soon)` and `Excel (Coming soon)` buttons for the demo.
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

## Phase 8: Reports

Phase 8 adds backend reporting endpoints for service hours and billing. These reports use the current Service Billing tables: `Users`, `Clients`, `Projects`, `ServiceRecords`, `Invoices`, and `InvoiceLines`.

### Service Hours Report

`GET /api/reports/service-hours` returns service records with:

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

Available filters:

- `from`
- `to`
- `technicianUserId`
- `clientId`
- `projectId`
- `status`: `Recorded`, `Billed`, or `Canceled`

### Service Hours Summary

`GET /api/reports/service-hours/summary` returns:

- `TotalRecords`
- `TotalHours`
- `BilledHours`
- `UnbilledHours`
- `CanceledHours`
- `HoursByTechnician`
- `HoursByClient`
- `HoursByProject`

### Invoice Report

`GET /api/reports/invoices` returns invoices with:

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

Available filters:

- `from`
- `to`
- `clientId`
- `status`: `Draft`, `Issued`, `Paid`, or `Canceled`

### Invoice Summary

`GET /api/reports/invoices/summary` returns:

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

### Permissions

- `Admin`: can view all service hour and invoice reports.
- `Technician`: can view only their own service records.
- `Technician`: can view only invoices related to their service records through `InvoiceLines`.

### API Examples

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

## Phase 9: Dashboard API

Phase 9 adds backend endpoints for a modern Service Billing dashboard. These endpoints are designed to feed summary cards, charts, and recent activity panels without changing the frontend yet.

### Dashboard Summary

`GET /api/dashboard/summary` returns:

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

`GET /api/dashboard/charts` returns:

- `HoursByMonth`
- `BillingByMonth`
- `HoursByClient`
- `HoursByProject`
- `HoursByTechnician`
- `InvoicesByStatus`

### Recent Activity

`GET /api/dashboard/recent-activity` returns the latest:

- `ServiceRecords`
- `Invoices`
- `Clients`
- `Projects`

### Permissions

- `Admin`: can view all dashboard data.
- `Technician`: can view only their own service records and data related to those records.
- Technician invoice data is limited through `InvoiceLines` linked to their `ServiceRecords`.

### API Examples

```http
GET /api/dashboard/summary
GET /api/dashboard/charts
GET /api/dashboard/recent-activity
```

Test as an admin:

```http
POST /api/login
Content-Type: application/json

{
  "email": "william@servicebilling.local",
  "password": "Admin123!"
}
```

Test as a technician:

```http
POST /api/login
Content-Type: application/json

{
  "email": "carlos@servicebilling.local",
  "password": "Tech123!"
}
```

## Phase 10: Frontend Foundation

Phase 10 starts the visual transition from the Help Desk interface into the Service Billing System frontend. No new frontend API integrations were added in this phase; the work focuses on structure, branding, and safe navigation.

### Completed Frontend Foundation

- Updated visible branding to `Service Billing System`.
- Added the new main navigation structure.
- Kept the existing login and authentication flow.
- Kept the existing dashboard in place for now.
- Kept legacy modules available internally without deleting old code.
- Added initial empty frontend screens for future Service Billing modules.
- Preserved responsive layout behavior for desktop, tablet, and mobile.

### Navigation

The main navigation now includes:

- `Dashboard`
- `Clients`
- `Projects`
- `Service Records`
- `Invoices`
- `Reports`
- `Users`
- `Settings`

### Initial Screens

- `Clients`: initial catalog workspace for client management.
- `Projects`: initial workspace for client projects and hourly rates.
- `Service Records`: current legacy record workflow, visually renamed for Service Billing.
- `Invoices`: initial billing workspace for invoice lists, lines, and generation.
- `Reports`: reporting area retained for billing/report workflows.
- `Users`: existing administrative user management.
- `Settings`: initial workspace for account, notifications, and billing defaults.

## Phase 11: Clients Frontend

Phase 11 connects the `Clients` screen to the real backend API. The screen now loads live client data and supports role-aware client management while leaving Projects, Service Records, Invoices, and legacy ticket logic untouched.

### Completed Clients Frontend

- Loads the client list with `GET /api/clients`.
- Adds client search using the backend search query.
- Adds an `Add Client` button for administrators.
- Adds a modal form to create clients.
- Adds a modal form to edit clients.
- Supports logical client deactivation through `DELETE /api/clients/:id`.
- Shows `ClientName`, `ContactName`, `Email`, `Phone`, `BillingName`, `TaxID`, and `IsActive`.
- Uses the current session role to control available actions.
- Keeps the Clients screen responsive.

### Validation

- `ClientName` is required.
- `Email` is optional and normalized visually in the form.
- Deactivation requires confirmation before calling the API.
- Success and error messages are shown in the Clients screen or modal.

### Role Permissions

- `Admin`: can create, edit, and deactivate clients.
- `Technician` / staff users: read-only access to the client list.

### API Usage

The frontend uses:

```http
GET /api/clients
GET /api/clients?search=acme
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id
```

### Test Flow

1. Sign in as an admin.
2. Open `Clients`.
3. Search for an existing client.
4. Create a new client with `ClientName`.
5. Edit contact, billing, phone, email, or tax fields.
6. Deactivate a client and confirm the prompt.
7. Sign in as a technician and verify the client list is read-only.

## Phase 12: Projects Frontend

Phase 12 connects the `Projects` screen to the real backend API. The screen now loads live project data, supports project search and client filtering, and keeps management actions role-aware.

### Completed Projects Frontend

- Loads the project list with `GET /api/projects`.
- Supports search by project name, client name, or description.
- Adds a client filter.
- Loads active clients from `GET /api/clients` for filter and form dropdowns.
- Adds an `Add Project` button for administrators.
- Adds a modal form to create projects.
- Adds a modal form to edit projects.
- Supports logical project deactivation through `DELETE /api/projects/:id`.
- Shows `ProjectName`, `ClientName`, `Description`, and `IsActive`.
- Keeps internal project rate values available for API compatibility, but hides them from the UI for the current demo.
- Uses the current session role to control available actions.
- Keeps the Projects screen responsive and visually consistent with Clients.

### Validation

- `ClientID` is required.
- `ProjectName` is required.
- Internal project rate defaults remain validated for API compatibility.
- Deactivation requires confirmation before calling the API.
- Success and error messages are shown in the Projects screen or modal.

### Role Permissions

- `Admin`: can create, edit, and deactivate projects.
- `Technician` / staff users: read-only access to the project list.

### API Usage

The frontend uses:

```http
GET /api/projects
GET /api/projects?search=support
GET /api/projects?clientId=1
GET /api/clients
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id
```

### Test Flow

1. Sign in as an admin.
2. Open `Projects`.
3. Search by project, client, or description.
4. Filter by client.
5. Create a project by selecting `ClientID` and entering `ProjectName`.
6. Edit a project's client, name, description, or active state.
7. Deactivate a project and confirm the prompt.
8. Sign in as a technician and verify the project list is read-only.

## Phase 13: Service Records Frontend

Phase 13 connects the `Service Records` screen to the real backend API. The screen now loads live service records, supports search and operational filters, and provides role-aware creation, editing, and logical cancellation workflows.

### Completed Service Records Frontend

- Loads the service record list with `GET /api/service-records`.
- Supports search across technician, client, project, and service description.
- Adds filters by technician, client, project, service date, and status.
- Adds an `Add Service Record` button for allowed roles.
- Adds a modal form to create service records.
- Adds a modal form to edit service records.
- Supports logical cancellation through `DELETE /api/service-records/:id`.
- Shows `TechnicianName`, `ClientName`, `ProjectName`, `ServiceDate`, `MorningStart`, `MorningEnd`, `AfternoonStart`, `AfternoonEnd`, `TotalHours`, `ServiceDescription`, and `Status`.
- Calculates a `TotalHours` preview automatically from the entered time ranges before saving.
- Loads technicians dynamically from users, clients from `GET /api/clients`, and projects from `GET /api/projects`.
- Filters the project dropdown by the selected client.
- Validates required fields and time ranges before sending the request.
- Uses the current session role to control available actions.
- Keeps the Service Records screen responsive and visually consistent with Clients and Projects.

### Service Records Filters

`GET /api/service-records` can be called from the frontend with:

- `search`
- `technicianUserId`
- `clientId`
- `projectId`
- `serviceDate`
- `status`

Example:

```http
GET /api/service-records?clientId=1&status=Recorded
```

### Role Rules

- `Admin`: can create, edit, and cancel service records.
- `Technician`: can create and view service records.
- The UI uses the active session to show or hide actions and to keep technician workflows scoped to the signed-in user where applicable.

### Test Flow

1. Sign in as an administrator.
2. Open `Service Records`.
3. Confirm the table loads records from `GET /api/service-records`.
4. Use search and filters for technician, client, project, date, and status.
5. Click `Add Service Record`, complete the modal, and verify `TotalHours` updates from the time ranges.
6. Save the record and confirm it appears in the list.
7. Edit the record as an administrator.
8. Cancel the record and confirm the prompt.
9. Sign in as a technician and verify the screen allows create/view workflows without admin-only actions.

## Phase 14: Invoices Frontend

Phase 14 connects the `Invoices` screen to the real backend API. The screen now loads live invoice data, supports billing filters, generates invoices from recorded service hours, and provides role-aware detail, status, and cancellation workflows.

### Completed Invoices Frontend

- Loads the invoice list with `GET /api/invoices`.
- Supports search by invoice number, client, or notes.
- Adds filters by client, status, and date range.
- Adds `Generate Invoice` for administrators.
- Generates invoices with `POST /api/invoices/generate`.
- Adds a modal to generate invoices from `ServiceRecords`.
- Uses `ClientID`, `PeriodFrom`, `PeriodTo`, and `Notes` in the visible generation flow.
- Keeps internal invoice tax values available for API compatibility, but hides them from the UI for the current demo.
- Adds an invoice detail view.
- Displays `InvoiceLines` from `GET /api/invoices/:id`.
- Allows invoice status editing for administrators.
- Supports logical invoice cancellation with `DELETE /api/invoices/:id`.
- Loads clients dynamically for filters and the generation modal.
- Shows `InvoiceNumber`, `ClientName`, `InvoiceDate`, `PeriodFrom`, `PeriodTo`, and `Status`.
- Shows `InvoiceLines` without monetary columns.
- Uses the current session role to control available actions.
- Keeps the Invoices screen responsive and visually consistent with the connected modules.

### Invoice Filters

`GET /api/invoices` can be called from the frontend with:

- `search`
- `clientId`
- `periodFrom`
- `periodTo`
- `status`

Example:

```http
GET /api/invoices?clientId=1&status=Issued&periodFrom=2026-06-01&periodTo=2026-06-30
```

### Generate Invoice Example

```http
POST /api/invoices/generate
Content-Type: application/json

{
  "ClientID": 1,
  "PeriodFrom": "2026-06-01",
  "PeriodTo": "2026-06-30",
  "Notes": "June service billing"
}
```

### Role Rules

- `Admin`: can generate, edit status, and cancel invoices.
- `Technician` / `Staff`: read-only invoice access.
- The UI uses the active session to show or hide generation, status, and cancellation actions.

### Test Flow

1. Sign in as an administrator.
2. Open `Invoices`.
3. Confirm the table loads invoices from `GET /api/invoices`.
4. Use search and filters for client, status, and date range.
5. Click `Generate Invoice`, select a client and period with `Recorded` service records, and save.
6. Open the invoice detail and confirm `InvoiceLines` are displayed.
7. Edit invoice status as an administrator.
8. Cancel an invoice and confirm the prompt.
9. Sign in as a technician and verify the invoice screen is read-only.

## Phase 15: Dashboard Frontend

Phase 15 connects the `Dashboard` screen to the real backend dashboard APIs. The dashboard now displays business metrics, visual chart sections, and recent activity from the Service Billing modules.

Demo adjustment: invoice-specific dashboard cards, charts, and recent activity are hidden from the visible frontend for now. Dashboard remains focused on clients, projects, service records, and hours.

### Completed Dashboard Frontend

- Connects the Dashboard frontend to `GET /api/dashboard/summary`.
- Connects visual chart sections to `GET /api/dashboard/charts`.
- Connects recent activity to `GET /api/dashboard/recent-activity`.
- Uses the active session to load the correct dashboard scope.
- Shows a complete dashboard for `Admin`.
- Shows a backend-limited dashboard for `Technician`.
- Handles API errors with a visible dashboard message.
- Keeps the dashboard responsive and focused on Clients, Projects, Service Records, and service hours.

### Summary Cards

The dashboard displays:

- `TotalClients`
- `TotalProjects`
- `TotalServiceRecords`
- `TotalHours`
- `CurrentMonthHours`
- `UnbilledHours` shown as pending hours.
- `BilledHours` shown as processed hours.
- Invoice and monetary summary values are hidden in the UI for the current demo.

### Visual Sections

The dashboard includes lightweight frontend chart sections without adding new libraries:

- `HoursByMonth`
- `HoursByClient`
- `HoursByProject`
- `HoursByTechnician`

### Recent Activity

The dashboard displays recent:

- `ServiceRecords`
- `Clients`
- `Projects`

### API Examples

```http
GET /api/dashboard/summary
```

```http
GET /api/dashboard/charts
```

```http
GET /api/dashboard/recent-activity
```

### Test Flow

1. Sign in as an administrator.
2. Open `Dashboard`.
3. Confirm all summary cards are populated.
4. Confirm chart sections render data or empty states.
5. Confirm recent activity lists service records, clients, and projects.

## Demo Adjustment: Reports and Invoices Visibility

- The visible `Reports` screen now uses `GET /api/reports/service-hours` and `GET /api/reports/service-hours/summary`.
- Reports show technician, client, project, service date, worked hours, service description, and service record status.
- Reports no longer call legacy ticket report endpoints from the frontend.
- The temporary service sheet print/export buttons are hidden for the demo.
- PDF and Excel buttons remain visible, disabled, and labeled `PDF (Coming soon)` and `Excel (Coming soon)` until service-hour exports are implemented.
- The visible frontend navigation hides `Invoices` temporarily for demo clarity.
- Invoice APIs, backend logic, SQL tables, and existing frontend implementation remain in the codebase.

## Phase 17C: Projects Contract Frontend

- Projects now displays contract summary fields: `ContractNumber`, `ContractedHours`, `UsedHours`, `RemainingHours`, `ContractEndDate`, and `ContractStatus`.
- The Project modal includes `Contract Information` fields for Admin users.
- Calculated values remain read-only: `UsedHours`, `RemainingHours`, `HoursAlertStatus`, `ExpirationAlertStatus`, and `ContractStatus`.
- Visual alerts use green for `OK`, yellow for `LOW_HOURS`, orange for `EXPIRING_SOON`, red for exhausted/expired states, and gray for `NO_CONTRACT`.
- No monetary fields or hourly rates are shown.
6. Sign in as a technician and confirm the dashboard is limited by backend permissions.
7. Temporarily interrupt an API or database connection during local testing and confirm the dashboard error message appears.

Next phase: Phase 17D - Service Record contract warnings.

## Author

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

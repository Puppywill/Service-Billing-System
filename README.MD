# Solutions By Design - Service Billing System

Language: [English](README.MD) | [Espanol](README_ES.md)

Solutions By Design - Service Billing System is an internal web application for registering hourly service work, reviewing operational records, and preparing service billing support reports. The repository name remains `Service-Billing-System`.

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
- Report export controls include active PDF export for service-hour reports; Excel remains disabled as `Excel (Coming soon)` for the demo.
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

- Established the Service Billing frontend identity; the current visible brand is now `Solutions By Design`.
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
- Dashboard cards for current month hours, pending hours, processed hours, projects, and service records open a detail panel with related records.

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

### Interactive Dashboard Details

- `Current Month Hours`: shows service records for the current month.
- `Pending Hours`: shows `Recorded` service records.
- `Processed Hours`: shows `Billed` service records.
- `Projects`: shows project contract/hour summary.
- `Service Records`: shows the latest service records.

### Project Dashboard

The Dashboard includes an internal `Project Dashboard` panel for demo review:

- Search projects by `ProjectName` or `ClientName`.
- Select a project from the filtered dropdown.
- View project and contract details, including `ContractNumber`, `ContractType`, `ContractStartDate`, `ContractEndDate`, `ContractedHours`, `UsedHours`, `RemainingHours`, `HoursAlertStatus`, `ExpirationAlertStatus`, `ContractStatus`, and `IsActive`.
- View project hour totals for total hours, current month hours, pending hours, processed hours, and canceled hours.
- View the latest service records for the selected project.
- Uses existing endpoints only: `GET /api/projects` and `GET /api/reports/service-hours?projectId=`.
- Does not display money, invoice data, rates, or monetary totals.

### Technician Dashboard

The Dashboard also includes an internal `Technician Dashboard` panel:

- Admin users can search technicians by name and select one from a filtered dropdown.
- Technician users see their own dashboard scope.
- After selecting a technician, the `Project` dropdown shows `All projects` plus only the projects where that technician has service records.
- Changing the selected project automatically recalculates technician totals, current month hours, pending/processed/canceled hours, total records, hours by client, and latest service records.
- Shows technician name, role, active/inactive status, total worked hours, current month hours, pending hours, processed hours, canceled hours, and total service records.
- Shows `Hours By Project` with `ProjectName`, `ClientName`, `TotalHours`, and `LastServiceDate`; when a project is selected, this table shows the selected project scope.
- Shows `Hours By Client` with `ClientName`, `TotalHours`, and `TotalRecords`.
- Shows the latest service records for the selected technician.
- Uses existing endpoints: `GET /api/users` for Admin technician selection and `GET /api/reports/service-hours?technicianUserId=`.
- Does not display money, invoice data, rates, or monetary totals.

### Phase 27: Dashboard Projects and Technician Date Filters

- The visible Dashboard shows all active projects returned by `ServiceBillingDB` (`IsActive = 1`) through the existing dashboard and project APIs.
- Project-specific focus, such as WIOA Bayamon, COC, WIOA Humacao, or WIOA San Juan, should be handled through search/filter controls rather than hardcoded dashboard exclusions.
- No database records are deleted or modified.
- Technician Dashboard now includes `Date from` and `Date to` filters.
- Admin users can combine technician, project, and date range filters to review worked hours, client totals, latest records, total records, pending hours, processed hours, and canceled hours.
- The project dropdown continues to show only projects where the selected technician has service records.
- Admin notifications are created when service records are marked as `Billed`/processed, including technician, project, client, service date, and processed record count.
- Money, invoice screens, rates, and monetary totals remain hidden from the visible dashboard.
### Phase 27.1: Service Records, Users, and Description Cleanup

- Service Record descriptions are cleaned for display so legacy HTML tags such as `<div>`, `</div>`, and `<br>` are not shown in visible tables or dashboard/report panels.
- The original database value is not changed; cleanup is presentation-only and preserves readable line breaks.
- Service Records can be edited from the Service Records table.
- Admin users can edit any Service Record and can change status when appropriate.
- Technician/User roles can edit their own records without changing the assigned technician or status.
- Users now show `Active`/`Inactive` status in the Users table.
- Admin users can activate or deactivate users without deleting database rows.
- Inactive users cannot sign in, but their historical Service Records remain available.
- Technician dropdowns prefer active users so inactive staff are hidden from new operational selection lists.

### Phase 27.2: Technician Dashboard Project Priority and Description Editing

- Technician Dashboard prioritizes current main active projects at the top of the project dropdown while keeping other technician projects available.
- Main projects are prioritized for selection only; no records are deleted, hidden from the database, or removed from other modules.
- Admin users can edit the description from `Latest Service Records` in Technician Dashboard.
- The description editor allows changing only `ServiceDescription` and saves back to `ServiceBillingDB`.
- Technician/User roles can view descriptions but cannot edit them from Technician Dashboard.
- The service-hours report API now includes internal IDs needed by dashboard filters and editing actions.

### Phase 27.3: User Activation and Deactivation Fix

- Users activation/deactivation now uses `PUT /api/users/:id/status` to update `IsActive` in `ServiceBillingDB`.
- The Users table refreshes after the status change and shows `Active` or `Inactive`.
- The action button changes between `Deactivate` and `Activate` based on the current status.
- Admin users cannot deactivate their own logged-in account.
- Inactive users are blocked by `POST /api/login` and active users can sign in normally.
- No users or historical service records are deleted.

### Phase 28: Simplified Technician Dashboard

- Technician Dashboard is simplified around the daily workflow: select Technician, Project, Date from, and Date to.
- The General Dashboard remains visible with company-wide service hour charts, summary cards, and recent activity.
- Technician Dashboard shows project-scoped information when a project is selected: Technician, Client, Project, total hours, total records, pending hours, processed hours, and canceled hours.
- The main record table is `Latest Service Records` with Date, Client, Project, Hours, Status, Description, and Admin-only Edit.
- Changing the selected project or date range updates all totals and the table automatically.
- Admin description editing from the Technician Dashboard remains available.

### Phase 28.1: General Dashboard Restored

- The General Dashboard has been restored alongside the simplified Technician Dashboard.
- Global service-hour bars are visible again for hours by month, client, service project, and technician.
- Recent activity panels for service records, clients, and projects are visible again.
- General charts continue to use real service-hour data from `GET /api/reports/service-hours`.
- Technician Dashboard remains focused on one technician, one project, and an optional date range.

### Phase 28.2: Technician-Filtered Bars

- Technician Dashboard now includes visual bars filtered by the selected technician.
- When only a technician is selected, the bars show all projects, clients, months, and latest service records for that technician.
- When a project or date range is selected, all Technician Dashboard cards, bars, and records recalculate using those filters.
- Added technician-filtered bars for hours by project, hours by client, and hours by month.
- Admin-only service record description editing remains available from the Technician Dashboard table.

### Phase 28.3: Global Number Format

- The frontend now uses one global `formatNumber` helper with `en-US` formatting.
- Hours display with comma thousands and dot decimals, such as `90,674.75 h`.
- Dashboard cards, General Dashboard bars, Technician Dashboard bars, Reports, Service Records, Projects contract hours, and visible counters use the same number format.
- This is a presentation-only change; database values and backend calculations are unchanged.

### Phase 28.4: General Dashboard Active Data

- The General Dashboard now filters its visible company-wide data to active clients, active projects, and active technicians.
- Service-hour cards and bars use only Service Records connected to active Projects, active Clients, and active Technicians.
- Recent activity is filtered to active Service Records context, active Clients, and active Projects.
- Technician Dashboard behavior remains unchanged and continues to use its technician/project/date filters.
- This is a frontend presentation filter only; no records are deleted or changed in `ServiceBillingDB` or `ServiceSBD_20260629`.

### Phase 28.5: Main Active Projects First

- The General Dashboard `Service Hours by Project` bar prioritizes current main active projects at the top.
- Main projects include WIOA Bayamon hosting/maintenance, ALDL La Montana web development, Conexion Laboral Sureste webpage, Departamento de la Familia CoC, and Solutions By Design.
- Other active projects remain visible below the prioritized projects.
- The active-data filter and `en-US` number format remain in place.

### Phase 28.6: Main Clients and Projects Focus

- General Dashboard bars prioritize the current main clients and projects while keeping active data only.
- `Service Hours by Client` shows Municipio de Bayamon - Programa WIOA, ALDL La Montana, Departamento de la Familia, WIOA SE, and Solutions By Design first.
- `Service Hours by Project` shows Hosting Y Mantenimiento 2025-2026, DESARROLLO DE PAGINA WEB 2025, Webpage 2025, and Programa Continuo de Cuidado (CoC) first.
- Client and project bars are clickable: client bars show active projects and hours; project bars show the client, total hours, and latest related Service Records.
- Technician Dashboard behavior remains unchanged.

### Phase 28.7: Dashboard Bar Detail Improvements

- Clicking a General Dashboard client or project bar now scrolls smoothly to the detail panel.
- Client detail shows selected client, related active projects, technicians, hours by technician/project, total hours, total records, and last service date.
- Project detail shows selected project, related client, technicians, hours by technician, total hours, total records, last service date, and latest related Service Records.
- Detail tables use `en-US` number formatting and keep active-data filters.

### Dashboard Polish: Cleaner Business View

- The main Dashboard summary was simplified to five core cards: Clients, Projects, Service Records, Total Hours, and Pending Service Hours.
- Removed the Current Month Hours and Processed Hours cards from the main Dashboard summary.
- Dashboard cards and panels now use a more compact dark business style with softer borders, subtler shadows, tighter spacing, and fewer decorative effects.
- Existing General Dashboard interactions, charts, active-data filters, and Technician Dashboard behavior remain unchanged.

### Phase 29: Professional UI/UX Polish

- Added a global commercial UI polish layer while keeping the existing dark theme and application identity.
- Improved navigation tabs, cards, forms, tables, buttons, badges, modals, scrollbars, dashboard charts, and hover/focus states.
- Added subtle animations for panels, modals, cards, buttons, and dashboard bars without changing application behavior.
- This phase is visual only; no backend logic, database schema, migrated data, or ServiceSBD_20260629 data was changed.

### Phase 30: Solutions By Design Branding and EN/ES Text Pass

- Visible application branding now presents `Solutions By Design` with `Solutions By Design - Service Billing System` used where document-level context is useful.
- The repository name remains `Service-Billing-System`.
- English and Spanish interface text was improved across navigation, dashboard, forms, tables, modals, reports, users, settings, notifications, buttons, empty states, and labels.
- This phase is copy/branding only; no database, backend behavior, or migrated real data was changed.

### Phase 30.1: Complete UI Localization and Branding Cleanup

- Removed visible `Service Billing System` branding from the application UI while keeping the repository name unchanged.
- Updated the header copy to use only `Solutions By Design` branding.
- Expanded English and Spanish localization for dashboard panels, project contract states, service record statuses, invoice states, forms, tables, selects, empty states, and action labels.
- Internal values such as `Recorded`, `Billed`, `NO_CONTRACT`, `ClientID`, and `ServiceDescription` are now translated or replaced with user-facing labels where shown in the UI.
- This phase does not modify backend logic, databases, ServiceBillingDB, or ServiceSBD_20260629.

### Phase 31: General Dashboard UX Improvements

- General Dashboard bars are now interactive for service hours by month, client, project, and technician.
- Clicking any bar opens the existing dashboard detail panel, scrolls smoothly to it, and applies a subtle highlight.
- Client, project, technician, and month details now show executive summaries with hours, records, related clients/projects/technicians, last activity, and recent service records where applicable.
- Bar hover states were improved with clearer pointer behavior, subtle motion, and smoother visual transitions.
- This phase is frontend-only and does not modify Technician Dashboard, backend logic, databases, ServiceBillingDB, or ServiceSBD_20260629.

### Phase 31.1: Dashboard Section Label Localization

- Dashboard section eyebrow labels now use the shared EN/ES translation system.
- Spanish mode shows `HORAS`, `CLIENTES`, `PROYECTOS`, `TECNICOS`, `MESES`, and `REGISTROS DE SERVICIO`.
- English mode shows `HOURS`, `CLIENTS`, `PROJECTS`, `TECHNICIANS`, `MONTHS`, and `SERVICE RECORDS`.
- The Dashboard and Technician Dashboard chart labels now update correctly when the language toggle changes.
- This phase is UI text only and does not modify backend logic, databases, ServiceBillingDB, or ServiceSBD_20260629.

### Phase 32: Professional PDF Reports and Time Sheet

- Reports now includes an active PDF export for service-hour reports using the current filters: date range, technician, client, project, and status.
- The separate `Period` month filter was removed from Reports; the report period is now defined only by `Date from` and `Date to`.
- The new PDF uses a corporate Solutions By Design layout with header, client/project/invoice context, report period, generation date, executive summary cards, service breakdown, and final time sheet.
- Service breakdown records include service date, legacy order number when available, technician, clean service description, status, and total hours.
- The Time Sheet section groups records by technician and shows technician, date, client, project/department, AM/PM time entries, and total hours.
- Each PDF page includes Solutions By Design, generation date, and page numbering in the footer.
- Empty PDFs are blocked: the frontend keeps PDF disabled until a report with records is generated, and the backend returns a clear no-data message if filters produce no records.
- Numeric hour values keep the global `en-US` format, for example `10,000.50 h`.
- This phase does not modify ServiceSBD_20260629, ServiceBillingDB schema, dashboard behavior, users, clients, projects, or service record CRUD.

### Phase 32.1: Classic PDF Layout Adjustment

- The service-hours PDF was adjusted to follow the classic reference format more closely.
- Removed the large cover-style header and executive summary card section.
- The report now starts directly with a compact `Desglose de servicios prestados` header and a table with `Fecha`, `Orden`, `Tecnico`, `Descripcion`, and `Horas`.
- Full service descriptions remain visible with more width allocated to the description column.
- The service breakdown total appears at the end of the breakdown section.
- The final `Time Sheet` page uses a compact landscape table grouped by technician with `Tecnico`, `Dia`, `Cliente`, `Departamento/Proyecto`, `Manana`, `Tarde`, and `Total`.
- The PDF generator uses `assets/logo-horizontal.png` and falls back to `Solutions By Design` text if the file is missing.

### Phase 33: Manual Invoice Number for PDF Reports

- Reports now includes a temporary `Invoice #` input above the PDF export action.
- The value is not stored in the database and is only used for the current PDF export request.
- If the input contains `8878`, the PDF displays `Invoice: #8878`; if it is empty, the PDF displays `Invoice: N/A`.
- The invoice value appears on every service breakdown page and every Time Sheet page.
- The field keeps its value during the current browser session until the page reloads.
- Existing report filters, SQL, service-hour report generation, and PDF export endpoint behavior remain otherwise unchanged.

### Phase 33.1: Invoice Field Layout and Notification Cleanup

- The manual `Invoice #` field now appears as a normal Reports grid field with the other filters instead of inside the button row.
- The Reports button row now contains only `Generate report`, `Export PDF`, and `Excel (Coming soon)`.
- Admin users can delete individual notifications from the Notifications table.
- Notification deletion requires confirmation, removes only the selected notification, and refreshes the notification list and unread counter.
- Added `DELETE /api/notifications/:id`, protected by authentication and Admin role.
- No database schema, ServiceSBD_20260629 data, Reports filters, PDF export behavior, Dashboard, Users, Clients, Projects, or Service Records workflows were changed.

### Phase 33.2: Demo Record Exclusion in Reports and PDF

- Reports and service-hour PDF export now exclude known demo/test records without deleting database data.
- The exclusion criterion is explicit: records assigned to seeded demo technician emails `william@servicebilling.local` and `carlos@servicebilling.local` are omitted from report queries.
- Excluded demo records no longer appear in the Reports table, service breakdown PDF, Time Sheet PDF, or report totals.
- Report totals, total hours, pending hours, processed hours, and canceled hours are calculated after the demo exclusion.
- This does not modify ServiceSBD_20260629, ServiceBillingDB schema, Users, Clients, Projects, Service Records, Dashboard UI, or Technician Dashboard UI.

### Phase 33.3: Professional PDF Layout Improvements

- Improved PDF pagination so service records are kept together and are not split between pages.
- The service breakdown now checks row height before drawing each record and repeats the table header after page breaks.
- Long descriptions receive cleaner spacing and smaller fallback text only when needed to keep the record together.
- Description cleanup removes common legacy HTML/entity residue and isolated junk characters before rendering.
- The service breakdown total appears immediately after the last record without unnecessary blank space.
- The PDF header repeats the Solutions By Design brand, client, department/project, report title, period, and invoice context on report pages.
- Time Sheet pages keep a consistent landscape layout and include client and department/project context in the header.
- Footers continue to show page numbering as `Page X of Y`.

### Phase 33.4: Blank Last Page and Manual PDF Footer Fix

- Removed page creation that existed only to print totals or footer content.
- Service breakdown and Time Sheet totals now render on the current content page immediately after the last record.
- The final record reserves space for the total before rendering, so the total does not create a blank page or overlap content.
- PDF footers are rendered manually on existing buffered pages and include only the long date and `Page X of Y`.
- Footer rendering no longer draws extra footer lines or content that could trigger an additional page.

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
6. Use `Project Dashboard`, search by project or client, select a project, and confirm contract alerts and service-hour totals render.
7. Use `Technician Dashboard`, search by technician name, select a technician, then filter by `Project`, `Date from`, and `Date to`; confirm totals, hours by client, hours by project, and latest service records update.

## Demo Adjustment: Reports and Invoices Visibility

- The visible `Reports` screen now uses `GET /api/reports/service-hours` and `GET /api/reports/service-hours/summary`.
- Reports show technician, client, project, service date, worked hours, service description, and service record status.
- Reports no longer call legacy ticket report endpoints from the frontend.
- The temporary service sheet print/export buttons are hidden for the demo.
- PDF export is active for service-hour reports, while Excel remains visible, disabled, and labeled `Excel (Coming soon)` until spreadsheet export is implemented.
- The visible frontend navigation hides `Invoices` temporarily for demo clarity.
- Invoice APIs, backend logic, SQL tables, and existing frontend implementation remain in the codebase.

## Phase 17C: Projects Contract Frontend

- Projects now displays contract summary fields: `ContractNumber`, `ContractedHours`, `UsedHours`, `RemainingHours`, `ContractEndDate`, and `ContractStatus`.
- The Project modal includes `Contract Information` fields for Admin users.
- Calculated values remain read-only: `UsedHours`, `RemainingHours`, `HoursAlertStatus`, `ExpirationAlertStatus`, and `ContractStatus`.
- Visual alerts use green for `OK`, yellow for `LOW_HOURS`, orange for `EXPIRING_SOON`, red for exhausted/expired states, and gray for `NO_CONTRACT`.
- No monetary fields or hourly rates are shown.

## Phase 34: Manual Invoice PDF Module

- Added a visible `Invoices` tab for secretary/admin invoice preparation, separate from `Reports`.
- `Reports` remains focused on service breakdowns and Time Sheet PDFs.
- The invoice screen uses manual header fields plus dynamic invoice lines.
- Invoice lines use `Quantity`, `Description`, `Rate`, and calculated `Amount`; there is no `Item` field.
- `Amount` is calculated as `Quantity x Rate`, and the invoice `Total` is calculated from all line amounts.
- The secretary can add or remove invoice lines before generating the PDF.
- Added `POST /api/manual-invoices/pdf` to generate a professional invoice PDF from the submitted form values.
- The invoice PDF includes all dynamic lines, Solutions By Design branding, invoice metadata, Bill To, project/payment terms, total, certification text, signature lines, and page footer.
- No invoice data is stored in the database during this phase.
- The implementation does not modify `ServiceSBD_20260629`, `ServiceBillingDB`, Reports, Dashboard, Clients, Projects, Users, or Service Records.

### Manual Invoice Test Flow

1. Sign in to the application.
2. Open `Invoices`.
3. Fill the manual invoice header fields.
4. Add one or more invoice lines with quantity, description, and rate.
5. Confirm each amount and the invoice total calculate automatically.
6. Click `Generate invoice PDF`.
7. Confirm the PDF downloads and displays every line and the calculated total.

### Phase 34.1: QuickBooks-Style Dynamic Invoice Lines

- The manual invoice UI now uses a clean line table similar to QuickBooks.
- Each line supports `Quantity`, `Description`, `Rate`, and auto-calculated `Amount`.
- The `+ Add line` button adds more invoice lines, and each line can be removed.
- The PDF includes every dynamic line and calculates the total from line amounts.
- No data is stored in the database.

### Phase 34.2: Subtotal, IVU, and Optional Tax

- Manual invoices now show a professional summary with `Subtotal`, `IVU`, and `Total`.
- `Subtotal` is calculated from all line amounts.
- `Apply IVU` can be enabled or disabled.
- The default IVU rate is `11.5%`, and the rate can be changed manually.
- If IVU is disabled, tax is `0.00` and total equals subtotal.
- The PDF shows the same subtotal, IVU, and total summary.
- Calculations remain temporary/manual and are not stored in the database.

### Phase 34.3: Configurable Manual Signatures

- Manual invoices now include two configurable signature blocks.
- Each signature has manual `Name` and `Title` fields.
- The PDF renders two professional signature sections with a signature line and date line.
- Empty signature fields leave the line visible without hardcoded names.
- Signature values are not stored in the database.

### Phase 34.5: Official Solutions By Design Logo

- Added the first official Solutions By Design logo asset.
- This asset was later replaced by the transparent horizontal logo in Phase 34.8.

### Phase 34.6: Official Favicon

- Generated browser favicon assets from the official logo:
  - `assets/favicon.ico`
  - `assets/favicon-32x32.png`
  - `assets/favicon-16x16.png`
  - `assets/apple-touch-icon.png`
- Added standard favicon and Apple touch icon links to `index.html`.
- Updated the browser tab title to `Solutions By Design - Service Billing System`.
- Future favicon updates only require replacing the favicon files in `assets`.

### Phase 34.7: Official Horizontal Logo

- Added the horizontal Solutions By Design logo as the primary brand mark.
- This asset was replaced by the transparent official version in Phase 34.8.

### Phase 34.8: Transparent Official Logo Replacement

- Replaced all previous logo assets with the new transparent official logo.
- The active logo path is `assets/logo-horizontal.png`.
- Login, header, Dashboard, Reports, Invoices, Report PDF, Time Sheet PDF, Invoice PDF, and future PDF templates use the same asset.
- Browser favicon files were regenerated from the new logo.
- Old logo files were removed from `assets`.
- Future logo replacement only requires replacing `assets/logo-horizontal.png` and regenerating favicon files if the browser icon should also change.

Next phase: Phase 17D - Service Record contract warnings.

## Phase 34: Project Manager Role And Project Assignments

The application now includes a `Project Manager` role limited to projects assigned by an administrator. The relationship is stored in `dbo.UserProjectAssignments` inside `ServiceBillingDB`; the restored `ServiceSBD_20260629` database remains unchanged.

The persisted and API role identifier is `ProjectManager`; the interface displays the friendly label `Project Manager`. Session validation remains independent from project assignments, so a manager with no assigned projects can sign in and receives an empty scoped workspace instead of being signed out.

### SQL Migration

Run `phase-34-project-manager-assignments.sql` in SSMS before starting this version. The script is idempotent, updates `CK_Users_Role`, creates the junction table, foreign keys and indexes, and retains disabled assignments for audit history.

### Administration And API

- Users supports the `Project Manager` role, role filtering, assignment counts, and full assignment management for Project Manager users.
- Projects also supports assigning one or more active Project Managers from the Project editor.
- `GET /api/users/:id/project-assignments` returns active assignments for a user.
- `POST /api/users` and `PUT /api/users/:id` accept `projectIds` for Project Manager assignment changes.
- `PUT /api/users/:id/project-assignments` remains available for assignment-only updates.
- `POST /api/projects` and `PUT /api/projects/:id` accept the complete `projectManagerUserIds` array.

### Permissions And Security

- Admin retains global access and exclusive control of Users, Settings, roles, and assignments.
- Project Manager only receives Clients, Projects, Service Records, Dashboard, and Reports associated with assigned projects.
- Date, technician, client, project, and status filters remain available within that scope.
- PDF and Excel exports use the same backend assignment scope.
- Direct requests for an unassigned project or service record return `403`.
- Project Manager cannot create, edit, cancel, or process Service Records and cannot access administrative or manual invoice endpoints.
- Technician retains the existing own-record scope.

### Test Flow

1. Run `phase-34-project-manager-assignments.sql` against `ServiceBillingDB`.
2. Sign in as Admin, create a `Project Manager`, then assign that user from two Project editors.
3. Sign in as that user and confirm Projects, Clients, Dashboard, Service Records, and Reports only show related data.
4. Export PDF and Excel and confirm they only contain records from assigned projects.
5. Request `GET /api/projects/{unassigned-id}` and verify a `403` response.
6. Remove one assignment as Admin and confirm it disappears after the Project Manager session refreshes.
7. Confirm Admin still sees all data and Technician permissions remain unchanged.

### Phase 34.1: Project Editor And Multi-Project Picker

- The Project editor separates basic information, contract fields, and the contract summary in a responsive two-column layout.
- Contract summary metrics only appear while editing an existing project; projects without contract data show one `No contract` badge.
- The Projects table has one localized header per field and summarizes assigned managers as `Name +N`, with the full list available on hover or keyboard focus.
- The reusable assignment control uses searchable checkboxes, chips, a live counter, and clear selection; Ctrl or Shift is no longer required.
- Assignment updates are now performed from the Project editor.

### Phase 34.2: Bidirectional Assignment Sync

- Assignments can now be managed from both Users and Projects while using the same `dbo.UserProjectAssignments` source.
- User create/edit shows the assigned-project picker only when the selected role is `ProjectManager`.
- The user assignment picker includes searchable checkboxes, selected-project chips, a live count, select visible, and clear selection.
- The user assignment picker includes an Admin-only status filter for Active, Inactive, and All projects. Inactive historical assignments remain visible and checked, but disabled.
- Editing a Project Manager loads existing assignments, preserves them while adding new ones, and saves the complete selected project set.
- Changing a Project Manager to another role asks for confirmation before deactivating active assignments.
- Project create/update still sends the complete `projectManagerUserIds` array and refreshes Users immediately after saving.
- The Users table assignment count opens a read-only detail with client, project, project status, and assignment date, plus an Admin-only manage button.
- The Projects table shows assigned managers as `Name +N`; clicking the summary opens a compact detail modal with the full manager list and an Admin-only manage button.
- User and Project assignment updates validate Admin role, active users/projects, duplicate IDs, and persist changes in SQL transactions.
- The backend rejects new assignments to inactive projects while allowing existing active historical relations to remain selected.
- Removed managers or projects are logically deactivated in `dbo.UserProjectAssignments`; historical data is not deleted.

## Phase 35: Production Polish And Reliability

- Static asset cache management was hardened for local/demo use: HTML and API responses are served with no-cache/no-store behavior, while versioned `app.js`, `style.css`, and favicon/logo assets can be cached safely.
- `index.html` now receives an automatic asset version generated from the current frontend file timestamps, with optional override through `APP_ASSET_VERSION`.
- Main forms now warn before discarding unsaved changes in Clients, Projects, Service Records, Users, and invoice status/generation dialogs.
- Long-running actions now show consistent loading states and always restore buttons after success or failure.
- A reusable Toast notification system now appears at the top-right of the app for success, error, warning, and info feedback, with icons, dismiss buttons, auto-close, hover pause, and light/dark styling.
- Login feedback now uses safe Toast messages for successful access, invalid credentials, inactive accounts, and connection errors.
- Toast coverage now includes login/logout, client and project create/update/activate/deactivate, Project Manager assignment changes, user create/update/status changes, temporary passwords, service record save/update/cancel, report generation/no-results/PDF/Excel, manual invoice PDF generation, password recovery, and notification resolve/delete actions.
- Modals can be dismissed with `Escape`, while dirty forms still ask for confirmation.
- Reports export buttons keep their visual PDF/Excel styles while using the shared loading-state behavior.
- API responses are explicitly marked `no-store` to reduce stale session or permission data during demos.
- Existing responsive tables, sticky headers, focus-visible outlines, disabled button states, and light/dark theme variables remain aligned with the production polish pass.

## Author

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

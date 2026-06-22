# Service Billing System

Language: [English](README.MD) | [Espanol](README_ES.md)

Service Billing System is a web application being migrated from a Help Desk ticket project into a system for registering hourly service work, reviewing operational records, and preparing billing reports.

## Migration Notice

This repository has completed Phase 4 of the migration. The product identity, new SQL Server schema, database connection, and Clients API are available, while several internal modules and frontend screens still use the original ticket-based Help Desk structure.

Legacy endpoints such as `/api/tickets` remain in place temporarily to avoid breaking the application while the new service billing modules are introduced safely.

## Project Progress

- Phase 1: Identity and documentation ✅
- Phase 2: ServiceBillingDB database ✅
- Phase 3: ServiceBillingDB connection ✅
- Phase 4: Clients CRUD ✅

## Current Capabilities

- Session-based login.
- Role-based access control for `Admin` and `User`.
- User administration.
- Client CRUD API with soft deletion.
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

## Author

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

# Service Billing System

Language: [English](README.MD) | [Espanol](README_ES.md)

Service Billing System is a web application being migrated from a Help Desk ticket project into a system for registering hourly service work, reviewing operational records, and preparing billing reports.

## Migration Notice

This repository is currently in Phase 1 of the migration. The visible product identity has been updated to Service Billing System, but several internal modules, database tables, API endpoints, seed scripts, and report exports still use the original ticket-based Help Desk structure.

No database changes have been made in this phase. Existing endpoints such as `/api/tickets` and tables such as `Tickets` remain in place temporarily to avoid breaking the application while the new service billing model is introduced safely.

## Current Capabilities

- Session-based login.
- Role-based access control for `Admin` and `User`.
- User administration.
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

These accounts still use the legacy Help Desk demo values during Phase 1.

## Current Database State

Backend configuration is unchanged in Phase 1:

- Server: `localhost`
- Database: `HelpDeskDB`
- Authentication: Windows Authentication

Current tables used by the application:

- `Tickets`
- `Users`
- `Notifications`
- `PasswordResetRequests`

Planned future tables include:

- `Clients`
- `Projects`
- `ServiceRecords`
- `Invoices`
- `InvoiceLines`

## Current API State

The API remains unchanged in Phase 1.

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

## Phase 1 Scope

Completed scope for this phase:

- Project package name changed to Service Billing System.
- Visible application identity updated.
- Documentation updated to describe the migration.
- No database schema changes.
- No endpoint changes.
- No module deletion.
- No changes to login, user management, reports, or legacy ticket logic.

## Author

William Rosado Perez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

# Help Desk Ticket System

Language: [English](README.MD) | [Español](README_ES.md)

Professional Help Desk ticket management system built as a portfolio project for IT Support, Help Desk, Database Support, and Junior Developer roles.

The application allows authenticated users to create and track support tickets, while administrators can manage tickets, users, password recovery requests, notifications, and professional PDF/Excel reports using real SQL Server data.

## Features

- User authentication with session-based login.
- Role-based access control for `Admin` and `User`.
- Create support tickets linked to the authenticated user.
- Automatic ticket creation date and time from SQL Server.
- Ticket priority: `Alta`, `Media`, `Baja`.
- Ticket status: `Abierto`, `En Progreso`, `Cerrado`.
- Admin can create, edit, close, and delete tickets.
- User can create tickets and view tickets allowed for their role.
- Search tickets by user or issue description.
- Filter tickets by status and priority.
- Dashboard counters for open, in progress, and closed tickets.
- Admin user management panel.
- Secure password storage using bcrypt.
- Forgot Password request workflow.
- Admin notifications for password recovery and reports.
- Professional PDF and Excel report exports.
- Dark theme responsive design for desktop, tablet, and mobile.

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
- `style.css`: dark theme, responsive layout, cards, tables, forms, buttons, and visual states.
- `app.js`: frontend logic, API calls, translations, filters, role-based UI, and dynamic rendering.
- `server.js`: Express backend, SQL Server connection, authentication, tickets, users, notifications, forgot password, and reports API.
- `seed.js`: creates demo users, tickets, and notifications without duplicating data.
- `README.md`: project documentation.

## How to Run the Project

1. Install dependencies:

```bash
npm install
```

Additional report export dependencies:

```bash
npm install exceljs pdfkit
```

2. Run seed data:

```bash
npm run seed
```

This command creates demo users and tickets in SQL Server. It can be executed more than once because it avoids duplicating the demo data.

3. Start the server:

```bash
npm start
```

or:

```bash
node server.js
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

## Login and Roles

The system uses session-based authentication.

- `Admin`: can create, edit, close, and delete tickets. Admin users can also manage users, view forgot password requests, receive notifications, and generate reports.
- `User`: can log in, create tickets, and view the information allowed for their role.

## Tickets

Tickets are stored in SQL Server and are associated with the authenticated user session.

Each ticket includes:

- Ticket ID.
- Issue description.
- Priority.
- Status.
- Creation date and time.
- User who reported the ticket.

The ticket list supports real-time search and filters by status and priority.

## User Administration

Admin users can manage real login accounts from the `Usuarios` tab.

The user panel includes:

- User ID.
- Full name.
- Email.
- Role.
- Creation date.
- Created by audit information.

Admins can create users, edit users, assign roles, delete users, and set temporary passwords.

## Forgot Password

The login screen includes a `Forgot Password` option.

Workflow:

1. The user opens the password recovery screen.
2. The user enters their email.
3. The system saves the request in SQL Server.
4. The system creates an admin notification.
5. The user receives a confirmation message.
6. The password is never displayed publicly.

Admin users can review forgot password requests from the `Usuarios` tab under `Solicitudes Forgot Password`.

Each request shows:

- User name.
- Email.
- Request date and time.
- Status: `Pendiente` or `Resuelto`.

Recommended admin workflow:

1. User submits a forgot password request.
2. Admin opens `Notificaciones` or `Usuarios`.
3. Admin edits the user account.
4. Admin assigns a new password or temporary password.
5. Admin marks the request as `Resuelto`.
6. The notification remains as history and no longer counts as new.

## Admin Notifications

The system creates admin notifications for important actions, including:

- Forgot password requests.
- Ticket-related activity.
- User administration actions.
- Report generation and exports.

Notifications include message, type, date, status, and action state when applicable.

## Reports

The `Reportes` tab is available only for users with role `Admin`.

This module generates professional reports using the real tickets stored in SQL Server. If filters are applied, the export includes only the filtered results. If no filters are applied, the export includes all available tickets.

Available filters:

- Date from.
- Date to.
- Status.
- Priority.

To filter one exact day, use the same date in both date fields. For example, selecting `2026-06-15` as both the start and end date returns tickets created on that day.

Report exports:

- `Exportar PDF`: downloads a professional PDF report with `WR Help Desk System` branding.
- `Exportar Excel`: downloads the same real ticket data in an organized spreadsheet.

Reports include:

- Report generation date and time.
- Selected date range.
- Applied filters: status and priority.
- Total tickets.
- Statistics by status: `Abiertos`, `En Progreso`, and `Cerrados`.
- Statistics by priority: `Alta`, `Media`, and `Baja`.
- Table with `ID`, `Problema`, `Prioridad`, `Estado`, `Fecha`, and `Reportado por`.

Report endpoints:

- `GET /api/reports/tickets`: returns filtered report data as JSON.
- `GET /api/reports/tickets/pdf`: exports the report to PDF.
- `GET /api/reports/tickets/excel`: exports the report to Excel.

## Screenshots

Recommended screenshots for GitHub:

- Login screen: best for showing authentication and polished first impression.
- Admin Dashboard: best for showing metrics, role session, tabs, and notifications.
- User Dashboard: shows the regular user experience with their tickets and notifications.
- Tickets module: best for showing the main Help Desk workflow.
- Reports module: best for showing filters, report generation, and export options.
- Users module: best for showing admin account management.
- Notifications module: best for showing admin activity tracking.
- Forgot Password: shows the password recovery flow integrated into the system.

Suggested file names:

- `screenshots/login.png`
- `screenshots/admin-dashboard.png`
- `screenshots/user-dashboard.png`
- `screenshots/tickets-admin.png`
- `screenshots/reports.png`
- `screenshots/users-admin.png`
- `screenshots/notifications.png`
- `screenshots/forgot-password.png`

### Login

![Login](screenshots/login.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### User Dashboard

Shows the regular user experience with their tickets and notifications.

![User Dashboard](screenshots/user-dashboard.png)

### Tickets

![Tickets](screenshots/tickets-admin.png)

### Reports

![Reports](screenshots/reports.png)

### User Administration

![User Administration](screenshots/users-admin.png)

### Notifications

![Notifications](screenshots/notifications.png)

### Forgot Password

Shows the password recovery flow integrated into the system.

![Forgot Password](screenshots/forgot-password.png)

## Responsive Design

The interface is designed for mobile, tablet, and desktop screens.

- Tabs adapt with horizontal scrolling when needed.
- Forms use full-width layouts on small screens.
- Tables support horizontal scrolling to preserve all columns.
- Buttons are large enough for touch interactions.
- Login, dashboard, tickets, users, reports, notifications, and forgot password screens keep the same dark theme.

## SQL Server Database

Backend configuration:

- Server: `localhost`
- Database: `HelpDeskDB`
- Authentication: Windows Authentication

Main tables used by the system:

- `Tickets`
- `Users`
- `Notifications`
- `PasswordResetRequests`

Core ticket fields:

- `TicketID`
- `Description`
- `Priority`
- `Status`
- `CreatedAt`
- `CreatedByUserID`

Core user fields:

- `UserID`
- `FullName`
- `Email`
- `Password`
- `Role`
- `CreatedAt`
- `CreatedByUserID`

## API Endpoints

Tickets:

- `GET /api/tickets`: returns tickets.
- `POST /api/tickets`: creates a ticket.
- `PUT /api/tickets/:id/close`: closes a ticket.
- `DELETE /api/tickets/:id`: deletes a ticket.

Users:

- `GET /api/users`: returns users.
- `POST /api/users`: creates a user.
- `PUT /api/users/:id`: updates a user.
- `DELETE /api/users/:id`: deletes a user.

Authentication and recovery:

- `POST /api/login`: starts a session.
- `POST /api/logout`: ends a session.
- `GET /api/session`: returns the authenticated session.
- `POST /api/forgot-password`: creates a password recovery request.
- `GET /api/password-resets`: returns forgot password requests for Admin.
- `PUT /api/password-resets/:id/resolve`: marks a recovery request as resolved.

Reports:

- `GET /api/reports/tickets`: returns filtered report data.
- `GET /api/reports/tickets/pdf`: exports PDF.
- `GET /api/reports/tickets/excel`: exports Excel.

## Concepts Practiced

- Semantic HTML.
- Responsive CSS layouts.
- CSS Grid and Flexbox.
- DOM manipulation.
- JavaScript events.
- REST API integration with `fetch`.
- Express routing.
- SQL Server queries with `mssql`.
- Session-based authentication.
- Role-based authorization.
- Password hashing with bcrypt.
- Dynamic table rendering.
- PDF and Excel generation.
- Professional documentation for GitHub.

## Author

William Rosado Pérez

- B.S. Computer Science
- IT Support Specialist
- Database Support
- Puerto Rico

GitHub: [https://github.com/Puppywill](https://github.com/Puppywill)

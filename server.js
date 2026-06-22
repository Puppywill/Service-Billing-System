const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const sql = require("mssql/msnodesqlv8");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 3000;

const dbConfig = {
  server: "localhost",
  database: process.env.DB_NAME || "ServiceBillingDB",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "helpdesk-dev-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.get("/api/reports/tickets", logReportEndpoint, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const reportTickets = await getFilteredReportTickets(pool, req.query);
    await createReportNotification(pool, req, "Reporte generado");

    res.json(reportTickets);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email es obligatorio." });
  }

  try {
    const pool = await getPool();
    await ensurePasswordResetRequestsTable(pool);

    const normalizedEmail = email.trim().toLowerCase();
    const userResult = await pool.request()
      .input("Email", sql.NVarChar(180), normalizedEmail)
      .query(`
        SELECT TOP 1 UserID, FullName, Email
        FROM dbo.Users
        WHERE Email = @Email
      `);

    const user = userResult.recordset[0];
    const fullName = user?.FullName || "Usuario no registrado";
    const requestResult = await pool.request()
      .input("UserID", sql.Int, user?.UserID || null)
      .input("FullName", sql.NVarChar(120), fullName)
      .input("Email", sql.NVarChar(180), normalizedEmail)
      .query(`
        INSERT INTO dbo.PasswordResetRequests (UserID, FullName, Email, Status)
        OUTPUT inserted.RequestID, inserted.CreatedAt
        VALUES (@UserID, @FullName, @Email, 'Pendiente')
      `);

    const createdAt = requestResult.recordset[0].CreatedAt;
    const requestId = requestResult.recordset[0].RequestID;
    await createNotification(
      pool,
      null,
      `Solicitud de recuperacion #${requestId}: ${fullName} (${normalizedEmail}) - ${formatReportDate(createdAt)} - Pendiente`,
      "PASSWORD_RESET_REQUESTED"
    );

    res.status(201).json({
      message: "Solicitud recibida. Contacta a un administrador para restablecer tu contrasena."
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/password-resets", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    await ensurePasswordResetRequestsTable(pool);

    const result = await pool.request().query(`
      SELECT RequestID, UserID, FullName, Email, Status, CreatedAt, ResolvedAt
      FROM dbo.PasswordResetRequests
      ORDER BY CreatedAt DESC
    `);

    res.json(result.recordset.map(mapPasswordResetRequest));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/password-resets/:id/resolve", requireAdmin, async (req, res) => {
  const requestId = Number(req.params.id);

  if (!Number.isInteger(requestId)) {
    return res.status(400).json({ message: "ID de solicitud invalido." });
  }

  try {
    const pool = await getPool();
    await ensurePasswordResetRequestsTable(pool);

    const existingRequestResult = await pool.request()
      .input("RequestID", sql.Int, requestId)
      .query(`
        SELECT RequestID, Email
        FROM dbo.PasswordResetRequests
        WHERE RequestID = @RequestID
      `);

    const existingRequest = existingRequestResult.recordset[0];

    if (!existingRequest) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    const result = await pool.request()
      .input("RequestID", sql.Int, requestId)
      .query(`
        UPDATE dbo.PasswordResetRequests
        SET Status = 'Resuelto',
            ResolvedAt = GETDATE()
        WHERE RequestID = @RequestID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    await markPasswordResetNotificationsRead(pool, existingRequest);

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.use(express.static(__dirname));

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }

  return poolPromise;
}

async function ensurePasswordResetRequestsTable(pool) {
  await pool.request().query(`
    IF OBJECT_ID('dbo.PasswordResetRequests', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.PasswordResetRequests (
        RequestID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NULL,
        FullName NVARCHAR(120) NOT NULL,
        Email NVARCHAR(180) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        ResolvedAt DATETIME NULL
      );
    END
  `);
}

function mapTicket(record) {
  return {
    TicketID: record.TicketID,
    UserName: record.UserName,
    Description: record.Description,
    Priority: record.Priority,
    Status: record.Status,
    CreatedAt: record.CreatedAt,
    CreatedByUserID: record.CreatedByUserID,
    ReportedBy: record.ReportedBy
  };
}

function mapUser(record) {
  return {
    UserID: record.UserID,
    FullName: record.FullName,
    Email: record.Email,
    Role: record.Role,
    CreatedAt: record.CreatedAt,
    CreatedByUserID: record.CreatedByUserID,
    CreatedByFullName: record.CreatedByFullName
  };
}

function mapClient(record) {
  return {
    ClientID: record.ClientID,
    ClientName: record.ClientName,
    ContactName: record.ContactName,
    Email: record.Email,
    Phone: record.Phone,
    Address: record.AddressLine1,
    BillingName: record.BillingName,
    TaxID: record.TaxID,
    IsActive: Boolean(record.IsActive),
    CreatedAt: record.CreatedAt,
    UpdatedAt: record.UpdatedAt
  };
}

function getClientPayload(body) {
  const getValue = (camelCaseName, pascalCaseName) => body[camelCaseName] ?? body[pascalCaseName];
  const normalizeOptionalText = (value) => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    return normalized || null;
  };

  const clientName = normalizeOptionalText(getValue("clientName", "ClientName"));
  const email = normalizeOptionalText(getValue("email", "Email"));
  const isActive = getValue("isActive", "IsActive");

  return {
    clientName,
    contactName: normalizeOptionalText(getValue("contactName", "ContactName")),
    email: email ? email.toLowerCase() : null,
    phone: normalizeOptionalText(getValue("phone", "Phone")),
    address: normalizeOptionalText(getValue("address", "Address")),
    billingName: normalizeOptionalText(getValue("billingName", "BillingName")),
    taxId: normalizeOptionalText(getValue("taxId", "TaxID")),
    isActive: isActive === undefined ? null : Boolean(isActive)
  };
}

function mapNotification(record) {
  return {
    NotificationID: record.NotificationID,
    UserID: record.UserID,
    Message: record.Message,
    Type: record.Type,
    IsRead: Boolean(record.IsRead),
    CreatedAt: record.CreatedAt,
    FullName: record.FullName
  };
}

function mapPasswordResetRequest(record) {
  return {
    RequestID: record.RequestID,
    UserID: record.UserID,
    FullName: record.FullName,
    Email: record.Email,
    Status: record.Status,
    CreatedAt: record.CreatedAt,
    ResolvedAt: record.ResolvedAt
  };
}

function getSqlErrorMessage(error) {
  return error.originalError?.message || error.message || "Error desconocido de SQL Server.";
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Debes iniciar sesion." });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Debes iniciar sesion." });
  }

  if (req.session.user.Role !== "Admin") {
    return res.status(403).json({ message: "No tienes permisos de administrador." });
  }

  next();
}

function regenerateSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      req.session.user = user;
      resolve();
    });
  });
}

function logReportEndpoint(req, res, next) {
  console.log("Report endpoint called");
  next();
}

async function ensureUsersTable() {
  const pool = await getPool();

  await pool.request().query(`
    IF OBJECT_ID('dbo.Users', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(120) NOT NULL,
        Email NVARCHAR(180) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        Role NVARCHAR(20) NOT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
      );
    END

    IF COL_LENGTH('dbo.Users', 'UserID') IS NULL
      ALTER TABLE dbo.Users ADD UserID INT IDENTITY(1,1) NOT NULL;

    IF COL_LENGTH('dbo.Users', 'Name') IS NOT NULL
      ALTER TABLE dbo.Users ALTER COLUMN Name NVARCHAR(120) NULL;

    IF COL_LENGTH('dbo.Users', 'FullName') IS NULL
      ALTER TABLE dbo.Users ADD FullName NVARCHAR(120) NULL;

    IF COL_LENGTH('dbo.Users', 'Email') IS NULL
      ALTER TABLE dbo.Users ADD Email NVARCHAR(180) NULL;

    IF COL_LENGTH('dbo.Users', 'Password') IS NULL
      ALTER TABLE dbo.Users ADD Password NVARCHAR(255) NULL;

    IF COL_LENGTH('dbo.Users', 'PasswordHash') IS NOT NULL
      ALTER TABLE dbo.Users ALTER COLUMN PasswordHash NVARCHAR(255) NULL;

    IF COL_LENGTH('dbo.Users', 'Role') IS NULL
      ALTER TABLE dbo.Users ADD Role NVARCHAR(20) NULL;

    IF COL_LENGTH('dbo.Users', 'CreatedAt') IS NULL
      ALTER TABLE dbo.Users ADD CreatedAt DATETIME NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE();

    IF COL_LENGTH('dbo.Users', 'CreatedByUserID') IS NULL
      ALTER TABLE dbo.Users ADD CreatedByUserID INT NULL;

    -- Tickets is optional while the legacy module is being migrated.
    IF OBJECT_ID('dbo.Tickets', 'U') IS NOT NULL
      AND COL_LENGTH('dbo.Tickets', 'CreatedByUserID') IS NULL
      ALTER TABLE dbo.Tickets ADD CreatedByUserID INT NULL;

    IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Notifications (
        NotificationID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NULL,
        Message NVARCHAR(300) NOT NULL,
        Type NVARCHAR(40) NOT NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
      );
    END

    IF OBJECT_ID('dbo.PasswordResetRequests', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.PasswordResetRequests (
        RequestID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NULL,
        FullName NVARCHAR(120) NOT NULL,
        Email NVARCHAR(180) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        ResolvedAt DATETIME NULL
      );
    END
  `);

  const adminHash = await bcrypt.hash("Admin123!", 10);
  const userHash = await bcrypt.hash("User123!", 10);

  await pool.request()
    .input("AdminHash", sql.NVarChar(255), adminHash)
    .input("UserHash", sql.NVarChar(255), userHash)
    .query(`
      UPDATE dbo.Users
      SET FullName = COALESCE(FullName, Email, 'Usuario Help Desk'),
          Role = COALESCE(Role, 'User')
      WHERE FullName IS NULL OR Role IS NULL;

      IF COL_LENGTH('dbo.Users', 'PasswordHash') IS NOT NULL
      BEGIN
        EXEC('UPDATE dbo.Users SET Password = COALESCE(Password, PasswordHash) WHERE Password IS NULL');
      END

      IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = 'admin@helpdesk.local')
      BEGIN
        INSERT INTO dbo.Users (FullName, Email, Password, Role)
        VALUES ('Administrador Help Desk', 'admin@helpdesk.local', @AdminHash, 'Admin');
      END

      IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = 'user@helpdesk.local')
      BEGIN
        INSERT INTO dbo.Users (FullName, Email, Password, Role)
        VALUES ('Usuario Help Desk', 'user@helpdesk.local', @UserHash, 'User');
      END
    `);
}

async function createNotification(pool, userId, message, type) {
  await pool.request()
    .input("UserID", sql.Int, userId || null)
    .input("Message", sql.NVarChar(300), message)
    .input("Type", sql.NVarChar(40), type)
    .query(`
      INSERT INTO dbo.Notifications (UserID, Message, Type)
      VALUES (@UserID, @Message, @Type)
    `);
}

async function createReportNotification(pool, req, messagePrefix) {
  const adminUser = await getUserById(pool, Number(req.session.user.UserID));
  const adminName = adminUser?.FullName || req.session.user.FullName || "Administrador";

  await createNotification(
    pool,
    Number(req.session.user.UserID),
    `${messagePrefix} por ${adminName}`,
    "REPORT_GENERATED"
  );
}

async function getTicketById(pool, ticketId) {
  const result = await pool.request()
    .input("TicketID", sql.Int, ticketId)
    .query(`
      SELECT
        t.TicketID,
        COALESCE(reporter.FullName, t.UserName) AS UserName,
        t.Description,
        t.Priority,
        t.Status,
        t.CreatedAt,
        t.CreatedByUserID,
        reporter.FullName AS ReportedBy
      FROM Tickets t
      LEFT JOIN dbo.Users reporter ON reporter.UserID = t.CreatedByUserID
      WHERE t.TicketID = @TicketID
    `);

  return result.recordset[0] ? mapTicket(result.recordset[0]) : null;
}

async function getUserById(pool, userId) {
  const result = await pool.request()
    .input("UserID", sql.Int, userId)
    .query(`
      SELECT
        u.UserID,
        u.FullName,
        u.Email,
        u.Role,
        u.CreatedAt,
        u.CreatedByUserID,
        creator.FullName AS CreatedByFullName
      FROM dbo.Users u
      LEFT JOIN dbo.Users creator ON creator.UserID = u.CreatedByUserID
      WHERE u.UserID = @UserID
    `);

  return result.recordset[0] ? mapUser(result.recordset[0]) : null;
}

async function getClientById(pool, clientId, activeOnly = true) {
  const result = await pool.request()
    .input("ClientID", sql.Int, clientId)
    .query(`
      SELECT
        ClientID,
        ClientName,
        ContactName,
        Email,
        Phone,
        AddressLine1,
        BillingName,
        TaxID,
        IsActive,
        CreatedAt,
        UpdatedAt
      FROM dbo.Clients
      WHERE ClientID = @ClientID
        ${activeOnly ? "AND IsActive = 1" : ""}
    `);

  return result.recordset[0] ? mapClient(result.recordset[0]) : null;
}

function isValidDateString(value) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getFilteredReportTickets(pool, filters) {
  const { from, to, status, priority } = filters;

  if (!isValidDateString(from) || !isValidDateString(to)) {
    const error = new Error("Formato de fecha invalido. Usa YYYY-MM-DD.");
    error.statusCode = 400;
    throw error;
  }

  const request = pool.request();
  const whereClauses = [];

  if (from) {
    request.input("FromDate", sql.Date, from);
    whereClauses.push("t.CreatedAt >= @FromDate");
  }

  if (to) {
    request.input("ToDate", sql.Date, to);
    whereClauses.push("t.CreatedAt < DATEADD(day, 1, @ToDate)");
  }

  if (status) {
    request.input("Status", sql.NVarChar(30), status);
    whereClauses.push("t.Status = @Status");
  }

  if (priority) {
    request.input("Priority", sql.NVarChar(20), priority);
    whereClauses.push("t.Priority = @Priority");
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const result = await request.query(`
    SELECT
      t.TicketID,
      COALESCE(reporter.FullName, t.UserName) AS UserName,
      t.Description,
      t.Priority,
      t.Status,
      t.CreatedAt,
      t.CreatedByUserID,
      reporter.FullName AS ReportedBy
    FROM Tickets t
    LEFT JOIN dbo.Users reporter ON reporter.UserID = t.CreatedByUserID
    ${whereSql}
    ORDER BY t.CreatedAt DESC
  `);

  return result.recordset.map(mapTicket);
}

function formatReportDate(value) {
  return value ? new Date(value).toLocaleString("es-BO") : "";
}

function formatReportDateRange(filters) {
  const from = filters.from || "Sin fecha inicial";
  const to = filters.to || "Sin fecha final";

  return `${from} - ${to}`;
}

function getReportedBy(ticket) {
  return ticket.ReportedBy || `Usuario #${ticket.CreatedByUserID || ""}`.trim();
}

function getReportStats(tickets) {
  return {
    total: tickets.length,
    abiertos: tickets.filter((ticket) => ticket.Status === "Abierto").length,
    enProgreso: tickets.filter((ticket) => ticket.Status === "En Progreso").length,
    cerrados: tickets.filter((ticket) => ticket.Status === "Cerrado").length,
    alta: tickets.filter((ticket) => ticket.Priority === "Alta").length,
    media: tickets.filter((ticket) => ticket.Priority === "Media").length,
    baja: tickets.filter((ticket) => ticket.Priority === "Baja").length
  };
}

function getReportRows(tickets) {
  return tickets.map((ticket) => ({
    id: ticket.TicketID,
    problem: ticket.Description,
    priority: ticket.Priority,
    status: ticket.Status,
    date: formatReportDate(ticket.CreatedAt),
    reportedBy: getReportedBy(ticket)
  }));
}

function getPasswordResetRequestIdFromMessage(message) {
  const match = message.match(/#(\d+)/);
  return match ? Number(match[1]) : null;
}

function getEmailFromNotificationMessage(message) {
  const match = message.match(/\(([^)@\s]+@[^)\s]+)\)/);
  return match ? match[1].trim().toLowerCase() : null;
}

async function markPasswordResetNotificationsRead(pool, request) {
  const requestIdPattern = request.RequestID ? `%#${request.RequestID}:%` : null;
  const emailPattern = request.Email ? `%(${request.Email})%` : null;
  const dbRequest = pool.request();
  const whereClauses = [];

  if (requestIdPattern) {
    dbRequest.input("RequestIdPattern", sql.NVarChar(60), requestIdPattern);
    whereClauses.push("Message LIKE @RequestIdPattern");
  }

  if (emailPattern) {
    dbRequest.input("EmailPattern", sql.NVarChar(220), emailPattern);
    whereClauses.push("Message LIKE @EmailPattern");
  }

  if (whereClauses.length === 0) {
    return;
  }

  await dbRequest.query(`
    UPDATE dbo.Notifications
    SET IsRead = 1,
        Message = REPLACE(Message, 'Pendiente', 'Resuelto')
    WHERE Type = 'PASSWORD_RESET_REQUESTED'
      AND (${whereClauses.join(" OR ")})
  `);
}

app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT 1 AS connectionTest");

    res.json({
      success: true,
      result: result.recordset[0]
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({
      success: false,
      message: getSqlErrorMessage(error)
    });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son obligatorios." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("Email", sql.NVarChar(180), email.trim().toLowerCase())
      .query(`
        SELECT UserID, FullName, Email, Password, Role
        FROM dbo.Users
        WHERE Email = @Email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    const user = result.recordset[0];
    const passwordMatches = await bcrypt.compare(password, user.Password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    await regenerateSession(req, mapUser(user));
    res.json({ user: req.session.user });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesion." });
  }
});

app.post("/api/logout", requireAuth, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al cerrar sesion." });
    }

    res.clearCookie("connect.sid");
    res.status(204).send();
  });
});

app.get("/api/me", async (req, res) => {
  if (!req.session.user) {
    return res.json({ user: null });
  }

  try {
    const pool = await getPool();
    const sessionUser = await getUserById(pool, Number(req.session.user.UserID));

    if (!sessionUser) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    req.session.user = sessionUser;
    res.json({ user: sessionUser });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al verificar sesion." });
  }
});

app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    const isAdmin = req.session.user.Role === "Admin";
    let whereClause = "";

    if (!isAdmin) {
      request.input("UserID", sql.Int, Number(req.session.user.UserID));
      whereClause = "WHERE n.UserID = @UserID";
    }

    const result = await request.query(`
      SELECT TOP 100
        n.NotificationID,
        n.UserID,
        n.Message,
        n.Type,
        n.IsRead,
        n.CreatedAt,
        u.FullName
      FROM dbo.Notifications n
      LEFT JOIN dbo.Users u ON u.UserID = n.UserID
      ${whereClause}
      ORDER BY n.CreatedAt DESC
    `);

    res.json(result.recordset.map(mapNotification));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener notificaciones." });
  }
});

app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId)) {
    return res.status(400).json({ message: "ID de notificacion invalido." });
  }

  try {
    const pool = await getPool();
    const request = pool.request()
      .input("NotificationID", sql.Int, notificationId);

    let whereClause = "NotificationID = @NotificationID";

    if (req.session.user.Role !== "Admin") {
      request.input("UserID", sql.Int, Number(req.session.user.UserID));
      whereClause += " AND UserID = @UserID";
    }

    const result = await request.query(`
      UPDATE dbo.Notifications
      SET IsRead = 1
      WHERE ${whereClause}
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Notificacion no encontrada." });
    }

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al marcar notificacion." });
  }
});

app.put("/api/notifications/:id/resolve-password-reset", requireAdmin, async (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId)) {
    return res.status(400).json({ message: "ID de notificacion invalido." });
  }

  try {
    const pool = await getPool();
    await ensurePasswordResetRequestsTable(pool);

    const notificationResult = await pool.request()
      .input("NotificationID", sql.Int, notificationId)
      .query(`
        SELECT NotificationID, Message, Type
        FROM dbo.Notifications
        WHERE NotificationID = @NotificationID
          AND Type = 'PASSWORD_RESET_REQUESTED'
      `);

    const notification = notificationResult.recordset[0];

    if (!notification) {
      return res.status(404).json({ message: "Notificacion no encontrada." });
    }

    const requestId = getPasswordResetRequestIdFromMessage(notification.Message);
    const email = getEmailFromNotificationMessage(notification.Message);
    let linkedRequest;

    if (requestId) {
      const linkedRequestResult = await pool.request()
        .input("RequestID", sql.Int, requestId)
        .query(`
          SELECT RequestID, Email, Status
          FROM dbo.PasswordResetRequests
          WHERE RequestID = @RequestID
        `);
      linkedRequest = linkedRequestResult.recordset[0];
    }

    if (!linkedRequest && email) {
      const linkedRequestResult = await pool.request()
        .input("Email", sql.NVarChar(180), email)
        .query(`
          SELECT TOP 1 RequestID, Email, Status
          FROM dbo.PasswordResetRequests
          WHERE Email = @Email
          ORDER BY CreatedAt DESC
        `);
      linkedRequest = linkedRequestResult.recordset[0];
    }

    if (!linkedRequest) {
      await pool.request()
        .input("NotificationID", sql.Int, notificationId)
        .query(`
          UPDATE dbo.Notifications
          SET IsRead = 1,
              Message = REPLACE(Message, 'Pendiente', 'Resuelto')
          WHERE NotificationID = @NotificationID
        `);

      return res.status(204).send();
    }

    const updateResult = await pool.request()
      .input("RequestID", sql.Int, linkedRequest.RequestID)
      .query(`
        UPDATE dbo.PasswordResetRequests
        SET Status = 'Resuelto',
            ResolvedAt = COALESCE(ResolvedAt, GETDATE())
        WHERE RequestID = @RequestID
      `);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }

    await markPasswordResetNotificationsRead(pool, linkedRequest);

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/users", requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        u.UserID,
        u.FullName,
        u.Email,
        u.Role,
        u.CreatedAt,
        u.CreatedByUserID,
        creator.FullName AS CreatedByFullName
      FROM dbo.Users u
      LEFT JOIN dbo.Users creator ON creator.UserID = u.CreatedByUserID
      ORDER BY u.CreatedAt DESC
    `);

    res.json(result.recordset.map(mapUser));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
});

app.post("/api/users", requireAdmin, async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  if (!["Admin", "User"].includes(role)) {
    return res.status(400).json({ message: "Rol invalido." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const pool = await getPool();
    const result = await pool.request()
      .input("FullName", sql.NVarChar(120), fullName.trim())
      .input("Email", sql.NVarChar(180), email.trim().toLowerCase())
      .input("Password", sql.NVarChar(255), passwordHash)
      .input("Role", sql.NVarChar(20), role)
      .input("CreatedByUserID", sql.Int, Number(req.session.user.UserID))
      .query(`
        INSERT INTO dbo.Users (FullName, Email, Password, Role, CreatedByUserID)
        OUTPUT inserted.UserID
        VALUES (@FullName, @Email, @Password, @Role, @CreatedByUserID)
      `);

    const createdUser = await getUserById(pool, result.recordset[0].UserID);
    await createNotification(
      pool,
      createdUser.UserID,
      `Usuario creado: ${createdUser.FullName}`,
      "USER_CREATED"
    );
    res.status(201).json(createdUser);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe un usuario con ese email." });
    }

    res.status(500).json({ message: "Error al crear usuario." });
  }
});

app.put("/api/users/:id", requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  const { fullName, email, password, role } = req.body;

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "ID de usuario invalido." });
  }

  if (!fullName || !email || !role) {
    return res.status(400).json({ message: "Nombre, email y rol son obligatorios." });
  }

  if (!["Admin", "User"].includes(role)) {
    return res.status(400).json({ message: "Rol invalido." });
  }

  try {
    const pool = await getPool();
    const request = pool.request()
      .input("UserID", sql.Int, userId)
      .input("FullName", sql.NVarChar(120), fullName.trim())
      .input("Email", sql.NVarChar(180), email.trim().toLowerCase())
      .input("Role", sql.NVarChar(20), role);

    let passwordUpdate = "";

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      request.input("Password", sql.NVarChar(255), passwordHash);
      passwordUpdate = ", Password = @Password";
    }

    const result = await request.query(`
      UPDATE dbo.Users
      SET FullName = @FullName,
          Email = @Email,
          Role = @Role
          ${passwordUpdate}
      WHERE UserID = @UserID
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const updatedUser = await getUserById(pool, userId);
    await createNotification(
      pool,
      updatedUser.UserID,
      `Usuario editado: ${updatedUser.FullName}`,
      "USER_UPDATED"
    );

    if (Number(req.session.user.UserID) === Number(updatedUser.UserID)) {
      req.session.user = updatedUser;
    }

    res.json(updatedUser);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe un usuario con ese email." });
    }

    res.status(500).json({ message: "Error al editar usuario." });
  }
});

app.delete("/api/users/:id", requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "ID de usuario invalido." });
  }

  if (req.session.user.UserID === userId) {
    return res.status(400).json({ message: "No puedes eliminar tu propio usuario." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM dbo.Users WHERE UserID = @UserID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al eliminar usuario." });
  }
});

app.get("/api/clients", requireAuth, async (req, res) => {
  const search = String(req.query.search || req.query.q || "").trim().slice(0, 180);

  try {
    const pool = await getPool();
    const request = pool.request();
    let searchClause = "";

    if (search) {
      request.input("Search", sql.NVarChar(400), `%${search}%`);
      searchClause = `
        AND (
          ClientName LIKE @Search
          OR Email LIKE @Search
          OR Phone LIKE @Search
        )
      `;
    }

    const result = await request.query(`
      SELECT
        ClientID,
        ClientName,
        ContactName,
        Email,
        Phone,
        AddressLine1,
        BillingName,
        TaxID,
        IsActive,
        CreatedAt,
        UpdatedAt
      FROM dbo.Clients
      WHERE IsActive = 1
      ${searchClause}
      ORDER BY ClientName ASC
    `);

    res.json(result.recordset.map(mapClient));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener clientes." });
  }
});

app.get("/api/clients/:id", requireAuth, async (req, res) => {
  const clientId = Number(req.params.id);

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return res.status(400).json({ message: "ID de cliente invalido." });
  }

  try {
    const pool = await getPool();
    const client = await getClientById(pool, clientId);

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado." });
    }

    res.json(client);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener el cliente." });
  }
});

app.post("/api/clients", requireAdmin, async (req, res) => {
  const client = getClientPayload(req.body || {});

  if (!client.clientName) {
    return res.status(400).json({ message: "ClientName es obligatorio." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("ClientName", sql.NVarChar(160), client.clientName)
      .input("ContactName", sql.NVarChar(120), client.contactName)
      .input("Email", sql.NVarChar(180), client.email)
      .input("Phone", sql.NVarChar(40), client.phone)
      .input("AddressLine1", sql.NVarChar(180), client.address)
      .input("BillingName", sql.NVarChar(180), client.billingName)
      .input("TaxID", sql.NVarChar(50), client.taxId)
      .input("IsActive", sql.Bit, client.isActive ?? true)
      .input("CreatedByUserID", sql.Int, Number(req.session.user.UserID))
      .query(`
        INSERT INTO dbo.Clients (
          ClientName,
          ContactName,
          Email,
          Phone,
          AddressLine1,
          BillingName,
          TaxID,
          IsActive,
          CreatedByUserID
        )
        OUTPUT inserted.ClientID
        VALUES (
          @ClientName,
          @ContactName,
          @Email,
          @Phone,
          @AddressLine1,
          @BillingName,
          @TaxID,
          @IsActive,
          @CreatedByUserID
        )
      `);

    const createdClient = await getClientById(pool, result.recordset[0].ClientID, false);
    res.status(201).json(createdClient);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe un cliente con ese nombre." });
    }

    res.status(500).json({ message: "Error al crear el cliente." });
  }
});

app.put("/api/clients/:id", requireAdmin, async (req, res) => {
  const clientId = Number(req.params.id);
  const client = getClientPayload(req.body || {});

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return res.status(400).json({ message: "ID de cliente invalido." });
  }

  if (!client.clientName) {
    return res.status(400).json({ message: "ClientName es obligatorio." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("ClientID", sql.Int, clientId)
      .input("ClientName", sql.NVarChar(160), client.clientName)
      .input("ContactName", sql.NVarChar(120), client.contactName)
      .input("Email", sql.NVarChar(180), client.email)
      .input("Phone", sql.NVarChar(40), client.phone)
      .input("AddressLine1", sql.NVarChar(180), client.address)
      .input("BillingName", sql.NVarChar(180), client.billingName)
      .input("TaxID", sql.NVarChar(50), client.taxId)
      .input("IsActive", sql.Bit, client.isActive)
      .query(`
        UPDATE dbo.Clients
        SET ClientName = @ClientName,
            ContactName = @ContactName,
            Email = @Email,
            Phone = @Phone,
            AddressLine1 = @AddressLine1,
            BillingName = @BillingName,
            TaxID = @TaxID,
            IsActive = COALESCE(@IsActive, IsActive),
            UpdatedAt = SYSUTCDATETIME()
        WHERE ClientID = @ClientID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Cliente no encontrado." });
    }

    const updatedClient = await getClientById(pool, clientId, false);
    res.json(updatedClient);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe un cliente con ese nombre." });
    }

    res.status(500).json({ message: "Error al editar el cliente." });
  }
});

app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
  const clientId = Number(req.params.id);

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return res.status(400).json({ message: "ID de cliente invalido." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("ClientID", sql.Int, clientId)
      .query(`
        UPDATE dbo.Clients
        SET IsActive = 0,
            UpdatedAt = SYSUTCDATETIME()
        WHERE ClientID = @ClientID
          AND IsActive = 1
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Cliente activo no encontrado." });
    }

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al desactivar el cliente." });
  }
});

app.get("/api/tickets", requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const sessionUser = await getUserById(pool, Number(req.session.user.UserID));

    if (!sessionUser) {
      return res.status(401).json({ message: "Sesion invalida. Inicia sesion nuevamente." });
    }

    req.session.user = sessionUser;
    const request = pool.request();
    const isAdmin = sessionUser.Role === "Admin";
    let whereClause = "";

    if (!isAdmin) {
      request.input("CreatedByUserID", sql.Int, Number(sessionUser.UserID));
      whereClause = "WHERE t.CreatedByUserID = @CreatedByUserID";
    }

    const result = await request.query(`
      SELECT
        t.TicketID,
        COALESCE(reporter.FullName, t.UserName) AS UserName,
        t.Description,
        t.Priority,
        t.Status,
        t.CreatedAt,
        t.CreatedByUserID,
        reporter.FullName AS ReportedBy
      FROM Tickets t
      LEFT JOIN dbo.Users reporter ON reporter.UserID = t.CreatedByUserID
      ${whereClause}
      ORDER BY t.CreatedAt DESC
    `);

    res.json(result.recordset.map(mapTicket));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener tickets." });
  }
});

app.post("/api/tickets", requireAuth, async (req, res) => {
  const { description, priority, status } = req.body;

  if (!description || !priority) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const pool = await getPool();
    const sessionUser = await getUserById(pool, Number(req.session.user.UserID));

    if (!sessionUser) {
      return res.status(401).json({ message: "Sesion invalida. Inicia sesion nuevamente." });
    }

    req.session.user = sessionUser;
    const createdByUserId = Number(sessionUser.UserID);
    const ticketUserName = sessionUser.FullName;
    const ticketStatus = sessionUser.Role === "Admin" ? status : "Abierto";

    if (!ticketUserName || !ticketStatus) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const result = await pool.request()
      .input("UserName", sql.NVarChar(120), ticketUserName)
      .input("Description", sql.NVarChar(sql.MAX), description.trim())
      .input("Priority", sql.NVarChar(20), priority)
      .input("Status", sql.NVarChar(30), ticketStatus)
      .input("CreatedByUserID", sql.Int, createdByUserId)
      .query(`
        INSERT INTO Tickets (UserName, Description, Priority, Status, CreatedByUserID)
        OUTPUT inserted.TicketID
        VALUES (@UserName, @Description, @Priority, @Status, @CreatedByUserID)
      `);

    const createdTicket = await getTicketById(pool, result.recordset[0].TicketID);
    await createNotification(
      pool,
      createdByUserId,
      `Ticket creado: #${createdTicket.TicketID} - ${createdTicket.Description}`,
      "TICKET_CREATED"
    );
    res.status(201).json(createdTicket);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al crear ticket." });
  }
});

app.put("/api/tickets/:id", requireAdmin, async (req, res) => {
  const ticketId = Number(req.params.id);
  const { description, priority, status } = req.body;

  if (!Number.isInteger(ticketId)) {
    return res.status(400).json({ message: "ID de ticket invalido." });
  }

  if (!description || !priority || !status) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("TicketID", sql.Int, ticketId)
      .input("Description", sql.NVarChar(sql.MAX), description)
      .input("Priority", sql.NVarChar(20), priority)
      .input("Status", sql.NVarChar(30), status)
      .query(`
        UPDATE Tickets
        SET Description = @Description,
            Priority = @Priority,
            Status = @Status
        WHERE TicketID = @TicketID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Ticket no encontrado." });
    }

    const updatedTicket = await getTicketById(pool, ticketId);
    res.json(updatedTicket);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al editar ticket." });
  }
});

app.put("/api/tickets/:id/close", requireAdmin, async (req, res) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId)) {
    return res.status(400).json({ message: "ID de ticket invalido." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("TicketID", sql.Int, ticketId)
      .query(`
        UPDATE Tickets
        SET Status = 'Cerrado'
        WHERE TicketID = @TicketID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Ticket no encontrado." });
    }

    const closedTicket = await getTicketById(pool, ticketId);
    await createNotification(
      pool,
      closedTicket.CreatedByUserID,
      `Ticket cerrado: #${closedTicket.TicketID} - ${closedTicket.Description}`,
      "TICKET_CLOSED"
    );
    res.json(closedTicket);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al cerrar ticket." });
  }
});

app.delete("/api/tickets/:id", requireAdmin, async (req, res) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId)) {
    return res.status(400).json({ message: "ID de ticket invalido." });
  }

  try {
    const pool = await getPool();
    const ticket = await getTicketById(pool, ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado." });
    }

    const result = await pool.request()
      .input("TicketID", sql.Int, ticketId)
      .query("DELETE FROM Tickets WHERE TicketID = @TicketID");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Ticket no encontrado." });
    }

    await createNotification(
      pool,
      ticket.CreatedByUserID,
      `Ticket eliminado: #${ticket.TicketID} - ${ticket.Description}`,
      "TICKET_DELETED"
    );

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al eliminar ticket." });
  }
});

app.get("/api/reports/tickets/excel", logReportEndpoint, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const reportTickets = await getFilteredReportTickets(pool, req.query);
    await createReportNotification(pool, req, "Reporte Excel generado");
    const reportRows = getReportRows(reportTickets);
    const stats = getReportStats(reportTickets);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tickets");

    workbook.creator = "Help Desk Ticket System";
    workbook.created = new Date();

    worksheet.columns = [
      { key: "ID", width: 12 },
      { key: "Problem", width: 54 },
      { key: "Priority", width: 16 },
      { key: "Status", width: 18 },
      { key: "Date", width: 24 },
      { key: "ReportedBy", width: 26 }
    ];

    worksheet.mergeCells("A1:B4");
    worksheet.getCell("A1").value = "WR";
    worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
    worksheet.getCell("A1").font = { bold: true, size: 32, color: { argb: "FFFFFFFF" } };
    worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF06213F" } };

    worksheet.mergeCells("C1:F1");
    worksheet.getCell("C1").value = "Help Desk Ticket Report";
    worksheet.getCell("C1").font = { bold: true, size: 20, color: { argb: "FF06213F" } };

    worksheet.mergeCells("C2:F2");
    worksheet.getCell("C2").value = "William Rosado - IT Support Dashboard";
    worksheet.getCell("C2").font = { size: 11, color: { argb: "FF475569" } };

    worksheet.mergeCells("C3:F3");
    worksheet.getCell("C3").value = `Generated: ${formatReportDate(new Date())} | Date range: ${formatReportDateRange(req.query)}`;
    worksheet.getCell("C3").font = { size: 10, color: { argb: "FF64748B" } };

    worksheet.mergeCells("C4:F4");
    worksheet.getCell("C4").value = `Filters: Status ${req.query.status || "Todos"} | Priority ${req.query.priority || "Todas"}`;
    worksheet.getCell("C4").font = { size: 10, color: { argb: "FF64748B" } };

    worksheet.addRow([]);
    const statsTitle = worksheet.addRow(["Resumen general"]);
    worksheet.mergeCells(`A${statsTitle.number}:F${statsTitle.number}`);
    statsTitle.getCell(1).font = { bold: true, size: 14, color: { argb: "FF06213F" } };
    statsTitle.getCell(1).alignment = { horizontal: "center" };

    const statsHeader = worksheet.addRow(["Total", "Abiertos", "En progreso", "Cerrados", "Alta prioridad", "Media / Baja"]);
    const statsValues = worksheet.addRow([stats.total, stats.abiertos, stats.enProgreso, stats.cerrados, stats.alta, `${stats.media} / ${stats.baja}`]);

    [statsHeader, statsValues].forEach((row, rowIndex) => {
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { bold: rowIndex === 0, color: { argb: rowIndex === 0 ? "FFFFFFFF" : "FF0F172A" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowIndex === 0 ? "FF06213F" : "FFF8FAFC" }
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFCBD5E1" } },
          left: { style: "thin", color: { argb: "FFCBD5E1" } },
          bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
          right: { style: "thin", color: { argb: "FFCBD5E1" } }
        };
      });
    });

    worksheet.addRow([]);
    const headerRow = worksheet.addRow(["ID", "Problema", "Prioridad", "Estado", "Fecha", "Reportado por"]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF06213F" } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });

    reportRows.forEach((ticket, index) => {
      const row = worksheet.addRow([
        ticket.id,
        ticket.problem,
        ticket.priority,
        ticket.status,
        ticket.date,
        ticket.reportedBy
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } }
        };
        cell.alignment = { vertical: "top", wrapText: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: index % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" }
        };
      });
    });

    worksheet.eachRow((row) => {
      row.height = Math.max(row.height || 18, 20);
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 12;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? String(cell.value) : "";
        maxLength = Math.max(maxLength, value.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, column.width || 12), 60);
    });

    worksheet.views = [{ state: "frozen", ySplit: headerRow.number }];
    worksheet.autoFilter = `A${headerRow.number}:F${headerRow.number}`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=helpdesk-ticket-report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.get("/api/reports/tickets/pdf", logReportEndpoint, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const reportTickets = await getFilteredReportTickets(pool, req.query);
    await createReportNotification(pool, req, "Reporte PDF generado");
    const reportRows = getReportRows(reportTickets);
    const stats = getReportStats(reportTickets);
    const document = new PDFDocument({ margin: 34, size: "LETTER", bufferPages: true });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=helpdesk-ticket-report.pdf");

    document.pipe(res);

    const pageWidth = document.page.width;
    const pageHeight = document.page.height;
    const margin = 34;
    const contentWidth = pageWidth - margin * 2;
    const navy = "#06213f";
    const navyDark = "#02142b";
    const teal = "#14b8a6";
    const slate = "#0f172a";
    const muted = "#64748b";
    const line = "#dbe3ef";
    const red = "#ef4444";
    const orange = "#f59e0b";
    const green = "#22a447";
    const blue = "#2563eb";
    const gray = "#64748b";

    const columns = [
      { label: "ID", x: margin, width: 34 },
      { label: "PROBLEMA", x: 68, width: 192 },
      { label: "PRIORIDAD", x: 260, width: 70 },
      { label: "ESTADO", x: 330, width: 82 },
      { label: "FECHA", x: 412, width: 92 },
      { label: "REPORTADO POR", x: 504, width: 74 }
    ];

    const getPriorityColor = (priority) => {
      if (priority === "Alta") return red;
      if (priority === "Media") return orange;
      return green;
    };

    const getStatusColor = (status) => {
      if (status === "Cerrado") return green;
      if (status === "En Progreso") return orange;
      return blue;
    };

    const drawPill = (text, x, y, width, color) => {
      document.roundedRect(x, y, width, 16, 4).fill(color);
      document.fillColor("#ffffff").font("Helvetica-Bold").fontSize(7).text(text, x + 4, y + 4, {
        width: width - 8,
        align: "center"
      });
    };

    const drawWrLogo = (x, y, width, color = navy) => {
      document.save();
      document.fillColor(color).font("Helvetica-Bold").fontSize(width * 0.42).text("WR", x, y, {
        width,
        align: "center",
        lineBreak: false
      });
      document.fillColor(slate).font("Helvetica-Bold").fontSize(Math.max(4.5, width * 0.075)).text("HELP DESK SYSTEM", x, y + width * 0.42, {
        width,
        align: "center",
        lineBreak: false
      });
      document.restore();
    };

    const drawMetaIcon = (type, x, y, color) => {
      document.circle(x, y, 15).fill(color);
      document.save();
      document.strokeColor("#ffffff").fillColor("#ffffff").lineWidth(1.2);

      if (type === "system") {
        document.circle(x - 4, y - 3, 3).stroke();
        document.circle(x + 5, y - 3, 3).stroke();
        document.moveTo(x - 10, y + 7).quadraticCurveTo(x - 4, y + 1, x + 2, y + 7).stroke();
        document.moveTo(x, y + 7).quadraticCurveTo(x + 5, y + 1, x + 10, y + 7).stroke();
      }

      if (type === "date") {
        document.roundedRect(x - 7, y - 7, 14, 14, 2).stroke();
        document.moveTo(x - 7, y - 2).lineTo(x + 7, y - 2).stroke();
        document.moveTo(x - 3, y - 10).lineTo(x - 3, y - 5).stroke();
        document.moveTo(x + 3, y - 10).lineTo(x + 3, y - 5).stroke();
        document.circle(x - 3, y + 3, 1).fill();
        document.circle(x + 3, y + 3, 1).fill();
      }

      if (type === "user") {
        document.circle(x, y - 4, 4).stroke();
        document.moveTo(x - 8, y + 8).quadraticCurveTo(x, y, x + 8, y + 8).stroke();
      }

      if (type === "total") {
        document.roundedRect(x - 6, y - 8, 12, 16, 2).stroke();
        document.moveTo(x - 3, y - 3).lineTo(x + 4, y - 3).stroke();
        document.moveTo(x - 3, y + 2).lineTo(x + 4, y + 2).stroke();
      }

      document.restore();
    };

    const drawSummaryIcon = (type, x, y, color) => {
      document.save();
      document.strokeColor(color).fillColor(color).lineWidth(1.5);

      if (type === "document") {
        document.roundedRect(x - 6, y - 8, 12, 16, 2).stroke();
        document.moveTo(x - 3, y - 3).lineTo(x + 4, y - 3).stroke();
        document.moveTo(x - 3, y + 2).lineTo(x + 4, y + 2).stroke();
      }

      if (type === "open") {
        document.roundedRect(x - 7, y - 6, 14, 12, 2).stroke();
        document.moveTo(x - 4, y - 1).lineTo(x + 4, y - 1).stroke();
      }

      if (type === "progress") {
        document.circle(x, y, 8).stroke();
        document.moveTo(x - 4, y).lineTo(x + 4, y).stroke();
      }

      if (type === "closed") {
        document.circle(x, y, 8).stroke();
        document.moveTo(x - 4, y).lineTo(x - 1, y + 4).lineTo(x + 5, y - 5).stroke();
      }

      if (type === "high") {
        document.circle(x, y, 8).stroke();
        document.moveTo(x, y + 5).lineTo(x, y - 5).stroke();
        document.moveTo(x - 4, y - 1).lineTo(x, y - 5).lineTo(x + 4, y - 1).stroke();
      }

      if (type === "medium") {
        document.circle(x, y, 8).stroke();
        document.moveTo(x - 5, y).lineTo(x + 5, y).stroke();
      }

      if (type === "low") {
        document.circle(x, y, 8).stroke();
        document.moveTo(x, y - 5).lineTo(x, y + 5).stroke();
        document.moveTo(x - 4, y + 1).lineTo(x, y + 5).lineTo(x + 4, y + 1).stroke();
      }

      document.restore();
    };

    const drawHeader = (includeMeta = true) => {
      document.save();
      document.rect(0, 0, pageWidth, 112).fill(navyDark);
      document.rect(230, 0, pageWidth - 230, 112).fill(navy);
      document.polygon([0, 0], [245, 0], [164, 112], [0, 112]).fill("#ffffff");
      document.polygon([215, 0], [248, 0], [166, 112], [134, 112]).fill(teal);
      document.polygon([248, 0], [300, 0], [218, 112], [188, 112]).fill("#0b2b4f");
      document.moveTo(0, 111).lineTo(pageWidth, 111).strokeColor(teal).lineWidth(1).stroke();
      drawWrLogo(32, 20, 128, navy);
      document.fillColor("#ffffff").font("Helvetica-Bold").fontSize(25).text("REPORTE DE TICKETS", 272, 30, {
        width: 286,
        align: "right"
      });
      document.moveTo(333, 64).lineTo(558, 64).strokeColor(teal).lineWidth(2).stroke();
      drawMetaIcon("date", 348, 84, teal);
      document.fillColor("#f8fafc").font("Helvetica-Bold").fontSize(10).text(`Generado el: ${formatReportDate(new Date())}`, 364, 78, {
        width: 194,
        align: "right"
      });

      if (includeMeta) {
        const metaY = 126;
        const metaCards = [
          ["S", "Sistema", "Help Desk Ticket System"],
          ["F", "Fecha del reporte", formatReportDateRange(req.query)],
          ["A", "Generado por", "Administrador"],
          ["T", "Total de tickets", String(stats.total)]
        ];

        metaCards.forEach((card, index) => {
          const x = margin + index * (contentWidth / 4);
          const circleColor = index % 2 === 0 ? navy : teal;
          const iconType = ["system", "date", "user", "total"][index];
          drawMetaIcon(iconType, x + 16, metaY + 16, circleColor);
          document.fillColor(slate).font("Helvetica-Bold").fontSize(8.5).text(`${card[1]}:`, x + 38, metaY + 5, {
            width: contentWidth / 4 - 42
          });
          document.fillColor(slate).font("Helvetica").fontSize(8.2).text(card[2], x + 38, metaY + 19, {
            width: contentWidth / 4 - 42
          });
        });

        document.fillColor(muted).font("Helvetica").fontSize(8).text(
          `Filtros aplicados: Estado ${req.query.status || "Todos"} | Prioridad ${req.query.priority || "Todas"}`,
          margin,
          metaY + 48,
          { width: contentWidth, align: "right" }
        );
      }

      document.restore();
    };

    const pageLabel = req.query.lang === "en" ? "Page" : "Pagina";
    const pageOfLabel = req.query.lang === "en" ? "of" : "de";

    const drawFooter = (pageNumber, pageCount) => {
      document.save();
      const footerLineY = pageHeight - 72;
      const footerTextY = pageHeight - 54;
      const footerSmallTextY = pageHeight - 42;

      document.rect(0, pageHeight - 18, pageWidth, 18).fill(navy);
      document.polygon([pageWidth - 86, pageHeight - 18], [pageWidth - 54, pageHeight - 18], [pageWidth - 72, pageHeight], [pageWidth - 104, pageHeight]).fill(teal);
      document.moveTo(0, footerLineY).lineTo(pageWidth, footerLineY).strokeColor(teal).lineWidth(1.2).stroke();
      drawWrLogo(margin, footerTextY - 10, 42, navy);
      document.fillColor(slate).font("Helvetica-Oblique").fontSize(8.5).text("Soluciones eficientes, soporte confiable.", margin, footerTextY, {
        width: contentWidth,
        align: "center",
        lineBreak: false
      });
      document.fillColor(slate).font("Helvetica").fontSize(8).text(`${pageLabel} ${pageNumber} ${pageOfLabel} ${pageCount}`, pageWidth - 145, footerTextY, {
        width: 110,
        align: "right",
        lineBreak: false
      });
      document.fillColor(muted).font("Helvetica").fontSize(6.8).text("Generated by Help Desk Ticket System", pageWidth - 220, footerSmallTextY, {
        width: 185,
        align: "right",
        lineBreak: false
      });
      document.restore();
    };

    const drawFooters = () => {
      const range = document.bufferedPageRange();

      for (let index = range.start; index < range.start + range.count; index += 1) {
        document.switchToPage(index);
        drawFooter(index - range.start + 1, range.count);
      }
    };

    const drawTableHeader = (y) => {
      document.save();
      document.roundedRect(margin, y, contentWidth, 26, 4).fill(navy);
      document.fillColor("#ffffff").fontSize(7).font("Helvetica-Bold");
      columns.forEach((column) => {
        document.text(column.label, column.x + 4, y + 9,
        {
          width: column.width - 8,
          align: "left"
        });
      });
      document.restore();
    };

    const drawSummary = (y) => {
      document.save();
      document.moveTo(margin + 40, y + 10).lineTo(222, y + 10).strokeColor(teal).lineWidth(1.2).stroke();
      document.moveTo(390, y + 10).lineTo(pageWidth - margin - 40, y + 10).strokeColor(teal).lineWidth(1.2).stroke();
      document.fillColor(navy).font("Helvetica-Bold").fontSize(13.5).text("RESUMEN GENERAL", 222, y, {
        width: 152,
        align: "center"
      });

      const cards = [
        ["Total tickets", stats.total, blue, 0, "document"],
        ["Abiertos", stats.abiertos, blue, 0, "open"],
        ["En progreso", stats.enProgreso, orange, 0, "progress"],
        ["Cerrados", stats.cerrados, green, 0, "closed"],
        ["Alta prioridad", stats.alta, red, 1, "high"],
        ["Media prioridad", stats.media, orange, 1, "medium"],
        ["Baja prioridad", stats.baja, green, 1, "low"]
      ];

      cards.forEach((card, index) => {
        const row = card[3];
        const rowIndex = row === 0 ? index : index - 4;
        const cardWidth = row === 0 ? 116 : 154;
        const gap = 12;
        const startX = row === 0 ? margin + 22 : margin + 34;
        const x = startX + rowIndex * (cardWidth + gap);
        const cardY = y + 26 + row * 52;
        document.roundedRect(x, cardY, cardWidth, 40, 5).fill("#ffffff");
        document.roundedRect(x, cardY, cardWidth, 40, 5).strokeColor(card[2]).lineWidth(0.65).stroke();
        document.circle(x + 22, cardY + 20, 12).strokeColor(card[2]).lineWidth(1.4).stroke();
        document.fillColor(card[2]).font("Helvetica-Bold").fontSize(row === 0 ? 9 : 11).text(row === 0 ? (index === 0 ? "T" : index === 1 ? "A" : index === 2 ? "-" : "✓") : String(card[1]), x + 14, cardY + 15, {
          width: 12,
          align: "center"
        });
        document.circle(x + 22, cardY + 20, 10.8).fill("#ffffff");
        document.circle(x + 22, cardY + 20, 12).strokeColor(card[2]).lineWidth(1.4).stroke();
        drawSummaryIcon(card[4], x + 22, cardY + 20, card[2]);
        document.fillColor(slate).font("Helvetica-Bold").fontSize(7.3).text(card[0], x + 43, cardY + 8, {
          width: cardWidth - 55,
          align: "center"
        });
        document.fillColor(slate).font("Helvetica-Bold").fontSize(14).text(String(card[1]), x + 43, cardY + 21, {
          width: cardWidth - 55,
          align: "center"
        });
      });
      document.restore();
    };

    const footerTop = pageHeight - 72;
    const tableContinuationY = 134;
    const tableContinuationHeaderY = 106;
    const summaryHeight = 132;

    const addPageForTableIfNeeded = (currentY, rowHeight) => {
      if (currentY + rowHeight <= footerTop - 8) {
        return currentY;
      }

      document.addPage();
      drawHeader(false);
      drawTableHeader(tableContinuationHeaderY);
      return tableContinuationY;
    };

    const addPageForSummaryIfNeeded = (currentY) => {
      const summaryY = currentY + 12;

      if (summaryY + summaryHeight <= footerTop - 8) {
        return summaryY;
      }

      document.addPage();
      drawHeader(false);
      return tableContinuationY;
    };

    drawHeader();
    drawTableHeader(188);
    let y = 214;

    if (reportRows.length === 0) {
      document.fillColor(slate).fontSize(11).font("Helvetica").text("No hay tickets para los filtros seleccionados.", margin, y + 12);
      y += 40;
    }

    reportRows.forEach((ticket, index) => {
      const rowHeight = Math.max(38, document.heightOfString(ticket.problem, {
        width: 184,
        align: "left"
      }) + 18);

      y = addPageForTableIfNeeded(y, rowHeight);
      document.save();
      document.rect(margin, y, contentWidth, rowHeight).fill(index % 2 === 0 ? "#ffffff" : "#f8fafc");
      document.rect(margin, y, contentWidth, rowHeight).strokeColor(line).lineWidth(0.45).stroke();
      columns.slice(1).forEach((column) => {
        document.moveTo(column.x, y).lineTo(column.x, y + rowHeight).strokeColor(line).lineWidth(0.35).stroke();
      });
      document.fillColor(slate).fontSize(7.2).font("Helvetica");
      document.font("Helvetica-Bold").text(`#${ticket.id}`, columns[0].x + 5, y + 11, { width: columns[0].width - 10 });
      document.font("Helvetica");
      document.text(ticket.problem, columns[1].x + 5, y + 9, { width: columns[1].width - 10 });
      drawPill(ticket.priority, columns[2].x + 8, y + 10, 48, getPriorityColor(ticket.priority));
      drawPill(ticket.status, columns[3].x + 6, y + 10, ticket.status === "En Progreso" ? 68 : 54, getStatusColor(ticket.status));
      document.fillColor(slate).font("Helvetica").text(ticket.date, columns[4].x + 5, y + 9, { width: columns[4].width - 10 });
      document.text(ticket.reportedBy, columns[5].x + 5, y + 9, { width: columns[5].width - 10 });
      document.restore();
      y += rowHeight;
    });

    y = addPageForSummaryIfNeeded(y);
    drawSummary(y);
    drawFooters();
    document.end();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({
    message: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`
  });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, async () => {
  console.log(`Service Billing System disponible en http://localhost:${PORT}`);
  console.log(`Base de datos configurada: ${dbConfig.database}`);

  try {
    await ensureUsersTable();
    console.log("Tabla Users verificada. Usuarios iniciales disponibles si la tabla estaba vacia.");
  } catch (error) {
    poolPromise = null;
    console.error(error);
  }
});

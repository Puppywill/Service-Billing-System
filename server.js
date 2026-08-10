const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcrypt");
const sql = require("mssql/msnodesqlv8");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 3000;
const hasSqlCredentials = Boolean(process.env.DB_USER && process.env.DB_PASSWORD);
const indexPath = path.join(__dirname, "index.html");

function getStaticAssetVersion() {
  if (process.env.APP_ASSET_VERSION) return process.env.APP_ASSET_VERSION;

  try {
    const appMtime = fs.statSync(path.join(__dirname, "app.js")).mtimeMs;
    const styleMtime = fs.statSync(path.join(__dirname, "style.css")).mtimeMs;
    return String(Math.max(appMtime, styleMtime).toFixed(0));
  } catch (error) {
    return "dev";
  }
}

const staticAssetVersion = getStaticAssetVersion();

const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME || "ServiceBillingDB",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: !hasSqlCredentials,
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

if (hasSqlCredentials) {
  dbConfig.user = process.env.DB_USER;
  dbConfig.password = process.env.DB_PASSWORD;
}

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

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

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

app.use(express.static(__dirname, {
  etag: true,
  index: false,
  setHeaders: (res, filePath) => {
    const extension = path.extname(filePath).toLowerCase();

    if (extension === ".html") {
      res.setHeader("Cache-Control", "no-cache");
      return;
    }

    if ([".js", ".css"].includes(extension)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return;
    }

    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader("Cache-Control", "public, max-age=604800");
    }
  }
}));

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig).catch((error) => {
      poolPromise = null;
      throw error;
    });
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

function normalizeRoleValue(role) {
  return role === "Project Manager" ? "ProjectManager" : role;
}

function isSupportedRole(role) {
  return ["Admin", "ProjectManager", "Technician", "User"].includes(normalizeRoleValue(role));
}

function getEligibleServiceTechnicianSql(alias = "technician") {
  return `
    ${alias}.IsActive = 1
    AND NULLIF(LTRIM(RTRIM(${alias}.FullName)), N'') IS NOT NULL
    AND (
      ${alias}.IsTechnician = 1
      OR ${alias}.Role IN (N'Admin', N'ProjectManager', N'Project Manager', N'Technician', N'User')
    )
  `;
}

function mapUser(record) {
  return {
    UserID: record.UserID,
    FullName: record.FullName,
    Email: record.Email,
    Role: normalizeRoleValue(record.Role),
    IsTechnician: Boolean(record.IsTechnician),
    IsActive: record.IsActive === undefined ? true : Boolean(record.IsActive),
    CreatedAt: record.CreatedAt,
    CreatedByUserID: record.CreatedByUserID,
    CreatedByFullName: record.CreatedByFullName,
    AssignedProjectCount: Number(record.AssignedProjectCount || 0)
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

function mapProject(record) {
  return {
    ProjectID: record.ProjectID,
    ClientID: record.ClientID,
    ClientName: record.ClientName,
    ProjectName: record.ProjectName,
    Description: record.Description,
    HourlyRate: Number(record.HourlyRate),
    ContractNumber: record.ContractNumber,
    ContractType: record.ContractType,
    SignedBy: record.SignedBy,
    ContractStartDate: record.ContractStartDate,
    ContractEndDate: record.ContractEndDate,
    ContractedHours: record.ContractedHours === null || record.ContractedHours === undefined ? null : Number(record.ContractedHours),
    LowHoursThreshold: record.LowHoursThreshold === null || record.LowHoursThreshold === undefined ? null : Number(record.LowHoursThreshold),
    ExpirationAlertDays: record.ExpirationAlertDays === null || record.ExpirationAlertDays === undefined ? null : Number(record.ExpirationAlertDays),
    UsedHours: record.UsedHours === null || record.UsedHours === undefined ? null : Number(record.UsedHours),
    RemainingHours: record.RemainingHours === null || record.RemainingHours === undefined ? null : Number(record.RemainingHours),
    HoursAlertStatus: record.HoursAlertStatus,
    ExpirationAlertStatus: record.ExpirationAlertStatus,
    ContractStatus: record.ContractStatus,
    ProjectManagerNames: record.ProjectManagerNames || "",
    ProjectManagerCount: Number(record.ProjectManagerCount || 0),
    ProjectManagerUserIDs: String(record.ProjectManagerUserIDs || "")
      .split(",")
      .map(Number)
      .filter((userId) => Number.isInteger(userId) && userId > 0),
    IsActive: Boolean(record.IsActive),
    CreatedAt: record.CreatedAt,
    UpdatedAt: record.UpdatedAt
  };
}

function mapProjectContractStatus(record) {
  return {
    ProjectID: record.ProjectID,
    ProjectName: record.ProjectName,
    ContractNumber: record.ContractNumber,
    ContractType: record.ContractType,
    ContractStartDate: record.ContractStartDate,
    ContractEndDate: record.ContractEndDate,
    ContractedHours: record.ContractedHours === null || record.ContractedHours === undefined ? null : Number(record.ContractedHours),
    UsedHours: record.UsedHours === null || record.UsedHours === undefined ? null : Number(record.UsedHours),
    RemainingHours: record.RemainingHours === null || record.RemainingHours === undefined ? null : Number(record.RemainingHours),
    LowHoursThreshold: record.LowHoursThreshold === null || record.LowHoursThreshold === undefined ? null : Number(record.LowHoursThreshold),
    ExpirationAlertDays: record.ExpirationAlertDays === null || record.ExpirationAlertDays === undefined ? null : Number(record.ExpirationAlertDays),
    HoursAlertStatus: record.HoursAlertStatus,
    ExpirationAlertStatus: record.ExpirationAlertStatus,
    ContractStatus: record.ContractStatus
  };
}

function getProjectPayload(body) {
  const getValue = (camelCaseName, pascalCaseName) => body[camelCaseName] ?? body[pascalCaseName];
  const hasValue = (camelCaseName, pascalCaseName) => Object.prototype.hasOwnProperty.call(body, camelCaseName)
    || Object.prototype.hasOwnProperty.call(body, pascalCaseName);
  const normalizeOptionalText = (value) => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    return normalized || null;
  };
  const normalizeOptionalNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const number = Number(value);

    return Number.isFinite(number) ? number : NaN;
  };

  const rawClientId = getValue("clientId", "ClientID");
  const rawHourlyRate = getValue("hourlyRate", "HourlyRate");
  const rawIsActive = getValue("isActive", "IsActive");
  const hasHourlyRate = rawHourlyRate !== undefined && rawHourlyRate !== null && rawHourlyRate !== "";
  const hourlyRate = hasHourlyRate ? Number(rawHourlyRate) : null;
  const contractType = normalizeOptionalText(getValue("contractType", "ContractType"));
  const hasProjectManagerUserIds = hasValue("projectManagerUserIds", "ProjectManagerUserIDs");
  const projectManagerUserIds = hasProjectManagerUserIds
    ? normalizeProjectIds(getValue("projectManagerUserIds", "ProjectManagerUserIDs"))
    : undefined;

  return {
    clientId: Number(rawClientId),
    projectName: normalizeOptionalText(getValue("projectName", "ProjectName")),
    description: normalizeOptionalText(getValue("description", "Description")),
    hourlyRate,
    hourlyRateIsValid: !hasHourlyRate || (Number.isFinite(hourlyRate) && hourlyRate >= 0),
    contractNumber: normalizeOptionalText(getValue("contractNumber", "ContractNumber")),
    hasContractNumber: hasValue("contractNumber", "ContractNumber"),
    contractType,
    hasContractType: hasValue("contractType", "ContractType"),
    signedBy: normalizeOptionalText(getValue("signedBy", "SignedBy")),
    hasSignedBy: hasValue("signedBy", "SignedBy"),
    contractStartDate: normalizeOptionalText(getValue("contractStartDate", "ContractStartDate")),
    hasContractStartDate: hasValue("contractStartDate", "ContractStartDate"),
    contractEndDate: normalizeOptionalText(getValue("contractEndDate", "ContractEndDate")),
    hasContractEndDate: hasValue("contractEndDate", "ContractEndDate"),
    contractedHours: normalizeOptionalNumber(getValue("contractedHours", "ContractedHours")),
    hasContractedHours: hasValue("contractedHours", "ContractedHours"),
    lowHoursThreshold: normalizeOptionalNumber(getValue("lowHoursThreshold", "LowHoursThreshold")),
    hasLowHoursThreshold: hasValue("lowHoursThreshold", "LowHoursThreshold"),
    expirationAlertDays: normalizeOptionalNumber(getValue("expirationAlertDays", "ExpirationAlertDays")),
    hasExpirationAlertDays: hasValue("expirationAlertDays", "ExpirationAlertDays"),
    projectManagerUserIds,
    hasProjectManagerUserIds,
    isActive: rawIsActive === undefined ? null : Boolean(rawIsActive)
  };
}

const SERVICE_RECORD_STATUSES = new Set(["Recorded", "Billed", "Canceled"]);
const INVOICE_STATUSES = new Set(["Draft", "Issued", "Paid", "Canceled"]);
const CONTRACT_TYPES = new Set(["Direct", "Signed", "Other"]);

function getProjectContractValidationMessage(project) {
  if (project.contractType && !CONTRACT_TYPES.has(project.contractType)) {
    return "ContractType debe ser Direct, Signed, Other o vacio.";
  }

  if (project.contractStartDate && !isValidServiceDate(project.contractStartDate)) {
    return "ContractStartDate debe usar formato YYYY-MM-DD.";
  }

  if (project.contractEndDate && !isValidServiceDate(project.contractEndDate)) {
    return "ContractEndDate debe usar formato YYYY-MM-DD.";
  }

  if (project.contractStartDate && project.contractEndDate && project.contractStartDate > project.contractEndDate) {
    return "ContractStartDate no puede ser mayor que ContractEndDate.";
  }

  if (Number.isNaN(project.contractedHours) || (project.contractedHours !== null && project.contractedHours < 0)) {
    return "ContractedHours no puede ser negativo.";
  }

  if (Number.isNaN(project.lowHoursThreshold) || (project.lowHoursThreshold !== null && project.lowHoursThreshold < 0)) {
    return "LowHoursThreshold no puede ser negativo.";
  }

  if (
    Number.isNaN(project.expirationAlertDays)
    || (project.expirationAlertDays !== null && (!Number.isInteger(project.expirationAlertDays) || project.expirationAlertDays < 0))
  ) {
    return "ExpirationAlertDays no puede ser negativo.";
  }

  return "";
}

function normalizeServiceTime(value) {
  if (value === undefined || value === null || value === "") {
    return { value: null, minutes: null, isValid: true };
  }

  const match = String(value).trim().match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);

  if (!match) {
    return { value: null, minutes: null, isValid: false };
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || 0);

  return {
    value: `${match[1]}:${match[2]}:${String(seconds).padStart(2, "0")}`,
    minutes: hours * 60 + minutes + seconds / 60,
    isValid: true
  };
}

function isValidServiceDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function formatServiceTime(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(11, 19);
  return String(value).slice(0, 8);
}

function getServiceRecordPayload(body) {
  const getValue = (camelCaseName, pascalCaseName) => body[camelCaseName] ?? body[pascalCaseName];
  const morningStart = normalizeServiceTime(getValue("morningStart", "MorningStart"));
  const morningEnd = normalizeServiceTime(getValue("morningEnd", "MorningEnd"));
  const afternoonStart = normalizeServiceTime(getValue("afternoonStart", "AfternoonStart"));
  const afternoonEnd = normalizeServiceTime(getValue("afternoonEnd", "AfternoonEnd"));
  const intervals = [
    { label: "manana", start: morningStart, end: morningEnd },
    { label: "tarde", start: afternoonStart, end: afternoonEnd }
  ];
  let totalMinutes = 0;
  let timeError = null;

  for (const interval of intervals) {
    if (!interval.start.isValid || !interval.end.isValid) {
      timeError = "Las horas deben usar formato HH:mm o HH:mm:ss.";
      break;
    }

    if ((interval.start.minutes === null) !== (interval.end.minutes === null)) {
      timeError = `El horario de ${interval.label} requiere entrada y salida.`;
      break;
    }

    if (interval.start.minutes !== null) {
      if (interval.end.minutes <= interval.start.minutes) {
        timeError = `La salida de ${interval.label} debe ser posterior a la entrada.`;
        break;
      }

      totalMinutes += interval.end.minutes - interval.start.minutes;
    }
  }

  if (!timeError && totalMinutes <= 0) {
    timeError = "Debes registrar al menos un intervalo de horas valido.";
  }

  const rawStatus = getValue("status", "Status");
  const description = getValue("serviceDescription", "ServiceDescription");

  return {
    technicianUserId: Number(getValue("technicianUserId", "TechnicianUserID")),
    clientId: Number(getValue("clientId", "ClientID")),
    projectId: Number(getValue("projectId", "ProjectID")),
    serviceDate: String(getValue("serviceDate", "ServiceDate") || "").trim(),
    morningStart: morningStart.value,
    morningEnd: morningEnd.value,
    afternoonStart: afternoonStart.value,
    afternoonEnd: afternoonEnd.value,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    serviceDescription: description === undefined || description === null ? "" : String(description).trim(),
    status: rawStatus === undefined || rawStatus === null || rawStatus === "" ? null : String(rawStatus).trim(),
    timeError
  };
}

function getServiceRecordValidationError(serviceRecord) {
  if (!Number.isInteger(serviceRecord.technicianUserId) || serviceRecord.technicianUserId <= 0) {
    return "TechnicianUserID es obligatorio y debe ser valido.";
  }

  if (!Number.isInteger(serviceRecord.clientId) || serviceRecord.clientId <= 0) {
    return "ClientID es obligatorio y debe ser valido.";
  }

  if (!Number.isInteger(serviceRecord.projectId) || serviceRecord.projectId <= 0) {
    return "ProjectID es obligatorio y debe ser valido.";
  }

  if (!isValidServiceDate(serviceRecord.serviceDate)) {
    return "ServiceDate es obligatorio y debe usar formato YYYY-MM-DD.";
  }

  if (!serviceRecord.serviceDescription) {
    return "ServiceDescription es obligatorio.";
  }

  if (serviceRecord.timeError) {
    return serviceRecord.timeError;
  }

  if (serviceRecord.totalHours < 0 || serviceRecord.totalHours > 24) {
    return "TotalHours calculado debe estar entre 0 y 24.";
  }

  if (serviceRecord.status && !SERVICE_RECORD_STATUSES.has(serviceRecord.status)) {
    return "Status debe ser Recorded, Billed o Canceled.";
  }

  return null;
}

function mapServiceRecord(record) {
  return {
    ServiceRecordID: record.ServiceRecordID,
    TechnicianUserID: record.TechnicianUserID,
    TechnicianName: record.TechnicianName,
    ClientID: record.ClientID,
    ClientName: record.ClientName,
    ProjectID: record.ProjectID,
    ProjectName: record.ProjectName,
    ServiceDate: record.ServiceDate instanceof Date
      ? record.ServiceDate.toISOString().slice(0, 10)
      : String(record.ServiceDate).slice(0, 10),
    MorningStart: formatServiceTime(record.MorningStart),
    MorningEnd: formatServiceTime(record.MorningEnd),
    AfternoonStart: formatServiceTime(record.AfternoonStart),
    AfternoonEnd: formatServiceTime(record.AfternoonEnd),
    TotalHours: Number(record.TotalHours),
    ServiceDescription: record.ServiceDescription,
    Status: record.Status,
    InvoiceID: record.InvoiceID,
    CreatedAt: record.CreatedAt,
    UpdatedAt: record.UpdatedAt
  };
}

function toDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function parseOptionalBoolean(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "si"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return null;
}

function mapInvoice(record, lines = undefined) {
  const invoice = {
    InvoiceID: record.InvoiceID,
    InvoiceNumber: record.InvoiceNumber,
    ClientID: record.ClientID,
    ClientName: record.ClientName,
    InvoiceDate: toDateOnly(record.InvoiceDate),
    PeriodFrom: toDateOnly(record.PeriodFrom),
    PeriodTo: toDateOnly(record.PeriodTo),
    Subtotal: Number(record.Subtotal),
    TaxRate: Number(record.TaxRate),
    TaxAmount: Number(record.TaxAmount),
    TotalAmount: Number(record.TotalAmount),
    Status: record.Status,
    Notes: record.Notes,
    IsActive: Boolean(record.IsActive),
    CreatedAt: record.CreatedAt,
    UpdatedAt: record.UpdatedAt,
    CreatedByUserID: record.CreatedByUserID,
    CreatedByName: record.CreatedByName
  };

  if (lines !== undefined) {
    invoice.Lines = lines;
  }

  return invoice;
}

function mapInvoiceLine(record) {
  return {
    InvoiceLineID: record.InvoiceLineID,
    InvoiceID: record.InvoiceID,
    ServiceRecordID: record.ServiceRecordID,
    ProjectID: record.ProjectID,
    ProjectName: record.ProjectName,
    Description: record.Description,
    ServiceDate: toDateOnly(record.ServiceDate),
    Hours: Number(record.Hours),
    HourlyRate: Number(record.HourlyRate),
    LineTotal: Number(record.LineTotal),
    CreatedAt: record.CreatedAt,
    UpdatedAt: record.UpdatedAt
  };
}

function mapServiceHoursReport(record) {
  return {
    ServiceRecordID: record.ServiceRecordID,
    LegacyOrderNumber: record.LegacyOrderNumber || null,
    LegacyInvoiceNumber: record.LegacyInvoiceNumber || null,
    TechnicianUserID: record.TechnicianUserID,
    TechnicianName: record.TechnicianName,
    ClientID: record.ClientID,
    ClientName: record.ClientName,
    ProjectID: record.ProjectID,
    ProjectName: record.ProjectName,
    ServiceDate: toDateOnly(record.ServiceDate),
    MorningStart: formatServiceTime(record.MorningStart),
    MorningEnd: formatServiceTime(record.MorningEnd),
    AfternoonStart: formatServiceTime(record.AfternoonStart),
    AfternoonEnd: formatServiceTime(record.AfternoonEnd),
    TotalHours: Number(record.TotalHours),
    ServiceDescription: record.ServiceDescription,
    Status: record.Status
  };
}

function mapInvoiceReport(record) {
  return {
    InvoiceID: record.InvoiceID,
    InvoiceNumber: record.InvoiceNumber,
    ClientName: record.ClientName,
    InvoiceDate: toDateOnly(record.InvoiceDate),
    PeriodFrom: toDateOnly(record.PeriodFrom),
    PeriodTo: toDateOnly(record.PeriodTo),
    Subtotal: Number(record.Subtotal),
    TaxAmount: Number(record.TaxAmount),
    TotalAmount: Number(record.TotalAmount),
    Status: record.Status
  };
}

function mapReportGroupRow(record, keyName, valueName = "TotalHours") {
  return {
    [keyName]: record[keyName],
    [valueName]: Number(record[valueName])
  };
}

function mapDashboardServiceRecord(record) {
  return {
    ServiceRecordID: record.ServiceRecordID,
    TechnicianName: record.TechnicianName,
    ClientName: record.ClientName,
    ProjectName: record.ProjectName,
    ServiceDate: toDateOnly(record.ServiceDate),
    TotalHours: Number(record.TotalHours),
    ServiceDescription: record.ServiceDescription,
    Status: record.Status,
    CreatedAt: record.CreatedAt
  };
}

function mapDashboardClient(record) {
  return {
    ClientID: record.ClientID,
    ClientName: record.ClientName,
    ContactName: record.ContactName,
    Email: record.Email,
    Phone: record.Phone,
    CreatedAt: record.CreatedAt
  };
}

function mapDashboardProject(record) {
  return {
    ProjectID: record.ProjectID,
    ProjectName: record.ProjectName,
    ClientName: record.ClientName,
    HourlyRate: Number(record.HourlyRate),
    CreatedAt: record.CreatedAt
  };
}

function getInvoicePayload(body) {
  const getValue = (camelCaseName, pascalCaseName) => body[camelCaseName] ?? body[pascalCaseName];
  const normalizeOptionalText = (value) => {
    if (value === undefined || value === null) return null;
    const normalized = String(value).trim();
    return normalized || null;
  };
  const rawTaxRate = getValue("taxRate", "TaxRate");
  const hasTaxRate = rawTaxRate !== undefined && rawTaxRate !== null && rawTaxRate !== "";
  const taxRate = hasTaxRate ? Number(rawTaxRate) : null;
  const rawStatus = getValue("status", "Status");

  return {
    invoiceNumber: normalizeOptionalText(getValue("invoiceNumber", "InvoiceNumber")),
    clientId: Number(getValue("clientId", "ClientID")),
    invoiceDate: normalizeOptionalText(getValue("invoiceDate", "InvoiceDate")),
    periodFrom: normalizeOptionalText(getValue("periodFrom", "PeriodFrom")),
    periodTo: normalizeOptionalText(getValue("periodTo", "PeriodTo")),
    taxRate,
    taxRateIsValid: !hasTaxRate || (Number.isFinite(taxRate) && taxRate >= 0),
    status: rawStatus === undefined || rawStatus === null || rawStatus === "" ? null : String(rawStatus).trim(),
    notes: normalizeOptionalText(getValue("notes", "Notes")),
    isActive: parseOptionalBoolean(getValue("isActive", "IsActive"))
  };
}

function getInvoiceValidationError(invoice, requireInvoiceNumber = true) {
  if (requireInvoiceNumber && !invoice.invoiceNumber) {
    return "InvoiceNumber es obligatorio.";
  }

  if (!Number.isInteger(invoice.clientId) || invoice.clientId <= 0) {
    return "ClientID es obligatorio y debe ser valido.";
  }

  if (!isValidServiceDate(invoice.invoiceDate)) {
    return "InvoiceDate es obligatorio y debe usar formato YYYY-MM-DD.";
  }

  if (!isValidServiceDate(invoice.periodFrom) || !isValidServiceDate(invoice.periodTo)) {
    return "PeriodFrom y PeriodTo son obligatorios y deben usar formato YYYY-MM-DD.";
  }

  if (invoice.periodFrom > invoice.periodTo) {
    return "PeriodFrom no puede ser posterior a PeriodTo.";
  }

  if (!invoice.taxRateIsValid) {
    return "TaxRate debe ser un decimal no negativo.";
  }

  if (invoice.status && !INVOICE_STATUSES.has(invoice.status)) {
    return "Status debe ser Draft, Issued, Paid o Canceled.";
  }

  return null;
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

function requireAdminOrTechnician(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Debes iniciar sesion." });
  }

  if (!isSupportedRole(req.session.user.Role)) {
    return res.status(403).json({ message: "No tienes permisos para acceder a registros de servicio." });
  }

  next();
}

function isProjectManager(user) {
  return normalizeRoleValue(user?.Role) === "ProjectManager";
}

function normalizeProjectIds(rawProjectIds) {
  if (rawProjectIds === undefined || rawProjectIds === null) return [];
  if (!Array.isArray(rawProjectIds)) return null;

  const projectIds = Array.from(new Set(rawProjectIds.map(Number)));
  return projectIds.every((projectId) => Number.isInteger(projectId) && projectId > 0)
    ? projectIds
    : null;
}

async function userCanAccessProject(pool, user, projectId) {
  if (user?.Role === "Admin") return true;
  if (!isProjectManager(user)) return true;

  const result = await pool.request()
    .input("ScopeUserID", sql.Int, Number(user.UserID))
    .input("ScopeProjectID", sql.Int, Number(projectId))
    .query(`
      SELECT CASE WHEN EXISTS (
        SELECT 1
        FROM dbo.UserProjectAssignments upa
        INNER JOIN dbo.Projects p ON p.ProjectID = upa.ProjectID
        WHERE upa.UserID = @ScopeUserID
          AND upa.ProjectID = @ScopeProjectID
          AND upa.IsActive = 1
          AND p.IsActive = 1
      ) THEN 1 ELSE 0 END AS HasAccess
    `);

  return Boolean(result.recordset[0]?.HasAccess);
}

async function userCanAccessClient(pool, user, clientId) {
  if (user?.Role === "Admin") return true;
  if (!isProjectManager(user)) return true;

  const result = await pool.request()
    .input("ScopeUserID", sql.Int, Number(user.UserID))
    .input("ScopeClientID", sql.Int, Number(clientId))
    .query(`
      SELECT CASE WHEN EXISTS (
        SELECT 1
        FROM dbo.UserProjectAssignments upa
        INNER JOIN dbo.Projects p ON p.ProjectID = upa.ProjectID
        WHERE upa.UserID = @ScopeUserID
          AND p.ClientID = @ScopeClientID
          AND upa.IsActive = 1
          AND p.IsActive = 1
      ) THEN 1 ELSE 0 END AS HasAccess
    `);

  return Boolean(result.recordset[0]?.HasAccess);
}

function addProjectManagerScope(request, whereClauses, user, projectAlias = "sr") {
  if (!isProjectManager(user)) return;

  request.input("ScopeProjectManagerUserID", sql.Int, Number(user.UserID));
  whereClauses.push(`EXISTS (
    SELECT 1
    FROM dbo.UserProjectAssignments scopeAssignment
    WHERE scopeAssignment.UserID = @ScopeProjectManagerUserID
      AND scopeAssignment.ProjectID = ${projectAlias}.ProjectID
      AND scopeAssignment.IsActive = 1
  )`);
}

async function syncUserProjectAssignmentsInTransaction(transaction, userId, projectIds, assignedByUserId) {
  const normalizedProjectIds = normalizeProjectIds(projectIds);

  if (normalizedProjectIds === null) {
    const error = new Error("projectIds debe ser una lista de IDs de proyecto validos.");
    error.statusCode = 400;
    throw error;
  }

  const targetResult = await new sql.Request(transaction)
    .input("TargetUserID", sql.Int, userId)
    .query("SELECT UserID, Role FROM dbo.Users WHERE UserID = @TargetUserID");
  const targetUser = targetResult.recordset[0];

  if (!targetUser) {
    const error = new Error("Usuario no encontrado.");
    error.statusCode = 404;
    throw error;
  }

  if (normalizeRoleValue(targetUser.Role) !== "ProjectManager" && normalizedProjectIds.length > 0) {
    const error = new Error("Solo se pueden asignar proyectos a usuarios Project Manager.");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedProjectIds.length > 0) {
    const validationRequest = new sql.Request(transaction);
    const placeholders = normalizedProjectIds.map((projectId, index) => {
      validationRequest.input(`AssignedProjectID${index}`, sql.Int, projectId);
      return `@AssignedProjectID${index}`;
    });
    const validationResult = await validationRequest.query(`
      SELECT COUNT(*) AS ValidProjectCount
      FROM dbo.Projects p
      WHERE p.ProjectID IN (${placeholders.join(", ")})
        AND (
          p.IsActive = 1
          OR EXISTS (
            SELECT 1
            FROM dbo.UserProjectAssignments existingAssignment
            WHERE existingAssignment.UserID = @TargetUserID
              AND existingAssignment.ProjectID = p.ProjectID
              AND existingAssignment.IsActive = 1
          )
        )
    `);

    if (Number(validationResult.recordset[0]?.ValidProjectCount) !== normalizedProjectIds.length) {
      const error = new Error("Uno o mas proyectos no existen, estan inactivos o no tienen una asignacion historica activa.");
      error.statusCode = 400;
      throw error;
    }
  }

  const deactivateRequest = new sql.Request(transaction)
    .input("UserID", sql.Int, userId);
  let keepSelectedClause = "";

  if (normalizedProjectIds.length > 0) {
    const keepPlaceholders = normalizedProjectIds.map((projectId, index) => {
      deactivateRequest.input(`KeepProjectID${index}`, sql.Int, projectId);
      return `@KeepProjectID${index}`;
    });
    keepSelectedClause = `AND ProjectID NOT IN (${keepPlaceholders.join(", ")})`;
  }

  await deactivateRequest.query(`
    UPDATE dbo.UserProjectAssignments
    SET IsActive = 0,
        UpdatedAt = SYSUTCDATETIME()
    WHERE UserID = @UserID
      AND IsActive = 1
      ${keepSelectedClause}
  `);

  for (const projectId of normalizedProjectIds) {
    await new sql.Request(transaction)
      .input("UserID", sql.Int, userId)
      .input("ProjectID", sql.Int, projectId)
      .input("AssignedByUserID", sql.Int, assignedByUserId)
      .query(`
        MERGE dbo.UserProjectAssignments AS target
        USING (SELECT @UserID AS UserID, @ProjectID AS ProjectID) AS source
        ON target.UserID = source.UserID AND target.ProjectID = source.ProjectID
        WHEN MATCHED THEN UPDATE SET
          IsActive = 1,
          AssignedByUserID = @AssignedByUserID,
          AssignedAt = CASE WHEN target.IsActive = 0 THEN SYSUTCDATETIME() ELSE target.AssignedAt END,
          UpdatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (UserID, ProjectID, AssignedByUserID, IsActive)
          VALUES (@UserID, @ProjectID, @AssignedByUserID, 1);
      `);
  }
}

async function syncUserProjectAssignments(pool, userId, projectIds, assignedByUserId) {
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    await syncUserProjectAssignmentsInTransaction(transaction, userId, projectIds, assignedByUserId);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function syncProjectManagerAssignments(transaction, projectId, userIds, assignedByUserId) {
  const normalizedUserIds = normalizeProjectIds(userIds);

  if (normalizedUserIds === null) {
    const error = new Error("projectManagerUserIds debe ser una lista de UserID validos.");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedUserIds.length > 0) {
    const validationRequest = new sql.Request(transaction);
    const placeholders = normalizedUserIds.map((userId, index) => {
      validationRequest.input(`ProjectManagerUserID${index}`, sql.Int, userId);
      return `@ProjectManagerUserID${index}`;
    });
    const validationResult = await validationRequest.query(`
      SELECT COUNT(*) AS ValidManagerCount
      FROM dbo.Users
      WHERE IsActive = 1
        AND Role IN (N'ProjectManager', N'Project Manager')
        AND UserID IN (${placeholders.join(", ")})
    `);

    if (Number(validationResult.recordset[0]?.ValidManagerCount) !== normalizedUserIds.length) {
      const error = new Error("Uno o mas Project Managers no existen, estan inactivos o tienen un rol invalido.");
      error.statusCode = 400;
      throw error;
    }
  }

  const deactivateRequest = new sql.Request(transaction)
    .input("AssignmentProjectID", sql.Int, projectId);
  let keepSelectedClause = "";

  if (normalizedUserIds.length > 0) {
    const keepPlaceholders = normalizedUserIds.map((userId, index) => {
      deactivateRequest.input(`KeepProjectManagerUserID${index}`, sql.Int, userId);
      return `@KeepProjectManagerUserID${index}`;
    });
    keepSelectedClause = `AND UserID NOT IN (${keepPlaceholders.join(", ")})`;
  }

  await deactivateRequest.query(`
    UPDATE dbo.UserProjectAssignments
    SET IsActive = 0,
        UpdatedAt = SYSUTCDATETIME()
    WHERE ProjectID = @AssignmentProjectID
      AND IsActive = 1
      ${keepSelectedClause}
  `);

  for (const userId of normalizedUserIds) {
    await new sql.Request(transaction)
      .input("AssignmentUserID", sql.Int, userId)
      .input("AssignmentProjectID", sql.Int, projectId)
      .input("AssignedByUserID", sql.Int, assignedByUserId)
      .query(`
        MERGE dbo.UserProjectAssignments AS target
        USING (
          SELECT @AssignmentUserID AS UserID, @AssignmentProjectID AS ProjectID
        ) AS source
        ON target.UserID = source.UserID AND target.ProjectID = source.ProjectID
        WHEN MATCHED THEN UPDATE SET
          IsActive = 1,
          AssignedByUserID = @AssignedByUserID,
          AssignedAt = CASE WHEN target.IsActive = 0 THEN SYSUTCDATETIME() ELSE target.AssignedAt END,
          UpdatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (UserID, ProjectID, AssignedByUserID, IsActive)
          VALUES (@AssignmentUserID, @AssignmentProjectID, @AssignedByUserID, 1);
      `);
  }
}

function requireInvoiceReadAccess(req, res, next) {
  if (!["Admin", "Technician"].includes(req.session.user.Role)) {
    return res.status(403).json({ message: "No tienes permisos para consultar facturas." });
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
      req.session.save((saveError) => {
        if (saveError) {
          reject(saveError);
          return;
        }

        resolve();
      });
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

function formatNotificationDate(value) {
  if (!value) return "-";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

async function getAdminNotificationUsers(pool) {
  const result = await pool.request().query(`
    SELECT UserID
    FROM dbo.Users
    WHERE Role = N'Admin'
      AND IsActive = 1
  `);

  return result.recordset;
}

async function createAdminServiceRecordsProcessedNotifications(pool, records) {
  if (!Array.isArray(records) || records.length === 0) return;

  const admins = await getAdminNotificationUsers(pool);
  if (!admins.length) return;

  const groupedRecords = new Map();

  records.forEach((record) => {
    const key = [
      record.TechnicianName || "",
      record.ProjectName || "",
      record.ClientName || "",
      formatNotificationDate(record.ServiceDate)
    ].join("|");
    const existing = groupedRecords.get(key) || {
      TechnicianName: record.TechnicianName || "-",
      ProjectName: record.ProjectName || "-",
      ClientName: record.ClientName || "-",
      ServiceDate: formatNotificationDate(record.ServiceDate),
      Count: 0
    };

    existing.Count += 1;
    groupedRecords.set(key, existing);
  });

  for (const group of groupedRecords.values()) {
    const message = `Registros procesados: Tecnico ${group.TechnicianName} | Proyecto ${group.ProjectName} | Cliente ${group.ClientName} | Fecha ${group.ServiceDate} | Cantidad ${group.Count}`;

    for (const admin of admins) {
      await createNotification(pool, Number(admin.UserID), message.slice(0, 300), "SERVICE_RECORDS_PROCESSED");
    }
  }
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
        u.IsTechnician,
        u.IsActive,
        u.CreatedAt,
        u.CreatedByUserID,
        creator.FullName AS CreatedByFullName
      FROM dbo.Users u
      LEFT JOIN dbo.Users creator ON creator.UserID = u.CreatedByUserID
      WHERE u.UserID = @UserID
    `);

  const userRecord = result.recordset[0];
  if (!userRecord) return null;

  userRecord.AssignedProjectCount = 0;
  try {
    if (await tableExists(pool, "dbo.UserProjectAssignments")) {
      const assignmentResult = await pool.request()
        .input("AssignmentUserID", sql.Int, userId)
        .query(`
          SELECT COUNT(*) AS AssignedProjectCount
          FROM dbo.UserProjectAssignments upa
          WHERE upa.UserID = @AssignmentUserID
            AND upa.IsActive = 1
        `);
      userRecord.AssignedProjectCount = Number(assignmentResult.recordset[0]?.AssignedProjectCount || 0);
    }
  } catch (error) {
    console.warn(`[auth] Assignment count unavailable for user ${userId}; session validation will continue.`, error.message);
  }

  return mapUser(userRecord);
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

async function getProjectById(pool, projectId, activeOnly = true) {
  const result = await pool.request()
    .input("ProjectID", sql.Int, projectId)
    .query(`
      SELECT
        p.ProjectID,
        p.ClientID,
        c.ClientName,
        p.ProjectName,
        p.Description,
        p.HourlyRate,
        p.ContractNumber,
        p.ContractType,
        p.SignedBy,
        p.ContractStartDate,
        p.ContractEndDate,
        p.ContractedHours,
        p.LowHoursThreshold,
        p.ExpirationAlertDays,
        pcs.UsedHours,
        pcs.RemainingHours,
        pcs.HoursAlertStatus,
        pcs.ExpirationAlertStatus,
        pcs.ContractStatus,
        managers.ProjectManagerNames,
        managers.ProjectManagerCount,
        managers.ProjectManagerUserIDs,
        p.IsActive,
        p.CreatedAt,
        p.UpdatedAt
      FROM dbo.Projects p
      INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
      LEFT JOIN dbo.vw_ProjectContractStatus pcs ON pcs.ProjectID = p.ProjectID
      OUTER APPLY (
        SELECT
          STRING_AGG(CONVERT(NVARCHAR(MAX), manager.FullName), N', ') AS ProjectManagerNames,
          COUNT(*) AS ProjectManagerCount,
          STRING_AGG(CONVERT(NVARCHAR(MAX), manager.UserID), N',') AS ProjectManagerUserIDs
        FROM dbo.UserProjectAssignments upa
        INNER JOIN dbo.Users manager ON manager.UserID = upa.UserID
        WHERE upa.ProjectID = p.ProjectID
          AND upa.IsActive = 1
          AND manager.IsActive = 1
          AND manager.Role IN (N'ProjectManager', N'Project Manager')
      ) managers
      WHERE p.ProjectID = @ProjectID
        ${activeOnly ? "AND p.IsActive = 1" : ""}
    `);

  return result.recordset[0] ? mapProject(result.recordset[0]) : null;
}

async function getServiceRecordById(pool, serviceRecordId) {
  const result = await pool.request()
    .input("ServiceRecordID", sql.Int, serviceRecordId)
    .query(`
      SELECT
        sr.ServiceRecordID,
        sr.TechnicianUserID,
        technician.FullName AS TechnicianName,
        sr.ClientID,
        client.ClientName,
        sr.ProjectID,
        project.ProjectName,
        sr.ServiceDate,
        sr.MorningStart,
        sr.MorningEnd,
        sr.AfternoonStart,
        sr.AfternoonEnd,
        sr.TotalHours,
        sr.ServiceDescription,
        sr.Status,
        sr.InvoiceID,
        sr.CreatedAt,
        sr.UpdatedAt
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
      INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
      INNER JOIN dbo.Projects project ON project.ProjectID = sr.ProjectID
      WHERE sr.ServiceRecordID = @ServiceRecordID
    `);

  return result.recordset[0] ? mapServiceRecord(result.recordset[0]) : null;
}

async function getServiceRecordsByIds(pool, serviceRecordIds) {
  const ids = Array.from(new Set((serviceRecordIds || [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0)));

  if (!ids.length) return [];

  const request = pool.request();
  const placeholders = ids.map((id, index) => {
    const inputName = `ServiceRecordID${index}`;
    request.input(inputName, sql.Int, id);
    return `@${inputName}`;
  });
  const result = await request.query(`
    SELECT
      sr.ServiceRecordID,
      sr.TechnicianUserID,
      technician.FullName AS TechnicianName,
      sr.ClientID,
      client.ClientName,
      sr.ProjectID,
      project.ProjectName,
      sr.ServiceDate,
      sr.MorningStart,
      sr.MorningEnd,
      sr.AfternoonStart,
      sr.AfternoonEnd,
      sr.TotalHours,
      sr.ServiceDescription,
      sr.Status,
      sr.InvoiceID,
      sr.CreatedAt,
      sr.UpdatedAt
    FROM dbo.ServiceRecords sr
    INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
    INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
    INNER JOIN dbo.Projects project ON project.ProjectID = sr.ProjectID
    WHERE sr.ServiceRecordID IN (${placeholders.join(", ")})
  `);

  return result.recordset.map(mapServiceRecord);
}

async function getInvoiceLines(pool, invoiceId) {
  const result = await pool.request()
    .input("InvoiceID", sql.Int, invoiceId)
    .query(`
      SELECT
        il.InvoiceLineID,
        il.InvoiceID,
        il.ServiceRecordID,
        il.ProjectID,
        p.ProjectName,
        il.Description,
        il.ServiceDate,
        il.Hours,
        il.HourlyRate,
        il.LineTotal,
        il.CreatedAt,
        il.UpdatedAt
      FROM dbo.InvoiceLines il
      INNER JOIN dbo.Projects p ON p.ProjectID = il.ProjectID
      WHERE il.InvoiceID = @InvoiceID
      ORDER BY il.ServiceDate ASC, il.InvoiceLineID ASC
    `);

  return result.recordset.map(mapInvoiceLine);
}

async function getInvoiceById(pool, invoiceId, includeLines = false) {
  const result = await pool.request()
    .input("InvoiceID", sql.Int, invoiceId)
    .query(`
      SELECT
        i.InvoiceID,
        i.InvoiceNumber,
        i.ClientID,
        c.ClientName,
        i.InvoiceDate,
        i.PeriodFrom,
        i.PeriodTo,
        i.Subtotal,
        i.TaxRate,
        i.TaxAmount,
        i.TotalAmount,
        i.Status,
        i.Notes,
        i.IsActive,
        i.CreatedAt,
        i.UpdatedAt,
        i.CreatedByUserID,
        creator.FullName AS CreatedByName
      FROM dbo.Invoices i
      INNER JOIN dbo.Clients c ON c.ClientID = i.ClientID
      LEFT JOIN dbo.Users creator ON creator.UserID = i.CreatedByUserID
      WHERE i.InvoiceID = @InvoiceID
    `);

  if (!result.recordset[0]) return null;

  const lines = includeLines ? await getInvoiceLines(pool, invoiceId) : undefined;
  return mapInvoice(result.recordset[0], lines);
}

async function getNextInvoiceNumber(pool) {
  const prefix = `INV-${new Date().getUTCFullYear()}-`;
  const result = await pool.request()
    .input("Prefix", sql.NVarChar(20), `${prefix}%`)
    .query(`
      SELECT MAX(TRY_CONVERT(INT, RIGHT(InvoiceNumber, 5))) AS LastSequence
      FROM dbo.Invoices
      WHERE InvoiceNumber LIKE @Prefix
    `);
  const nextSequence = Number(result.recordset[0]?.LastSequence || 0) + 1;

  return `${prefix}${String(nextSequence).padStart(5, "0")}`;
}

async function validateServiceRecordReferences(pool, serviceRecord) {
  const result = await pool.request()
    .input("TechnicianUserID", sql.Int, serviceRecord.technicianUserId)
    .input("ClientID", sql.Int, serviceRecord.clientId)
    .input("ProjectID", sql.Int, serviceRecord.projectId)
    .query(`
      SELECT
        CASE WHEN EXISTS (
          SELECT 1
          FROM dbo.Users
            WHERE UserID = @TechnicianUserID
            AND IsActive = 1
            AND NULLIF(LTRIM(RTRIM(FullName)), N'') IS NOT NULL
            AND (
              IsTechnician = 1
              OR Role IN (N'Admin', N'ProjectManager', N'Project Manager', N'Technician', N'User')
            )
        ) THEN 1 ELSE 0 END AS TechnicianExists,
        CASE WHEN EXISTS (
          SELECT 1
          FROM dbo.Clients
          WHERE ClientID = @ClientID
            AND IsActive = 1
        ) THEN 1 ELSE 0 END AS ClientExists,
        CASE WHEN EXISTS (
          SELECT 1
          FROM dbo.Projects
          WHERE ProjectID = @ProjectID
            AND ClientID = @ClientID
            AND IsActive = 1
        ) THEN 1 ELSE 0 END AS ProjectExists
    `);

  const validation = result.recordset[0];

  if (!validation.TechnicianExists) return "El tecnico no existe o esta inactivo.";
  if (!validation.ClientExists) return "El cliente no existe o esta inactivo.";
  if (!validation.ProjectExists) return "El proyecto no existe, esta inactivo o no pertenece al cliente.";
  return null;
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

function formatReportDateOnly(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatReportNumber(value, fractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(Number(value || 0));
}

function formatReportDateRange(filters) {
  const from = filters.from || "Sin fecha inicial";
  const to = filters.to || "Sin fecha final";

  return `${from} - ${to}`;
}

function cleanReportText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Aacute;/g, "Á")
    .replace(/&aacute;/g, "á")
    .replace(/&Eacute;/g, "É")
    .replace(/&eacute;/g, "é")
    .replace(/&Iacute;/g, "Í")
    .replace(/&iacute;/g, "í")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&oacute;/g, "ó")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&uacute;/g, "ú")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&n(?:bsp)?;?/gi, " ")
    .replace(/&#?\w+;?/g, " ")
    .replace(/\r/g, "")
    .replace(/^\s*[.&]\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function formatReportTime(value) {
  if (!value) return "—";

  const timeValue = String(value).trim();
  const match = timeValue.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return timeValue;

  const hours24 = Number(match[1]);
  const minutes = match[2];

  if (!Number.isInteger(hours24) || hours24 < 0 || hours24 > 23) {
    return timeValue.slice(0, 5);
  }

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes} ${period}`;
}

async function tableColumnExists(pool, tableName, columnName) {
  const result = await pool.request()
    .input("TableName", sql.NVarChar(128), tableName)
    .input("ColumnName", sql.NVarChar(128), columnName)
    .query(`
      SELECT CASE WHEN COL_LENGTH(@TableName, @ColumnName) IS NULL THEN 0 ELSE 1 END AS ExistsFlag
    `);

  return Boolean(result.recordset[0]?.ExistsFlag);
}

async function tableExists(pool, tableName) {
  const result = await pool.request()
    .input("TableName", sql.NVarChar(256), tableName)
    .query("SELECT CASE WHEN OBJECT_ID(@TableName, N'U') IS NULL THEN 0 ELSE 1 END AS ExistsFlag");

  return Boolean(result.recordset[0]?.ExistsFlag);
}

function getServiceHoursReportFilters(req) {
  const from = String(req.query.from || "").trim();
  const to = String(req.query.to || "").trim();
  const status = String(req.query.status || "").trim();
  const rawFilters = {
    TechnicianUserID: req.query.technicianUserId,
    ClientID: req.query.clientId,
    ProjectID: req.query.projectId
  };
  const numericFilters = {};

  if ((from && !isValidServiceDate(from)) || (to && !isValidServiceDate(to))) {
    return { error: "from y to deben usar formato YYYY-MM-DD.", statusCode: 400 };
  }

  if (from && to && from > to) {
    return { error: "from no puede ser posterior a to.", statusCode: 400 };
  }

  if (status && !SERVICE_RECORD_STATUSES.has(status)) {
    return { error: "status debe ser Recorded, Billed o Canceled.", statusCode: 400 };
  }

  for (const [name, rawValue] of Object.entries(rawFilters)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    const value = Number(rawValue);

    if (!Number.isInteger(value) || value <= 0) {
      return { error: `${name} invalido.`, statusCode: 400 };
    }

    numericFilters[name] = value;
  }

  if (["Technician", "User"].includes(req.session.user.Role)) {
    const sessionUserId = Number(req.session.user.UserID);

    if (numericFilters.TechnicianUserID && numericFilters.TechnicianUserID !== sessionUserId) {
      return { error: "Los tecnicos solo pueden ver sus propios registros.", statusCode: 403 };
    }

    numericFilters.TechnicianUserID = sessionUserId;
  }

  return {
    from,
    to,
    status,
    numericFilters,
    projectManagerUserId: isProjectManager(req.session.user) ? Number(req.session.user.UserID) : null
  };
}

async function getServiceHoursReportRecords(pool, filters) {
  const request = pool.request();
  const whereClauses = [];
  const hasLegacyOrderNumber = await tableColumnExists(pool, "dbo.ServiceRecords", "LegacyOrderNumber");
  const hasLegacyInvoiceNumber = await tableColumnExists(pool, "dbo.ServiceRecords", "LegacyInvoiceNumber");

  if (filters.from) {
    request.input("FromDate", sql.Date, filters.from);
    whereClauses.push("sr.ServiceDate >= @FromDate");
  }

  if (filters.to) {
    request.input("ToDate", sql.Date, filters.to);
    whereClauses.push("sr.ServiceDate <= @ToDate");
  }

  if (filters.status) {
    request.input("Status", sql.NVarChar(20), filters.status);
    whereClauses.push("sr.Status = @Status");
  }

  for (const [name, value] of Object.entries(filters.numericFilters || {})) {
    request.input(name, sql.Int, value);
    whereClauses.push(`sr.${name} = @${name}`);
  }

  if (filters.projectManagerUserId) {
    request.input("ScopeProjectManagerUserID", sql.Int, filters.projectManagerUserId);
    whereClauses.push(`EXISTS (
      SELECT 1 FROM dbo.UserProjectAssignments scopeAssignment
      WHERE scopeAssignment.UserID = @ScopeProjectManagerUserID
        AND scopeAssignment.ProjectID = sr.ProjectID
        AND scopeAssignment.IsActive = 1
    )`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const result = await request.query(`
    SELECT
      sr.ServiceRecordID,
      ${hasLegacyOrderNumber ? "sr.LegacyOrderNumber" : "CAST(NULL AS NVARCHAR(20)) AS LegacyOrderNumber"},
      ${hasLegacyInvoiceNumber ? "sr.LegacyInvoiceNumber" : "CAST(NULL AS NVARCHAR(25)) AS LegacyInvoiceNumber"},
      sr.TechnicianUserID,
      technician.FullName AS TechnicianName,
      sr.ClientID,
      client.ClientName,
      sr.ProjectID,
      project.ProjectName,
      sr.ServiceDate,
      sr.MorningStart,
      sr.MorningEnd,
      sr.AfternoonStart,
      sr.AfternoonEnd,
      sr.TotalHours,
      sr.ServiceDescription,
      sr.Status
    FROM dbo.ServiceRecords sr
    INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
    INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
    INNER JOIN dbo.Projects project ON project.ProjectID = sr.ProjectID
    ${whereSql}
    ORDER BY sr.ServiceDate DESC, sr.ServiceRecordID DESC
  `);

  return result.recordset.map(mapServiceHoursReport);
}

async function getServiceHoursReportTechnicians(pool, filters) {
  const request = pool.request();
  const whereClauses = [getEligibleServiceTechnicianSql("technician")];

  if (filters.from) {
    request.input("FromDate", sql.Date, filters.from);
    whereClauses.push("sr.ServiceDate >= @FromDate");
  }

  if (filters.to) {
    request.input("ToDate", sql.Date, filters.to);
    whereClauses.push("sr.ServiceDate <= @ToDate");
  }

  if (filters.status) {
    request.input("Status", sql.NVarChar(20), filters.status);
    whereClauses.push("sr.Status = @Status");
  }

  for (const [name, value] of Object.entries(filters.numericFilters || {})) {
    request.input(name, sql.Int, value);
    whereClauses.push(`sr.${name} = @${name}`);
  }

  if (filters.projectManagerUserId) {
    request.input("ScopeProjectManagerUserID", sql.Int, filters.projectManagerUserId);
    whereClauses.push(`EXISTS (
      SELECT 1 FROM dbo.UserProjectAssignments scopeAssignment
      WHERE scopeAssignment.UserID = @ScopeProjectManagerUserID
        AND scopeAssignment.ProjectID = sr.ProjectID
        AND scopeAssignment.IsActive = 1
    )`);
  }

  const whereSql = `WHERE ${whereClauses.join(" AND ")}`;
  const result = await request.query(`
    SELECT DISTINCT
      technician.UserID,
      technician.FullName,
      technician.Email,
      technician.Role,
      technician.IsTechnician,
      technician.IsActive
    FROM dbo.ServiceRecords sr
    INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
    INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
    INNER JOIN dbo.Projects project ON project.ProjectID = sr.ProjectID
    ${whereSql}
    ORDER BY technician.FullName, technician.Email
  `);

  return result.recordset;
}

function drawServiceHoursPdf(records, filters, generatedAt, outputStream, options = {}) {
  const document = new PDFDocument({ margin: 30, size: "LETTER", bufferPages: true });
  const margin = 30;
  const navy = "#17365d";
  const slate = "#111827";
  const muted = "#4b5563";
  const border = "#9ca3af";
  const soft = "#f3f6fb";
  const rowAlt = "#fbfdff";
  const footerDateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(generatedAt);
  const footerMargin = 42;

  document.pipe(outputStream);

  const uniqueValues = (key) => Array.from(new Set(records.map((record) => record[key]).filter(Boolean)));
  const totalHours = records.reduce((sum, record) => sum + Number(record.TotalHours || 0), 0);
  const clients = uniqueValues("ClientName");
  const projects = uniqueValues("ProjectName");
  const period = `${filters.from || "Inicio"} - ${filters.to || "Actual"}`;
  const clientLabel = clients.length === 1 ? clients[0] : `${clients.length} clientes`;
  const projectLabel = projects.length === 1 ? projects[0] : `${projects.length} proyectos`;
  const manualInvoiceNumber = String(options.invoiceNumber || "").trim();
  const invoiceLabel = manualInvoiceNumber ? `#${manualInvoiceNumber.replace(/^#/, "")}` : "N/A";
  const logoCandidates = [
    path.join(__dirname, "assets", "logo-horizontal.png")
  ];
  const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));

  const drawBrand = (x, y, width = 360, height = 106) => {
    document.save();
    if (logoPath) {
      document.image(logoPath, x, y, { fit: [width, height] });
    } else {
      document.fillColor(navy).font("Helvetica-Bold").fontSize(12).text("Solutions By Design", x, y + 8, {
        width,
        align: "left"
      });
    }
    document.restore();
  };

  const drawBreakdownHeader = () => {
    const pageWidth = document.page.width;
    const y = margin;

    document.save();
    drawBrand(margin, y, 360, 100);
    document.fillColor(slate).font("Helvetica-Bold").fontSize(11).text(clientLabel, margin, y + 112, {
      width: pageWidth - margin * 2,
      align: "center"
    });
    document.fillColor(navy).font("Helvetica-Bold").fontSize(14).text("Desglose de servicios prestados", margin, y + 130, {
      width: pageWidth - margin * 2,
      align: "center"
    });
    document.fillColor(slate).font("Helvetica").fontSize(9).text(`Invoice: ${invoiceLabel}`, pageWidth - margin - 140, y + 12, {
      width: 140,
      align: "right"
    });
    document.fillColor(muted).font("Helvetica").fontSize(8).text(`Departamento/Proyecto: ${projectLabel}`, margin, y + 158, {
      width: pageWidth - margin * 2 - 190
    });
    document.fillColor(muted).font("Helvetica").fontSize(8).text(`Período: ${period}`, pageWidth - margin - 180, y + 158, {
      width: 180,
      align: "right"
    });
    document.moveTo(margin, y + 176).lineTo(pageWidth - margin, y + 176).strokeColor(border).lineWidth(0.8).stroke();
    document.restore();
    document.y = y + 186;
  };

  const getPageBottom = () => document.page.height - footerMargin;

  const getServiceColumns = () => {
    const tableWidth = document.page.width - margin * 2;
    return [
      { label: "Fecha", width: 58, align: "left" },
      { label: "Orden", width: 50, align: "left" },
      { label: "Técnico", width: 88, align: "left" },
      { label: "Descripción", width: tableWidth - 244, align: "left" },
      { label: "Horas", width: 48, align: "right" }
    ];
  };

  const getColumnX = (columns, columnIndex) => margin + columns
    .slice(0, columnIndex)
    .reduce((sum, column) => sum + column.width, 0);

  const ensureSpace = (height) => {
    if (document.y + height > getPageBottom()) {
      document.addPage();
      drawBreakdownHeader();
      return true;
    }

    return false;
  };

  const drawServiceTableHeader = () => {
    const y = document.y;
    const tableWidth = document.page.width - margin * 2;
    const columns = getServiceColumns();
    let x = margin;

    document.rect(margin, y, tableWidth, 18).fill(soft).stroke(border);
    columns.forEach((column) => {
      document.fillColor(slate).font("Helvetica-Bold").fontSize(7.5).text(column.label, x + 4, y + 5, {
        width: column.width - 8,
        align: column.align
      });
      x += column.width;
    });
    document.y = y + 18;

    return columns;
  };

  const drawServiceBreakdown = () => {
    drawBreakdownHeader();
    let columns = drawServiceTableHeader();

    records.forEach((record, recordIndex) => {
      const isLastRecord = recordIndex === records.length - 1;
      const description = cleanReportText(record.ServiceDescription) || "Sin descripción.";
      const maxRowHeight = getPageBottom() - document.y - 2;
      let descriptionFontSize = 7.6;
      document.font("Helvetica").fontSize(descriptionFontSize);
      const descriptionHeight = document.heightOfString(description, {
        width: columns[3].width - 8,
        lineGap: 1.4
      });
      let rowHeight = Math.max(24, descriptionHeight + 10);

      if (rowHeight > maxRowHeight && document.y > margin + 96) {
        document.addPage();
        drawBreakdownHeader();
        columns = drawServiceTableHeader();
      }

      while (rowHeight > getPageBottom() - document.y - 2 && descriptionFontSize > 6.2) {
        descriptionFontSize -= 0.2;
        document.font("Helvetica").fontSize(descriptionFontSize);
        rowHeight = Math.max(24, document.heightOfString(description, {
          width: columns[3].width - 8,
          lineGap: 1.2
        }) + 10);
      }

      if (ensureSpace(rowHeight + (isLastRecord ? 28 : 0))) {
        columns = drawServiceTableHeader();
      }

      const maxDrawableRowHeight = Math.max(24, getPageBottom() - document.y - (isLastRecord ? 28 : 0));
      rowHeight = Math.min(rowHeight, maxDrawableRowHeight);

      const y = document.y;
      let x = margin;
      const values = [
        formatReportDateOnly(record.ServiceDate),
        record.LegacyOrderNumber || "-",
        record.TechnicianName || "",
        description,
        formatReportNumber(record.TotalHours)
      ];

      document.rect(margin, y, document.page.width - margin * 2, rowHeight).strokeColor(border).lineWidth(0.4).stroke();
      values.forEach((value, index) => {
        document.fillColor(slate).font("Helvetica").fontSize(index === 3 ? descriptionFontSize : 7.4).text(value, x + 4, y + 5, {
          width: columns[index].width - 8,
          height: rowHeight - 9,
          align: columns[index].align,
          lineGap: index === 3 ? 1.2 : 0,
          ellipsis: index === 3
        });
        x += columns[index].width;
      });
      document.y = y + rowHeight;
    });

    const serviceColumns = getServiceColumns();
    const hoursColumnIndex = serviceColumns.length - 1;
    const hoursX = getColumnX(serviceColumns, hoursColumnIndex);
    const hoursWidth = serviceColumns[hoursColumnIndex].width;
    const labelWidth = 120;
    const labelX = hoursX - labelWidth - 16;
    const totalLineY = Math.min(document.y, document.page.height - footerMargin - 22);
    document.moveTo(labelX, totalLineY).lineTo(hoursX + hoursWidth, totalLineY).strokeColor(border).stroke();
    document.fillColor(slate).font("Helvetica-Bold").fontSize(9).text("Total de horas", labelX, totalLineY + 7, {
      width: labelWidth,
      align: "right",
      lineBreak: false
    });
    document.text(formatReportNumber(totalHours), hoursX + 4, totalLineY + 7, {
      width: hoursWidth - 8,
      align: "right",
      lineBreak: false
    });
  };

  const drawTimeSheetPageHeader = () => {
    const pageWidth = document.page.width;
    const y = margin;
    const titleX = margin + 250;
    const titleWidth = pageWidth - margin * 2 - 500;

    document.save();
    drawBrand(margin, y - 8, 330, 90);
    document.fillColor(navy).font("Helvetica-Bold").fontSize(15).text("Time Sheet", titleX, y + 2, {
      width: titleWidth,
      align: "center"
    });
    document.fillColor(slate).font("Helvetica").fontSize(9).text(`Invoice: ${invoiceLabel}`, pageWidth - margin - 170, y + 4, {
      width: 170,
      align: "right"
    });
    document.fillColor(muted).font("Helvetica").fontSize(8).text(`Del ${filters.from || "inicio"} al ${filters.to || "actual"}`, titleX, y + 25, {
      width: titleWidth,
      align: "center"
    });
    document.fillColor(muted).font("Helvetica").fontSize(7.5).text(`Cliente: ${clientLabel} | Departamento/Proyecto: ${projectLabel}`, margin, y + 88, {
      width: pageWidth - margin * 2,
      ellipsis: true
    });
    document.moveTo(margin, y + 100).lineTo(pageWidth - margin, y + 100).strokeColor(border).lineWidth(0.8).stroke();
    document.restore();
    document.y = y + 110;
  };

  const getTimeSheetColumns = () => [
    { label: "Técnico", width: 80, align: "left" },
    { label: "Día", width: 54, align: "left" },
    { label: "Cliente", width: 112, align: "left" },
    { label: "Departamento/Proyecto", width: 158, align: "left" },
    { label: "Mañana Entrada", width: 64, align: "center" },
    { label: "Mañana Salida", width: 64, align: "center" },
    { label: "Tarde Entrada", width: 64, align: "center" },
    { label: "Tarde Salida", width: 64, align: "center" },
    { label: "Total", width: 54, align: "right" }
  ];

  const drawTimeSheetHeader = () => {
    const pageWidth = document.page.width;
    const sheetWidth = pageWidth - margin * 2;
    const columns = getTimeSheetColumns();
    let x = margin;
    const y = document.y;

    document.rect(margin, y, sheetWidth, 19).fill(soft).stroke(border);
    columns.forEach((column) => {
      document.fillColor(slate).font("Helvetica-Bold").fontSize(6.2).text(column.label, x + 3, y + 5, {
        width: column.width - 6,
        height: 12,
        align: column.align,
        lineBreak: false
      });
      x += column.width;
    });
    document.y = y + 19;

    return columns;
  };

  const drawTimeSheet = () => {
    document.addPage({ size: "LETTER", layout: "landscape", margin });
    drawTimeSheetPageHeader();

    const recordsByTechnician = new Map();
    records.forEach((record) => {
      const technician = record.TechnicianName || "Sin técnico";
      if (!recordsByTechnician.has(technician)) recordsByTechnician.set(technician, []);
      recordsByTechnician.get(technician).push(record);
    });

    let timeSheetColumns = drawTimeSheetHeader();

    const technicianEntries = Array.from(recordsByTechnician.entries());

    technicianEntries.forEach(([technician, technicianRecords], technicianIndex) => {
      const technicianHours = technicianRecords.reduce((sum, record) => sum + Number(record.TotalHours || 0), 0);
      const isLastTechnicianGroup = technicianIndex === technicianEntries.length - 1;
      const minimumGroupHeight = 22 + 24 + (isLastTechnicianGroup && technicianRecords.length === 1 ? 30 : 0);

      if (document.y + minimumGroupHeight > document.page.height - 56) {
        document.addPage({ size: "LETTER", layout: "landscape", margin });
        drawTimeSheetPageHeader();
        timeSheetColumns = drawTimeSheetHeader();
      }
      document.fillColor(navy).font("Helvetica-Bold").fontSize(8).text(`${technician} - ${formatReportNumber(technicianHours)}`, margin, document.y + 7, {
        width: document.page.width - margin * 2
      });
      document.y += 22;

      technicianRecords.forEach((record, index) => {
        const isLastTimeSheetRecord = technicianIndex === technicianEntries.length - 1 && index === technicianRecords.length - 1;

        if (document.y + 24 + (isLastTimeSheetRecord ? 30 : 0) > document.page.height - 56) {
          document.addPage({ size: "LETTER", layout: "landscape", margin });
          drawTimeSheetPageHeader();
          timeSheetColumns = drawTimeSheetHeader();
        }

        const rowY = document.y;
        const values = [
          record.TechnicianName || "",
          formatReportDateOnly(record.ServiceDate),
          record.ClientName || "",
          record.ProjectName || "",
          formatReportTime(record.MorningStart),
          formatReportTime(record.MorningEnd),
          formatReportTime(record.AfternoonStart),
          formatReportTime(record.AfternoonEnd),
          formatReportNumber(record.TotalHours)
        ];
        let x = margin;

        if (index % 2 === 0) {
          document.rect(margin, rowY, document.page.width - margin * 2, 22).fill(rowAlt);
        }

        values.forEach((value, valueIndex) => {
          const column = timeSheetColumns[valueIndex];
          document.fillColor(slate).font("Helvetica").fontSize(7).text(value, x + 4, rowY + 6, {
            width: column.width - 8,
            height: 10,
            align: column.align,
            ellipsis: true
          });
          x += column.width;
        });
        document.moveTo(margin, rowY + 22).lineTo(document.page.width - margin, rowY + 22).strokeColor(border).lineWidth(0.4).stroke();
        document.y = rowY + 22;
      });
    });

    const totalColumnIndex = timeSheetColumns.length - 1;
    const totalX = getColumnX(timeSheetColumns, totalColumnIndex);
    const totalWidth = timeSheetColumns[totalColumnIndex].width;
    const labelWidth = 124;
    const labelX = totalX - labelWidth - 16;
    const totalLineY = Math.min(document.y + 8, document.page.height - footerMargin - 22);
    document.moveTo(labelX, totalLineY).lineTo(totalX + totalWidth, totalLineY).strokeColor(border).stroke();
    document.fillColor(slate).font("Helvetica-Bold").fontSize(9).text("Total de horas", labelX, totalLineY + 8, {
      width: labelWidth,
      align: "right",
      lineBreak: false
    });
    document.text(formatReportNumber(totalHours), totalX + 4, totalLineY + 8, {
      width: totalWidth - 8,
      align: "right",
      lineBreak: false
    });
  };

  const drawFooter = () => {
    const range = document.bufferedPageRange();

    for (let index = 0; index < range.count; index += 1) {
      document.switchToPage(range.start + index);
      document.save();
      const footerWidth = document.page.width;
      const footerHeight = document.page.height;
      document.fillColor(muted).font("Helvetica").fontSize(7.5).text(footerDateLabel, margin, footerHeight - 28, {
        width: 220,
        height: 10,
        lineBreak: false
      });
      document.text(`Página ${index + 1} de ${range.count}`, footerWidth - margin - 120, footerHeight - 28, {
        width: 120,
        height: 10,
        align: "right",
        lineBreak: false
      });
      document.restore();
    }
  };

  drawServiceBreakdown();
  drawTimeSheet();
  drawFooter();
  document.end();
}

function createServiceHoursExcelWorkbook(records, filters, generatedAt) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Service Hours", {
    views: [{ state: "frozen", ySplit: 7 }],
    pageSetup: {
      orientation: "landscape",
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.45,
        bottom: 0.45,
        header: 0.2,
        footer: 0.2
      }
    }
  });
  const navy = "FF17365D";
  const blue = "FF2563EB";
  const lightBlue = "FFEAF1F8";
  const soft = "FFF6F8FB";
  const white = "FFFFFFFF";
  const slate = "FF1F2937";
  const muted = "FF5B6778";
  const border = "FFB8C4D2";
  const totalHours = records.reduce((sum, record) => sum + Number(record.TotalHours || 0), 0);
  const uniqueValues = (key) => Array.from(new Set(records.map((record) => cleanReportText(record[key])).filter(Boolean)));
  const scopeLabel = (key, selectedValue, allLabel) => {
    const values = uniqueValues(key);

    if (selectedValue && values.length) return values.join(", ");
    if (values.length === 1) return values[0];
    return allLabel;
  };
  const periodLabel = filters.from || filters.to
    ? `${filters.from || "Inicio"} al ${filters.to || "Actual"}`
    : "Todos los periodos";
  const clientLabel = scopeLabel("ClientName", filters.numericFilters?.ClientID, "Todos los clientes");
  const projectLabel = scopeLabel("ProjectName", filters.numericFilters?.ProjectID, "Todos los proyectos");
  const technicianLabel = scopeLabel("TechnicianName", filters.numericFilters?.TechnicianUserID, "Todos los tecnicos");
  const statusLabel = filters.status || "Todos los estados";
  const generatedLabel = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(generatedAt);

  workbook.creator = "Solutions By Design";
  workbook.company = "Solutions By Design";
  workbook.subject = "Service hours report";
  workbook.title = "Desglose de servicios prestados";
  workbook.created = generatedAt;
  workbook.modified = generatedAt;

  worksheet.columns = [
    { key: "id", width: 13 },
    { key: "date", width: 13 },
    { key: "order", width: 14 },
    { key: "technician", width: 24 },
    { key: "client", width: 27 },
    { key: "project", width: 32 },
    { key: "morningStart", width: 14 },
    { key: "morningEnd", width: 14 },
    { key: "afternoonStart", width: 14 },
    { key: "afternoonEnd", width: 14 },
    { key: "hours", width: 12 },
    { key: "status", width: 14 },
    { key: "description", width: 58 }
  ];

  worksheet.mergeCells("A1:C5");
  const logoPath = path.join(__dirname, "assets", "logo-horizontal.png");

  if (fs.existsSync(logoPath)) {
    const logoId = workbook.addImage({ filename: logoPath, extension: "png" });
    worksheet.addImage(logoId, {
      tl: { col: 0.12, row: 0.12 },
      ext: { width: 180, height: 120 },
      editAs: "oneCell"
    });
  } else {
    worksheet.getCell("A1").value = "Solutions By Design";
    worksheet.getCell("A1").font = { bold: true, size: 18, color: { argb: navy } };
    worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  }

  worksheet.mergeCells("D1:M1");
  worksheet.getCell("D1").value = "DESGLOSE DE SERVICIOS PRESTADOS";
  worksheet.getCell("D1").font = { bold: true, size: 18, color: { argb: navy } };
  worksheet.getCell("D1").alignment = { vertical: "middle", horizontal: "left" };

  worksheet.mergeCells("D2:M2");
  worksheet.getCell("D2").value = "Solutions By Design | Reporte de horas de servicio";
  worksheet.getCell("D2").font = { size: 10, color: { argb: muted } };

  const metadataRows = [
    [3, "D", "H", `Periodo: ${periodLabel}`, "I", "M", `Estado: ${statusLabel}`],
    [4, "D", "H", `Cliente: ${clientLabel}`, "I", "M", `Tecnico: ${technicianLabel}`],
    [5, "D", "H", `Proyecto: ${projectLabel}`, "I", "M", `Generado: ${generatedLabel}`]
  ];

  metadataRows.forEach(([rowNumber, leftStart, leftEnd, leftValue, rightStart, rightEnd, rightValue]) => {
    worksheet.mergeCells(`${leftStart}${rowNumber}:${leftEnd}${rowNumber}`);
    worksheet.mergeCells(`${rightStart}${rowNumber}:${rightEnd}${rowNumber}`);
    worksheet.getCell(`${leftStart}${rowNumber}`).value = leftValue;
    worksheet.getCell(`${rightStart}${rowNumber}`).value = rightValue;
    worksheet.getCell(`${leftStart}${rowNumber}`).font = { size: 9, color: { argb: slate } };
    worksheet.getCell(`${rightStart}${rowNumber}`).font = { size: 9, color: { argb: slate } };
    worksheet.getCell(`${leftStart}${rowNumber}`).alignment = { vertical: "middle", wrapText: true };
    worksheet.getCell(`${rightStart}${rowNumber}`).alignment = { vertical: "middle", wrapText: true };
  });

  [1, 2, 3, 4, 5].forEach((rowNumber) => {
    worksheet.getRow(rowNumber).height = rowNumber === 1 ? 30 : 23;
  });

  worksheet.mergeCells("A6:J6");
  worksheet.getCell("A6").value = "RESUMEN";
  worksheet.getCell("A6").font = { bold: true, size: 10, color: { argb: white } };
  worksheet.getCell("A6").fill = { type: "pattern", pattern: "solid", fgColor: { argb: navy } };
  worksheet.getCell("A6").alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getCell("K6").value = "Total horas";
  worksheet.getCell("L6").value = totalHours;
  worksheet.mergeCells("L6:M6");
  ["K6", "L6"].forEach((address) => {
    const cell = worksheet.getCell(address);
    cell.font = { bold: true, size: 10, color: { argb: white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: navy } };
    cell.alignment = { vertical: "middle", horizontal: address === "L6" ? "right" : "center" };
  });
  worksheet.getCell("L6").numFmt = "#,##0.00";
  worksheet.getRow(6).height = 24;

  const headers = [
    "Registro", "Fecha", "Orden", "Tecnico", "Cliente", "Proyecto",
    "Entrada AM", "Salida AM", "Entrada PM", "Salida PM", "Horas", "Estado", "Descripcion del servicio"
  ];
  const headerRowNumber = 7;
  const headerRow = worksheet.getRow(headerRowNumber);
  headerRow.values = headers;
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 9, color: { argb: white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: blue } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: navy } },
      left: { style: "thin", color: { argb: navy } },
      bottom: { style: "thin", color: { argb: navy } },
      right: { style: "thin", color: { argb: navy } }
    };
  });

  records.forEach((record, index) => {
    const serviceDate = record.ServiceDate ? new Date(`${record.ServiceDate}T00:00:00`) : null;
    const row = worksheet.addRow([
      record.ServiceRecordID,
      serviceDate && !Number.isNaN(serviceDate.getTime()) ? serviceDate : record.ServiceDate || "",
      record.LegacyOrderNumber || "",
      cleanReportText(record.TechnicianName),
      cleanReportText(record.ClientName),
      cleanReportText(record.ProjectName),
      record.MorningStart ? formatReportTime(record.MorningStart) : "-",
      record.MorningEnd ? formatReportTime(record.MorningEnd) : "-",
      record.AfternoonStart ? formatReportTime(record.AfternoonStart) : "-",
      record.AfternoonEnd ? formatReportTime(record.AfternoonEnd) : "-",
      Number(record.TotalHours || 0),
      record.Status || "",
      cleanReportText(record.ServiceDescription)
    ]);
    const descriptionLength = cleanReportText(record.ServiceDescription).length;

    row.height = Math.min(84, Math.max(22, 18 + Math.ceil(descriptionLength / 85) * 12));
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cell.font = { size: 9, color: { argb: slate } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? white : soft }
      };
      cell.border = {
        top: { style: "thin", color: { argb: border } },
        left: { style: "thin", color: { argb: border } },
        bottom: { style: "thin", color: { argb: border } },
        right: { style: "thin", color: { argb: border } }
      };
      cell.alignment = {
        vertical: "top",
        horizontal: columnNumber === 11
          ? "right"
          : [1, 2, 7, 8, 9, 10, 12].includes(columnNumber) ? "center" : "left",
        wrapText: true
      };
    });
    row.getCell(2).numFmt = "mm/dd/yyyy";
    row.getCell(11).numFmt = "#,##0.00";
    const statusCell = row.getCell(12);
    const statusColors = {
      Recorded: { fill: "FFFFF3CD", text: "FF7C4A03" },
      Billed: { fill: "FFDCFCE7", text: "FF166534" },
      Canceled: { fill: "FFFEE2E2", text: "FF991B1B" }
    };
    const statusColor = statusColors[record.Status];

    if (statusColor) {
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusColor.fill } };
      statusCell.font = { bold: true, size: 9, color: { argb: statusColor.text } };
    }
  });

  const totalRowNumber = worksheet.lastRow.number + 1;
  worksheet.mergeCells(`A${totalRowNumber}:J${totalRowNumber}`);
  worksheet.getCell(`A${totalRowNumber}`).value = "TOTAL DE HORAS";
  worksheet.getCell(`K${totalRowNumber}`).value = totalHours;
  worksheet.mergeCells(`L${totalRowNumber}:M${totalRowNumber}`);
  worksheet.getCell(`L${totalRowNumber}`).value = `${records.length} registros`;

  [worksheet.getCell(`A${totalRowNumber}`), worksheet.getCell(`K${totalRowNumber}`), worksheet.getCell(`L${totalRowNumber}`)].forEach((cell) => {
    cell.font = { bold: true, size: 10, color: { argb: navy } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: lightBlue } };
    cell.border = {
      top: { style: "medium", color: { argb: navy } },
      bottom: { style: "thin", color: { argb: border } }
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  worksheet.getCell(`K${totalRowNumber}`).alignment = { vertical: "middle", horizontal: "right" };
  worksheet.getCell(`L${totalRowNumber}`).alignment = { vertical: "middle", horizontal: "right" };
  worksheet.getCell(`K${totalRowNumber}`).numFmt = "#,##0.00";
  worksheet.getRow(totalRowNumber).height = 26;

  worksheet.autoFilter = `A${headerRowNumber}:M${headerRowNumber}`;
  worksheet.pageSetup.printTitlesRow = `${headerRowNumber}:${headerRowNumber}`;
  worksheet.pageSetup.printArea = `A1:M${totalRowNumber}`;
  worksheet.headerFooter.oddFooter = "&LSolutions By Design&C&P de &N&RReporte de horas";
  worksheet.headerFooter.evenFooter = worksheet.headerFooter.oddFooter;

  worksheet.columns.forEach((column, columnIndex) => {
    const minimumWidth = Number(column.width || 12);
    const maximumWidth = columnIndex === 12 ? 65 : 36;
    let contentWidth = minimumWidth;

    column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber < headerRowNumber) return;
      const value = cell.value instanceof Date ? "00/00/0000" : String(cell.value ?? "");
      contentWidth = Math.max(contentWidth, Math.min(value.length + 2, maximumWidth));
    });
    column.width = Math.min(Math.max(contentWidth, minimumWidth), maximumWidth);
  });

  return workbook;
}

function cleanManualInvoiceValue(value, fallback = "N/A") {
  const text = String(value ?? "").replace(/\r/g, "").trim();
  return text || fallback;
}

function formatManualInvoiceDate(value) {
  if (!value) return "N/A";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return cleanManualInvoiceValue(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatManualInvoiceNumber(value) {
  const text = cleanManualInvoiceValue(value, "");
  return text ? `#${text.replace(/^#/, "")}` : "N/A";
}

function formatManualInvoiceQuantity(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return cleanManualInvoiceValue(value);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}

function formatManualInvoiceMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return cleanManualInvoiceValue(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}

function normalizeManualInvoiceLines(invoice) {
  const sourceLines = Array.isArray(invoice.lines) ? invoice.lines : [{
    quantity: invoice.quantity,
    description: invoice.description,
    rate: invoice.rate
  }];
  const lines = sourceLines.map((line) => {
    const quantity = Number(line.quantity) || 0;
    const rate = Number(line.rate) || 0;
    const amount = quantity * rate;

    return {
      quantity,
      description: cleanManualInvoiceValue(line.description, ""),
      rate,
      amount
    };
  }).filter((line) => line.quantity > 0 || line.description || line.rate > 0 || line.amount > 0);

  return lines;
}

function getManualInvoiceValidationError(invoice) {
  const lines = normalizeManualInvoiceLines(invoice);

  if (!lines.length) {
    return "Agrega al menos una línea válida antes de generar la factura.";
  }

  const hasInvalidLine = lines.some((line) => (
    !Number.isFinite(line.quantity)
    || line.quantity <= 0
    || !Number.isFinite(line.rate)
    || line.rate < 0
    || !line.description
  ));

  if (hasInvalidLine) {
    return "Cada línea debe tener cantidad mayor que 0, descripción y rate válido.";
  }

  return "";
}

function normalizeManualInvoiceSignatures(invoice) {
  const sourceSignatures = Array.isArray(invoice.signatures) ? invoice.signatures : [];
  const signatures = sourceSignatures.slice(0, 2).map((signature) => ({
    name: cleanManualInvoiceValue(signature?.name, ""),
    title: cleanManualInvoiceValue(signature?.title, "")
  }));

  while (signatures.length < 2) {
    signatures.push({ name: "", title: "" });
  }

  return signatures;
}

function drawManualInvoicePdf(invoice, generatedAt, outputStream) {
  const document = new PDFDocument({ margin: 42, size: "LETTER", bufferPages: true });
  const margin = 42;
  const pageWidth = 612;
  const pageHeight = 792;
  const contentWidth = pageWidth - margin * 2;
  const navy = "#17365d";
  const slate = "#111827";
  const muted = "#4b5563";
  const border = "#94a3b8";
  const soft = "#f3f6fb";
  const invoiceNumber = formatManualInvoiceNumber(invoice.invoiceNumber);
  const invoiceDate = formatManualInvoiceDate(invoice.invoiceDate);
  const dueDate = formatManualInvoiceDate(invoice.dueDate);
  const billTo = cleanManualInvoiceValue(invoice.billTo);
  const poNumber = cleanManualInvoiceValue(invoice.poNumber);
  const terms = cleanManualInvoiceValue(invoice.terms);
  const project = cleanManualInvoiceValue(invoice.project);
  const invoiceLines = normalizeManualInvoiceLines(invoice);
  const subtotal = invoiceLines.reduce((sum, line) => sum + line.amount, 0);
  const taxRate = Math.max(0, Number(invoice.taxRate) || 0);
  const applyTax = invoice.applyTax !== false && invoice.applyTax !== "false";
  const taxAmount = applyTax ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + taxAmount;
  const signatures = normalizeManualInvoiceSignatures(invoice);
  const logoCandidates = [
    path.join(__dirname, "assets", "logo-horizontal.png")
  ];
  const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));

  document.on("error", (error) => {
    console.error("[manual-invoice-pdf] Error de PDFKit:", error);
    if (typeof outputStream.destroy === "function" && !outputStream.destroyed) {
      outputStream.destroy(error);
    }
  });

  document.pipe(outputStream);
  console.log("[manual-invoice-pdf] PDF iniciado");

  const drawBrand = () => {
    if (logoPath) {
      try {
        document.image(logoPath, margin, 38, { fit: [224, 108] });
        console.log("[manual-invoice-pdf] Logo cargado");
        return;
      } catch (error) {
        console.error("[manual-invoice-pdf] Error al cargar logo, usando fallback tipografico:", error);
      }
    }

    console.log("[manual-invoice-pdf] Logo no disponible, usando fallback tipografico");
    document.fillColor(navy).font("Helvetica-Bold").fontSize(18).text("Solutions By Design", margin, 48, {
      width: 230
    });
    document.fillColor(muted).font("Helvetica").fontSize(8.5).text("Professional services and technology solutions", margin, 72, {
      width: 230
    });
  };

  const drawFooter = () => {
    const range = document.bufferedPageRange();
    const generatedLabel = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(generatedAt);

    for (let index = 0; index < range.count; index += 1) {
      document.switchToPage(range.start + index);
      const footerBottom = document.page.height - document.page.margins.bottom;
      const footerLineY = footerBottom - 30;
      const footerTextY = footerBottom - 20;

      document.save();
      document.moveTo(margin, footerLineY).lineTo(pageWidth - margin, footerLineY).strokeColor(border).lineWidth(0.5).stroke();
      document.fillColor(muted).font("Helvetica").fontSize(8).text("Solutions By Design", margin, footerTextY, {
        width: 160,
        height: 10,
        lineBreak: false
      });
      document.text(`Page ${index + 1} of ${range.count}`, pageWidth - margin - 120, footerTextY, {
        width: 120,
        height: 10,
        align: "right",
        lineBreak: false
      });
      document.restore();
    }
  };

  drawBrand();
  document.fillColor(muted).font("Helvetica").fontSize(8.8).text(
    "50 Calle Isabel II STE 103\nBayamón, PR 00961-6355\nTel. (787) 946-1534\nFax (787) 946-7830",
    margin + 176,
    62,
    {
      width: 180,
      align: "left",
      lineGap: 2
    }
  );
  document.fillColor(navy).font("Helvetica-Bold").fontSize(26).text("INVOICE", pageWidth - margin - 190, 44, {
    width: 190,
    align: "right"
  });
  document.fillColor(slate).font("Helvetica-Bold").fontSize(10).text(`Invoice #: ${invoiceNumber}`, pageWidth - margin - 190, 78, {
    width: 190,
    align: "right"
  });
  document.fillColor(muted).font("Helvetica").fontSize(9).text(`Date: ${invoiceDate}`, pageWidth - margin - 190, 94, {
    width: 190,
    align: "right"
  });

  let y = 190;
  document.rect(margin, y, contentWidth, 94).strokeColor(border).lineWidth(0.8).stroke();
  document.rect(margin, y, 250, 24).fill(soft);
  document.fillColor(navy).font("Helvetica-Bold").fontSize(9).text("Bill To", margin + 12, y + 8, {
    width: 220
  });
  document.fillColor(slate).font("Helvetica").fontSize(9).text(billTo, margin + 12, y + 34, {
    width: 226,
    height: 48,
    lineGap: 2
  });

  const metaX = margin + 270;
  const metaColWidth = (contentWidth - 270) / 2;
  const metaRows = [
    ["P.O. No.", poNumber],
    ["Terms", terms],
    ["Due Date", dueDate],
    ["Project", project]
  ];

  metaRows.forEach((row, index) => {
    const rowX = metaX + (index % 2) * metaColWidth;
    const rowY = y + Math.floor(index / 2) * 47;

    document.fillColor(navy).font("Helvetica-Bold").fontSize(8).text(row[0], rowX, rowY + 10, {
      width: metaColWidth - 12
    });
    document.fillColor(slate).font("Helvetica").fontSize(9).text(row[1], rowX, rowY + 25, {
      width: metaColWidth - 12,
      height: 18,
      ellipsis: true
    });
  });

  y += 126;
  const columns = [
    { label: "Quantity", width: 78, align: "right" },
    { label: "Description", width: contentWidth - 272, align: "left" },
    { label: "Rate", width: 92, align: "right" },
    { label: "Amount", width: 102, align: "right" }
  ];
  const footerSafeBottom = pageHeight - margin - 42;
  const pageBottom = footerSafeBottom;
  const ensureInvoiceSpace = (requiredHeight) => {
    if (y + requiredHeight <= pageBottom) return;
    document.addPage({ margin });
    y = margin;
  };

  const drawInvoiceLinesHeader = () => {
    let x = margin;

    document.rect(margin, y, contentWidth, 24).fill(navy);
    columns.forEach((column) => {
      document.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.5).text(column.label, x + 8, y + 8, {
        width: column.width - 16,
        align: column.align
      });
      x += column.width;
    });
    y += 24;
  };

  drawInvoiceLinesHeader();

  invoiceLines.forEach((line, index) => {
    document.font("Helvetica").fontSize(9);
    const descriptionHeight = document.heightOfString(line.description || "N/A", {
      width: columns[1].width - 16,
      lineGap: 2
    });
    const rowHeight = Math.max(34, descriptionHeight + 18);

    if (y + rowHeight > pageBottom) {
      ensureInvoiceSpace(rowHeight + 24);
      drawInvoiceLinesHeader();
    }

    if (index % 2 === 0) {
      document.rect(margin, y, contentWidth, rowHeight).fill("#fbfdff");
    }
    document.rect(margin, y, contentWidth, rowHeight).strokeColor(border).lineWidth(0.6).stroke();

    let x = margin;
    [
      formatManualInvoiceQuantity(line.quantity),
      line.description || "N/A",
      formatManualInvoiceMoney(line.rate),
      formatManualInvoiceMoney(line.amount)
    ].forEach((value, valueIndex) => {
      const column = columns[valueIndex];

      document.fillColor(slate).font("Helvetica").fontSize(valueIndex === 1 ? 9 : 8.8).text(value, x + 8, y + 10, {
        width: column.width - 16,
        height: rowHeight - 18,
        align: column.align,
        lineGap: valueIndex === 1 ? 2 : 0
      });
      x += column.width;
    });

    y += rowHeight;
  });

  y += 10;
  ensureInvoiceSpace(156);
  const summaryX = pageWidth - margin - 230;
  const summaryLabelWidth = 118;
  const summaryValueWidth = 112;
  const summaryRows = [
    ["Subtotal", formatManualInvoiceMoney(subtotal), false],
    [`IVU (${formatManualInvoiceQuantity(applyTax ? taxRate : 0)}%)`, formatManualInvoiceMoney(taxAmount), false],
    ["TOTAL", formatManualInvoiceMoney(total), true]
  ];

  document.moveTo(summaryX, y).lineTo(pageWidth - margin, y).strokeColor(border).lineWidth(0.7).stroke();
  summaryRows.forEach((row, index) => {
    const rowY = y + 8 + index * 24;
    const isTotal = row[2];

    if (isTotal) {
      document.rect(summaryX, rowY - 5, summaryLabelWidth + summaryValueWidth, 24).fill(soft).strokeColor(border).stroke();
    }

    document.fillColor(isTotal ? navy : muted).font("Helvetica-Bold").fontSize(isTotal ? 10.5 : 9).text(row[0], summaryX + 8, rowY, {
      width: summaryLabelWidth - 12,
      align: "left",
      lineBreak: false
    });
    document.fillColor(slate).font("Helvetica-Bold").fontSize(isTotal ? 10.5 : 9).text(row[1], summaryX + summaryLabelWidth, rowY, {
      width: summaryValueWidth - 8,
      align: "right",
      lineBreak: false
    });
  });

  y += 92;
  ensureInvoiceSpace(78);
  document.fillColor(navy).font("Helvetica-Bold").fontSize(10).text("Certificación", margin, y, {
    width: contentWidth
  });
  document.fillColor(slate).font("Helvetica").fontSize(9).text(
    "Certificamos que los servicios descritos fueron ofrecidos según los términos acordados y están listos para revisión administrativa.",
    margin,
    y + 18,
    { width: contentWidth, lineGap: 2 }
  );

  y += 88;
  const signatureLineWidth = 210;
  const signatureDateWidth = 112;
  const signatureBlockGap = contentWidth - signatureLineWidth - signatureDateWidth;
  const signatureDateX = margin + signatureLineWidth + signatureBlockGap;

  signatures.forEach((signature) => {
    ensureInvoiceSpace(64);

    document.moveTo(margin, y).lineTo(margin + signatureLineWidth, y).strokeColor(border).lineWidth(0.7).stroke();
    document.moveTo(signatureDateX, y).lineTo(signatureDateX + signatureDateWidth, y).strokeColor(border).lineWidth(0.7).stroke();

    if (signature.name) {
      document.fillColor(slate).font("Helvetica").fontSize(9).text(signature.name, margin, y + 8, {
        width: signatureLineWidth,
        align: "center",
        lineBreak: false
      });
    }

    if (signature.title) {
      document.fillColor(muted).font("Helvetica").fontSize(8).text(signature.title, margin, y + 22, {
        width: signatureLineWidth,
        align: "center",
        lineBreak: false
      });
    }

    document.fillColor(muted).font("Helvetica").fontSize(8).text("Fecha", signatureDateX, y + 8, {
      width: signatureDateWidth,
      align: "center",
      lineBreak: false
    });

    y += 68;
  });

  drawFooter();
  const finalPageRange = document.bufferedPageRange();
  console.log(`[manual-invoice-pdf] Paginas antes de doc.end(): ${finalPageRange.count}`);
  console.log("[manual-invoice-pdf] Contenido agregado");
  console.log("[manual-invoice-pdf] doc.end() ejecutado");
  document.end();
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

app.get("/api/test-db", requireAdmin, async (req, res) => {
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
    console.info(`[auth] Login request received for ${email.trim().toLowerCase()}.`);
    const pool = await getPool();
    const result = await pool.request()
      .input("Email", sql.NVarChar(180), email.trim().toLowerCase())
      .query(`
        SELECT UserID, FullName, Email, Password, Role, IsTechnician, IsActive
        FROM dbo.Users
        WHERE Email = @Email
      `);

    if (result.recordset.length === 0) {
      console.info("[auth] Login rejected: user not found.");
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    const user = result.recordset[0];
    if (user.IsActive === false || Number(user.IsActive) === 0) {
      console.info(`[auth] Login rejected for user ${user.UserID}: inactive account.`);
      return res.status(403).json({ message: "Usuario inactivo. Contacta a un administrador." });
    }

    const passwordMatches = await bcrypt.compare(password, user.Password);

    if (!passwordMatches) {
      console.info(`[auth] Login rejected for user ${user.UserID}: invalid credentials.`);
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    await regenerateSession(req, mapUser(user));
    console.info(`[auth] Login successful for user ${user.UserID}; role=${req.session.user.Role}; session created=true.`);
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
    console.info("[auth] /api/me returned no active session.");
    return res.json({ user: null });
  }

  try {
    console.info(`[auth] Validating session for user ${req.session.user.UserID}; role=${normalizeRoleValue(req.session.user.Role)}.`);
    const pool = await getPool();
    const sessionUser = await getUserById(pool, Number(req.session.user.UserID));

    if (!sessionUser || sessionUser.IsActive === false) {
      console.info(`[auth] Session invalidated for user ${req.session.user.UserID}: missing or inactive account.`);
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    req.session.user = sessionUser;
    console.info(`[auth] Session valid for user ${sessionUser.UserID}; role=${sessionUser.Role}.`);
    res.json({ user: sessionUser });
  } catch (error) {
    poolPromise = null;
    console.error(`[auth] Session validation failed for user ${req.session.user?.UserID || "unknown"}.`, error);
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

app.delete("/api/notifications/:id", requireAdmin, async (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId)) {
    return res.status(400).json({ message: "ID de notificacion invalido." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("NotificationID", sql.Int, notificationId)
      .query(`
        DELETE FROM dbo.Notifications
        WHERE NotificationID = @NotificationID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Notificacion no encontrada." });
    }

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al borrar notificacion." });
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
        u.IsTechnician,
        u.IsActive,
        u.CreatedAt,
        u.CreatedByUserID,
        creator.FullName AS CreatedByFullName
      FROM dbo.Users u
      LEFT JOIN dbo.Users creator ON creator.UserID = u.CreatedByUserID
      ORDER BY u.CreatedAt DESC
    `);

    const assignmentCounts = new Map();
    if (await tableExists(pool, "dbo.UserProjectAssignments")) {
      const assignmentResult = await pool.request().query(`
        SELECT upa.UserID, COUNT(*) AS AssignedProjectCount
        FROM dbo.UserProjectAssignments upa
        WHERE upa.IsActive = 1
        GROUP BY upa.UserID
      `);
      assignmentResult.recordset.forEach((row) => {
        assignmentCounts.set(Number(row.UserID), Number(row.AssignedProjectCount || 0));
      });
    }

    res.json(result.recordset.map((record) => mapUser({
      ...record,
      AssignedProjectCount: assignmentCounts.get(Number(record.UserID)) || 0
    })));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
});

app.post("/api/users", requireAdmin, async (req, res) => {
  const { fullName, email, password } = req.body;
  const role = normalizeRoleValue(req.body?.role);
  const projectIds = normalizeProjectIds(req.body?.projectIds ?? []);

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  if (!isSupportedRole(role)) {
    return res.status(400).json({ message: "Rol invalido." });
  }

  if (projectIds === null) {
    return res.status(400).json({ message: "projectIds debe ser una lista valida." });
  }

  if (role !== "ProjectManager" && projectIds.length > 0) {
    return res.status(400).json({ message: "Solo se pueden asignar proyectos a usuarios Project Manager." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    let createdUserId;

    try {
      const result = await new sql.Request(transaction)
        .input("FullName", sql.NVarChar(120), fullName.trim())
        .input("Email", sql.NVarChar(180), email.trim().toLowerCase())
        .input("Password", sql.NVarChar(255), passwordHash)
        .input("Role", sql.NVarChar(30), role)
        .input("CreatedByUserID", sql.Int, Number(req.session.user.UserID))
        .query(`
          INSERT INTO dbo.Users (FullName, Email, Password, Role, CreatedByUserID)
          OUTPUT inserted.UserID
          VALUES (@FullName, @Email, @Password, @Role, @CreatedByUserID)
        `);

      createdUserId = result.recordset[0].UserID;

      if (role === "ProjectManager") {
        await syncUserProjectAssignmentsInTransaction(
          transaction,
          createdUserId,
          projectIds,
          Number(req.session.user.UserID)
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    const createdUser = await getUserById(pool, createdUserId);
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

    res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Error al crear usuario." });
  }
});

app.put("/api/users/:id", requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  const { fullName, email, password } = req.body;
  const role = normalizeRoleValue(req.body?.role);
  const isActive = parseOptionalBoolean(req.body?.isActive ?? req.body?.IsActive);
  const hasProjectIds = Object.prototype.hasOwnProperty.call(req.body || {}, "projectIds");
  const projectIds = hasProjectIds ? normalizeProjectIds(req.body?.projectIds) : [];

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "ID de usuario invalido." });
  }

  if (!fullName || !email || !role) {
    return res.status(400).json({ message: "Nombre, email y rol son obligatorios." });
  }

  if (!isSupportedRole(role)) {
    return res.status(400).json({ message: "Rol invalido." });
  }

  if (hasProjectIds && projectIds === null) {
    return res.status(400).json({ message: "projectIds debe ser una lista valida." });
  }

  if (role !== "ProjectManager" && projectIds.length > 0) {
    return res.status(400).json({ message: "Solo se pueden asignar proyectos a usuarios Project Manager." });
  }

  if (Number(req.session.user.UserID) === userId && isActive === false) {
    return res.status(400).json({ message: "No puedes desactivar tu propio usuario." });
  }

  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction)
      .input("UserID", sql.Int, userId)
      .input("FullName", sql.NVarChar(120), fullName.trim())
      .input("Email", sql.NVarChar(180), email.trim().toLowerCase())
      .input("Role", sql.NVarChar(30), role)
      .input("IsActive", sql.Bit, isActive);

    let passwordUpdate = "";

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      request.input("Password", sql.NVarChar(255), passwordHash);
      passwordUpdate = ", Password = @Password";
    }

    try {
      const result = await request.query(`
        UPDATE dbo.Users
        SET FullName = @FullName,
            Email = @Email,
            Role = @Role,
            IsActive = COALESCE(@IsActive, IsActive)
            ${passwordUpdate}
        WHERE UserID = @UserID
      `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      if (hasProjectIds) {
        await syncUserProjectAssignmentsInTransaction(
          transaction,
          userId,
          role === "ProjectManager" ? projectIds : [],
          Number(req.session.user.UserID)
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
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

    res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Error al editar usuario." });
  }
});

app.get("/api/users/:id/project-assignments", requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "ID de usuario invalido." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT
          upa.UserProjectAssignmentID,
          upa.ProjectID,
          p.ProjectName,
          p.ClientID,
          c.ClientName,
          upa.AssignedByUserID,
          assignedBy.FullName AS AssignedByName,
          upa.AssignedAt,
          upa.IsActive AS AssignmentIsActive,
          p.IsActive AS ProjectIsActive
        FROM dbo.UserProjectAssignments upa
        INNER JOIN dbo.Projects p ON p.ProjectID = upa.ProjectID
        INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
        INNER JOIN dbo.Users assignedBy ON assignedBy.UserID = upa.AssignedByUserID
        WHERE upa.UserID = @UserID
          AND upa.IsActive = 1
        ORDER BY c.ClientName, p.ProjectName
      `);

    res.json(result.recordset);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener asignaciones de proyectos." });
  }
});

app.put("/api/users/:id/project-assignments", requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  const projectIds = normalizeProjectIds(req.body?.projectIds);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "ID de usuario invalido." });
  }

  if (projectIds === null) {
    return res.status(400).json({ message: "projectIds debe ser una lista valida." });
  }

  try {
    const pool = await getPool();
    await syncUserProjectAssignments(pool, userId, projectIds, Number(req.session.user.UserID));
    const updatedUser = await getUserById(pool, userId);
    res.json(updatedUser);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(error.statusCode || 500).json({ message: error.message || "Error al guardar asignaciones." });
  }
});

async function updateUserActiveStatus(req, res) {
  const userId = Number(req.params.id);
  const isActive = parseOptionalBoolean(req.body?.isActive ?? req.body?.IsActive);

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "ID de usuario invalido." });
  }

  if (Number(req.session.user.UserID) === userId && isActive !== true) {
    return res.status(400).json({ message: "No puedes desactivar tu propio usuario." });
  }

  try {
    const pool = await getPool();
    const currentUserResult = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT UserID, IsActive
        FROM dbo.Users
        WHERE UserID = @UserID
      `);

    const targetUser = currentUserResult.recordset[0];

    if (!targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const nextIsActive = isActive === null ? !Boolean(targetUser.IsActive) : isActive;
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .input("IsActive", sql.Bit, nextIsActive)
      .query(`
        UPDATE dbo.Users
        SET IsActive = @IsActive,
            UpdatedAt = SYSUTCDATETIME()
        WHERE UserID = @UserID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const updatedUser = await getUserById(pool, userId);
    res.json(updatedUser);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado del usuario." });
  }
}

app.put("/api/users/:id/status", requireAdmin, updateUserActiveStatus);

app.delete("/api/users/:id", requireAdmin, async (req, res) => {
  await updateUserActiveStatus(req, res);
});

app.get("/api/clients", requireAuth, async (req, res) => {
  const search = String(req.query.search || req.query.q || "").trim().slice(0, 180);
  const status = String(req.query.status || "active").trim().toLowerCase();

  if (!["active", "inactive", "all"].includes(status)) {
    return res.status(400).json({ message: "El filtro status debe ser active, inactive o all." });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    const statusClause = status === "all"
      ? ""
      : status === "inactive"
        ? "AND c.IsActive = 0"
        : "AND c.IsActive = 1";
    let searchClause = "";

    if (search) {
      request.input("Search", sql.NVarChar(400), `%${search}%`);
      searchClause = `
        AND (
          c.ClientName LIKE @Search
          OR c.Email LIKE @Search
          OR c.Phone LIKE @Search
        )
      `;
    }

    const projectManagerClause = isProjectManager(req.session.user)
      ? `AND EXISTS (
          SELECT 1
          FROM dbo.Projects scopeProject
          INNER JOIN dbo.UserProjectAssignments scopeAssignment
            ON scopeAssignment.ProjectID = scopeProject.ProjectID
          WHERE scopeProject.ClientID = c.ClientID
            AND scopeProject.IsActive = 1
            AND scopeAssignment.UserID = @ScopeProjectManagerUserID
            AND scopeAssignment.IsActive = 1
        )`
      : "";

    if (isProjectManager(req.session.user)) {
      request.input("ScopeProjectManagerUserID", sql.Int, Number(req.session.user.UserID));
    }

    const result = await request.query(`
      SELECT
        c.ClientID,
        c.ClientName,
        c.ContactName,
        c.Email,
        c.Phone,
        c.AddressLine1,
        c.BillingName,
        c.TaxID,
        c.IsActive,
        c.CreatedAt,
        c.UpdatedAt
      FROM dbo.Clients c
      WHERE 1 = 1
      ${statusClause}
      ${searchClause}
      ${projectManagerClause}
      ORDER BY c.ClientName ASC
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
    if (!await userCanAccessClient(pool, req.session.user, clientId)) {
      return res.status(403).json({ message: "No tienes acceso a este cliente." });
    }
    const client = await getClientById(pool, clientId, false);

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

app.put("/api/clients/:id/status", requireAdmin, async (req, res) => {
  const clientId = Number(req.params.id);
  const isActive = req.body?.IsActive;

  if (!Number.isInteger(clientId) || clientId <= 0) {
    return res.status(400).json({ message: "ID de cliente invalido." });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "IsActive debe ser booleano." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("ClientID", sql.Int, clientId)
      .input("IsActive", sql.Bit, isActive)
      .query(`
        UPDATE dbo.Clients
        SET IsActive = @IsActive,
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
    res.status(500).json({ message: "Error al actualizar el estado del cliente." });
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

app.get("/api/projects", requireAuth, async (req, res) => {
  const search = String(req.query.search || req.query.q || "").trim().slice(0, 180);
  const status = String(req.query.status || "active").trim().toLowerCase();
  const rawClientId = req.query.clientId ?? req.query.ClientID;
  const hasClientFilter = rawClientId !== undefined && rawClientId !== null && rawClientId !== "";
  const clientId = hasClientFilter ? Number(rawClientId) : null;

  if (hasClientFilter && (!Number.isInteger(clientId) || clientId <= 0)) {
    return res.status(400).json({ message: "ClientID invalido." });
  }

  if (!["active", "inactive", "all"].includes(status)) {
    return res.status(400).json({ message: "El filtro status debe ser active, inactive o all." });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    const whereClauses = [];

    if (status === "active") whereClauses.push("p.IsActive = 1");
    if (status === "inactive") whereClauses.push("p.IsActive = 0");

    if (search) {
      request.input("Search", sql.NVarChar(400), `%${search}%`);
      whereClauses.push(`
        (
          p.ProjectName LIKE @Search
          OR c.ClientName LIKE @Search
          OR p.Description LIKE @Search
        )
      `);
    }

    if (hasClientFilter) {
      request.input("ClientID", sql.Int, clientId);
      whereClauses.push("p.ClientID = @ClientID");
    }

    addProjectManagerScope(request, whereClauses, req.session.user, "p");

    const result = await request.query(`
      SELECT
        p.ProjectID,
        p.ClientID,
        c.ClientName,
        p.ProjectName,
        p.Description,
        p.HourlyRate,
        p.ContractNumber,
        p.ContractType,
        p.SignedBy,
        p.ContractStartDate,
        p.ContractEndDate,
        p.ContractedHours,
        p.LowHoursThreshold,
        p.ExpirationAlertDays,
        pcs.UsedHours,
        pcs.RemainingHours,
        pcs.HoursAlertStatus,
        pcs.ExpirationAlertStatus,
        pcs.ContractStatus,
        managers.ProjectManagerNames,
        managers.ProjectManagerCount,
        managers.ProjectManagerUserIDs,
        p.IsActive,
        p.CreatedAt,
        p.UpdatedAt
      FROM dbo.Projects p
      INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
      LEFT JOIN dbo.vw_ProjectContractStatus pcs ON pcs.ProjectID = p.ProjectID
      OUTER APPLY (
        SELECT
          STRING_AGG(CONVERT(NVARCHAR(MAX), manager.FullName), N', ') AS ProjectManagerNames,
          COUNT(*) AS ProjectManagerCount,
          STRING_AGG(CONVERT(NVARCHAR(MAX), manager.UserID), N',') AS ProjectManagerUserIDs
        FROM dbo.UserProjectAssignments upa
        INNER JOIN dbo.Users manager ON manager.UserID = upa.UserID
        WHERE upa.ProjectID = p.ProjectID
          AND upa.IsActive = 1
          AND manager.IsActive = 1
          AND manager.Role IN (N'ProjectManager', N'Project Manager')
      ) managers
      ${whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : ""}
      ORDER BY c.ClientName ASC, p.ProjectName ASC
    `);

    res.json(result.recordset.map(mapProject));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener proyectos." });
  }
});

app.get("/api/projects/:id", requireAuth, async (req, res) => {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ message: "ID de proyecto invalido." });
  }

  try {
    const pool = await getPool();
    if (!await userCanAccessProject(pool, req.session.user, projectId)) {
      return res.status(403).json({ message: "No tienes acceso a este proyecto." });
    }
    const project = await getProjectById(pool, projectId, false);

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado." });
    }

    res.json(project);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener el proyecto." });
  }
});

app.get("/api/projects/:id/contract-status", requireAuth, async (req, res) => {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ message: "ID de proyecto invalido." });
  }

  try {
    const pool = await getPool();
    if (!await userCanAccessProject(pool, req.session.user, projectId)) {
      return res.status(403).json({ message: "No tienes acceso a este proyecto." });
    }
    const result = await pool.request()
      .input("ProjectID", sql.Int, projectId)
      .query(`
        SELECT
          ProjectID,
          ProjectName,
          ContractNumber,
          ContractType,
          ContractStartDate,
          ContractEndDate,
          ContractedHours,
          UsedHours,
          RemainingHours,
          LowHoursThreshold,
          ExpirationAlertDays,
          HoursAlertStatus,
          ExpirationAlertStatus,
          ContractStatus
        FROM dbo.vw_ProjectContractStatus
        WHERE ProjectID = @ProjectID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado." });
    }

    res.json(mapProjectContractStatus(result.recordset[0]));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener estado contractual del proyecto." });
  }
});

app.post("/api/projects", requireAdmin, async (req, res) => {
  const project = getProjectPayload(req.body || {});

  if (!Number.isInteger(project.clientId) || project.clientId <= 0) {
    return res.status(400).json({ message: "ClientID es obligatorio y debe ser valido." });
  }

  if (!project.projectName) {
    return res.status(400).json({ message: "ProjectName es obligatorio." });
  }

  if (!project.hourlyRateIsValid) {
    return res.status(400).json({ message: "HourlyRate debe ser un decimal no negativo." });
  }

  if (project.projectManagerUserIds === null) {
    return res.status(400).json({ message: "projectManagerUserIds debe ser una lista de UserID validos." });
  }

  const contractValidationMessage = getProjectContractValidationMessage(project);

  if (contractValidationMessage) {
    return res.status(400).json({ message: contractValidationMessage });
  }

  try {
    const pool = await getPool();
    const activeClient = await getClientById(pool, project.clientId);

    if (!activeClient) {
      return res.status(400).json({ message: "El cliente no existe o esta inactivo." });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let createdProjectId;

    try {
      const result = await new sql.Request(transaction)
      .input("ClientID", sql.Int, project.clientId)
      .input("ProjectName", sql.NVarChar(160), project.projectName)
      .input("Description", sql.NVarChar(500), project.description)
      .input("HourlyRate", sql.Decimal(10, 2), project.hourlyRate ?? 0)
      .input("ContractNumber", sql.NVarChar(80), project.contractNumber)
      .input("ContractType", sql.NVarChar(20), project.contractType)
      .input("SignedBy", sql.NVarChar(120), project.signedBy)
      .input("ContractStartDate", sql.Date, project.contractStartDate)
      .input("ContractEndDate", sql.Date, project.contractEndDate)
      .input("ContractedHours", sql.Decimal(8, 2), project.contractedHours)
      .input("LowHoursThreshold", sql.Decimal(8, 2), project.lowHoursThreshold)
      .input("ExpirationAlertDays", sql.Int, project.expirationAlertDays)
      .input("IsActive", sql.Bit, project.isActive ?? true)
      .input("CreatedByUserID", sql.Int, Number(req.session.user.UserID))
      .query(`
        INSERT INTO dbo.Projects (
          ClientID,
          ProjectName,
          Description,
          HourlyRate,
          ContractNumber,
          ContractType,
          SignedBy,
          ContractStartDate,
          ContractEndDate,
          ContractedHours,
          LowHoursThreshold,
          ExpirationAlertDays,
          IsActive,
          CreatedByUserID
        )
        OUTPUT inserted.ProjectID
        VALUES (
          @ClientID,
          @ProjectName,
          @Description,
          @HourlyRate,
          @ContractNumber,
          @ContractType,
          @SignedBy,
          @ContractStartDate,
          @ContractEndDate,
          @ContractedHours,
          @LowHoursThreshold,
          @ExpirationAlertDays,
          @IsActive,
          @CreatedByUserID
        )
      `);

      createdProjectId = Number(result.recordset[0].ProjectID);
      await syncProjectManagerAssignments(
        transaction,
        createdProjectId,
        project.projectManagerUserIds || [],
        Number(req.session.user.UserID)
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    const createdProject = await getProjectById(pool, createdProjectId, false);
    res.status(201).json(createdProject);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe un proyecto con ese nombre para el cliente." });
    }

    res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Error al crear el proyecto." });
  }
});

app.put("/api/projects/:id/status", requireAdmin, async (req, res) => {
  const projectId = Number(req.params.id);
  const isActive = req.body?.IsActive;

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ message: "ID de proyecto invalido." });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "IsActive debe ser booleano." });
  }

  try {
    const pool = await getPool();
    const existingProject = await getProjectById(pool, projectId, false);

    if (!existingProject) {
      return res.status(404).json({ message: "Proyecto no encontrado." });
    }

    if (isActive) {
      const activeClient = await getClientById(pool, Number(existingProject.ClientID));

      if (!activeClient) {
        return res.status(400).json({ message: "No se puede activar el proyecto mientras su cliente este inactivo." });
      }
    }

    await pool.request()
      .input("ProjectID", sql.Int, projectId)
      .input("IsActive", sql.Bit, isActive)
      .query(`
        UPDATE dbo.Projects
        SET IsActive = @IsActive,
            UpdatedAt = SYSUTCDATETIME()
        WHERE ProjectID = @ProjectID
      `);

    const updatedProject = await getProjectById(pool, projectId, false);
    res.json(updatedProject);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el estado del proyecto." });
  }
});

app.put("/api/projects/:id", requireAdmin, async (req, res) => {
  const projectId = Number(req.params.id);
  const project = getProjectPayload(req.body || {});

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ message: "ID de proyecto invalido." });
  }

  if (!Number.isInteger(project.clientId) || project.clientId <= 0) {
    return res.status(400).json({ message: "ClientID es obligatorio y debe ser valido." });
  }

  if (!project.projectName) {
    return res.status(400).json({ message: "ProjectName es obligatorio." });
  }

  if (!project.hourlyRateIsValid) {
    return res.status(400).json({ message: "HourlyRate debe ser un decimal no negativo." });
  }

  if (project.projectManagerUserIds === null) {
    return res.status(400).json({ message: "projectManagerUserIds debe ser una lista de UserID validos." });
  }

  const contractValidationMessage = getProjectContractValidationMessage(project);

  if (contractValidationMessage) {
    return res.status(400).json({ message: contractValidationMessage });
  }

  try {
    const pool = await getPool();
    const existingProject = await getProjectById(pool, projectId, false);

    if (!existingProject) {
      return res.status(404).json({ message: "Proyecto no encontrado." });
    }

    const activeClient = await getClientById(pool, project.clientId);
    const canKeepInactiveClient = !existingProject.IsActive
      && project.isActive === false
      && Number(existingProject.ClientID) === project.clientId;

    if (!activeClient && !canKeepInactiveClient) {
      return res.status(400).json({ message: "El cliente no existe o esta inactivo." });
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let rowsAffected = 0;

    try {
      const result = await new sql.Request(transaction)
      .input("ProjectID", sql.Int, projectId)
      .input("ClientID", sql.Int, project.clientId)
      .input("ProjectName", sql.NVarChar(160), project.projectName)
      .input("Description", sql.NVarChar(500), project.description)
      .input("HourlyRate", sql.Decimal(10, 2), project.hourlyRate)
      .input("ContractNumber", sql.NVarChar(80), project.contractNumber)
      .input("ContractType", sql.NVarChar(20), project.contractType)
      .input("SignedBy", sql.NVarChar(120), project.signedBy)
      .input("ContractStartDate", sql.Date, project.contractStartDate)
      .input("ContractEndDate", sql.Date, project.contractEndDate)
      .input("ContractedHours", sql.Decimal(8, 2), project.contractedHours)
      .input("LowHoursThreshold", sql.Decimal(8, 2), project.lowHoursThreshold)
      .input("ExpirationAlertDays", sql.Int, project.expirationAlertDays)
      .input("HasContractNumber", sql.Bit, project.hasContractNumber)
      .input("HasContractType", sql.Bit, project.hasContractType)
      .input("HasSignedBy", sql.Bit, project.hasSignedBy)
      .input("HasContractStartDate", sql.Bit, project.hasContractStartDate)
      .input("HasContractEndDate", sql.Bit, project.hasContractEndDate)
      .input("HasContractedHours", sql.Bit, project.hasContractedHours)
      .input("HasLowHoursThreshold", sql.Bit, project.hasLowHoursThreshold)
      .input("HasExpirationAlertDays", sql.Bit, project.hasExpirationAlertDays)
      .input("IsActive", sql.Bit, project.isActive)
      .query(`
        UPDATE dbo.Projects
        SET ClientID = @ClientID,
            ProjectName = @ProjectName,
            Description = @Description,
            HourlyRate = COALESCE(@HourlyRate, HourlyRate),
            ContractNumber = CASE WHEN @HasContractNumber = 1 THEN @ContractNumber ELSE ContractNumber END,
            ContractType = CASE WHEN @HasContractType = 1 THEN @ContractType ELSE ContractType END,
            SignedBy = CASE WHEN @HasSignedBy = 1 THEN @SignedBy ELSE SignedBy END,
            ContractStartDate = CASE WHEN @HasContractStartDate = 1 THEN @ContractStartDate ELSE ContractStartDate END,
            ContractEndDate = CASE WHEN @HasContractEndDate = 1 THEN @ContractEndDate ELSE ContractEndDate END,
            ContractedHours = CASE WHEN @HasContractedHours = 1 THEN @ContractedHours ELSE ContractedHours END,
            LowHoursThreshold = CASE WHEN @HasLowHoursThreshold = 1 THEN @LowHoursThreshold ELSE LowHoursThreshold END,
            ExpirationAlertDays = CASE WHEN @HasExpirationAlertDays = 1 THEN @ExpirationAlertDays ELSE ExpirationAlertDays END,
            IsActive = COALESCE(@IsActive, IsActive),
            UpdatedAt = SYSUTCDATETIME()
        WHERE ProjectID = @ProjectID
      `);
      rowsAffected = result.rowsAffected[0];

      if (rowsAffected === 0) {
        const error = new Error("Proyecto no encontrado.");
        error.statusCode = 404;
        throw error;
      }

      if (project.hasProjectManagerUserIds) {
        await syncProjectManagerAssignments(
          transaction,
          projectId,
          project.projectManagerUserIds,
          Number(req.session.user.UserID)
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    if (rowsAffected === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado." });
    }

    const updatedProject = await getProjectById(pool, projectId, false);
    res.json(updatedProject);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe un proyecto con ese nombre para el cliente." });
    }

    res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Error al editar el proyecto." });
  }
});

app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return res.status(400).json({ message: "ID de proyecto invalido." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("ProjectID", sql.Int, projectId)
      .query(`
        UPDATE dbo.Projects
        SET IsActive = 0,
            UpdatedAt = SYSUTCDATETIME()
        WHERE ProjectID = @ProjectID
          AND IsActive = 1
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Proyecto activo no encontrado." });
    }

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al desactivar el proyecto." });
  }
});

app.get("/api/service-records", requireAdminOrTechnician, async (req, res) => {
  const search = String(req.query.search || req.query.q || "").trim().slice(0, 300);
  const rawFilters = {
    TechnicianUserID: req.query.technicianUserId ?? req.query.TechnicianUserID,
    ClientID: req.query.clientId ?? req.query.ClientID,
    ProjectID: req.query.projectId ?? req.query.ProjectID
  };
  const numericFilters = {};

  for (const [name, rawValue] of Object.entries(rawFilters)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    const value = Number(rawValue);

    if (!Number.isInteger(value) || value <= 0) {
      return res.status(400).json({ message: `${name} invalido.` });
    }

    numericFilters[name] = value;
  }

  if (["Technician", "User"].includes(req.session.user.Role)) {
    const sessionUserId = Number(req.session.user.UserID);

    if (numericFilters.TechnicianUserID && numericFilters.TechnicianUserID !== sessionUserId) {
      return res.status(403).json({ message: "Solo puedes consultar tus propios registros." });
    }

    numericFilters.TechnicianUserID = sessionUserId;
  }

  const serviceDate = String(req.query.serviceDate || req.query.ServiceDate || "").trim();
  const status = String(req.query.status || req.query.Status || "").trim();

  if (serviceDate && !isValidServiceDate(serviceDate)) {
    return res.status(400).json({ message: "ServiceDate debe usar formato YYYY-MM-DD." });
  }

  if (status && !SERVICE_RECORD_STATUSES.has(status)) {
    return res.status(400).json({ message: "Status debe ser Recorded, Billed o Canceled." });
  }

  try {
    const pool = await getPool();
    if (isProjectManager(req.session.user)
      && numericFilters.ProjectID
      && !await userCanAccessProject(pool, req.session.user, numericFilters.ProjectID)) {
      return res.status(403).json({ message: "No tienes acceso al proyecto solicitado." });
    }
    const request = pool.request();
    const whereClauses = [];

    if (search) {
      request.input("Search", sql.NVarChar(620), `%${search}%`);
      whereClauses.push(`
        (
          sr.ServiceDescription LIKE @Search
          OR technician.FullName LIKE @Search
          OR client.ClientName LIKE @Search
          OR project.ProjectName LIKE @Search
        )
      `);
    }

    for (const [name, value] of Object.entries(numericFilters)) {
      request.input(name, sql.Int, value);
      whereClauses.push(`sr.${name} = @${name}`);
    }

    if (serviceDate) {
      request.input("ServiceDate", sql.Date, serviceDate);
      whereClauses.push("sr.ServiceDate = @ServiceDate");
    }

    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClauses.push("sr.Status = @Status");
    }

    addProjectManagerScope(request, whereClauses, req.session.user, "sr");

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const result = await request.query(`
      SELECT
        sr.ServiceRecordID,
        sr.TechnicianUserID,
        technician.FullName AS TechnicianName,
        sr.ClientID,
        client.ClientName,
        sr.ProjectID,
        project.ProjectName,
        sr.ServiceDate,
        sr.MorningStart,
        sr.MorningEnd,
        sr.AfternoonStart,
        sr.AfternoonEnd,
        sr.TotalHours,
        sr.ServiceDescription,
        sr.Status,
        sr.InvoiceID,
        sr.CreatedAt,
        sr.UpdatedAt
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
      INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
      INNER JOIN dbo.Projects project ON project.ProjectID = sr.ProjectID
      ${whereSql}
      ORDER BY sr.ServiceDate DESC, sr.ServiceRecordID DESC
    `);

    res.json(result.recordset.map(mapServiceRecord));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener registros de servicio." });
  }
});

app.get("/api/service-records/:id", requireAdminOrTechnician, async (req, res) => {
  const serviceRecordId = Number(req.params.id);

  if (!Number.isInteger(serviceRecordId) || serviceRecordId <= 0) {
    return res.status(400).json({ message: "ID de registro de servicio invalido." });
  }

  try {
    const pool = await getPool();
    const serviceRecord = await getServiceRecordById(pool, serviceRecordId);

    if (!serviceRecord) {
      return res.status(404).json({ message: "Registro de servicio no encontrado." });
    }

    if (isProjectManager(req.session.user)
      && !await userCanAccessProject(pool, req.session.user, serviceRecord.ProjectID)) {
      return res.status(403).json({ message: "No tienes acceso a este registro de servicio." });
    }

    if (["Technician", "User"].includes(req.session.user.Role)
      && Number(serviceRecord.TechnicianUserID) !== Number(req.session.user.UserID)) {
      return res.status(403).json({ message: "Solo puedes consultar tus propios registros." });
    }

    res.json(serviceRecord);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener el registro de servicio." });
  }
});

app.post("/api/service-records", requireAdminOrTechnician, async (req, res) => {
  if (isProjectManager(req.session.user)) {
    return res.status(403).json({ message: "Project Manager solo puede consultar registros de sus proyectos asignados." });
  }

  const serviceRecord = getServiceRecordPayload(req.body || {});
  const validationError = getServiceRecordValidationError(serviceRecord);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (req.session.user.Role !== "Admin"
    && Number(req.session.user.UserID) !== serviceRecord.technicianUserId) {
    return res.status(403).json({ message: "Solo puedes crear registros a tu propio nombre." });
  }

  if (req.session.user.Role !== "Admin"
    && serviceRecord.status
    && serviceRecord.status !== "Recorded") {
    return res.status(403).json({ message: "Solo un administrador puede asignar estados administrativos." });
  }

  try {
    const pool = await getPool();
    const referenceError = await validateServiceRecordReferences(pool, serviceRecord);

    if (referenceError) {
      return res.status(400).json({ message: referenceError });
    }

    const result = await pool.request()
      .input("TechnicianUserID", sql.Int, serviceRecord.technicianUserId)
      .input("ClientID", sql.Int, serviceRecord.clientId)
      .input("ProjectID", sql.Int, serviceRecord.projectId)
      .input("ServiceDate", sql.Date, serviceRecord.serviceDate)
      .input("MorningStart", sql.VarChar(8), serviceRecord.morningStart)
      .input("MorningEnd", sql.VarChar(8), serviceRecord.morningEnd)
      .input("AfternoonStart", sql.VarChar(8), serviceRecord.afternoonStart)
      .input("AfternoonEnd", sql.VarChar(8), serviceRecord.afternoonEnd)
      .input("TotalHours", sql.Decimal(6, 2), serviceRecord.totalHours)
      .input("ServiceDescription", sql.NVarChar(sql.MAX), serviceRecord.serviceDescription)
      .input("Status", sql.NVarChar(20), req.session.user.Role === "Admin" ? (serviceRecord.status || "Recorded") : "Recorded")
      .input("CreatedByUserID", sql.Int, Number(req.session.user.UserID))
      .query(`
        INSERT INTO dbo.ServiceRecords (
          TechnicianUserID,
          ClientID,
          ProjectID,
          ServiceDate,
          MorningStart,
          MorningEnd,
          AfternoonStart,
          AfternoonEnd,
          TotalHours,
          ServiceDescription,
          Status,
          CreatedByUserID
        )
        OUTPUT inserted.ServiceRecordID
        VALUES (
          @TechnicianUserID,
          @ClientID,
          @ProjectID,
          @ServiceDate,
          @MorningStart,
          @MorningEnd,
          @AfternoonStart,
          @AfternoonEnd,
          @TotalHours,
          @ServiceDescription,
          @Status,
          @CreatedByUserID
        )
      `);

    const createdRecord = await getServiceRecordById(pool, result.recordset[0].ServiceRecordID);
    res.status(201).json(createdRecord);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al crear el registro de servicio." });
  }
});

app.put("/api/service-records/:id", requireAdminOrTechnician, async (req, res) => {
  if (isProjectManager(req.session.user)) {
    return res.status(403).json({ message: "Project Manager no puede editar registros de servicio." });
  }

  const serviceRecordId = Number(req.params.id);
  const serviceRecord = getServiceRecordPayload(req.body || {});

  if (!Number.isInteger(serviceRecordId) || serviceRecordId <= 0) {
    return res.status(400).json({ message: "ID de registro de servicio invalido." });
  }

  const validationError = getServiceRecordValidationError(serviceRecord);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const pool = await getPool();
    const previousRecord = await getServiceRecordById(pool, serviceRecordId);

    if (!previousRecord) {
      return res.status(404).json({ message: "Registro de servicio no encontrado." });
    }

    const isAdminUser = req.session.user.Role === "Admin";

    if (!isAdminUser) {
      const sessionUserId = Number(req.session.user.UserID);

      if (Number(previousRecord.TechnicianUserID) !== sessionUserId) {
        return res.status(403).json({ message: "Solo puedes editar tus propios registros." });
      }

      if (Number(serviceRecord.technicianUserId) !== sessionUserId) {
        return res.status(403).json({ message: "No puedes cambiar el tecnico del registro." });
      }

      if (serviceRecord.status && serviceRecord.status !== previousRecord.Status) {
        return res.status(403).json({ message: "No tienes permiso para cambiar el estado del registro." });
      }
    }

    const referenceError = await validateServiceRecordReferences(pool, serviceRecord);

    if (referenceError) {
      return res.status(400).json({ message: referenceError });
    }

    const result = await pool.request()
      .input("ServiceRecordID", sql.Int, serviceRecordId)
      .input("TechnicianUserID", sql.Int, serviceRecord.technicianUserId)
      .input("ClientID", sql.Int, serviceRecord.clientId)
      .input("ProjectID", sql.Int, serviceRecord.projectId)
      .input("ServiceDate", sql.Date, serviceRecord.serviceDate)
      .input("MorningStart", sql.VarChar(8), serviceRecord.morningStart)
      .input("MorningEnd", sql.VarChar(8), serviceRecord.morningEnd)
      .input("AfternoonStart", sql.VarChar(8), serviceRecord.afternoonStart)
      .input("AfternoonEnd", sql.VarChar(8), serviceRecord.afternoonEnd)
      .input("TotalHours", sql.Decimal(6, 2), serviceRecord.totalHours)
      .input("ServiceDescription", sql.NVarChar(sql.MAX), serviceRecord.serviceDescription)
      .input("Status", sql.NVarChar(20), isAdminUser ? serviceRecord.status : previousRecord.Status)
      .query(`
        UPDATE dbo.ServiceRecords
        SET TechnicianUserID = @TechnicianUserID,
            ClientID = @ClientID,
            ProjectID = @ProjectID,
            ServiceDate = @ServiceDate,
            MorningStart = @MorningStart,
            MorningEnd = @MorningEnd,
            AfternoonStart = @AfternoonStart,
            AfternoonEnd = @AfternoonEnd,
            TotalHours = @TotalHours,
            ServiceDescription = @ServiceDescription,
            Status = COALESCE(@Status, Status),
            UpdatedAt = SYSUTCDATETIME()
        WHERE ServiceRecordID = @ServiceRecordID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Registro de servicio no encontrado." });
    }

    const updatedRecord = await getServiceRecordById(pool, serviceRecordId);
    if (updatedRecord?.Status === "Billed" && previousRecord.Status !== "Billed") {
      try {
        await createAdminServiceRecordsProcessedNotifications(pool, [updatedRecord]);
      } catch (notificationError) {
        console.error(notificationError);
      }
    }

    res.json(updatedRecord);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al editar el registro de servicio." });
  }
});

app.delete("/api/service-records/:id", requireAdmin, async (req, res) => {
  const serviceRecordId = Number(req.params.id);

  if (!Number.isInteger(serviceRecordId) || serviceRecordId <= 0) {
    return res.status(400).json({ message: "ID de registro de servicio invalido." });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("ServiceRecordID", sql.Int, serviceRecordId)
      .query(`
        UPDATE dbo.ServiceRecords
        SET Status = N'Canceled',
            UpdatedAt = SYSUTCDATETIME()
        WHERE ServiceRecordID = @ServiceRecordID
          AND Status <> N'Canceled'
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Registro activo no encontrado." });
    }

    res.status(204).send();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al cancelar el registro de servicio." });
  }
});

app.get("/api/invoices", requireAuth, requireInvoiceReadAccess, async (req, res) => {
  const search = String(req.query.search || req.query.q || "").trim().slice(0, 180);
  const rawClientId = req.query.clientId ?? req.query.ClientID;
  const hasClientFilter = rawClientId !== undefined && rawClientId !== null && rawClientId !== "";
  const clientId = hasClientFilter ? Number(rawClientId) : null;
  const status = String(req.query.status || req.query.Status || "").trim();
  const periodFrom = String(req.query.periodFrom || req.query.PeriodFrom || "").trim();
  const periodTo = String(req.query.periodTo || req.query.PeriodTo || "").trim();

  if (hasClientFilter && (!Number.isInteger(clientId) || clientId <= 0)) {
    return res.status(400).json({ message: "ClientID invalido." });
  }

  if (status && !INVOICE_STATUSES.has(status)) {
    return res.status(400).json({ message: "Status debe ser Draft, Issued, Paid o Canceled." });
  }

  if ((periodFrom && !isValidServiceDate(periodFrom)) || (periodTo && !isValidServiceDate(periodTo))) {
    return res.status(400).json({ message: "PeriodFrom y PeriodTo deben usar formato YYYY-MM-DD." });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    const whereClauses = [];

    if (search) {
      request.input("Search", sql.NVarChar(400), `%${search}%`);
      whereClauses.push(`
        (
          i.InvoiceNumber LIKE @Search
          OR c.ClientName LIKE @Search
          OR i.Notes LIKE @Search
        )
      `);
    }

    if (hasClientFilter) {
      request.input("ClientID", sql.Int, clientId);
      whereClauses.push("i.ClientID = @ClientID");
    }

    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClauses.push("i.Status = @Status");
    }

    if (periodFrom) {
      request.input("PeriodFrom", sql.Date, periodFrom);
      whereClauses.push("i.PeriodTo >= @PeriodFrom");
    }

    if (periodTo) {
      request.input("PeriodTo", sql.Date, periodTo);
      whereClauses.push("i.PeriodFrom <= @PeriodTo");
    }

    if (req.session.user.Role === "Technician") {
      request.input("TechnicianUserID", sql.Int, Number(req.session.user.UserID));
      whereClauses.push(`
        EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND sr.TechnicianUserID = @TechnicianUserID
        )
      `);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const result = await request.query(`
      SELECT
        i.InvoiceID,
        i.InvoiceNumber,
        i.ClientID,
        c.ClientName,
        i.InvoiceDate,
        i.PeriodFrom,
        i.PeriodTo,
        i.Subtotal,
        i.TaxRate,
        i.TaxAmount,
        i.TotalAmount,
        i.Status,
        i.Notes,
        i.IsActive,
        i.CreatedAt,
        i.UpdatedAt,
        i.CreatedByUserID,
        creator.FullName AS CreatedByName
      FROM dbo.Invoices i
      INNER JOIN dbo.Clients c ON c.ClientID = i.ClientID
      LEFT JOIN dbo.Users creator ON creator.UserID = i.CreatedByUserID
      ${whereSql}
      ORDER BY i.InvoiceDate DESC, i.InvoiceID DESC
    `);

    res.json(result.recordset.map((invoice) => mapInvoice(invoice)));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener facturas." });
  }
});

app.post("/api/invoices/generate", requireAdmin, async (req, res) => {
  const invoice = getInvoicePayload(req.body || {});
  const today = new Date().toISOString().slice(0, 10);

  if (!invoice.invoiceDate) invoice.invoiceDate = today;
  if (!invoice.status) invoice.status = "Issued";
  if (invoice.taxRate === null) invoice.taxRate = 0;

  const validationError = getInvoiceValidationError(invoice, false);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const pool = await getPool();
    const activeClient = await getClientById(pool, invoice.clientId);

    if (!activeClient) {
      return res.status(400).json({ message: "El cliente no existe o esta inactivo." });
    }

    const billableResult = await pool.request()
      .input("ClientID", sql.Int, invoice.clientId)
      .input("PeriodFrom", sql.Date, invoice.periodFrom)
      .input("PeriodTo", sql.Date, invoice.periodTo)
      .query(`
        SELECT
          sr.ServiceRecordID,
          sr.ProjectID,
          sr.ServiceDate,
          sr.TotalHours,
          sr.ServiceDescription,
          p.HourlyRate
        FROM dbo.ServiceRecords sr
        INNER JOIN dbo.Projects p ON p.ProjectID = sr.ProjectID
        WHERE sr.ClientID = @ClientID
          AND sr.ServiceDate BETWEEN @PeriodFrom AND @PeriodTo
          AND sr.Status = N'Recorded'
          AND sr.InvoiceID IS NULL
          AND sr.IsActive = 1
        ORDER BY sr.ServiceDate ASC, sr.ServiceRecordID ASC
      `);
    const billableRecords = billableResult.recordset;

    if (billableRecords.length === 0) {
      return res.status(400).json({
        message: "No hay registros Recorded sin facturar para ese cliente y rango de fechas."
      });
    }

    const subtotal = Math.round(billableRecords.reduce((sum, record) => {
      return sum + (Number(record.TotalHours) * Number(record.HourlyRate));
    }, 0) * 100) / 100;
    const taxAmount = Math.round(subtotal * invoice.taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    const invoiceNumber = invoice.invoiceNumber || await getNextInvoiceNumber(pool);
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const invoiceResult = await new sql.Request(transaction)
        .input("InvoiceNumber", sql.NVarChar(40), invoiceNumber)
        .input("ClientID", sql.Int, invoice.clientId)
        .input("InvoiceDate", sql.Date, invoice.invoiceDate)
        .input("PeriodFrom", sql.Date, invoice.periodFrom)
        .input("PeriodTo", sql.Date, invoice.periodTo)
        .input("Subtotal", sql.Decimal(12, 2), subtotal)
        .input("TaxRate", sql.Decimal(7, 4), invoice.taxRate)
        .input("TaxAmount", sql.Decimal(12, 2), taxAmount)
        .input("TotalAmount", sql.Decimal(12, 2), totalAmount)
        .input("Status", sql.NVarChar(20), invoice.status)
        .input("Notes", sql.NVarChar(500), invoice.notes)
        .input("CreatedByUserID", sql.Int, Number(req.session.user.UserID))
        .query(`
          INSERT INTO dbo.Invoices (
            InvoiceNumber,
            ClientID,
            InvoiceDate,
            PeriodFrom,
            PeriodTo,
            Subtotal,
            TaxRate,
            TaxAmount,
            TotalAmount,
            Status,
            Notes,
            CreatedByUserID
          )
          OUTPUT inserted.InvoiceID
          VALUES (
            @InvoiceNumber,
            @ClientID,
            @InvoiceDate,
            @PeriodFrom,
            @PeriodTo,
            @Subtotal,
            @TaxRate,
            @TaxAmount,
            @TotalAmount,
            @Status,
            @Notes,
            @CreatedByUserID
          )
        `);
      const invoiceId = invoiceResult.recordset[0].InvoiceID;

      for (const record of billableRecords) {
        const hours = Number(record.TotalHours);
        const hourlyRate = Number(record.HourlyRate);
        const lineTotal = Math.round(hours * hourlyRate * 100) / 100;

        await new sql.Request(transaction)
          .input("InvoiceID", sql.Int, invoiceId)
          .input("ServiceRecordID", sql.Int, record.ServiceRecordID)
          .input("ProjectID", sql.Int, record.ProjectID)
          .input("Description", sql.NVarChar(500), String(record.ServiceDescription).slice(0, 500))
          .input("ServiceDate", sql.Date, record.ServiceDate)
          .input("Hours", sql.Decimal(6, 2), hours)
          .input("HourlyRate", sql.Decimal(10, 2), hourlyRate)
          .input("LineTotal", sql.Decimal(12, 2), lineTotal)
          .query(`
            INSERT INTO dbo.InvoiceLines (
              InvoiceID,
              ServiceRecordID,
              ProjectID,
              Description,
              ServiceDate,
              Hours,
              HourlyRate,
              LineTotal
            )
            VALUES (
              @InvoiceID,
              @ServiceRecordID,
              @ProjectID,
              @Description,
              @ServiceDate,
              @Hours,
              @HourlyRate,
              @LineTotal
            )
          `);
      }

      const updateRequest = new sql.Request(transaction)
        .input("InvoiceID", sql.Int, invoiceId);
      const serviceRecordPlaceholders = billableRecords.map((record, index) => {
        const inputName = `ServiceRecordID${index}`;
        updateRequest.input(inputName, sql.Int, record.ServiceRecordID);
        return `@${inputName}`;
      });
      const billedResult = await updateRequest.query(`
        UPDATE dbo.ServiceRecords
        SET Status = N'Billed',
            InvoiceID = @InvoiceID,
            UpdatedAt = SYSUTCDATETIME()
        WHERE ServiceRecordID IN (${serviceRecordPlaceholders.join(", ")})
          AND Status = N'Recorded'
          AND InvoiceID IS NULL
          AND IsActive = 1
      `);

      if (billedResult.rowsAffected[0] !== billableRecords.length) {
        throw new Error("Algunos registros ya no estan disponibles para facturar.");
      }

      await transaction.commit();

      const createdInvoice = await getInvoiceById(pool, invoiceId, true);
      try {
        const processedRecords = await getServiceRecordsByIds(
          pool,
          billableRecords.map((record) => record.ServiceRecordID)
        );
        await createAdminServiceRecordsProcessedNotifications(pool, processedRecords);
      } catch (notificationError) {
        console.error(notificationError);
      }

      res.status(201).json(createdInvoice);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe una factura con ese numero." });
    }

    res.status(500).json({ message: "Error al generar la factura." });
  }
});

app.get("/api/invoices/:id", requireAuth, requireInvoiceReadAccess, async (req, res) => {
  const invoiceId = Number(req.params.id);

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: "ID de factura invalido." });
  }

  try {
    const pool = await getPool();

    if (req.session.user.Role === "Technician") {
      const accessResult = await pool.request()
        .input("InvoiceID", sql.Int, invoiceId)
        .input("TechnicianUserID", sql.Int, Number(req.session.user.UserID))
        .query(`
          SELECT TOP 1 1 AS HasAccess
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = @InvoiceID
            AND sr.TechnicianUserID = @TechnicianUserID
        `);

      if (accessResult.recordset.length === 0) {
        return res.status(403).json({ message: "Solo puedes consultar facturas relacionadas con tus registros." });
      }
    }

    const invoice = await getInvoiceById(pool, invoiceId, true);

    if (!invoice) {
      return res.status(404).json({ message: "Factura no encontrada." });
    }

    res.json(invoice);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener la factura." });
  }
});

app.post("/api/invoices", requireAdmin, async (req, res) => {
  const invoice = getInvoicePayload(req.body || {});

  if (!invoice.status) invoice.status = "Draft";
  if (invoice.taxRate === null) invoice.taxRate = 0;

  const validationError = getInvoiceValidationError(invoice);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const pool = await getPool();
    const activeClient = await getClientById(pool, invoice.clientId);

    if (!activeClient) {
      return res.status(400).json({ message: "El cliente no existe o esta inactivo." });
    }

    const result = await pool.request()
      .input("InvoiceNumber", sql.NVarChar(40), invoice.invoiceNumber)
      .input("ClientID", sql.Int, invoice.clientId)
      .input("InvoiceDate", sql.Date, invoice.invoiceDate)
      .input("PeriodFrom", sql.Date, invoice.periodFrom)
      .input("PeriodTo", sql.Date, invoice.periodTo)
      .input("TaxRate", sql.Decimal(7, 4), invoice.taxRate)
      .input("Status", sql.NVarChar(20), invoice.status)
      .input("Notes", sql.NVarChar(500), invoice.notes)
      .input("IsActive", sql.Bit, invoice.isActive ?? true)
      .input("CreatedByUserID", sql.Int, Number(req.session.user.UserID))
      .query(`
        INSERT INTO dbo.Invoices (
          InvoiceNumber,
          ClientID,
          InvoiceDate,
          PeriodFrom,
          PeriodTo,
          TaxRate,
          Status,
          Notes,
          IsActive,
          CreatedByUserID
        )
        OUTPUT inserted.InvoiceID
        VALUES (
          @InvoiceNumber,
          @ClientID,
          @InvoiceDate,
          @PeriodFrom,
          @PeriodTo,
          @TaxRate,
          @Status,
          @Notes,
          @IsActive,
          @CreatedByUserID
        )
      `);

    const createdInvoice = await getInvoiceById(pool, result.recordset[0].InvoiceID, true);
    res.status(201).json(createdInvoice);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe una factura con ese numero." });
    }

    res.status(500).json({ message: "Error al crear la factura." });
  }
});

app.put("/api/invoices/:id", requireAdmin, async (req, res) => {
  const invoiceId = Number(req.params.id);
  const invoice = getInvoicePayload(req.body || {});

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: "ID de factura invalido." });
  }

  const validationError = getInvoiceValidationError(invoice);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const pool = await getPool();
    const existingInvoice = await getInvoiceById(pool, invoiceId);

    if (!existingInvoice) {
      return res.status(404).json({ message: "Factura no encontrada." });
    }

    const activeClient = await getClientById(pool, invoice.clientId);

    if (!activeClient) {
      return res.status(400).json({ message: "El cliente no existe o esta inactivo." });
    }

    const subtotalResult = await pool.request()
      .input("InvoiceID", sql.Int, invoiceId)
      .query(`
        SELECT COALESCE(SUM(LineTotal), 0) AS Subtotal
        FROM dbo.InvoiceLines
        WHERE InvoiceID = @InvoiceID
    `);
    const subtotal = Math.round(Number(subtotalResult.recordset[0].Subtotal || 0) * 100) / 100;
    const taxRate = invoice.taxRate ?? Number(existingInvoice.TaxRate);
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const result = await new sql.Request(transaction)
        .input("InvoiceID", sql.Int, invoiceId)
        .input("InvoiceNumber", sql.NVarChar(40), invoice.invoiceNumber)
        .input("ClientID", sql.Int, invoice.clientId)
        .input("InvoiceDate", sql.Date, invoice.invoiceDate)
        .input("PeriodFrom", sql.Date, invoice.periodFrom)
        .input("PeriodTo", sql.Date, invoice.periodTo)
        .input("Subtotal", sql.Decimal(12, 2), subtotal)
        .input("TaxRate", sql.Decimal(7, 4), taxRate)
        .input("TaxAmount", sql.Decimal(12, 2), taxAmount)
        .input("TotalAmount", sql.Decimal(12, 2), totalAmount)
        .input("Status", sql.NVarChar(20), invoice.status)
        .input("Notes", sql.NVarChar(500), invoice.notes)
        .input("IsActive", sql.Bit, invoice.isActive)
        .query(`
          UPDATE dbo.Invoices
          SET InvoiceNumber = @InvoiceNumber,
              ClientID = @ClientID,
              InvoiceDate = @InvoiceDate,
              PeriodFrom = @PeriodFrom,
              PeriodTo = @PeriodTo,
              Subtotal = @Subtotal,
              TaxRate = @TaxRate,
              TaxAmount = @TaxAmount,
              TotalAmount = @TotalAmount,
              Status = COALESCE(@Status, Status),
              Notes = @Notes,
              IsActive = COALESCE(@IsActive, IsActive),
              UpdatedAt = SYSUTCDATETIME()
          WHERE InvoiceID = @InvoiceID
        `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: "Factura no encontrada." });
      }

      if (invoice.status === "Canceled") {
        await new sql.Request(transaction)
          .input("InvoiceID", sql.Int, invoiceId)
          .query(`
            UPDATE dbo.ServiceRecords
            SET Status = N'Recorded',
                InvoiceID = NULL,
                UpdatedAt = SYSUTCDATETIME()
            WHERE InvoiceID = @InvoiceID
              AND Status = N'Billed'
          `);
      }

      await transaction.commit();

      const updatedInvoice = await getInvoiceById(pool, invoiceId, true);
      res.json(updatedInvoice);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe una factura con ese numero." });
    }

    res.status(500).json({ message: "Error al editar la factura." });
  }
});

app.delete("/api/invoices/:id", requireAdmin, async (req, res) => {
  const invoiceId = Number(req.params.id);

  if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
    return res.status(400).json({ message: "ID de factura invalido." });
  }

  try {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const result = await new sql.Request(transaction)
        .input("InvoiceID", sql.Int, invoiceId)
        .query(`
          UPDATE dbo.Invoices
          SET Status = N'Canceled',
              IsActive = 0,
              UpdatedAt = SYSUTCDATETIME()
          WHERE InvoiceID = @InvoiceID
            AND Status <> N'Canceled'
        `);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: "Factura activa no encontrada." });
      }

      await new sql.Request(transaction)
        .input("InvoiceID", sql.Int, invoiceId)
        .query(`
          UPDATE dbo.ServiceRecords
          SET Status = N'Recorded',
              InvoiceID = NULL,
              UpdatedAt = SYSUTCDATETIME()
          WHERE InvoiceID = @InvoiceID
            AND Status = N'Billed'
        `);

      await transaction.commit();
      res.status(204).send();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al cancelar la factura." });
  }
});

app.get("/api/reports/service-hours", requireAdminOrTechnician, async (req, res) => {
  const filters = getServiceHoursReportFilters(req);

  if (filters.error) {
    return res.status(filters.statusCode || 400).json({ message: filters.error });
  }

  try {
    const pool = await getPool();
    if (filters.projectManagerUserId && filters.numericFilters.ProjectID
      && !await userCanAccessProject(pool, req.session.user, filters.numericFilters.ProjectID)) {
      return res.status(403).json({ message: "No tienes acceso al proyecto solicitado." });
    }
    const records = await getServiceHoursReportRecords(pool, filters);

    res.json(records);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener reporte de horas de servicio." });
  }
});

app.get("/api/reports/service-hours/technicians", requireAdminOrTechnician, async (req, res) => {
  const filters = getServiceHoursReportFilters(req);

  if (filters.error) {
    return res.status(filters.statusCode || 400).json({ message: filters.error });
  }

  try {
    const pool = await getPool();
    if (filters.projectManagerUserId && filters.numericFilters.ProjectID
      && !await userCanAccessProject(pool, req.session.user, filters.numericFilters.ProjectID)) {
      return res.status(403).json({ message: "No tienes acceso al proyecto solicitado." });
    }
    const technicians = await getServiceHoursReportTechnicians(pool, filters);

    res.json(technicians);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener tecnicos del reporte." });
  }
});

app.get("/api/reports/service-hours/pdf", requireAdminOrTechnician, async (req, res) => {
  const filters = getServiceHoursReportFilters(req);

  if (filters.error) {
    return res.status(filters.statusCode || 400).json({ message: filters.error });
  }

  try {
    const pool = await getPool();
    if (filters.projectManagerUserId && filters.numericFilters.ProjectID
      && !await userCanAccessProject(pool, req.session.user, filters.numericFilters.ProjectID)) {
      return res.status(403).json({ message: "No tienes acceso al proyecto solicitado." });
    }
    const records = await getServiceHoursReportRecords(pool, filters);

    if (records.length === 0) {
      return res.status(404).json({ message: "No hay registros para generar el PDF." });
    }

    await createReportNotification(pool, req, "Reporte PDF generado");

    const generatedAt = new Date();
    const filenameDate = generatedAt.toISOString().slice(0, 10);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=solutions-by-design-service-hours-${filenameDate}.pdf`);
    drawServiceHoursPdf(records, filters, generatedAt, res, {
      invoiceNumber: req.query.invoiceNumber
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error al exportar PDF." });
    } else {
      res.end();
    }
  }
});

app.get("/api/reports/service-hours/excel", requireAdminOrTechnician, async (req, res) => {
  const filters = getServiceHoursReportFilters(req);

  if (filters.error) {
    return res.status(filters.statusCode || 400).json({ message: filters.error });
  }

  try {
    const pool = await getPool();
    if (filters.projectManagerUserId && filters.numericFilters.ProjectID
      && !await userCanAccessProject(pool, req.session.user, filters.numericFilters.ProjectID)) {
      return res.status(403).json({ message: "No tienes acceso al proyecto solicitado." });
    }
    const records = await getServiceHoursReportRecords(pool, filters);

    if (records.length === 0) {
      return res.status(404).json({ message: "No hay registros para generar el Excel." });
    }

    await createReportNotification(pool, req, "Reporte Excel generado");

    const generatedAt = new Date();
    const filenameDate = generatedAt.toISOString().slice(0, 10);
    const workbook = createServiceHoursExcelWorkbook(records, filters, generatedAt);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=solutions-by-design-service-hours-${filenameDate}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    poolPromise = null;
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error al exportar Excel." });
    } else {
      res.end();
    }
  }
});

app.post("/api/manual-invoices/pdf", requireAdmin, (req, res) => {
  console.log("[manual-invoice-pdf] Solicitud recibida");

  try {
    const validationError = getManualInvoiceValidationError(req.body || {});

    if (validationError) {
      console.log("[manual-invoice-pdf] Validacion fallida:", validationError);
      return res.status(400).json({ message: validationError });
    }

    console.log("[manual-invoice-pdf] Datos validados");
    const generatedAt = new Date();
    const invoiceNumber = cleanManualInvoiceValue(req.body.invoiceNumber, "").replace(/^#/, "") || generatedAt.toISOString().slice(0, 10);
    const safeInvoiceNumber = invoiceNumber.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "manual";

    res.on("finish", () => {
      console.log("[manual-invoice-pdf] Respuesta finalizada");
    });
    res.on("error", (error) => {
      console.error("[manual-invoice-pdf] Error de respuesta:", error);
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=solutions-by-design-invoice-${safeInvoiceNumber}.pdf`);
    drawManualInvoicePdf(req.body || {}, generatedAt, res);
  } catch (error) {
    console.error("[manual-invoice-pdf] Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error al generar la factura PDF." });
    } else {
      res.end();
    }
  }
});

app.get("/api/reports/service-hours/summary", requireAdminOrTechnician, async (req, res) => {
  const from = String(req.query.from || "").trim();
  const to = String(req.query.to || "").trim();
  const status = String(req.query.status || "").trim();
  const rawFilters = {
    TechnicianUserID: req.query.technicianUserId,
    ClientID: req.query.clientId,
    ProjectID: req.query.projectId
  };
  const numericFilters = {};

  if ((from && !isValidServiceDate(from)) || (to && !isValidServiceDate(to))) {
    return res.status(400).json({ message: "from y to deben usar formato YYYY-MM-DD." });
  }

  if (from && to && from > to) {
    return res.status(400).json({ message: "from no puede ser posterior a to." });
  }

  if (status && !SERVICE_RECORD_STATUSES.has(status)) {
    return res.status(400).json({ message: "status debe ser Recorded, Billed o Canceled." });
  }

  for (const [name, rawValue] of Object.entries(rawFilters)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    const value = Number(rawValue);

    if (!Number.isInteger(value) || value <= 0) {
      return res.status(400).json({ message: `${name} invalido.` });
    }

    numericFilters[name] = value;
  }

  if (["Technician", "User"].includes(req.session.user.Role)) {
    const sessionUserId = Number(req.session.user.UserID);

    if (numericFilters.TechnicianUserID && numericFilters.TechnicianUserID !== sessionUserId) {
      return res.status(403).json({ message: "Los tecnicos solo pueden ver sus propios registros." });
    }

    numericFilters.TechnicianUserID = sessionUserId;
  }

  try {
    const pool = await getPool();
    if (isProjectManager(req.session.user) && numericFilters.ProjectID
      && !await userCanAccessProject(pool, req.session.user, numericFilters.ProjectID)) {
      return res.status(403).json({ message: "No tienes acceso al proyecto solicitado." });
    }
    const request = pool.request();
    const whereClauses = [];

    if (from) {
      request.input("FromDate", sql.Date, from);
      whereClauses.push("sr.ServiceDate >= @FromDate");
    }

    if (to) {
      request.input("ToDate", sql.Date, to);
      whereClauses.push("sr.ServiceDate <= @ToDate");
    }

    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClauses.push("sr.Status = @Status");
    }

    for (const [name, value] of Object.entries(numericFilters)) {
      request.input(name, sql.Int, value);
      whereClauses.push(`sr.${name} = @${name}`);
    }

    addProjectManagerScope(request, whereClauses, req.session.user, "sr");

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const summaryResult = await request.query(`
      SELECT
        COUNT(*) AS TotalRecords,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours,
        COALESCE(SUM(CASE WHEN sr.Status = N'Billed' THEN sr.TotalHours ELSE 0 END), 0) AS BilledHours,
        COALESCE(SUM(CASE WHEN sr.Status = N'Recorded' THEN sr.TotalHours ELSE 0 END), 0) AS UnbilledHours,
        COALESCE(SUM(CASE WHEN sr.Status = N'Canceled' THEN sr.TotalHours ELSE 0 END), 0) AS CanceledHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
      ${whereSql};

      SELECT
        technician.FullName AS TechnicianName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
      ${whereSql}
      GROUP BY technician.FullName
      ORDER BY technician.FullName ASC;

      SELECT
        client.ClientName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
      INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
      ${whereSql}
      GROUP BY client.ClientName
      ORDER BY client.ClientName ASC;

      SELECT
        project.ProjectName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
      INNER JOIN dbo.Projects project ON project.ProjectID = sr.ProjectID
      ${whereSql}
      GROUP BY project.ProjectName
      ORDER BY project.ProjectName ASC;
    `);
    const summary = summaryResult.recordsets[0][0];

    res.json({
      TotalRecords: Number(summary.TotalRecords),
      TotalHours: Number(summary.TotalHours),
      BilledHours: Number(summary.BilledHours),
      UnbilledHours: Number(summary.UnbilledHours),
      CanceledHours: Number(summary.CanceledHours),
      HoursByTechnician: summaryResult.recordsets[1].map((row) => mapReportGroupRow(row, "TechnicianName")),
      HoursByClient: summaryResult.recordsets[2].map((row) => mapReportGroupRow(row, "ClientName")),
      HoursByProject: summaryResult.recordsets[3].map((row) => mapReportGroupRow(row, "ProjectName"))
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen de horas de servicio." });
  }
});

app.get("/api/reports/invoices", requireAuth, requireInvoiceReadAccess, async (req, res) => {
  const from = String(req.query.from || "").trim();
  const to = String(req.query.to || "").trim();
  const status = String(req.query.status || "").trim();
  const rawClientId = req.query.clientId;
  const hasClientFilter = rawClientId !== undefined && rawClientId !== null && rawClientId !== "";
  const clientId = hasClientFilter ? Number(rawClientId) : null;

  if ((from && !isValidServiceDate(from)) || (to && !isValidServiceDate(to))) {
    return res.status(400).json({ message: "from y to deben usar formato YYYY-MM-DD." });
  }

  if (from && to && from > to) {
    return res.status(400).json({ message: "from no puede ser posterior a to." });
  }

  if (hasClientFilter && (!Number.isInteger(clientId) || clientId <= 0)) {
    return res.status(400).json({ message: "clientId invalido." });
  }

  if (status && !INVOICE_STATUSES.has(status)) {
    return res.status(400).json({ message: "status debe ser Draft, Issued, Paid o Canceled." });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    const whereClauses = [];

    if (from) {
      request.input("FromDate", sql.Date, from);
      whereClauses.push("i.InvoiceDate >= @FromDate");
    }

    if (to) {
      request.input("ToDate", sql.Date, to);
      whereClauses.push("i.InvoiceDate <= @ToDate");
    }

    if (hasClientFilter) {
      request.input("ClientID", sql.Int, clientId);
      whereClauses.push("i.ClientID = @ClientID");
    }

    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClauses.push("i.Status = @Status");
    }

    if (req.session.user.Role === "Technician") {
      request.input("TechnicianUserID", sql.Int, Number(req.session.user.UserID));
      whereClauses.push(`
        EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND sr.TechnicianUserID = @TechnicianUserID
        )
      `);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const result = await request.query(`
      SELECT
        i.InvoiceID,
        i.InvoiceNumber,
        c.ClientName,
        i.InvoiceDate,
        i.PeriodFrom,
        i.PeriodTo,
        i.Subtotal,
        i.TaxAmount,
        i.TotalAmount,
        i.Status
      FROM dbo.Invoices i
      INNER JOIN dbo.Clients c ON c.ClientID = i.ClientID
      ${whereSql}
      ORDER BY i.InvoiceDate DESC, i.InvoiceID DESC
    `);

    res.json(result.recordset.map(mapInvoiceReport));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener reporte de facturas." });
  }
});

app.get("/api/reports/invoices/summary", requireAuth, requireInvoiceReadAccess, async (req, res) => {
  const from = String(req.query.from || "").trim();
  const to = String(req.query.to || "").trim();
  const status = String(req.query.status || "").trim();
  const rawClientId = req.query.clientId;
  const hasClientFilter = rawClientId !== undefined && rawClientId !== null && rawClientId !== "";
  const clientId = hasClientFilter ? Number(rawClientId) : null;

  if ((from && !isValidServiceDate(from)) || (to && !isValidServiceDate(to))) {
    return res.status(400).json({ message: "from y to deben usar formato YYYY-MM-DD." });
  }

  if (from && to && from > to) {
    return res.status(400).json({ message: "from no puede ser posterior a to." });
  }

  if (hasClientFilter && (!Number.isInteger(clientId) || clientId <= 0)) {
    return res.status(400).json({ message: "clientId invalido." });
  }

  if (status && !INVOICE_STATUSES.has(status)) {
    return res.status(400).json({ message: "status debe ser Draft, Issued, Paid o Canceled." });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    const whereClauses = [];

    if (from) {
      request.input("FromDate", sql.Date, from);
      whereClauses.push("i.InvoiceDate >= @FromDate");
    }

    if (to) {
      request.input("ToDate", sql.Date, to);
      whereClauses.push("i.InvoiceDate <= @ToDate");
    }

    if (hasClientFilter) {
      request.input("ClientID", sql.Int, clientId);
      whereClauses.push("i.ClientID = @ClientID");
    }

    if (status) {
      request.input("Status", sql.NVarChar(20), status);
      whereClauses.push("i.Status = @Status");
    }

    if (req.session.user.Role === "Technician") {
      request.input("TechnicianUserID", sql.Int, Number(req.session.user.UserID));
      whereClauses.push(`
        EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND sr.TechnicianUserID = @TechnicianUserID
        )
      `);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const summaryResult = await request.query(`
      SELECT
        COUNT(*) AS TotalInvoices,
        COALESCE(SUM(CASE WHEN i.Status = N'Draft' THEN 1 ELSE 0 END), 0) AS DraftInvoices,
        COALESCE(SUM(CASE WHEN i.Status = N'Issued' THEN 1 ELSE 0 END), 0) AS IssuedInvoices,
        COALESCE(SUM(CASE WHEN i.Status = N'Paid' THEN 1 ELSE 0 END), 0) AS PaidInvoices,
        COALESCE(SUM(CASE WHEN i.Status = N'Canceled' THEN 1 ELSE 0 END), 0) AS CanceledInvoices,
        COALESCE(SUM(i.Subtotal), 0) AS TotalSubtotal,
        COALESCE(SUM(i.TaxAmount), 0) AS TotalTax,
        COALESCE(SUM(i.TotalAmount), 0) AS TotalAmount
      FROM dbo.Invoices i
      ${whereSql};

      SELECT
        c.ClientName,
        COALESCE(SUM(i.TotalAmount), 0) AS TotalAmount
      FROM dbo.Invoices i
      INNER JOIN dbo.Clients c ON c.ClientID = i.ClientID
      ${whereSql}
      GROUP BY c.ClientName
      ORDER BY c.ClientName ASC;

      SELECT
        i.Status,
        COALESCE(SUM(i.TotalAmount), 0) AS TotalAmount
      FROM dbo.Invoices i
      ${whereSql}
      GROUP BY i.Status
      ORDER BY i.Status ASC;
    `);
    const summary = summaryResult.recordsets[0][0];

    res.json({
      TotalInvoices: Number(summary.TotalInvoices),
      DraftInvoices: Number(summary.DraftInvoices),
      IssuedInvoices: Number(summary.IssuedInvoices),
      PaidInvoices: Number(summary.PaidInvoices),
      CanceledInvoices: Number(summary.CanceledInvoices),
      TotalSubtotal: Number(summary.TotalSubtotal),
      TotalTax: Number(summary.TotalTax),
      TotalAmount: Number(summary.TotalAmount),
      AmountByClient: summaryResult.recordsets[1].map((row) => mapReportGroupRow(row, "ClientName", "TotalAmount")),
      AmountByStatus: summaryResult.recordsets[2].map((row) => mapReportGroupRow(row, "Status", "TotalAmount"))
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen de facturas." });
  }
});

app.get("/api/dashboard/summary", requireAdminOrTechnician, async (req, res) => {
  const isTechnicianUser = ["Technician", "User"].includes(req.session.user.Role);
  const isProjectManagerUser = isProjectManager(req.session.user);
  const isLimitedUser = isTechnicianUser || isProjectManagerUser;
  const sessionUserId = Number(req.session.user.UserID);

  try {
    const pool = await getPool();
    const request = pool.request();
    const serviceRecordCondition = isTechnicianUser
      ? "sr.TechnicianUserID = @DashboardUserID"
      : isProjectManagerUser
        ? `EXISTS (
            SELECT 1 FROM dbo.UserProjectAssignments upa
            WHERE upa.UserID = @DashboardUserID
              AND upa.ProjectID = sr.ProjectID
              AND upa.IsActive = 1
          )`
        : "1 = 1";
    const invoiceCondition = isLimitedUser
      ? `EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND ${serviceRecordCondition}
        )`
      : "1 = 1";

    if (isLimitedUser) {
      request.input("DashboardUserID", sql.Int, sessionUserId);
    }

    const result = await request.query(`
      SELECT
        ${isProjectManagerUser ? `
        (SELECT COUNT(DISTINCT p.ClientID)
         FROM dbo.UserProjectAssignments upa
         INNER JOIN dbo.Projects p ON p.ProjectID = upa.ProjectID
         WHERE upa.UserID = @DashboardUserID AND upa.IsActive = 1 AND p.IsActive = 1) AS TotalClients,
        (SELECT COUNT(*)
         FROM dbo.UserProjectAssignments upa
         INNER JOIN dbo.Projects p ON p.ProjectID = upa.ProjectID
         WHERE upa.UserID = @DashboardUserID AND upa.IsActive = 1 AND p.IsActive = 1) AS TotalProjects,
        ` : isTechnicianUser ? `
        (SELECT COUNT(DISTINCT sr.ClientID) FROM dbo.ServiceRecords sr WHERE ${serviceRecordCondition}) AS TotalClients,
        (SELECT COUNT(DISTINCT sr.ProjectID) FROM dbo.ServiceRecords sr WHERE ${serviceRecordCondition}) AS TotalProjects,
        ` : `
        (SELECT COUNT(*) FROM dbo.Clients WHERE IsActive = 1) AS TotalClients,
        (SELECT COUNT(*) FROM dbo.Projects WHERE IsActive = 1) AS TotalProjects,
        `}
        (SELECT COUNT(*) FROM dbo.ServiceRecords sr WHERE ${serviceRecordCondition}) AS TotalServiceRecords,
        (SELECT COUNT(*) FROM dbo.Invoices i WHERE ${invoiceCondition}) AS TotalInvoices,
        (SELECT COALESCE(SUM(sr.TotalHours), 0) FROM dbo.ServiceRecords sr WHERE ${serviceRecordCondition}) AS TotalHours,
        (SELECT COALESCE(SUM(sr.TotalHours), 0) FROM dbo.ServiceRecords sr WHERE ${serviceRecordCondition} AND sr.Status = N'Recorded') AS UnbilledHours,
        (SELECT COALESCE(SUM(sr.TotalHours), 0) FROM dbo.ServiceRecords sr WHERE ${serviceRecordCondition} AND sr.Status = N'Billed') AS BilledHours,
        (SELECT COALESCE(SUM(i.TotalAmount), 0) FROM dbo.Invoices i WHERE ${invoiceCondition} AND i.Status <> N'Canceled') AS TotalBilledAmount,
        (SELECT COALESCE(SUM(i.TotalAmount), 0) FROM dbo.Invoices i WHERE ${invoiceCondition} AND i.Status IN (N'Draft', N'Issued')) AS PendingInvoiceAmount,
        (SELECT COALESCE(SUM(i.TotalAmount), 0) FROM dbo.Invoices i WHERE ${invoiceCondition} AND i.Status = N'Paid') AS PaidAmount
    `);
    const summary = result.recordset[0];

    const dashboardSummary = {
      TotalClients: Number(summary.TotalClients),
      TotalProjects: Number(summary.TotalProjects),
      TotalServiceRecords: Number(summary.TotalServiceRecords),
      TotalHours: Number(summary.TotalHours),
      UnbilledHours: Number(summary.UnbilledHours),
      BilledHours: Number(summary.BilledHours)
    };

    if (!isLimitedUser) {
      Object.assign(dashboardSummary, {
        TotalInvoices: Number(summary.TotalInvoices),
        TotalBilledAmount: Number(summary.TotalBilledAmount),
        PendingInvoiceAmount: Number(summary.PendingInvoiceAmount),
        PaidAmount: Number(summary.PaidAmount)
      });
    }

    res.json(dashboardSummary);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen del dashboard." });
  }
});

app.get("/api/dashboard/charts", requireAdminOrTechnician, async (req, res) => {
  const isTechnicianUser = ["Technician", "User"].includes(req.session.user.Role);
  const isProjectManagerUser = isProjectManager(req.session.user);
  const isLimitedUser = isTechnicianUser || isProjectManagerUser;
  const sessionUserId = Number(req.session.user.UserID);

  try {
    const pool = await getPool();
    const request = pool.request();
    const serviceRecordCondition = isTechnicianUser
      ? "sr.TechnicianUserID = @DashboardUserID"
      : isProjectManagerUser
        ? `EXISTS (
            SELECT 1 FROM dbo.UserProjectAssignments upa
            WHERE upa.UserID = @DashboardUserID
              AND upa.ProjectID = sr.ProjectID
              AND upa.IsActive = 1
          )`
        : "1 = 1";
    const invoiceCondition = isLimitedUser
      ? `EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND ${serviceRecordCondition}
        )`
      : "1 = 1";

    if (isLimitedUser) {
      request.input("DashboardUserID", sql.Int, sessionUserId);
    }

    const result = await request.query(`
      SELECT
        CONVERT(CHAR(7), sr.ServiceDate, 120) AS Month,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      WHERE ${serviceRecordCondition}
      GROUP BY CONVERT(CHAR(7), sr.ServiceDate, 120)
      ORDER BY Month ASC;

      SELECT
        CONVERT(CHAR(7), i.InvoiceDate, 120) AS Month,
        COALESCE(SUM(i.TotalAmount), 0) AS TotalAmount
      FROM dbo.Invoices i
      WHERE ${invoiceCondition}
      GROUP BY CONVERT(CHAR(7), i.InvoiceDate, 120)
      ORDER BY Month ASC;

      SELECT
        c.ClientName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Clients c ON c.ClientID = sr.ClientID
      WHERE ${serviceRecordCondition}
      GROUP BY c.ClientName
      ORDER BY TotalHours DESC, c.ClientName ASC;

      SELECT
        p.ProjectName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Projects p ON p.ProjectID = sr.ProjectID
      WHERE ${serviceRecordCondition}
      GROUP BY p.ProjectName
      ORDER BY TotalHours DESC, p.ProjectName ASC;

      SELECT
        u.FullName AS TechnicianName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users u ON u.UserID = sr.TechnicianUserID
      WHERE ${serviceRecordCondition}
      GROUP BY u.FullName
      ORDER BY TotalHours DESC, u.FullName ASC;

      SELECT
        i.Status,
        COUNT(*) AS TotalInvoices
      FROM dbo.Invoices i
      WHERE ${invoiceCondition}
      GROUP BY i.Status
      ORDER BY i.Status ASC;
    `);

    res.json({
      HoursByMonth: result.recordsets[0].map((row) => mapReportGroupRow(row, "Month")),
      BillingByMonth: isLimitedUser ? [] : result.recordsets[1].map((row) => mapReportGroupRow(row, "Month", "TotalAmount")),
      HoursByClient: result.recordsets[2].map((row) => mapReportGroupRow(row, "ClientName")),
      HoursByProject: result.recordsets[3].map((row) => mapReportGroupRow(row, "ProjectName")),
      HoursByTechnician: result.recordsets[4].map((row) => mapReportGroupRow(row, "TechnicianName")),
      InvoicesByStatus: isLimitedUser ? [] : result.recordsets[5].map((row) => mapReportGroupRow(row, "Status", "TotalInvoices"))
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener graficas del dashboard." });
  }
});

app.get("/api/dashboard/recent-activity", requireAdminOrTechnician, async (req, res) => {
  const isTechnicianUser = ["Technician", "User"].includes(req.session.user.Role);
  const isProjectManagerUser = isProjectManager(req.session.user);
  const isLimitedUser = isTechnicianUser || isProjectManagerUser;
  const sessionUserId = Number(req.session.user.UserID);

  try {
    const pool = await getPool();
    const request = pool.request();
    const serviceRecordCondition = isTechnicianUser
      ? "sr.TechnicianUserID = @DashboardUserID"
      : isProjectManagerUser
        ? `EXISTS (
            SELECT 1 FROM dbo.UserProjectAssignments upa
            WHERE upa.UserID = @DashboardUserID
              AND upa.ProjectID = sr.ProjectID
              AND upa.IsActive = 1
          )`
        : "1 = 1";
    const invoiceCondition = isLimitedUser
      ? `EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND ${serviceRecordCondition}
        )`
      : "1 = 1";
    const relatedClientCondition = isLimitedUser
      ? `EXISTS (
          SELECT 1
          FROM dbo.ServiceRecords sr
          WHERE sr.ClientID = c.ClientID
            AND ${serviceRecordCondition}
        )`
      : "c.IsActive = 1";
    const relatedProjectCondition = isLimitedUser
      ? `EXISTS (
          SELECT 1
          FROM dbo.ServiceRecords sr
          WHERE sr.ProjectID = p.ProjectID
            AND ${serviceRecordCondition}
        )`
      : "p.IsActive = 1";

    if (isLimitedUser) {
      request.input("DashboardUserID", sql.Int, sessionUserId);
    }

    const result = await request.query(`
      SELECT TOP 10
        sr.ServiceRecordID,
        u.FullName AS TechnicianName,
        c.ClientName,
        p.ProjectName,
        sr.ServiceDate,
        sr.TotalHours,
        sr.ServiceDescription,
        sr.Status,
        sr.CreatedAt
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users u ON u.UserID = sr.TechnicianUserID
      INNER JOIN dbo.Clients c ON c.ClientID = sr.ClientID
      INNER JOIN dbo.Projects p ON p.ProjectID = sr.ProjectID
      WHERE ${serviceRecordCondition}
      ORDER BY sr.CreatedAt DESC, sr.ServiceRecordID DESC;

      SELECT TOP 10
        i.InvoiceID,
        i.InvoiceNumber,
        i.ClientID,
        c.ClientName,
        i.InvoiceDate,
        i.PeriodFrom,
        i.PeriodTo,
        i.Subtotal,
        i.TaxRate,
        i.TaxAmount,
        i.TotalAmount,
        i.Status,
        i.Notes,
        i.IsActive,
        i.CreatedAt,
        i.UpdatedAt,
        i.CreatedByUserID,
        creator.FullName AS CreatedByName
      FROM dbo.Invoices i
      INNER JOIN dbo.Clients c ON c.ClientID = i.ClientID
      LEFT JOIN dbo.Users creator ON creator.UserID = i.CreatedByUserID
      WHERE ${invoiceCondition}
      ORDER BY i.CreatedAt DESC, i.InvoiceID DESC;

      SELECT TOP 10
        c.ClientID,
        c.ClientName,
        c.ContactName,
        c.Email,
        c.Phone,
        c.CreatedAt
      FROM dbo.Clients c
      WHERE ${relatedClientCondition}
      ORDER BY c.CreatedAt DESC, c.ClientID DESC;

      SELECT TOP 10
        p.ProjectID,
        p.ProjectName,
        c.ClientName,
        p.HourlyRate,
        p.CreatedAt
      FROM dbo.Projects p
      INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
      WHERE ${relatedProjectCondition}
      ORDER BY p.CreatedAt DESC, p.ProjectID DESC;
    `);

    res.json({
      ServiceRecords: result.recordsets[0].map(mapDashboardServiceRecord),
      Invoices: isLimitedUser ? [] : result.recordsets[1].map((invoice) => mapInvoice(invoice)),
      Clients: result.recordsets[2].map(mapDashboardClient),
      Projects: result.recordsets[3].map(mapDashboardProject)
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener actividad reciente del dashboard." });
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

    const pageLabel = req.query.lang === "en" ? "Page" : "Página";
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

function sendVersionedIndex(res) {
  fs.readFile(indexPath, "utf8", (error, html) => {
    if (error) {
      console.error(error);
      res.status(500).send("No se pudo cargar la aplicacion.");
      return;
    }

    res.set("Cache-Control", "no-cache");
    res.type("html").send(html.replace(/__ASSET_VERSION__/g, staticAssetVersion));
  });
}

app.use((req, res) => {
  sendVersionedIndex(res);
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

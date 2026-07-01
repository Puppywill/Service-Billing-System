const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const sql = require("mssql/msnodesqlv8");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 3000;
const hasSqlCredentials = Boolean(process.env.DB_USER && process.env.DB_PASSWORD);

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
    IsActive: record.IsActive === undefined ? true : Boolean(record.IsActive),
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

  if (!["Admin", "Technician", "User"].includes(req.session.user.Role)) {
    return res.status(403).json({ message: "No tienes permisos para acceder a registros de servicio." });
  }

  next();
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
        u.IsActive,
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
        p.IsActive,
        p.CreatedAt,
        p.UpdatedAt
      FROM dbo.Projects p
      INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
      LEFT JOIN dbo.vw_ProjectContractStatus pcs ON pcs.ProjectID = p.ProjectID
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
            AND (IsTechnician = 1 OR Role = N'Technician')
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
        SELECT UserID, FullName, Email, Password, Role, IsActive
        FROM dbo.Users
        WHERE Email = @Email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    const user = result.recordset[0];
    if (user.IsActive === false || Number(user.IsActive) === 0) {
      return res.status(403).json({ message: "Usuario inactivo. Contacta a un administrador." });
    }

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

    if (!sessionUser || sessionUser.IsActive === false) {
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
        u.IsActive,
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

  if (!["Admin", "Technician", "User"].includes(role)) {
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
  const isActive = parseOptionalBoolean(req.body?.isActive ?? req.body?.IsActive);

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: "ID de usuario invalido." });
  }

  if (!fullName || !email || !role) {
    return res.status(400).json({ message: "Nombre, email y rol son obligatorios." });
  }

  if (!["Admin", "Technician", "User"].includes(role)) {
    return res.status(400).json({ message: "Rol invalido." });
  }

  try {
    const pool = await getPool();
    const request = pool.request()
      .input("UserID", sql.Int, userId)
      .input("FullName", sql.NVarChar(120), fullName.trim())
      .input("Email", sql.NVarChar(180), email.trim().toLowerCase())
      .input("Role", sql.NVarChar(20), role)
      .input("IsActive", sql.Bit, isActive);

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
          Role = @Role,
          IsActive = COALESCE(@IsActive, IsActive)
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

app.get("/api/projects", requireAuth, async (req, res) => {
  const search = String(req.query.search || req.query.q || "").trim().slice(0, 180);
  const rawClientId = req.query.clientId ?? req.query.ClientID;
  const hasClientFilter = rawClientId !== undefined && rawClientId !== null && rawClientId !== "";
  const clientId = hasClientFilter ? Number(rawClientId) : null;

  if (hasClientFilter && (!Number.isInteger(clientId) || clientId <= 0)) {
    return res.status(400).json({ message: "ClientID invalido." });
  }

  try {
    const pool = await getPool();
    const request = pool.request();
    const whereClauses = ["p.IsActive = 1"];

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
        p.IsActive,
        p.CreatedAt,
        p.UpdatedAt
      FROM dbo.Projects p
      INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
      LEFT JOIN dbo.vw_ProjectContractStatus pcs ON pcs.ProjectID = p.ProjectID
      WHERE ${whereClauses.join(" AND ")}
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
    const project = await getProjectById(pool, projectId);

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

    const result = await pool.request()
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

    const createdProject = await getProjectById(pool, result.recordset[0].ProjectID, false);
    res.status(201).json(createdProject);
  } catch (error) {
    poolPromise = null;
    console.error(error);

    if (error.number === 2627 || error.number === 2601) {
      return res.status(409).json({ message: "Ya existe un proyecto con ese nombre para el cliente." });
    }

    res.status(500).json({ message: "Error al crear el proyecto." });
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

    const result = await pool.request()
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

    if (result.rowsAffected[0] === 0) {
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

    res.status(500).json({ message: "Error al editar el proyecto." });
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

    res.json(serviceRecord);
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener el registro de servicio." });
  }
});

app.post("/api/service-records", requireAdminOrTechnician, async (req, res) => {
  const serviceRecord = getServiceRecordPayload(req.body || {});
  const validationError = getServiceRecordValidationError(serviceRecord);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (req.session.user.Role !== "Admin"
    && Number(req.session.user.UserID) !== serviceRecord.technicianUserId) {
    return res.status(403).json({ message: "Solo puedes crear registros a tu propio nombre." });
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
      .input("Status", sql.NVarChar(20), serviceRecord.status || "Recorded")
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

  if (req.session.user.Role === "Technician") {
    const sessionUserId = Number(req.session.user.UserID);

    if (numericFilters.TechnicianUserID && numericFilters.TechnicianUserID !== sessionUserId) {
      return res.status(403).json({ message: "Los tecnicos solo pueden ver sus propios registros." });
    }

    numericFilters.TechnicianUserID = sessionUserId;
  }

  try {
    const pool = await getPool();
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
        sr.Status
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users technician ON technician.UserID = sr.TechnicianUserID
      INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
      INNER JOIN dbo.Projects project ON project.ProjectID = sr.ProjectID
      ${whereSql}
      ORDER BY sr.ServiceDate DESC, sr.ServiceRecordID DESC
    `);

    res.json(result.recordset.map(mapServiceHoursReport));
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener reporte de horas de servicio." });
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

  if (req.session.user.Role === "Technician") {
    const sessionUserId = Number(req.session.user.UserID);

    if (numericFilters.TechnicianUserID && numericFilters.TechnicianUserID !== sessionUserId) {
      return res.status(403).json({ message: "Los tecnicos solo pueden ver sus propios registros." });
    }

    numericFilters.TechnicianUserID = sessionUserId;
  }

  try {
    const pool = await getPool();
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

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const summaryResult = await request.query(`
      SELECT
        COUNT(*) AS TotalRecords,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours,
        COALESCE(SUM(CASE WHEN sr.Status = N'Billed' THEN sr.TotalHours ELSE 0 END), 0) AS BilledHours,
        COALESCE(SUM(CASE WHEN sr.Status = N'Recorded' THEN sr.TotalHours ELSE 0 END), 0) AS UnbilledHours,
        COALESCE(SUM(CASE WHEN sr.Status = N'Canceled' THEN sr.TotalHours ELSE 0 END), 0) AS CanceledHours
      FROM dbo.ServiceRecords sr
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
      INNER JOIN dbo.Clients client ON client.ClientID = sr.ClientID
      ${whereSql}
      GROUP BY client.ClientName
      ORDER BY client.ClientName ASC;

      SELECT
        project.ProjectName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
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
  const isTechnician = req.session.user.Role === "Technician";
  const technicianUserId = Number(req.session.user.UserID);

  try {
    const pool = await getPool();
    const request = pool.request();
    const serviceRecordWhere = isTechnician ? "WHERE sr.TechnicianUserID = @TechnicianUserID" : "";
    const invoiceWhere = isTechnician
      ? `WHERE EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND sr.TechnicianUserID = @TechnicianUserID
        )`
      : "";

    if (isTechnician) {
      request.input("TechnicianUserID", sql.Int, technicianUserId);
    }

    const result = await request.query(`
      SELECT
        ${isTechnician ? `
        (SELECT COUNT(DISTINCT sr.ClientID) FROM dbo.ServiceRecords sr WHERE sr.TechnicianUserID = @TechnicianUserID) AS TotalClients,
        (SELECT COUNT(DISTINCT sr.ProjectID) FROM dbo.ServiceRecords sr WHERE sr.TechnicianUserID = @TechnicianUserID) AS TotalProjects,
        ` : `
        (SELECT COUNT(*) FROM dbo.Clients WHERE IsActive = 1) AS TotalClients,
        (SELECT COUNT(*) FROM dbo.Projects WHERE IsActive = 1) AS TotalProjects,
        `}
        (SELECT COUNT(*) FROM dbo.ServiceRecords sr ${serviceRecordWhere}) AS TotalServiceRecords,
        (SELECT COUNT(*) FROM dbo.Invoices i ${invoiceWhere}) AS TotalInvoices,
        (SELECT COALESCE(SUM(sr.TotalHours), 0) FROM dbo.ServiceRecords sr ${serviceRecordWhere}) AS TotalHours,
        (SELECT COALESCE(SUM(sr.TotalHours), 0) FROM dbo.ServiceRecords sr ${serviceRecordWhere ? `${serviceRecordWhere} AND` : "WHERE"} sr.Status = N'Recorded') AS UnbilledHours,
        (SELECT COALESCE(SUM(sr.TotalHours), 0) FROM dbo.ServiceRecords sr ${serviceRecordWhere ? `${serviceRecordWhere} AND` : "WHERE"} sr.Status = N'Billed') AS BilledHours,
        (SELECT COALESCE(SUM(i.TotalAmount), 0) FROM dbo.Invoices i ${invoiceWhere ? `${invoiceWhere} AND` : "WHERE"} i.Status <> N'Canceled') AS TotalBilledAmount,
        (SELECT COALESCE(SUM(i.TotalAmount), 0) FROM dbo.Invoices i ${invoiceWhere ? `${invoiceWhere} AND` : "WHERE"} i.Status IN (N'Draft', N'Issued')) AS PendingInvoiceAmount,
        (SELECT COALESCE(SUM(i.TotalAmount), 0) FROM dbo.Invoices i ${invoiceWhere ? `${invoiceWhere} AND` : "WHERE"} i.Status = N'Paid') AS PaidAmount
    `);
    const summary = result.recordset[0];

    res.json({
      TotalClients: Number(summary.TotalClients),
      TotalProjects: Number(summary.TotalProjects),
      TotalServiceRecords: Number(summary.TotalServiceRecords),
      TotalInvoices: Number(summary.TotalInvoices),
      TotalHours: Number(summary.TotalHours),
      UnbilledHours: Number(summary.UnbilledHours),
      BilledHours: Number(summary.BilledHours),
      TotalBilledAmount: Number(summary.TotalBilledAmount),
      PendingInvoiceAmount: Number(summary.PendingInvoiceAmount),
      PaidAmount: Number(summary.PaidAmount)
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener resumen del dashboard." });
  }
});

app.get("/api/dashboard/charts", requireAdminOrTechnician, async (req, res) => {
  const isTechnician = req.session.user.Role === "Technician";
  const technicianUserId = Number(req.session.user.UserID);

  try {
    const pool = await getPool();
    const request = pool.request();
    const serviceRecordWhere = isTechnician ? "WHERE sr.TechnicianUserID = @TechnicianUserID" : "";
    const invoiceWhere = isTechnician
      ? `WHERE EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND sr.TechnicianUserID = @TechnicianUserID
        )`
      : "";

    if (isTechnician) {
      request.input("TechnicianUserID", sql.Int, technicianUserId);
    }

    const result = await request.query(`
      SELECT
        CONVERT(CHAR(7), sr.ServiceDate, 120) AS Month,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      ${serviceRecordWhere}
      GROUP BY CONVERT(CHAR(7), sr.ServiceDate, 120)
      ORDER BY Month ASC;

      SELECT
        CONVERT(CHAR(7), i.InvoiceDate, 120) AS Month,
        COALESCE(SUM(i.TotalAmount), 0) AS TotalAmount
      FROM dbo.Invoices i
      ${invoiceWhere}
      GROUP BY CONVERT(CHAR(7), i.InvoiceDate, 120)
      ORDER BY Month ASC;

      SELECT
        c.ClientName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Clients c ON c.ClientID = sr.ClientID
      ${serviceRecordWhere}
      GROUP BY c.ClientName
      ORDER BY TotalHours DESC, c.ClientName ASC;

      SELECT
        p.ProjectName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Projects p ON p.ProjectID = sr.ProjectID
      ${serviceRecordWhere}
      GROUP BY p.ProjectName
      ORDER BY TotalHours DESC, p.ProjectName ASC;

      SELECT
        u.FullName AS TechnicianName,
        COALESCE(SUM(sr.TotalHours), 0) AS TotalHours
      FROM dbo.ServiceRecords sr
      INNER JOIN dbo.Users u ON u.UserID = sr.TechnicianUserID
      ${serviceRecordWhere}
      GROUP BY u.FullName
      ORDER BY TotalHours DESC, u.FullName ASC;

      SELECT
        i.Status,
        COUNT(*) AS TotalInvoices
      FROM dbo.Invoices i
      ${invoiceWhere}
      GROUP BY i.Status
      ORDER BY i.Status ASC;
    `);

    res.json({
      HoursByMonth: result.recordsets[0].map((row) => mapReportGroupRow(row, "Month")),
      BillingByMonth: result.recordsets[1].map((row) => mapReportGroupRow(row, "Month", "TotalAmount")),
      HoursByClient: result.recordsets[2].map((row) => mapReportGroupRow(row, "ClientName")),
      HoursByProject: result.recordsets[3].map((row) => mapReportGroupRow(row, "ProjectName")),
      HoursByTechnician: result.recordsets[4].map((row) => mapReportGroupRow(row, "TechnicianName")),
      InvoicesByStatus: result.recordsets[5].map((row) => mapReportGroupRow(row, "Status", "TotalInvoices"))
    });
  } catch (error) {
    poolPromise = null;
    console.error(error);
    res.status(500).json({ message: "Error al obtener graficas del dashboard." });
  }
});

app.get("/api/dashboard/recent-activity", requireAdminOrTechnician, async (req, res) => {
  const isTechnician = req.session.user.Role === "Technician";
  const technicianUserId = Number(req.session.user.UserID);

  try {
    const pool = await getPool();
    const request = pool.request();
    const serviceRecordWhere = isTechnician ? "WHERE sr.TechnicianUserID = @TechnicianUserID" : "";
    const invoiceWhere = isTechnician
      ? `WHERE EXISTS (
          SELECT 1
          FROM dbo.InvoiceLines il
          INNER JOIN dbo.ServiceRecords sr ON sr.ServiceRecordID = il.ServiceRecordID
          WHERE il.InvoiceID = i.InvoiceID
            AND sr.TechnicianUserID = @TechnicianUserID
        )`
      : "";
    const relatedClientWhere = isTechnician
      ? `WHERE EXISTS (
          SELECT 1
          FROM dbo.ServiceRecords sr
          WHERE sr.ClientID = c.ClientID
            AND sr.TechnicianUserID = @TechnicianUserID
        )`
      : "WHERE c.IsActive = 1";
    const relatedProjectWhere = isTechnician
      ? `WHERE EXISTS (
          SELECT 1
          FROM dbo.ServiceRecords sr
          WHERE sr.ProjectID = p.ProjectID
            AND sr.TechnicianUserID = @TechnicianUserID
        )`
      : "WHERE p.IsActive = 1";

    if (isTechnician) {
      request.input("TechnicianUserID", sql.Int, technicianUserId);
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
      ${serviceRecordWhere}
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
      ${invoiceWhere}
      ORDER BY i.CreatedAt DESC, i.InvoiceID DESC;

      SELECT TOP 10
        c.ClientID,
        c.ClientName,
        c.ContactName,
        c.Email,
        c.Phone,
        c.CreatedAt
      FROM dbo.Clients c
      ${relatedClientWhere}
      ORDER BY c.CreatedAt DESC, c.ClientID DESC;

      SELECT TOP 10
        p.ProjectID,
        p.ProjectName,
        c.ClientName,
        p.HourlyRate,
        p.CreatedAt
      FROM dbo.Projects p
      INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
      ${relatedProjectWhere}
      ORDER BY p.CreatedAt DESC, p.ProjectID DESC;
    `);

    res.json({
      ServiceRecords: result.recordsets[0].map(mapDashboardServiceRecord),
      Invoices: result.recordsets[1].map((invoice) => mapInvoice(invoice)),
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

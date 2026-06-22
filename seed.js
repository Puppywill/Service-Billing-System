const bcrypt = require("bcrypt");
const sql = require("mssql/msnodesqlv8");

const dbConfig = {
  server: "localhost",
  database: "HelpDeskDB",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

const users = [
  { fullName: "Administrador Help Desk", email: "admin@helpdesk.local", role: "Admin" },
  { fullName: "William Rosado", email: "williamarosado@gmail.com", role: "User" },
  { fullName: "Oscar Romero", email: "romero@gmail.com", role: "User" },
  { fullName: "Usuario Help Desk", email: "user@helpdesk.local", role: "User" },
  { fullName: "Eliane Perez", email: "eliane@gmail.com", role: "User" },
  { fullName: "Maria Lopez", email: "maria@gmail.com", role: "User" },
  { fullName: "Carlos Rivera", email: "carlos@gmail.com", role: "User" },
  { fullName: "Sofia Martinez", email: "sofia@gmail.com", role: "User" },
  { fullName: "Luis Torres", email: "luis@gmail.com", role: "User" },
  { fullName: "Ana Gomez", email: "ana@gmail.com", role: "User" },
  { fullName: "Javier Morales", email: "javier@gmail.com", role: "User" }
];

const tickets = [
  {
    email: "romero@gmail.com",
    description: "VPN no conecta al servidor corporativo desde la red de casa.",
    priority: "Alta",
    status: "Abierto"
  },
  {
    email: "user@helpdesk.local",
    description: "Cuenta bloqueada despues de varios intentos fallidos de inicio de sesion.",
    priority: "Alta",
    status: "En Progreso"
  },
  {
    email: "eliane@gmail.com",
    description: "Problema de internet intermitente durante videollamadas y acceso a sistemas internos.",
    priority: "Media",
    status: "Abierto"
  },
  {
    email: "maria@gmail.com",
    description: "Impresora no imprime documentos enviados desde el equipo de recepcion.",
    priority: "Media",
    status: "Abierto"
  },
  {
    email: "carlos@gmail.com",
    description: "Outlook no abre y muestra error al cargar el perfil del usuario.",
    priority: "Alta",
    status: "En Progreso"
  },
  {
    email: "sofia@gmail.com",
    description: "Microsoft Teams sin audio durante reuniones con clientes.",
    priority: "Media",
    status: "Cerrado"
  },
  {
    email: "luis@gmail.com",
    description: "Computadora lenta al iniciar Windows y abrir aplicaciones de oficina.",
    priority: "Media",
    status: "Abierto"
  },
  {
    email: "ana@gmail.com",
    description: "Monitor no da imagen aunque el equipo esta encendido.",
    priority: "Baja",
    status: "Abierto"
  },
  {
    email: "javier@gmail.com",
    description: "No puede acceder al sistema de inventario despues de cambio de permisos.",
    priority: "Alta",
    status: "En Progreso"
  },
  {
    email: "williamarosado@gmail.com",
    description: "Solicitud de cambio de contrasena para usuario del area administrativa.",
    priority: "Baja",
    status: "Cerrado"
  }
];

const cleanUserEmails = users.map((user) => user.email.toLowerCase());

async function ensureRequiredSchema(pool) {
  await pool.request().query(`
    IF COL_LENGTH('dbo.Users', 'CreatedByUserID') IS NULL
      ALTER TABLE dbo.Users ADD CreatedByUserID INT NULL;

    IF COL_LENGTH('dbo.Tickets', 'CreatedByUserID') IS NULL
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
  `);
}

function toSqlStringList(values) {
  return values.map((value) => `'${value.replaceAll("'", "''")}'`).join(", ");
}

async function cleanDemoData(pool) {
  const emailList = toSqlStringList(cleanUserEmails);

  await pool.request().query(`
    IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL
      DELETE FROM dbo.Notifications;

    IF OBJECT_ID('dbo.PasswordResetRequests', 'U') IS NOT NULL
      DELETE FROM dbo.PasswordResetRequests;

    IF OBJECT_ID('dbo.Tickets', 'U') IS NOT NULL
      DELETE FROM dbo.Tickets;

    DELETE FROM dbo.Users
    WHERE LOWER(Email) NOT IN (${emailList});
  `);
}

async function seedUsers(pool, passwordHash) {
  for (const user of users) {
    await pool.request()
      .input("FullName", sql.NVarChar(120), user.fullName)
      .input("Email", sql.NVarChar(180), user.email.toLowerCase())
      .input("Password", sql.NVarChar(255), passwordHash)
      .input("Role", sql.NVarChar(20), user.role)
      .query(`
        IF EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @Email)
        BEGIN
          UPDATE dbo.Users
          SET FullName = @FullName,
              Password = @Password,
              Role = @Role
          WHERE Email = @Email;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.Users (FullName, Email, Password, Role)
          VALUES (@FullName, @Email, @Password, @Role);
        END
      `);
  }

  const adminResult = await pool.request()
    .input("Email", sql.NVarChar(180), "admin@helpdesk.local")
    .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

  const createdByUserId = adminResult.recordset[0]?.UserID || null;

  if (createdByUserId) {
    await pool.request()
      .input("CreatedByUserID", sql.Int, createdByUserId)
      .query(`
        UPDATE dbo.Users
        SET CreatedByUserID = COALESCE(CreatedByUserID, @CreatedByUserID)
        WHERE Email IN (
          'admin@helpdesk.local',
          'williamarosado@gmail.com',
          'romero@gmail.com',
          'user@helpdesk.local',
          'eliane@gmail.com',
          'maria@gmail.com',
          'carlos@gmail.com',
          'sofia@gmail.com',
          'luis@gmail.com',
          'ana@gmail.com',
          'javier@gmail.com'
        );
      `);
  }
}

async function getUserIdByEmail(pool, email) {
  const result = await pool.request()
    .input("Email", sql.NVarChar(180), email.toLowerCase())
    .query("SELECT UserID, FullName FROM dbo.Users WHERE Email = @Email");

  return result.recordset[0] || null;
}

async function createTicketNotification(pool, userId, ticketId, description) {
  const message = `Ticket creado: #${ticketId} - ${description}`;

  await pool.request()
    .input("UserID", sql.Int, userId)
    .input("Message", sql.NVarChar(300), message)
    .input("Type", sql.NVarChar(40), "TICKET_CREATED")
    .query(`
      IF NOT EXISTS (
        SELECT 1
        FROM dbo.Notifications
        WHERE UserID = @UserID
          AND Message = @Message
          AND Type = @Type
      )
      BEGIN
        INSERT INTO dbo.Notifications (UserID, Message, Type)
        VALUES (@UserID, @Message, @Type);
      END
    `);
}

async function seedTickets(pool) {
  for (const ticket of tickets) {
    const creator = await getUserIdByEmail(pool, ticket.email);

    if (!creator) {
      throw new Error(`No se encontro el usuario: ${ticket.email}`);
    }

    const existingTicket = await pool.request()
      .input("Description", sql.NVarChar(sql.MAX), ticket.description)
      .query(`
        SELECT TOP 1 TicketID
        FROM dbo.Tickets
        WHERE Description = @Description
      `);

    if (existingTicket.recordset.length > 0) {
      await pool.request()
        .input("TicketID", sql.Int, existingTicket.recordset[0].TicketID)
        .input("UserName", sql.NVarChar(120), creator.FullName)
        .input("Priority", sql.NVarChar(20), ticket.priority)
        .input("Status", sql.NVarChar(30), ticket.status)
        .input("CreatedByUserID", sql.Int, creator.UserID)
        .query(`
          UPDATE dbo.Tickets
          SET UserName = @UserName,
              Priority = @Priority,
              Status = @Status,
              CreatedByUserID = @CreatedByUserID
          WHERE TicketID = @TicketID;
        `);
      continue;
    }

    const insertResult = await pool.request()
      .input("UserName", sql.NVarChar(120), creator.FullName)
      .input("Description", sql.NVarChar(sql.MAX), ticket.description)
      .input("Priority", sql.NVarChar(20), ticket.priority)
      .input("Status", sql.NVarChar(30), ticket.status)
      .input("CreatedByUserID", sql.Int, creator.UserID)
      .query(`
        INSERT INTO dbo.Tickets (UserName, Description, Priority, Status, CreatedByUserID)
        OUTPUT inserted.TicketID
        VALUES (@UserName, @Description, @Priority, @Status, @CreatedByUserID);
      `);

    await createTicketNotification(
      pool,
      creator.UserID,
      insertResult.recordset[0].TicketID,
      ticket.description
    );
  }
}

async function main() {
  const pool = await sql.connect(dbConfig);
  const passwordHash = await bcrypt.hash("1234", 10);

  await ensureRequiredSchema(pool);
  await cleanDemoData(pool);
  await seedUsers(pool, passwordHash);
  await seedTickets(pool);

  console.log("Seed completado correctamente.");
  console.log("Todos los usuarios de prueba usan password: 1234");

  await pool.close();
}

main().catch(async (error) => {
  console.error(error);
  await sql.close();
  process.exit(1);
});

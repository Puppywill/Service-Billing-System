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

const demoUsers = [
  { fullName: "William Rosado", email: "williamarosado@gmail.com", role: "Admin" },
  { fullName: "Sofia Martinez", email: "sofia.martinez@helpdesk.local", role: "Admin" },
  { fullName: "Oscar Romero", email: "romero@gmail.com", role: "User" },
  { fullName: "Ana Gomez", email: "ana.gomez@helpdesk.local", role: "User" },
  { fullName: "Carlos Perez", email: "carlos.perez@helpdesk.local", role: "User" },
  { fullName: "Maria Lopez", email: "maria.lopez@helpdesk.local", role: "User" },
  { fullName: "Luis Hernandez", email: "luis.hernandez@helpdesk.local", role: "User" },
  { fullName: "Elena Torres", email: "elena.torres@helpdesk.local", role: "User" },
  { fullName: "Roberto Diaz", email: "roberto.diaz@helpdesk.local", role: "User" },
  { fullName: "Valeria Sanchez", email: "valeria.sanchez@helpdesk.local", role: "User" }
];

const demoTickets = [
  {
    email: "romero@gmail.com",
    userName: "Oscar Romero",
    description: "No puedo conectarme a la VPN corporativa desde mi laptop. El cliente muestra error de autenticacion.",
    priority: "Alta",
    status: "Abierto"
  },
  {
    email: "ana.gomez@helpdesk.local",
    userName: "Ana Gomez",
    description: "La conexion a internet se cae varias veces durante videollamadas y afecta mi trabajo remoto.",
    priority: "Alta",
    status: "En Progreso"
  },
  {
    email: "carlos.perez@helpdesk.local",
    userName: "Carlos Perez",
    description: "La impresora de contabilidad aparece sin conexion y no permite imprimir facturas.",
    priority: "Media",
    status: "Abierto"
  },
  {
    email: "maria.lopez@helpdesk.local",
    userName: "Maria Lopez",
    description: "Necesito restablecer mi password porque mi cuenta quedo bloqueada despues de varios intentos.",
    priority: "Alta",
    status: "Cerrado"
  },
  {
    email: "luis.hernandez@helpdesk.local",
    userName: "Luis Hernandez",
    description: "No recibo emails externos en Outlook desde esta manana, pero si puedo enviar correos.",
    priority: "Media",
    status: "En Progreso"
  },
  {
    email: "elena.torres@helpdesk.local",
    userName: "Elena Torres",
    description: "La computadora esta muy lenta al abrir Excel, navegador y el sistema de inventario.",
    priority: "Media",
    status: "Abierto"
  },
  {
    email: "roberto.diaz@helpdesk.local",
    userName: "Roberto Diaz",
    description: "No tengo acceso al sistema de ventas despues del cambio de departamento.",
    priority: "Alta",
    status: "Abierto"
  },
  {
    email: "valeria.sanchez@helpdesk.local",
    userName: "Valeria Sanchez",
    description: "Microsoft Teams no detecta el microfono durante reuniones con clientes.",
    priority: "Media",
    status: "Cerrado"
  },
  {
    email: "sofia.martinez@helpdesk.local",
    userName: "Sofia Martinez",
    description: "Outlook solicita credenciales repetidamente aunque la contrasena fue actualizada correctamente.",
    priority: "Baja",
    status: "En Progreso"
  },
  {
    email: "williamarosado@gmail.com",
    userName: "William Rosado",
    description: "El segundo monitor no muestra imagen despues de conectar la estacion de acoplamiento.",
    priority: "Baja",
    status: "Abierto"
  }
];

async function ensureAuditColumns(pool) {
  await pool.request().query(`
    IF COL_LENGTH('dbo.Users', 'CreatedByUserID') IS NULL
      ALTER TABLE dbo.Users ADD CreatedByUserID INT NULL;

    IF COL_LENGTH('dbo.Tickets', 'CreatedByUserID') IS NULL
      ALTER TABLE dbo.Tickets ADD CreatedByUserID INT NULL;
  `);
}

async function upsertDemoUsers(pool, adminHash, userHash) {
  for (const user of demoUsers) {
    const passwordHash = user.role === "Admin" ? adminHash : userHash;

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

  const williamResult = await pool.request()
    .input("Email", sql.NVarChar(180), "williamarosado@gmail.com")
    .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

  const williamUserId = williamResult.recordset[0].UserID;

  await pool.request()
    .input("CreatedByUserID", sql.Int, williamUserId)
    .query(`
      UPDATE dbo.Users
      SET CreatedByUserID = COALESCE(CreatedByUserID, @CreatedByUserID)
      WHERE Email IN (
        'williamarosado@gmail.com',
        'sofia.martinez@helpdesk.local',
        'romero@gmail.com',
        'ana.gomez@helpdesk.local',
        'carlos.perez@helpdesk.local',
        'maria.lopez@helpdesk.local',
        'luis.hernandez@helpdesk.local',
        'elena.torres@helpdesk.local',
        'roberto.diaz@helpdesk.local',
        'valeria.sanchez@helpdesk.local'
      );
    `);
}

async function getUserIdByEmail(pool, email) {
  const result = await pool.request()
    .input("Email", sql.NVarChar(180), email.toLowerCase())
    .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

  return result.recordset[0]?.UserID;
}

async function insertDemoTickets(pool) {
  for (const ticket of demoTickets) {
    const createdByUserId = await getUserIdByEmail(pool, ticket.email);

    if (!createdByUserId) {
      throw new Error(`No se encontro el usuario para el ticket: ${ticket.email}`);
    }

    await pool.request()
      .input("UserName", sql.NVarChar(120), ticket.userName)
      .input("Description", sql.NVarChar(sql.MAX), ticket.description)
      .input("Priority", sql.NVarChar(20), ticket.priority)
      .input("Status", sql.NVarChar(30), ticket.status)
      .input("CreatedByUserID", sql.Int, createdByUserId)
      .query(`
        IF NOT EXISTS (
          SELECT 1
          FROM dbo.Tickets
          WHERE Description = @Description
            AND CreatedByUserID = @CreatedByUserID
        )
        BEGIN
          INSERT INTO dbo.Tickets (UserName, Description, Priority, Status, CreatedByUserID)
          VALUES (@UserName, @Description, @Priority, @Status, @CreatedByUserID);
        END
      `);
  }
}

async function seedDemoData() {
  const pool = await sql.connect(dbConfig);
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const userHash = await bcrypt.hash("User123!", 10);

  await ensureAuditColumns(pool);
  await upsertDemoUsers(pool, adminHash, userHash);
  await insertDemoTickets(pool);

  console.log("Data de prueba creada correctamente.");
  console.log("Admins: williamarosado@gmail.com y sofia.martinez@helpdesk.local / Admin123!");
  console.log("Users: romero@gmail.com y usuarios demo / User123!");

  await pool.close();
}

seedDemoData().catch(async (error) => {
  console.error(error);
  await sql.close();
  process.exit(1);
});

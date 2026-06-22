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

const accounts = [
  { email: "admin@helpdesk.local", password: "Admin123!" },
  { email: "user@helpdesk.local", password: "User123!" }
];

async function resetDemoPasswords() {
  const pool = await sql.connect(dbConfig);

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);

    await pool.request()
      .input("Email", sql.NVarChar(180), account.email)
      .input("Password", sql.NVarChar(255), passwordHash)
      .query(`
        UPDATE dbo.Users
        SET Password = @Password
        WHERE Email = @Email;

        IF COL_LENGTH('dbo.Users', 'PasswordHash') IS NOT NULL
        BEGIN
          UPDATE dbo.Users
          SET PasswordHash = @Password
          WHERE Email = @Email;
        END
      `);
  }

  await pool.close();
  console.log("Demo account passwords restored.");
}

resetDemoPasswords().catch((error) => {
  console.error(error);
  process.exit(1);
});

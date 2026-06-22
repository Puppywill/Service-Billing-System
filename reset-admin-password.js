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

async function resetPassword() {
  const email = "admin@helpdesk.local";
  const passwordHash = await bcrypt.hash("1234", 10);
  const pool = await sql.connect(dbConfig);

  await pool.request()
    .input("Email", sql.NVarChar(180), email)
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

  await pool.close();
  console.log(`Password updated for ${email}`);
}

resetPassword().catch((error) => {
  console.error(error);
  process.exit(1);
});

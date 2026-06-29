USE ServiceBillingDB;
GO

SET NOCOUNT ON;
GO

DECLARE @TemporaryPasswordHash NVARCHAR(255) = N'$2b$10$vpY5gCPw3tKL30JjadO.TefBRJ7sc4zWMfPOGYx/5Y9FdcqNeqfLy';

DECLARE @MigrationResults TABLE (
  ActionName NVARCHAR(20) NOT NULL,
  Email NVARCHAR(180) NOT NULL,
  FullName NVARCHAR(120) NOT NULL
);

WITH SourceTechnicians AS (
  SELECT
    LegacyUsername,
    LEFT(FullName, 120) AS FullName,
    LEFT(
      LOWER(
        COALESCE(
          NULLIF(LTRIM(RTRIM(Email)), N''),
          CONCAT(LegacyUsername, N'@legacy.servicebilling.local')
        )
      ),
      180
    ) AS Email,
    Role,
    TechnicianInitials,
    IsActive
  FROM dbo.vw_RealTechnicians
  WHERE IsValidForMigration = 1
    AND LegacyUsername IS NOT NULL
    AND FullName IS NOT NULL
),
RankedTechnicians AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY Email
      ORDER BY LegacyUsername
    ) AS SourceRank
  FROM SourceTechnicians
),
PreparedTechnicians AS (
  SELECT
    LegacyUsername,
    FullName,
    Email,
    CASE
      WHEN Role = N'Admin' THEN N'Admin'
      WHEN Role = N'Technician' THEN N'Technician'
      ELSE N'User'
    END AS Role,
    CASE
      WHEN Role = N'Technician' THEN CAST(1 AS bit)
      ELSE CAST(0 AS bit)
    END AS IsTechnician,
    IsActive
  FROM RankedTechnicians
  WHERE SourceRank = 1
)
MERGE dbo.Users AS target
USING PreparedTechnicians AS source
  ON LOWER(target.Email) = source.Email
WHEN MATCHED AND (
     ISNULL(target.FullName, N'') <> ISNULL(source.FullName, N'')
  OR ISNULL(target.Role, N'') <> ISNULL(source.Role, N'')
  OR ISNULL(target.IsTechnician, 0) <> ISNULL(source.IsTechnician, 0)
  OR ISNULL(target.IsActive, 0) <> ISNULL(source.IsActive, 0)
)
THEN UPDATE SET
  FullName = source.FullName,
  Role = source.Role,
  IsTechnician = source.IsTechnician,
  IsActive = source.IsActive,
  UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET
THEN INSERT (
  FullName,
  Email,
  Password,
  Role,
  Phone,
  HourlyCost,
  IsTechnician,
  IsActive,
  CreatedAt,
  UpdatedAt,
  CreatedByUserID
)
VALUES (
  source.FullName,
  source.Email,
  @TemporaryPasswordHash,
  source.Role,
  NULL,
  NULL,
  source.IsTechnician,
  source.IsActive,
  SYSUTCDATETIME(),
  NULL,
  NULL
)
OUTPUT $action, inserted.Email, inserted.FullName
INTO @MigrationResults (ActionName, Email, FullName);

DECLARE @ValidUniqueSourceCount INT = (
  SELECT COUNT(*)
  FROM (
    SELECT DISTINCT
      LEFT(
        LOWER(
          COALESCE(
            NULLIF(LTRIM(RTRIM(Email)), N''),
            CONCAT(LegacyUsername, N'@legacy.servicebilling.local')
          )
        ),
        180
      ) AS Email
    FROM dbo.vw_RealTechnicians
    WHERE IsValidForMigration = 1
      AND LegacyUsername IS NOT NULL
      AND FullName IS NOT NULL
  ) validTechnicians
);

DECLARE @InvalidSourceCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealTechnicians
  WHERE IsValidForMigration = 0
     OR LegacyUsername IS NULL
     OR FullName IS NULL
);

DECLARE @DuplicateEmailCount INT = (
  SELECT COUNT(*) - COUNT(DISTINCT Email)
  FROM (
    SELECT
      LEFT(
        LOWER(
          COALESCE(
            NULLIF(LTRIM(RTRIM(Email)), N''),
            CONCAT(LegacyUsername, N'@legacy.servicebilling.local')
          )
        ),
        180
      ) AS Email
    FROM dbo.vw_RealTechnicians
    WHERE IsValidForMigration = 1
      AND LegacyUsername IS NOT NULL
      AND FullName IS NOT NULL
  ) sourceEmails
);

DECLARE @InsertedCount INT = (
  SELECT COUNT(*)
  FROM @MigrationResults
  WHERE ActionName = N'INSERT'
);

DECLARE @UpdatedCount INT = (
  SELECT COUNT(*)
  FROM @MigrationResults
  WHERE ActionName = N'UPDATE'
);

DECLARE @AlreadyCurrentCount INT = @ValidUniqueSourceCount - @InsertedCount - @UpdatedCount;

SELECT
  @InsertedCount AS UsersInserted,
  @UpdatedCount AS UsersUpdated,
  @AlreadyCurrentCount AS UsersAlreadyCurrent,
  @InvalidSourceCount AS UsersInvalidFromSource,
  @DuplicateEmailCount AS UsersDuplicateEmailsOmitted;

SELECT
  ActionName,
  Email,
  FullName
FROM @MigrationResults
ORDER BY ActionName, Email;

SELECT
  UserID,
  FullName,
  Email,
  Role,
  IsTechnician,
  IsActive,
  CreatedAt,
  UpdatedAt
FROM dbo.Users
WHERE LOWER(Email) IN (
  SELECT
    LEFT(
      LOWER(
        COALESCE(
          NULLIF(LTRIM(RTRIM(Email)), N''),
          CONCAT(LegacyUsername, N'@legacy.servicebilling.local')
        )
      ),
      180
    )
  FROM dbo.vw_RealTechnicians
  WHERE IsValidForMigration = 1
    AND LegacyUsername IS NOT NULL
    AND FullName IS NOT NULL
)
ORDER BY FullName, Email;
GO

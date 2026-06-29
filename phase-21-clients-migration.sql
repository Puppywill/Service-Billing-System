USE ServiceBillingDB;
GO

SET NOCOUNT ON;
GO

DECLARE @MigrationResults TABLE (
  ActionName NVARCHAR(20) NOT NULL,
  ClientName NVARCHAR(160) NOT NULL
);

WITH SourceClients AS (
  SELECT
    LegacyClientCode,
    LEFT(ClientName, 160) AS ClientName,
    LEFT(Email, 180) AS Email,
    LEFT(Phone, 40) AS Phone,
    LEFT(AddressLine1, 180) AS AddressLine1,
    LEFT(AddressLine2, 180) AS AddressLine2,
    LEFT(City, 100) AS City,
    LEFT(PostalCode, 30) AS PostalCode,
    LEFT(ClientType, 180) AS ClientType,
    LegacyStartDate,
    LegacyEndDate
  FROM dbo.vw_RealClients
  WHERE IsValidForMigration = 1
    AND ClientName IS NOT NULL
),
RankedClients AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY ClientName
      ORDER BY LegacyClientCode
    ) AS SourceRank
  FROM SourceClients
),
PreparedClients AS (
  SELECT
    LegacyClientCode,
    ClientName,
    Email,
    Phone,
    AddressLine1,
    AddressLine2,
    City,
    PostalCode,
    COALESCE(ClientType, ClientName) AS BillingName
  FROM RankedClients
  WHERE SourceRank = 1
)
MERGE dbo.Clients AS target
USING PreparedClients AS source
  ON target.ClientName = source.ClientName
WHEN MATCHED AND (
     ISNULL(target.Email, N'') <> ISNULL(source.Email, N'')
  OR ISNULL(target.Phone, N'') <> ISNULL(source.Phone, N'')
  OR ISNULL(target.AddressLine1, N'') <> ISNULL(source.AddressLine1, N'')
  OR ISNULL(target.AddressLine2, N'') <> ISNULL(source.AddressLine2, N'')
  OR ISNULL(target.City, N'') <> ISNULL(source.City, N'')
  OR ISNULL(target.PostalCode, N'') <> ISNULL(source.PostalCode, N'')
  OR ISNULL(target.BillingName, N'') <> ISNULL(source.BillingName, N'')
  OR target.IsActive <> 1
)
THEN UPDATE SET
  Email = source.Email,
  Phone = source.Phone,
  AddressLine1 = source.AddressLine1,
  AddressLine2 = source.AddressLine2,
  City = source.City,
  PostalCode = source.PostalCode,
  BillingName = source.BillingName,
  IsActive = 1,
  UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET
THEN INSERT (
  ClientName,
  ContactName,
  Email,
  Phone,
  BillingName,
  TaxID,
  AddressLine1,
  AddressLine2,
  City,
  StateProvince,
  PostalCode,
  Country,
  IsActive,
  CreatedAt,
  UpdatedAt,
  CreatedByUserID
)
VALUES (
  source.ClientName,
  NULL,
  source.Email,
  source.Phone,
  source.BillingName,
  NULL,
  source.AddressLine1,
  source.AddressLine2,
  source.City,
  N'PR',
  source.PostalCode,
  N'USA',
  1,
  SYSUTCDATETIME(),
  NULL,
  NULL
)
OUTPUT $action, inserted.ClientName
INTO @MigrationResults (ActionName, ClientName);

DECLARE @ValidUniqueSourceCount INT = (
  SELECT COUNT(*)
  FROM (
    SELECT DISTINCT ClientName
    FROM dbo.vw_RealClients
    WHERE IsValidForMigration = 1
      AND ClientName IS NOT NULL
  ) validClients
);

DECLARE @InvalidSourceCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealClients
  WHERE IsValidForMigration = 0
     OR ClientName IS NULL
);

DECLARE @DuplicateSourceCount INT = (
  SELECT COUNT(*) - COUNT(DISTINCT ClientName)
  FROM dbo.vw_RealClients
  WHERE IsValidForMigration = 1
    AND ClientName IS NOT NULL
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

DECLARE @UnchangedCount INT = @ValidUniqueSourceCount - @InsertedCount - @UpdatedCount;

SELECT
  @InsertedCount AS ClientsInserted,
  @UpdatedCount AS ClientsUpdated,
  @UnchangedCount + @InvalidSourceCount + @DuplicateSourceCount AS ClientsOmitted,
  @UnchangedCount AS ClientsAlreadyCurrent,
  @InvalidSourceCount AS ClientsInvalidFromSource,
  @DuplicateSourceCount AS ClientsDuplicateNamesOmitted;

SELECT
  ActionName,
  ClientName
FROM @MigrationResults
ORDER BY ActionName, ClientName;

SELECT
  ClientID,
  ClientName,
  Email,
  Phone,
  BillingName,
  AddressLine1,
  AddressLine2,
  City,
  StateProvince,
  PostalCode,
  Country,
  IsActive,
  CreatedAt,
  UpdatedAt
FROM dbo.Clients
WHERE ClientName IN (
  SELECT ClientName
  FROM dbo.vw_RealClients
  WHERE IsValidForMigration = 1
)
ORDER BY ClientName;
GO

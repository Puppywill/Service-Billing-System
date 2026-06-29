USE ServiceBillingDB;
GO

SET NOCOUNT ON;
GO

IF COL_LENGTH(N'dbo.Clients', N'LegacyClientCode') IS NULL
BEGIN
  ALTER TABLE dbo.Clients ADD LegacyClientCode NVARCHAR(10) NULL;
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'UX_Clients_LegacyClientCode'
    AND object_id = OBJECT_ID(N'dbo.Clients')
)
BEGIN
  CREATE UNIQUE INDEX UX_Clients_LegacyClientCode
  ON dbo.Clients (LegacyClientCode)
  WHERE LegacyClientCode IS NOT NULL;
END
GO

IF COL_LENGTH(N'dbo.Users', N'TechnicianInitials') IS NULL
BEGIN
  ALTER TABLE dbo.Users ADD TechnicianInitials NVARCHAR(10) NULL;
END
GO

IF COL_LENGTH(N'dbo.ServiceRecords', N'LegacyServiceID') IS NULL
BEGIN
  ALTER TABLE dbo.ServiceRecords ADD LegacyServiceID INT NULL;
END
GO

IF COL_LENGTH(N'dbo.ServiceRecords', N'LegacyOrderNumber') IS NULL
BEGIN
  ALTER TABLE dbo.ServiceRecords ADD LegacyOrderNumber NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH(N'dbo.ServiceRecords', N'LegacyInvoiceNumber') IS NULL
BEGIN
  ALTER TABLE dbo.ServiceRecords ADD LegacyInvoiceNumber NVARCHAR(25) NULL;
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'UX_ServiceRecords_LegacyServiceID'
    AND object_id = OBJECT_ID(N'dbo.ServiceRecords')
)
BEGIN
  CREATE UNIQUE INDEX UX_ServiceRecords_LegacyServiceID
  ON dbo.ServiceRecords (LegacyServiceID)
  WHERE LegacyServiceID IS NOT NULL;
END
GO

WITH SourceClientMap AS (
  SELECT
    s.LegacyClientCode,
    MIN(p.ClientID) AS ClientID,
    COUNT(DISTINCT p.ClientID) AS ClientMatchCount
  FROM dbo.vw_RealServiceRecords s
  INNER JOIN dbo.Projects p ON p.LegacyDepartmentID = s.LegacyDepartmentID
  WHERE s.IsValidForMigration = 1
    AND s.LegacyClientCode IS NOT NULL
    AND s.LegacyDepartmentID IS NOT NULL
  GROUP BY s.LegacyClientCode
)
UPDATE c
SET
  LegacyClientCode = scm.LegacyClientCode,
  UpdatedAt = SYSUTCDATETIME()
FROM dbo.Clients c
INNER JOIN SourceClientMap scm ON scm.ClientID = c.ClientID
WHERE scm.ClientMatchCount = 1
  AND (c.LegacyClientCode IS NULL OR c.LegacyClientCode = scm.LegacyClientCode);
GO

WITH SourceTechnicianMap AS (
  SELECT
    s.LegacyTechnicianInitials,
    s.LegacyTechnicianName,
    COUNT(*) AS ServiceCount
  FROM dbo.vw_RealServiceRecords s
  WHERE s.IsValidForMigration = 1
    AND s.LegacyTechnicianInitials IS NOT NULL
    AND s.LegacyTechnicianName IS NOT NULL
  GROUP BY s.LegacyTechnicianInitials, s.LegacyTechnicianName
),
RankedTechnicianMap AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY LegacyTechnicianName
      ORDER BY ServiceCount DESC, LegacyTechnicianInitials
    ) AS TechnicianRank
  FROM SourceTechnicianMap
)
UPDATE u
SET
  TechnicianInitials = rtm.LegacyTechnicianInitials,
  UpdatedAt = SYSUTCDATETIME()
FROM dbo.Users u
INNER JOIN RankedTechnicianMap rtm ON rtm.LegacyTechnicianName = u.FullName
WHERE rtm.TechnicianRank = 1
  AND (u.TechnicianInitials IS NULL OR u.TechnicianInitials = rtm.LegacyTechnicianInitials);
GO

DECLARE @MigrationResults TABLE (
  ActionName NVARCHAR(20) NOT NULL,
  LegacyServiceID INT NOT NULL,
  LegacyOrderNumber NVARCHAR(20) NULL
);

WITH SourceRecords AS (
  SELECT
    s.LegacyServiceID,
    LEFT(s.LegacyOrderNumber, 20) AS LegacyOrderNumber,
    s.ServiceDate,
    s.MorningStart,
    s.MorningEnd,
    s.AfternoonStart,
    s.AfternoonEnd,
    s.TotalHours,
    s.LegacyClientCode,
    s.LegacyDepartmentID,
    s.LegacyTechnicianInitials,
    s.LegacyTechnicianName,
    COALESCE(s.ServiceDescription, N'') AS ServiceDescription,
    LEFT(s.LegacyInvoiceNumber, 25) AS LegacyInvoiceNumber,
    s.Status
  FROM dbo.vw_RealServiceRecords s
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
),
ResolvedRecords AS (
  SELECT
    sr.LegacyServiceID,
    sr.LegacyOrderNumber,
    sr.ServiceDate,
    sr.MorningStart,
    sr.MorningEnd,
    sr.AfternoonStart,
    sr.AfternoonEnd,
    sr.TotalHours,
    c.ClientID,
    p.ProjectID,
    tech.UserID AS TechnicianUserID,
    sr.ServiceDescription,
    sr.LegacyInvoiceNumber,
    sr.Status
  FROM SourceRecords sr
  LEFT JOIN dbo.Clients c ON c.LegacyClientCode = sr.LegacyClientCode
  LEFT JOIN dbo.Projects p ON p.LegacyDepartmentID = sr.LegacyDepartmentID
  OUTER APPLY (
    SELECT TOP 1 u.UserID
    FROM dbo.Users u
    WHERE (
         u.TechnicianInitials = sr.LegacyTechnicianInitials
      OR u.FullName = sr.LegacyTechnicianName
    )
    ORDER BY
      CASE WHEN u.TechnicianInitials = sr.LegacyTechnicianInitials THEN 0 ELSE 1 END,
      u.IsActive DESC,
      u.UserID
  ) tech
),
PreparedRecords AS (
  SELECT
    *
  FROM ResolvedRecords
  WHERE ClientID IS NOT NULL
    AND ProjectID IS NOT NULL
    AND TechnicianUserID IS NOT NULL
    AND NOT (MorningStart IS NOT NULL AND MorningEnd IS NOT NULL AND MorningStart >= MorningEnd)
    AND NOT (AfternoonStart IS NOT NULL AND AfternoonEnd IS NOT NULL AND AfternoonStart >= AfternoonEnd)
    AND TotalHours IS NOT NULL
    AND TotalHours >= 0
    AND TotalHours <= 24
    AND Status IN (N'Recorded', N'Billed', N'Canceled')
)
MERGE dbo.ServiceRecords AS target
USING PreparedRecords AS source
  ON target.LegacyServiceID = source.LegacyServiceID
WHEN MATCHED AND (
     target.TechnicianUserID <> source.TechnicianUserID
  OR target.ClientID <> source.ClientID
  OR target.ProjectID <> source.ProjectID
  OR target.ServiceDate <> source.ServiceDate
  OR ISNULL(CONVERT(VARCHAR(8), target.MorningStart, 108), '') <> ISNULL(CONVERT(VARCHAR(8), source.MorningStart, 108), '')
  OR ISNULL(CONVERT(VARCHAR(8), target.MorningEnd, 108), '') <> ISNULL(CONVERT(VARCHAR(8), source.MorningEnd, 108), '')
  OR ISNULL(CONVERT(VARCHAR(8), target.AfternoonStart, 108), '') <> ISNULL(CONVERT(VARCHAR(8), source.AfternoonStart, 108), '')
  OR ISNULL(CONVERT(VARCHAR(8), target.AfternoonEnd, 108), '') <> ISNULL(CONVERT(VARCHAR(8), source.AfternoonEnd, 108), '')
  OR target.TotalHours <> source.TotalHours
  OR ISNULL(target.ServiceDescription, N'') <> ISNULL(source.ServiceDescription, N'')
  OR target.Status <> source.Status
  OR ISNULL(target.LegacyOrderNumber, N'') <> ISNULL(source.LegacyOrderNumber, N'')
  OR ISNULL(target.LegacyInvoiceNumber, N'') <> ISNULL(source.LegacyInvoiceNumber, N'')
)
THEN UPDATE SET
  TechnicianUserID = source.TechnicianUserID,
  ClientID = source.ClientID,
  ProjectID = source.ProjectID,
  ServiceDate = source.ServiceDate,
  MorningStart = source.MorningStart,
  MorningEnd = source.MorningEnd,
  AfternoonStart = source.AfternoonStart,
  AfternoonEnd = source.AfternoonEnd,
  TotalHours = source.TotalHours,
  ServiceDescription = source.ServiceDescription,
  Status = source.Status,
  LegacyOrderNumber = source.LegacyOrderNumber,
  LegacyInvoiceNumber = source.LegacyInvoiceNumber,
  IsActive = CASE WHEN source.Status = N'Canceled' THEN 0 ELSE 1 END,
  UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET
THEN INSERT (
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
  InvoiceID,
  IsActive,
  CreatedAt,
  UpdatedAt,
  CreatedByUserID,
  LegacyServiceID,
  LegacyOrderNumber,
  LegacyInvoiceNumber
)
VALUES (
  source.TechnicianUserID,
  source.ClientID,
  source.ProjectID,
  source.ServiceDate,
  source.MorningStart,
  source.MorningEnd,
  source.AfternoonStart,
  source.AfternoonEnd,
  source.TotalHours,
  source.ServiceDescription,
  source.Status,
  NULL,
  CASE WHEN source.Status = N'Canceled' THEN 0 ELSE 1 END,
  SYSUTCDATETIME(),
  NULL,
  NULL,
  source.LegacyServiceID,
  source.LegacyOrderNumber,
  source.LegacyInvoiceNumber
)
OUTPUT $action, inserted.LegacyServiceID, inserted.LegacyOrderNumber
INTO @MigrationResults (ActionName, LegacyServiceID, LegacyOrderNumber);

DECLARE @ValidSourceCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords
  WHERE IsValidForMigration = 1
    AND LegacyServiceID IS NOT NULL
);

DECLARE @InvalidSourceCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords
  WHERE IsValidForMigration = 0
     OR LegacyServiceID IS NULL
);

DECLARE @WithoutClientCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords s
  LEFT JOIN dbo.Clients c ON c.LegacyClientCode = s.LegacyClientCode
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
    AND c.ClientID IS NULL
);

DECLARE @WithoutProjectCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords s
  LEFT JOIN dbo.Projects p ON p.LegacyDepartmentID = s.LegacyDepartmentID
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
    AND p.ProjectID IS NULL
);

DECLARE @WithoutTechnicianCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords s
  OUTER APPLY (
    SELECT TOP 1 u.UserID
    FROM dbo.Users u
    WHERE (
         u.TechnicianInitials = s.LegacyTechnicianInitials
      OR u.FullName = s.LegacyTechnicianName
    )
    ORDER BY
      CASE WHEN u.TechnicianInitials = s.LegacyTechnicianInitials THEN 0 ELSE 1 END,
      u.IsActive DESC,
      u.UserID
  ) tech
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
    AND tech.UserID IS NULL
);

DECLARE @InvalidTimeRangeCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords s
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
    AND (
      (s.MorningStart IS NOT NULL AND s.MorningEnd IS NOT NULL AND s.MorningStart >= s.MorningEnd)
      OR (s.AfternoonStart IS NOT NULL AND s.AfternoonEnd IS NOT NULL AND s.AfternoonStart >= s.AfternoonEnd)
    )
);

DECLARE @InvalidTotalHoursCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords s
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
    AND (
      s.TotalHours IS NULL
      OR s.TotalHours < 0
      OR s.TotalHours > 24
    )
);

DECLARE @InvalidStatusCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords s
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
    AND (
      s.Status IS NULL
      OR s.Status NOT IN (N'Recorded', N'Billed', N'Canceled')
    )
);

DECLARE @ResolvableSourceCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealServiceRecords s
  INNER JOIN dbo.Clients c ON c.LegacyClientCode = s.LegacyClientCode
  INNER JOIN dbo.Projects p ON p.LegacyDepartmentID = s.LegacyDepartmentID
  OUTER APPLY (
    SELECT TOP 1 u.UserID
    FROM dbo.Users u
    WHERE (
         u.TechnicianInitials = s.LegacyTechnicianInitials
      OR u.FullName = s.LegacyTechnicianName
    )
    ORDER BY
      CASE WHEN u.TechnicianInitials = s.LegacyTechnicianInitials THEN 0 ELSE 1 END,
      u.IsActive DESC,
      u.UserID
  ) tech
  WHERE s.IsValidForMigration = 1
    AND s.LegacyServiceID IS NOT NULL
    AND tech.UserID IS NOT NULL
    AND NOT (s.MorningStart IS NOT NULL AND s.MorningEnd IS NOT NULL AND s.MorningStart >= s.MorningEnd)
    AND NOT (s.AfternoonStart IS NOT NULL AND s.AfternoonEnd IS NOT NULL AND s.AfternoonStart >= s.AfternoonEnd)
    AND s.TotalHours IS NOT NULL
    AND s.TotalHours >= 0
    AND s.TotalHours <= 24
    AND s.Status IN (N'Recorded', N'Billed', N'Canceled')
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

DECLARE @AlreadyCurrentRawCount INT = @ResolvableSourceCount - @InsertedCount - @UpdatedCount;
DECLARE @AlreadyCurrentCount INT = CASE WHEN @AlreadyCurrentRawCount < 0 THEN 0 ELSE @AlreadyCurrentRawCount END;

SELECT
  @InsertedCount AS ServiceRecordsInserted,
  @UpdatedCount AS ServiceRecordsUpdated,
  @AlreadyCurrentCount AS ServiceRecordsAlreadyCurrent,
  @WithoutClientCount AS ServiceRecordsWithoutClient,
  @WithoutProjectCount AS ServiceRecordsWithoutProject,
  @WithoutTechnicianCount AS ServiceRecordsWithoutTechnician,
  @InvalidSourceCount AS ServiceRecordsInvalid,
  @InvalidTimeRangeCount AS ServiceRecordsInvalidTimeRange,
  @InvalidTotalHoursCount AS ServiceRecordsInvalidTotalHours,
  @InvalidStatusCount AS ServiceRecordsInvalidStatus;

SELECT
  ActionName,
  LegacyServiceID,
  LegacyOrderNumber
FROM @MigrationResults
ORDER BY ActionName, LegacyServiceID;

SELECT TOP 100
  sr.ServiceRecordID,
  sr.LegacyServiceID,
  sr.LegacyOrderNumber,
  sr.ServiceDate,
  u.FullName AS TechnicianName,
  c.ClientName,
  p.ProjectName,
  sr.TotalHours,
  sr.Status,
  sr.LegacyInvoiceNumber,
  sr.CreatedAt,
  sr.UpdatedAt
FROM dbo.ServiceRecords sr
INNER JOIN dbo.Users u ON u.UserID = sr.TechnicianUserID
INNER JOIN dbo.Clients c ON c.ClientID = sr.ClientID
INNER JOIN dbo.Projects p ON p.ProjectID = sr.ProjectID
WHERE sr.LegacyServiceID IS NOT NULL
ORDER BY sr.ServiceDate DESC, sr.LegacyServiceID DESC;

SELECT TOP 100
  s.LegacyServiceID,
  s.LegacyOrderNumber,
  s.ServiceDate,
  s.MorningStart,
  s.MorningEnd,
  s.AfternoonStart,
  s.AfternoonEnd,
  s.TotalHours,
  s.Status,
  CASE
    WHEN s.MorningStart IS NOT NULL AND s.MorningEnd IS NOT NULL AND s.MorningStart >= s.MorningEnd THEN N'INVALID_MORNING_RANGE'
    WHEN s.AfternoonStart IS NOT NULL AND s.AfternoonEnd IS NOT NULL AND s.AfternoonStart >= s.AfternoonEnd THEN N'INVALID_AFTERNOON_RANGE'
    ELSE s.MigrationIssue
  END AS MigrationIssue
FROM dbo.vw_RealServiceRecords s
WHERE s.IsValidForMigration = 1
  AND s.LegacyServiceID IS NOT NULL
  AND (
    (s.MorningStart IS NOT NULL AND s.MorningEnd IS NOT NULL AND s.MorningStart >= s.MorningEnd)
    OR (s.AfternoonStart IS NOT NULL AND s.AfternoonEnd IS NOT NULL AND s.AfternoonStart >= s.AfternoonEnd)
  )
ORDER BY s.ServiceDate DESC, s.LegacyServiceID DESC;
GO

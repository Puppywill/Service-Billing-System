USE ServiceBillingDB;
GO

IF COL_LENGTH(N'dbo.Projects', N'ContractNumber') IS NULL
  ALTER TABLE dbo.Projects ADD ContractNumber NVARCHAR(80) NULL;
GO

IF COL_LENGTH(N'dbo.Projects', N'ContractType') IS NULL
  ALTER TABLE dbo.Projects ADD ContractType NVARCHAR(20) NULL;
GO

IF COL_LENGTH(N'dbo.Projects', N'SignedBy') IS NULL
  ALTER TABLE dbo.Projects ADD SignedBy NVARCHAR(120) NULL;
GO

IF COL_LENGTH(N'dbo.Projects', N'ContractStartDate') IS NULL
  ALTER TABLE dbo.Projects ADD ContractStartDate DATE NULL;
GO

IF COL_LENGTH(N'dbo.Projects', N'ContractEndDate') IS NULL
  ALTER TABLE dbo.Projects ADD ContractEndDate DATE NULL;
GO

IF COL_LENGTH(N'dbo.Projects', N'ContractedHours') IS NULL
  ALTER TABLE dbo.Projects ADD ContractedHours DECIMAL(8,2) NULL;
GO

IF COL_LENGTH(N'dbo.Projects', N'LowHoursThreshold') IS NULL
  ALTER TABLE dbo.Projects ADD LowHoursThreshold DECIMAL(8,2) NULL;
GO

IF COL_LENGTH(N'dbo.Projects', N'ExpirationAlertDays') IS NULL
  ALTER TABLE dbo.Projects ADD ExpirationAlertDays INT NULL;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_Projects_ContractType'
    AND parent_object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  ALTER TABLE dbo.Projects
  ADD CONSTRAINT CK_Projects_ContractType
  CHECK (ContractType IS NULL OR ContractType IN (N'Direct', N'Signed', N'Other'));
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_Projects_ContractedHours'
    AND parent_object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  ALTER TABLE dbo.Projects
  ADD CONSTRAINT CK_Projects_ContractedHours
  CHECK (ContractedHours IS NULL OR ContractedHours >= 0);
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_Projects_LowHoursThreshold'
    AND parent_object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  ALTER TABLE dbo.Projects
  ADD CONSTRAINT CK_Projects_LowHoursThreshold
  CHECK (LowHoursThreshold IS NULL OR LowHoursThreshold >= 0);
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_Projects_ExpirationAlertDays'
    AND parent_object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  ALTER TABLE dbo.Projects
  ADD CONSTRAINT CK_Projects_ExpirationAlertDays
  CHECK (ExpirationAlertDays IS NULL OR ExpirationAlertDays >= 0);
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_Projects_ContractDateRange'
    AND parent_object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  ALTER TABLE dbo.Projects
  ADD CONSTRAINT CK_Projects_ContractDateRange
  CHECK (
    ContractStartDate IS NULL
    OR ContractEndDate IS NULL
    OR ContractStartDate <= ContractEndDate
  );
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'IX_Projects_ContractEndDate'
    AND object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  CREATE INDEX IX_Projects_ContractEndDate
  ON dbo.Projects (ContractEndDate);
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'IX_Projects_ContractNumber'
    AND object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  CREATE INDEX IX_Projects_ContractNumber
  ON dbo.Projects (ContractNumber);
END
GO

CREATE OR ALTER VIEW dbo.vw_ProjectContractStatus
AS
WITH ServiceHours AS (
  SELECT
    ProjectID,
    CAST(SUM(TotalHours) AS DECIMAL(8,2)) AS UsedHours
  FROM dbo.ServiceRecords
  WHERE Status IN (N'Recorded', N'Billed')
  GROUP BY ProjectID
),
ProjectContract AS (
  SELECT
    p.ProjectID,
    p.ProjectName,
    p.ClientID,
    p.ContractNumber,
    p.ContractType,
    p.SignedBy,
    p.ContractStartDate,
    p.ContractEndDate,
    p.ContractedHours,
    p.LowHoursThreshold,
    p.ExpirationAlertDays,
    CAST(ISNULL(sh.UsedHours, 0) AS DECIMAL(8,2)) AS UsedHours,
    CAST(
      CASE
        WHEN p.ContractedHours IS NULL THEN NULL
        ELSE p.ContractedHours - ISNULL(sh.UsedHours, 0)
      END
      AS DECIMAL(8,2)
    ) AS RemainingHours
  FROM dbo.Projects p
  LEFT JOIN ServiceHours sh ON sh.ProjectID = p.ProjectID
),
AlertStatus AS (
  SELECT
    pc.ProjectID,
    pc.ProjectName,
    pc.ClientID,
    pc.ContractNumber,
    pc.ContractType,
    pc.SignedBy,
    pc.ContractStartDate,
    pc.ContractEndDate,
    pc.ContractedHours,
    pc.LowHoursThreshold,
    pc.ExpirationAlertDays,
    pc.UsedHours,
    pc.RemainingHours,
    CASE
      WHEN pc.ContractedHours IS NULL THEN N'NO_CONTRACT'
      WHEN pc.RemainingHours <= 0 THEN N'NO_HOURS_REMAINING'
      WHEN pc.LowHoursThreshold IS NOT NULL AND pc.RemainingHours <= pc.LowHoursThreshold THEN N'LOW_HOURS'
      ELSE N'OK'
    END AS HoursAlertStatus,
    CASE
      WHEN pc.ContractEndDate IS NULL THEN N'NO_CONTRACT'
      WHEN pc.ContractEndDate < CAST(GETDATE() AS DATE) THEN N'EXPIRED'
      WHEN pc.ExpirationAlertDays IS NOT NULL
        AND pc.ContractEndDate <= DATEADD(DAY, pc.ExpirationAlertDays, CAST(GETDATE() AS DATE)) THEN N'EXPIRING_SOON'
      ELSE N'OK'
    END AS ExpirationAlertStatus
  FROM ProjectContract pc
)
SELECT
  ProjectID,
  ProjectName,
  ClientID,
  ContractNumber,
  ContractType,
  SignedBy,
  ContractStartDate,
  ContractEndDate,
  ContractedHours,
  LowHoursThreshold,
  ExpirationAlertDays,
  UsedHours,
  RemainingHours,
  HoursAlertStatus,
  ExpirationAlertStatus,
  CASE
    WHEN HoursAlertStatus = N'NO_CONTRACT' AND ExpirationAlertStatus = N'NO_CONTRACT' THEN N'NO_CONTRACT'
    WHEN HoursAlertStatus = N'NO_HOURS_REMAINING' OR ExpirationAlertStatus = N'EXPIRED' THEN N'CRITICAL'
    WHEN HoursAlertStatus = N'LOW_HOURS' OR ExpirationAlertStatus = N'EXPIRING_SOON' THEN N'WARNING'
    ELSE N'OK'
  END AS ContractStatus
FROM AlertStatus;
GO

UPDATE dbo.Projects
SET
  ContractNumber = N'CNT-ACME-2026-001',
  ContractType = N'Signed',
  SignedBy = N'Laura Torres',
  ContractStartDate = '2026-06-01',
  ContractEndDate = '2026-12-31',
  ContractedHours = 80.00,
  LowHoursThreshold = 10.00,
  ExpirationAlertDays = 30,
  UpdatedAt = SYSUTCDATETIME()
WHERE ProjectName = N'Monthly IT Support'
  AND (ContractNumber IS NULL OR ContractNumber = N'CNT-ACME-2026-001');

UPDATE dbo.Projects
SET
  ContractNumber = N'CNT-NORTHWIND-2026-002',
  ContractType = N'Direct',
  SignedBy = N'Pedro Sanchez',
  ContractStartDate = '2026-06-01',
  ContractEndDate = '2026-09-30',
  ContractedHours = 12.00,
  LowHoursThreshold = 2.00,
  ExpirationAlertDays = 30,
  UpdatedAt = SYSUTCDATETIME()
WHERE ProjectName = N'Access Migration Planning'
  AND (ContractNumber IS NULL OR ContractNumber = N'CNT-NORTHWIND-2026-002');

UPDATE dbo.Projects
SET
  ContractNumber = N'CNT-CONTOSO-2026-003',
  ContractType = N'Other',
  SignedBy = N'Elena Vega',
  ContractStartDate = '2026-06-01',
  ContractEndDate = DATEADD(DAY, 10, CAST(GETDATE() AS DATE)),
  ContractedHours = 50.00,
  LowHoursThreshold = 5.00,
  ExpirationAlertDays = 15,
  UpdatedAt = SYSUTCDATETIME()
WHERE ProjectName = N'Billing Operations Support'
  AND (ContractNumber IS NULL OR ContractNumber = N'CNT-CONTOSO-2026-003');
GO

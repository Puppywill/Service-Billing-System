USE ServiceBillingDB;
GO

CREATE OR ALTER VIEW dbo.vw_RealClients
AS
SELECT
  c.Name AS LegacyClientCode,
  NULLIF(LTRIM(RTRIM(c.Initial)), N'') AS ClientName,
  NULLIF(LTRIM(RTRIM(c.Phone)), N'') AS Phone,
  NULLIF(LTRIM(RTRIM(c.Email)), N'') AS Email,
  NULLIF(LTRIM(RTRIM(c.PhisAddress1)), N'') AS AddressLine1,
  NULLIF(LTRIM(RTRIM(c.PhisAddress2)), N'') AS AddressLine2,
  NULLIF(LTRIM(RTRIM(c.PhisCity)), N'') AS City,
  NULLIF(LTRIM(RTRIM(c.PhisZipCode)), N'') AS PostalCode,
  NULLIF(LTRIM(RTRIM(c.Type)), N'') AS ClientType,
  c.FechaComienzo AS LegacyStartDate,
  c.FechaTerminacion AS LegacyEndDate,
  c.TotHrs AS LegacyTotalHours,
  c.XtraHrs AS LegacyExtraHours,
  c.CantHrs AS LegacyContractHours,
  CAST(
    CASE
      WHEN c.Name IS NULL OR LTRIM(RTRIM(c.Name)) = N'' THEN 0
      WHEN c.Initial IS NULL OR LTRIM(RTRIM(c.Initial)) = N'' THEN 0
      ELSE 1
    END
    AS bit
  ) AS IsValidForMigration,
  CASE
    WHEN c.Name IS NULL OR LTRIM(RTRIM(c.Name)) = N'' THEN N'MISSING_CLIENT_CODE'
    WHEN c.Initial IS NULL OR LTRIM(RTRIM(c.Initial)) = N'' THEN N'MISSING_CLIENT_NAME'
    ELSE NULL
  END AS MigrationIssue
FROM ServiceSBD_20260629.dbo.Client c;
GO

CREATE OR ALTER VIEW dbo.vw_RealTechnicians
AS
SELECT
  t.username AS LegacyUsername,
  NULLIF(LTRIM(RTRIM(CONCAT(ISNULL(t.Name, N''), N' ', ISNULL(t.LastName, N'')))), N'') AS FullName,
  NULLIF(LTRIM(RTRIM(t.Email)), N'') AS Email,
  CASE
    WHEN t.secgroup = N'Administrador' THEN N'Admin'
    WHEN t.secgroup COLLATE Latin1_General_CI_AI = N'Tecnico' THEN N'Technician'
    ELSE N'User'
  END AS Role,
  NULLIF(LTRIM(RTRIM(t.Initial)), N'') AS TechnicianInitials,
  CAST(
    CASE
      WHEN UPPER(ISNULL(t.Status, '')) = 'A' THEN 1
      ELSE 0
    END
    AS bit
  ) AS IsActive,
  t.Status AS LegacyStatus,
  t.secgroup AS LegacySecGroup,
  CAST(
    CASE
      WHEN t.username IS NULL OR LTRIM(RTRIM(t.username)) = N'' THEN 0
      WHEN NULLIF(LTRIM(RTRIM(CONCAT(ISNULL(t.Name, N''), N' ', ISNULL(t.LastName, N'')))), N'') IS NULL THEN 0
      WHEN t.Initial IS NULL OR LTRIM(RTRIM(t.Initial)) = N'' THEN 0
      WHEN t.secgroup <> N'Administrador' AND t.secgroup COLLATE Latin1_General_CI_AI <> N'Tecnico' THEN 0
      ELSE 1
    END
    AS bit
  ) AS IsValidForMigration,
  CASE
    WHEN t.username IS NULL OR LTRIM(RTRIM(t.username)) = N'' THEN N'MISSING_USERNAME'
    WHEN NULLIF(LTRIM(RTRIM(CONCAT(ISNULL(t.Name, N''), N' ', ISNULL(t.LastName, N'')))), N'') IS NULL THEN N'MISSING_FULL_NAME'
    WHEN t.Initial IS NULL OR LTRIM(RTRIM(t.Initial)) = N'' THEN N'MISSING_INITIALS'
    WHEN t.secgroup <> N'Administrador' AND t.secgroup COLLATE Latin1_General_CI_AI <> N'Tecnico' THEN N'UNKNOWN_SECGROUP'
    ELSE NULL
  END AS MigrationIssue
FROM ServiceSBD_20260629.dbo.Technician t;
GO

CREATE OR ALTER VIEW dbo.vw_RealProjects
AS
SELECT
  d.IdDepartamento AS LegacyDepartmentID,
  d.IdClientef AS LegacyClientCode,
  c.Initial AS ClientName,
  NULLIF(LTRIM(RTRIM(d.Descripcion)), N'') AS ProjectName,
  NULLIF(LTRIM(RTRIM(d.PersonaACargo)), N'') AS PersonInCharge,
  CAST(ISNULL(d.IsActive, 0) AS bit) AS IsActive,
  CAST(
    CASE
      WHEN d.IdDepartamento IS NULL THEN 0
      WHEN d.IdClientef IS NULL OR LTRIM(RTRIM(d.IdClientef)) = N'' THEN 0
      WHEN c.Name IS NULL THEN 0
      WHEN d.Descripcion IS NULL OR LTRIM(RTRIM(d.Descripcion)) = N'' THEN 0
      ELSE 1
    END
    AS bit
  ) AS IsValidForMigration,
  CASE
    WHEN d.IdDepartamento IS NULL THEN N'MISSING_DEPARTMENT_ID'
    WHEN d.IdClientef IS NULL OR LTRIM(RTRIM(d.IdClientef)) = N'' THEN N'MISSING_CLIENT_CODE'
    WHEN c.Name IS NULL THEN N'CLIENT_NOT_FOUND'
    WHEN d.Descripcion IS NULL OR LTRIM(RTRIM(d.Descripcion)) = N'' THEN N'MISSING_PROJECT_NAME'
    ELSE NULL
  END AS MigrationIssue
FROM ServiceSBD_20260629.dbo.tblDepartamento d
LEFT JOIN ServiceSBD_20260629.dbo.Client c ON c.Name = d.IdClientef;
GO

CREATE OR ALTER VIEW dbo.vw_RealServiceRecords
AS
WITH NormalizedService AS (
  SELECT
    s.Id,
    s.OrderNum,
    CASE
      WHEN s.Today IS NULL OR CAST(s.Today AS date) = '19000101' THEN NULL
      ELSE CAST(s.Today AS date)
    END AS ServiceDate,
    CASE
      WHEN s.Begin1 IS NULL OR CAST(s.Begin1 AS date) = '19000101' THEN NULL
      ELSE CAST(s.Begin1 AS time(0))
    END AS MorningStart,
    CASE
      WHEN s.Begin2 IS NULL OR CAST(s.Begin2 AS date) = '19000101' THEN NULL
      ELSE CAST(s.Begin2 AS time(0))
    END AS MorningEnd,
    CASE
      WHEN s.End1 IS NULL OR CAST(s.End1 AS date) = '19000101' THEN NULL
      ELSE CAST(s.End1 AS time(0))
    END AS AfternoonStart,
    CASE
      WHEN s.End2 IS NULL OR CAST(s.End2 AS date) = '19000101' THEN NULL
      ELSE CAST(s.End2 AS time(0))
    END AS AfternoonEnd,
    CAST(s.TotalHrs AS DECIMAL(6,2)) AS TotalHours,
    s.Client,
    s.IdDepartamento,
    NULLIF(LTRIM(RTRIM(s.TechInit)), N'') AS TechInit,
    NULLIF(LTRIM(RTRIM(s.Tech)), N'') AS TechName,
    NULLIF(LTRIM(RTRIM(s.Description)), N'') AS Description,
    NULLIF(LTRIM(RTRIM(s.Invoice)), N'') AS Invoice,
    s.Active
  FROM ServiceSBD_20260629.dbo.Service s
)
SELECT
  ns.Id AS LegacyServiceID,
  ns.OrderNum AS LegacyOrderNumber,
  ns.ServiceDate,
  ns.MorningStart,
  ns.MorningEnd,
  ns.AfternoonStart,
  ns.AfternoonEnd,
  ns.TotalHours,
  ns.Client AS LegacyClientCode,
  ns.IdDepartamento AS LegacyDepartmentID,
  ns.TechInit AS LegacyTechnicianInitials,
  ns.TechName AS LegacyTechnicianName,
  ns.Description AS ServiceDescription,
  ns.Invoice AS LegacyInvoiceNumber,
  CASE
    WHEN ISNULL(ns.Active, 0) = 1 THEN N'Recorded'
    ELSE N'Canceled'
  END AS Status,
  CAST(
    CASE
      WHEN c.Name IS NULL THEN 0
      WHEN d.IdDepartamento IS NULL THEN 0
      WHEN t.username IS NULL THEN 0
      WHEN ns.ServiceDate IS NULL THEN 0
      WHEN ns.TotalHours IS NULL OR ns.TotalHours <= 0 THEN 0
      ELSE 1
    END
    AS bit
  ) AS IsValidForMigration,
  CASE
    WHEN c.Name IS NULL THEN N'CLIENT_NOT_FOUND'
    WHEN d.IdDepartamento IS NULL THEN N'PROJECT_NOT_FOUND'
    WHEN t.username IS NULL THEN N'TECHNICIAN_NOT_FOUND'
    WHEN ns.ServiceDate IS NULL THEN N'MISSING_SERVICE_DATE'
    WHEN ns.TotalHours IS NULL OR ns.TotalHours <= 0 THEN N'INVALID_TOTAL_HOURS'
    ELSE NULL
  END AS MigrationIssue
FROM NormalizedService ns
LEFT JOIN ServiceSBD_20260629.dbo.Client c ON c.Name = ns.Client
LEFT JOIN ServiceSBD_20260629.dbo.tblDepartamento d ON d.IdDepartamento = ns.IdDepartamento
LEFT JOIN ServiceSBD_20260629.dbo.Technician t ON t.Initial = ns.TechInit;
GO

CREATE OR ALTER VIEW dbo.vw_RealContracts
AS
SELECT
  ct.IdContrato AS LegacyContractID,
  ct.IdClientef AS LegacyClientCode,
  NULLIF(LTRIM(RTRIM(ct.DescripcionContrato)), N'') AS ContractDescription,
  CAST(ct.FechaComienzo AS date) AS ContractStartDate,
  CAST(ct.FechaTerminacion AS date) AS ContractEndDate,
  NULLIF(LTRIM(RTRIM(ct.SolicitudCredito)), N'') AS CreditRequest,
  NULLIF(LTRIM(RTRIM(ct.OC)), N'') AS OC,
  NULLIF(LTRIM(RTRIM(ct.DC)), N'') AS DC,
  NULLIF(LTRIM(RTRIM(ct.Auditor)), N'') AS Auditor,
  CAST(ISNULL(ct.Disponible, 0) AS bit) AS IsAvailable,
  CAST(
    CASE
      WHEN ct.IdContrato IS NULL OR LTRIM(RTRIM(ct.IdContrato)) = N'' THEN 0
      WHEN ct.IdClientef IS NULL OR LTRIM(RTRIM(ct.IdClientef)) = N'' THEN 0
      WHEN c.Name IS NULL THEN 0
      ELSE 1
    END
    AS bit
  ) AS IsValidForMigration,
  CASE
    WHEN ct.IdContrato IS NULL OR LTRIM(RTRIM(ct.IdContrato)) = N'' THEN N'MISSING_CONTRACT_ID'
    WHEN ct.IdClientef IS NULL OR LTRIM(RTRIM(ct.IdClientef)) = N'' THEN N'MISSING_CLIENT_CODE'
    WHEN c.Name IS NULL THEN N'CLIENT_NOT_FOUND'
    ELSE NULL
  END AS MigrationIssue
FROM ServiceSBD_20260629.dbo.tblContrato ct
LEFT JOIN ServiceSBD_20260629.dbo.Client c ON c.Name = ct.IdClientef;
GO

CREATE OR ALTER VIEW dbo.vw_RealMigrationSummary
AS
SELECT
  (SELECT COUNT(*) FROM dbo.vw_RealClients WHERE IsValidForMigration = 1) AS ClientsValid,
  (SELECT COUNT(*) FROM dbo.vw_RealClients WHERE IsValidForMigration = 0) AS ClientsInvalid,
  (SELECT COUNT(*) FROM dbo.vw_RealTechnicians WHERE IsValidForMigration = 1) AS TechniciansValid,
  (SELECT COUNT(*) FROM dbo.vw_RealTechnicians WHERE IsValidForMigration = 0) AS TechniciansInvalid,
  (SELECT COUNT(*) FROM dbo.vw_RealProjects WHERE IsValidForMigration = 1) AS ProjectsValid,
  (SELECT COUNT(*) FROM dbo.vw_RealProjects WHERE IsValidForMigration = 0) AS ProjectsInvalid,
  (SELECT COUNT(*) FROM dbo.vw_RealServiceRecords WHERE IsValidForMigration = 1) AS ServiceRecordsValid,
  (SELECT COUNT(*) FROM dbo.vw_RealServiceRecords WHERE IsValidForMigration = 0) AS ServiceRecordsInvalid,
  (SELECT COUNT(*) FROM dbo.vw_RealContracts WHERE IsValidForMigration = 1) AS ContractsValid,
  (SELECT COUNT(*) FROM dbo.vw_RealContracts WHERE IsValidForMigration = 0) AS ContractsInvalid;
GO

SELECT TOP 20 * FROM dbo.vw_RealClients ORDER BY LegacyClientCode;
SELECT TOP 20 * FROM dbo.vw_RealTechnicians ORDER BY LegacyUsername;
SELECT TOP 20 * FROM dbo.vw_RealProjects ORDER BY LegacyClientCode, ProjectName;
SELECT TOP 20 * FROM dbo.vw_RealServiceRecords ORDER BY ServiceDate DESC, LegacyServiceID DESC;
SELECT TOP 20 * FROM dbo.vw_RealContracts ORDER BY LegacyClientCode, LegacyContractID;
SELECT * FROM dbo.vw_RealMigrationSummary;
GO

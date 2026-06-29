USE ServiceSBD_20260629;
GO

SET NOCOUNT ON;
GO

/* ============================================================
   Phase 19 - Real Database Data Profile
   Purpose: read-only data quality analysis before migration.
   Rules: SELECT statements only. No data changes.
   ============================================================ */

SELECT
  N'1. General Counts' AS Section,
  (SELECT COUNT(*) FROM dbo.Client) AS TotalClients,
  (SELECT COUNT(*) FROM dbo.Technician) AS TotalTechnicians,
  (SELECT COUNT(*) FROM dbo.tblDepartamento) AS TotalDepartmentsProjects,
  (SELECT COUNT(*) FROM dbo.Service) AS TotalServices,
  (SELECT COUNT(*) FROM dbo.tblContrato) AS TotalContracts;

/* ============================================================
   2. Clients
   ============================================================ */

SELECT
  N'2.1 Clients Without Full Name' AS CheckName,
  Name,
  Initial,
  Phone,
  Email,
  Type
FROM dbo.Client
WHERE Initial IS NULL
   OR LTRIM(RTRIM(Initial)) = N'';

SELECT
  N'2.2 Clients Without Email' AS CheckName,
  Name,
  Initial,
  Phone,
  Email,
  Type
FROM dbo.Client
WHERE Email IS NULL
   OR LTRIM(RTRIM(Email)) = N'';

SELECT
  N'2.3 Duplicate Clients By Name' AS CheckName,
  Name,
  COUNT(*) AS DuplicateCount
FROM dbo.Client
GROUP BY Name
HAVING COUNT(*) > 1;

SELECT
  N'2.4 Duplicate Clients By Initial' AS CheckName,
  Initial,
  COUNT(*) AS DuplicateCount
FROM dbo.Client
WHERE Initial IS NOT NULL
  AND LTRIM(RTRIM(Initial)) <> N''
GROUP BY Initial
HAVING COUNT(*) > 1;

/* ============================================================
   3. Technicians
   ============================================================ */

SELECT
  N'3.1 Technicians By Status' AS CheckName,
  Status,
  COUNT(*) AS TechnicianCount
FROM dbo.Technician
GROUP BY Status
ORDER BY Status;

SELECT
  N'3.2 Technicians Active/Inactive Normalized' AS CheckName,
  CASE
    WHEN UPPER(ISNULL(Status, '')) = 'A' THEN N'Active'
    WHEN UPPER(ISNULL(Status, '')) = 'I' THEN N'Inactive'
    ELSE N'Unknown'
  END AS NormalizedStatus,
  COUNT(*) AS TechnicianCount
FROM dbo.Technician
GROUP BY
  CASE
    WHEN UPPER(ISNULL(Status, '')) = 'A' THEN N'Active'
    WHEN UPPER(ISNULL(Status, '')) = 'I' THEN N'Inactive'
    ELSE N'Unknown'
  END;

SELECT
  N'3.3 Technicians Without Email' AS CheckName,
  username,
  Name,
  LastName,
  Initial,
  secgroup,
  Status,
  Email
FROM dbo.Technician
WHERE Email IS NULL
   OR LTRIM(RTRIM(Email)) = N'';

SELECT
  N'3.4 Technicians Without Initial' AS CheckName,
  username,
  Name,
  LastName,
  Initial,
  secgroup,
  Status,
  Email
FROM dbo.Technician
WHERE Initial IS NULL
   OR LTRIM(RTRIM(Initial)) = N'';

SELECT
  N'3.5 Distinct secgroup Values' AS CheckName,
  secgroup,
  COUNT(*) AS TechnicianCount
FROM dbo.Technician
GROUP BY secgroup
ORDER BY secgroup;

SELECT
  N'3.6 Distinct Status Values' AS CheckName,
  Status,
  COUNT(*) AS TechnicianCount
FROM dbo.Technician
GROUP BY Status
ORDER BY Status;

/* ============================================================
   4. Projects / Departments
   ============================================================ */

SELECT
  N'4.1 Departments Without Valid Client' AS CheckName,
  d.IdDepartamento,
  d.IdClientef,
  d.Descripcion,
  d.PersonaACargo,
  d.IsActive
FROM dbo.tblDepartamento d
LEFT JOIN dbo.Client c ON c.Name = d.IdClientef
WHERE c.Name IS NULL;

SELECT
  N'4.2 Inactive Departments' AS CheckName,
  d.IdDepartamento,
  d.IdClientef,
  c.Initial AS ClientName,
  d.Descripcion,
  d.PersonaACargo,
  d.IsActive
FROM dbo.tblDepartamento d
LEFT JOIN dbo.Client c ON c.Name = d.IdClientef
WHERE ISNULL(d.IsActive, 0) = 0
ORDER BY d.IdClientef, d.Descripcion;

SELECT
  N'4.3 Duplicate Departments By Client And Description' AS CheckName,
  IdClientef,
  Descripcion,
  COUNT(*) AS DuplicateCount
FROM dbo.tblDepartamento
GROUP BY IdClientef, Descripcion
HAVING COUNT(*) > 1
ORDER BY IdClientef, Descripcion;

/* ============================================================
   5. Services
   ============================================================ */

SELECT
  N'5.1 Services Without Valid Client' AS CheckName,
  s.Id,
  s.OrderNum,
  s.Today,
  s.Client,
  s.ClientInit,
  s.Tech,
  s.TechInit,
  s.IdDepartamento,
  s.Departamento,
  s.TotalHrs
FROM dbo.Service s
LEFT JOIN dbo.Client c ON c.Name = s.Client
WHERE c.Name IS NULL;

SELECT
  N'5.2 Services Without Valid Department/Project' AS CheckName,
  s.Id,
  s.OrderNum,
  s.Today,
  s.Client,
  s.ClientInit,
  s.Tech,
  s.TechInit,
  s.IdDepartamento,
  s.Departamento,
  s.TotalHrs
FROM dbo.Service s
LEFT JOIN dbo.tblDepartamento d ON d.IdDepartamento = s.IdDepartamento
WHERE s.IdDepartamento IS NULL
   OR d.IdDepartamento IS NULL;

SELECT
  N'5.3 Services Without Valid Technician By TechInit' AS CheckName,
  s.Id,
  s.OrderNum,
  s.Today,
  s.Client,
  s.ClientInit,
  s.Tech,
  s.TechInit,
  s.IdDepartamento,
  s.Departamento,
  s.TotalHrs
FROM dbo.Service s
LEFT JOIN dbo.Technician t ON t.Initial = s.TechInit
WHERE s.TechInit IS NULL
   OR LTRIM(RTRIM(s.TechInit)) = N''
   OR t.username IS NULL;

SELECT
  N'5.4 Services With Null Or Nonpositive TotalHrs' AS CheckName,
  s.Id,
  s.OrderNum,
  s.Today,
  s.Client,
  s.Tech,
  s.TechInit,
  s.IdDepartamento,
  s.Departamento,
  s.TotalHrs
FROM dbo.Service s
WHERE s.TotalHrs IS NULL
   OR s.TotalHrs <= 0;

SELECT
  N'5.5 Services With Null Today' AS CheckName,
  s.Id,
  s.OrderNum,
  s.Today,
  s.Client,
  s.Tech,
  s.TechInit,
  s.IdDepartamento,
  s.TotalHrs
FROM dbo.Service s
WHERE s.Today IS NULL;

SELECT
  N'5.6 Services With 1900 Placeholder Dates' AS CheckName,
  s.Id,
  s.OrderNum,
  s.Today,
  s.Begin1,
  s.Begin2,
  s.End1,
  s.End2,
  s.TravelBegin1,
  s.TravelBegin2,
  s.TravelEnd1,
  s.TravelEnd2,
  s.Client,
  s.Tech,
  s.TotalHrs
FROM dbo.Service s
WHERE CAST(ISNULL(s.Today, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.Begin1, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.Begin2, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.End1, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.End2, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.TravelBegin1, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.TravelBegin2, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.TravelEnd1, '19000101') AS date) = '19000101'
   OR CAST(ISNULL(s.TravelEnd2, '19000101') AS date) = '19000101';

SELECT
  N'5.7 Service Date Range' AS CheckName,
  MIN(Today) AS MinToday,
  MAX(Today) AS MaxToday,
  COUNT(*) AS TotalServices
FROM dbo.Service;

SELECT
  N'5.8 Total Hours By Year' AS CheckName,
  YEAR(Today) AS ServiceYear,
  COUNT(*) AS ServiceCount,
  CAST(SUM(ISNULL(TotalHrs, 0)) AS DECIMAL(18,2)) AS TotalHours
FROM dbo.Service
WHERE Today IS NOT NULL
GROUP BY YEAR(Today)
ORDER BY ServiceYear;

SELECT
  N'5.9 Total Hours By Client' AS CheckName,
  s.Client,
  MAX(s.ClientInit) AS ClientName,
  COUNT(*) AS ServiceCount,
  CAST(SUM(ISNULL(s.TotalHrs, 0)) AS DECIMAL(18,2)) AS TotalHours
FROM dbo.Service s
GROUP BY s.Client
ORDER BY TotalHours DESC;

SELECT
  N'5.10 Total Hours By Technician' AS CheckName,
  s.TechInit,
  MAX(s.Tech) AS TechnicianName,
  COUNT(*) AS ServiceCount,
  CAST(SUM(ISNULL(s.TotalHrs, 0)) AS DECIMAL(18,2)) AS TotalHours
FROM dbo.Service s
GROUP BY s.TechInit
ORDER BY TotalHours DESC;

SELECT
  N'5.11 Total Hours By Department' AS CheckName,
  s.IdDepartamento,
  MAX(s.Departamento) AS DepartmentName,
  MAX(s.Client) AS ClientCode,
  COUNT(*) AS ServiceCount,
  CAST(SUM(ISNULL(s.TotalHrs, 0)) AS DECIMAL(18,2)) AS TotalHours
FROM dbo.Service s
GROUP BY s.IdDepartamento
ORDER BY TotalHours DESC;

/* ============================================================
   6. Contracts
   ============================================================ */

SELECT
  N'6.1 Contracts Without Valid Client' AS CheckName,
  ct.IdContrato,
  ct.IdClientef,
  ct.DescripcionContrato,
  ct.FechaComienzo,
  ct.FechaTerminacion,
  ct.Disponible
FROM dbo.tblContrato ct
LEFT JOIN dbo.Client c ON c.Name = ct.IdClientef
WHERE c.Name IS NULL;

SELECT
  N'6.2 Expired Contracts' AS CheckName,
  ct.IdContrato,
  ct.IdClientef,
  c.Initial AS ClientName,
  ct.DescripcionContrato,
  ct.FechaComienzo,
  ct.FechaTerminacion,
  ct.Disponible
FROM dbo.tblContrato ct
LEFT JOIN dbo.Client c ON c.Name = ct.IdClientef
WHERE ct.FechaTerminacion IS NOT NULL
  AND CAST(ct.FechaTerminacion AS date) < CAST(GETDATE() AS date);

SELECT
  N'6.3 Active Contracts' AS CheckName,
  ct.IdContrato,
  ct.IdClientef,
  c.Initial AS ClientName,
  ct.DescripcionContrato,
  ct.FechaComienzo,
  ct.FechaTerminacion,
  ct.Disponible
FROM dbo.tblContrato ct
LEFT JOIN dbo.Client c ON c.Name = ct.IdClientef
WHERE ISNULL(ct.Disponible, 0) = 1
  AND (
    ct.FechaTerminacion IS NULL
    OR CAST(ct.FechaTerminacion AS date) >= CAST(GETDATE() AS date)
  );

SELECT
  N'6.4 Contracts Without Start Or End Date' AS CheckName,
  ct.IdContrato,
  ct.IdClientef,
  c.Initial AS ClientName,
  ct.DescripcionContrato,
  ct.FechaComienzo,
  ct.FechaTerminacion,
  ct.Disponible
FROM dbo.tblContrato ct
LEFT JOIN dbo.Client c ON c.Name = ct.IdClientef
WHERE ct.FechaComienzo IS NULL
   OR ct.FechaTerminacion IS NULL;

SELECT
  N'6.5 Contract Count By Client' AS CheckName,
  ct.IdClientef,
  MAX(c.Initial) AS ClientName,
  COUNT(*) AS ContractCount
FROM dbo.tblContrato ct
LEFT JOIN dbo.Client c ON c.Name = ct.IdClientef
GROUP BY ct.IdClientef
ORDER BY ContractCount DESC, ct.IdClientef;

/* ============================================================
   7. Possible mappings
   ============================================================ */

SELECT
  N'7.1 Mapping Service.Client -> Client.Name' AS CheckName,
  s.Client AS ServiceClientCode,
  MAX(s.ClientInit) AS ServiceClientName,
  c.Name AS ClientNameCode,
  c.Initial AS ClientFullName,
  COUNT(*) AS ServiceCount
FROM dbo.Service s
LEFT JOIN dbo.Client c ON c.Name = s.Client
GROUP BY s.Client, c.Name, c.Initial
ORDER BY ServiceCount DESC;

SELECT
  N'7.2 Mapping Service.IdDepartamento -> tblDepartamento.IdDepartamento' AS CheckName,
  s.IdDepartamento AS ServiceDepartmentID,
  MAX(s.Departamento) AS ServiceDepartmentName,
  d.IdDepartamento AS DepartmentID,
  d.IdClientef AS DepartmentClientCode,
  d.Descripcion AS DepartmentDescription,
  COUNT(*) AS ServiceCount
FROM dbo.Service s
LEFT JOIN dbo.tblDepartamento d ON d.IdDepartamento = s.IdDepartamento
GROUP BY s.IdDepartamento, d.IdDepartamento, d.IdClientef, d.Descripcion
ORDER BY ServiceCount DESC;

SELECT
  N'7.3 Mapping Service.TechInit -> Technician.Initial' AS CheckName,
  s.TechInit AS ServiceTechInitial,
  MAX(s.Tech) AS ServiceTechName,
  t.username,
  t.Name,
  t.LastName,
  t.Initial,
  t.secgroup,
  t.Status,
  COUNT(*) AS ServiceCount
FROM dbo.Service s
LEFT JOIN dbo.Technician t ON t.Initial = s.TechInit
GROUP BY s.TechInit, t.username, t.Name, t.LastName, t.Initial, t.secgroup, t.Status
ORDER BY ServiceCount DESC;

/* ============================================================
   8. Final report: critical and minor issues
   ============================================================ */

SELECT
  N'8.1 Critical Migration Issues' AS ReportSection,
  Issue,
  IssueCount,
  Impact
FROM (
  SELECT
    N'Services without valid client' AS Issue,
    COUNT(*) AS IssueCount,
    N'Cannot map ServiceRecords.ClientID without cleanup or fallback client.' AS Impact
  FROM dbo.Service s
  LEFT JOIN dbo.Client c ON c.Name = s.Client
  WHERE c.Name IS NULL

  UNION ALL

  SELECT
    N'Services without valid department/project' AS Issue,
    COUNT(*) AS IssueCount,
    N'Cannot map ServiceRecords.ProjectID without cleanup or fallback project.' AS Impact
  FROM dbo.Service s
  LEFT JOIN dbo.tblDepartamento d ON d.IdDepartamento = s.IdDepartamento
  WHERE s.IdDepartamento IS NULL
     OR d.IdDepartamento IS NULL

  UNION ALL

  SELECT
    N'Services without valid technician by TechInit' AS Issue,
    COUNT(*) AS IssueCount,
    N'Cannot map TechnicianUserID reliably without technician mapping rules.' AS Impact
  FROM dbo.Service s
  LEFT JOIN dbo.Technician t ON t.Initial = s.TechInit
  WHERE s.TechInit IS NULL
     OR LTRIM(RTRIM(s.TechInit)) = N''
     OR t.username IS NULL

  UNION ALL

  SELECT
    N'Services with null service date' AS Issue,
    COUNT(*) AS IssueCount,
    N'Cannot map required ServiceDate without a fallback date.' AS Impact
  FROM dbo.Service s
  WHERE s.Today IS NULL

  UNION ALL

  SELECT
    N'Services with null or nonpositive TotalHrs' AS Issue,
    COUNT(*) AS IssueCount,
    N'Requires recalculation from time fields or exclusion rule before migration.' AS Impact
  FROM dbo.Service s
  WHERE s.TotalHrs IS NULL
     OR s.TotalHrs <= 0
) issues
ORDER BY IssueCount DESC, Issue;

SELECT
  N'8.2 Minor Cleanup Issues' AS ReportSection,
  Issue,
  IssueCount,
  SuggestedHandling
FROM (
  SELECT
    N'Clients without email' AS Issue,
    COUNT(*) AS IssueCount,
    N'Migrate as null email; collect later if needed.' AS SuggestedHandling
  FROM dbo.Client
  WHERE Email IS NULL
     OR LTRIM(RTRIM(Email)) = N''

  UNION ALL

  SELECT
    N'Technicians without email' AS Issue,
    COUNT(*) AS IssueCount,
    N'Migrate with generated local email or require password reset/contact update.' AS SuggestedHandling
  FROM dbo.Technician
  WHERE Email IS NULL
     OR LTRIM(RTRIM(Email)) = N''

  UNION ALL

  SELECT
    N'Inactive departments' AS Issue,
    COUNT(*) AS IssueCount,
    N'Migrate as inactive projects or exclude from active demo lists.' AS SuggestedHandling
  FROM dbo.tblDepartamento
  WHERE ISNULL(IsActive, 0) = 0

  UNION ALL

  SELECT
    N'Contracts without start or end date' AS Issue,
    COUNT(*) AS IssueCount,
    N'Migrate available fields and mark missing dates for business review.' AS SuggestedHandling
  FROM dbo.tblContrato
  WHERE FechaComienzo IS NULL
     OR FechaTerminacion IS NULL

  UNION ALL

  SELECT
    N'Services with 1900 placeholder dates in time fields' AS Issue,
    COUNT(*) AS IssueCount,
    N'Treat 1900 date portions as null/time placeholders during migration.' AS SuggestedHandling
  FROM dbo.Service s
  WHERE CAST(ISNULL(s.Begin1, '19000101') AS date) = '19000101'
     OR CAST(ISNULL(s.Begin2, '19000101') AS date) = '19000101'
     OR CAST(ISNULL(s.End1, '19000101') AS date) = '19000101'
     OR CAST(ISNULL(s.End2, '19000101') AS date) = '19000101'
     OR CAST(ISNULL(s.TravelBegin1, '19000101') AS date) = '19000101'
     OR CAST(ISNULL(s.TravelBegin2, '19000101') AS date) = '19000101'
     OR CAST(ISNULL(s.TravelEnd1, '19000101') AS date) = '19000101'
     OR CAST(ISNULL(s.TravelEnd2, '19000101') AS date) = '19000101'
) issues
ORDER BY IssueCount DESC, Issue;
GO

USE ServiceBillingDB;
GO

SET NOCOUNT ON;
GO

IF COL_LENGTH(N'dbo.Projects', N'LegacyDepartmentID') IS NULL
BEGIN
  ALTER TABLE dbo.Projects ADD LegacyDepartmentID INT NULL;
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = N'UX_Projects_LegacyDepartmentID'
    AND object_id = OBJECT_ID(N'dbo.Projects')
)
BEGIN
  CREATE UNIQUE INDEX UX_Projects_LegacyDepartmentID
  ON dbo.Projects (LegacyDepartmentID)
  WHERE LegacyDepartmentID IS NOT NULL;
END
GO

DECLARE @MigrationResults TABLE (
  ActionName NVARCHAR(20) NOT NULL,
  LegacyDepartmentID INT NOT NULL,
  ProjectName NVARCHAR(160) NOT NULL,
  ClientID INT NOT NULL
);

WITH SourceProjects AS (
  SELECT
    rp.LegacyDepartmentID,
    rp.LegacyClientCode,
    LEFT(rp.ClientName, 160) AS ClientName,
    LEFT(rp.ProjectName, 160) AS ProjectName,
    LEFT(rp.PersonInCharge, 120) AS PersonInCharge,
    rp.IsActive
  FROM dbo.vw_RealProjects rp
  WHERE rp.IsValidForMigration = 1
    AND rp.LegacyDepartmentID IS NOT NULL
    AND rp.ProjectName IS NOT NULL
),
PreparedProjectsForLink AS (
  SELECT
    sp.LegacyDepartmentID,
    c.ClientID,
    sp.ClientName,
    sp.ProjectName,
    CASE
      WHEN sp.PersonInCharge IS NULL THEN NULL
      ELSE CONCAT(N'Persona a cargo: ', sp.PersonInCharge)
    END AS Description,
    CAST(0 AS DECIMAL(10,2)) AS HourlyRate,
    sp.IsActive
  FROM SourceProjects sp
  INNER JOIN dbo.Clients c ON c.ClientName = sp.ClientName
),
RankedProjectsForLink AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY LegacyDepartmentID
      ORDER BY ProjectName
    ) AS LegacyRank,
    ROW_NUMBER() OVER (
      PARTITION BY ClientID, ProjectName
      ORDER BY LegacyDepartmentID
    ) AS ProjectNameRank
  FROM PreparedProjectsForLink
)
UPDATE target
SET
  LegacyDepartmentID = source.LegacyDepartmentID,
  Description = source.Description,
  HourlyRate = source.HourlyRate,
  IsActive = source.IsActive,
  UpdatedAt = SYSUTCDATETIME()
OUTPUT N'UPDATE', inserted.LegacyDepartmentID, inserted.ProjectName, inserted.ClientID
INTO @MigrationResults (ActionName, LegacyDepartmentID, ProjectName, ClientID)
FROM dbo.Projects target
INNER JOIN RankedProjectsForLink source
  ON source.ClientID = target.ClientID
  AND source.ProjectName = target.ProjectName
  AND source.LegacyRank = 1
  AND source.ProjectNameRank = 1
WHERE target.LegacyDepartmentID IS NULL;

WITH SourceProjects AS (
  SELECT
    rp.LegacyDepartmentID,
    rp.LegacyClientCode,
    LEFT(rp.ClientName, 160) AS ClientName,
    LEFT(rp.ProjectName, 160) AS ProjectName,
    LEFT(rp.PersonInCharge, 120) AS PersonInCharge,
    rp.IsActive
  FROM dbo.vw_RealProjects rp
  WHERE rp.IsValidForMigration = 1
    AND rp.LegacyDepartmentID IS NOT NULL
    AND rp.ProjectName IS NOT NULL
),
PreparedProjects AS (
  SELECT
    sp.LegacyDepartmentID,
    c.ClientID,
    sp.ClientName,
    sp.ProjectName,
    CASE
      WHEN sp.PersonInCharge IS NULL THEN NULL
      ELSE CONCAT(N'Persona a cargo: ', sp.PersonInCharge)
    END AS Description,
    CAST(0 AS DECIMAL(10,2)) AS HourlyRate,
    sp.IsActive
  FROM SourceProjects sp
  INNER JOIN dbo.Clients c ON c.ClientName = sp.ClientName
),
RankedProjects AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY LegacyDepartmentID
      ORDER BY ProjectName
    ) AS LegacyRank,
    ROW_NUMBER() OVER (
      PARTITION BY ClientID, ProjectName
      ORDER BY LegacyDepartmentID
    ) AS ProjectNameRank
  FROM PreparedProjects
)
MERGE dbo.Projects AS target
USING (
  SELECT
    LegacyDepartmentID,
    ClientID,
    ClientName,
    ProjectName,
    Description,
    HourlyRate,
    IsActive
  FROM RankedProjects
  WHERE LegacyRank = 1
    AND ProjectNameRank = 1
) AS source
  ON target.LegacyDepartmentID = source.LegacyDepartmentID
WHEN MATCHED AND (
     target.ClientID <> source.ClientID
  OR ISNULL(target.ProjectName, N'') <> ISNULL(source.ProjectName, N'')
  OR ISNULL(target.Description, N'') <> ISNULL(source.Description, N'')
  OR ISNULL(target.HourlyRate, 0) <> source.HourlyRate
  OR ISNULL(target.IsActive, 0) <> ISNULL(source.IsActive, 0)
)
THEN UPDATE SET
  ClientID = source.ClientID,
  ProjectName = source.ProjectName,
  Description = source.Description,
  HourlyRate = source.HourlyRate,
  IsActive = source.IsActive,
  UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET
THEN INSERT (
  ClientID,
  ProjectName,
  Description,
  HourlyRate,
  IsActive,
  CreatedAt,
  UpdatedAt,
  CreatedByUserID,
  LegacyDepartmentID
)
VALUES (
  source.ClientID,
  source.ProjectName,
  source.Description,
  source.HourlyRate,
  source.IsActive,
  SYSUTCDATETIME(),
  NULL,
  NULL,
  source.LegacyDepartmentID
)
OUTPUT $action, inserted.LegacyDepartmentID, inserted.ProjectName, inserted.ClientID
INTO @MigrationResults (ActionName, LegacyDepartmentID, ProjectName, ClientID);

DECLARE @ValidSourceCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealProjects
  WHERE IsValidForMigration = 1
    AND LegacyDepartmentID IS NOT NULL
    AND ProjectName IS NOT NULL
);

DECLARE @InvalidSourceCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealProjects
  WHERE IsValidForMigration = 0
     OR LegacyDepartmentID IS NULL
     OR ProjectName IS NULL
);

DECLARE @WithoutClientCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealProjects rp
  LEFT JOIN dbo.Clients c ON c.ClientName = rp.ClientName
  WHERE rp.IsValidForMigration = 1
    AND rp.LegacyDepartmentID IS NOT NULL
    AND rp.ProjectName IS NOT NULL
    AND c.ClientID IS NULL
);

DECLARE @DuplicateLegacyDepartmentCount INT = (
  SELECT COUNT(*) - COUNT(DISTINCT LegacyDepartmentID)
  FROM dbo.vw_RealProjects
  WHERE IsValidForMigration = 1
    AND LegacyDepartmentID IS NOT NULL
    AND ProjectName IS NOT NULL
);

DECLARE @DuplicateClientProjectCount INT;

DECLARE @SourceWithClientCount INT = (
  SELECT COUNT(*)
  FROM dbo.vw_RealProjects rp
  INNER JOIN dbo.Clients c ON c.ClientName = rp.ClientName
  WHERE rp.IsValidForMigration = 1
    AND rp.LegacyDepartmentID IS NOT NULL
    AND rp.ProjectName IS NOT NULL
);

DECLARE @UniqueClientProjectCount INT = (
  SELECT COUNT(*)
  FROM (
    SELECT
      c.ClientID,
      rp.ProjectName
    FROM dbo.vw_RealProjects rp
    INNER JOIN dbo.Clients c ON c.ClientName = rp.ClientName
    WHERE rp.IsValidForMigration = 1
      AND rp.LegacyDepartmentID IS NOT NULL
      AND rp.ProjectName IS NOT NULL
    GROUP BY c.ClientID, rp.ProjectName
  ) uniqueProjects
);

SET @DuplicateClientProjectCount = @SourceWithClientCount - @UniqueClientProjectCount;

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

DECLARE @AlreadyCurrentRawCount INT = @ValidSourceCount - @WithoutClientCount - @DuplicateLegacyDepartmentCount - @DuplicateClientProjectCount - @InsertedCount - @UpdatedCount;
DECLARE @AlreadyCurrentCount INT = CASE WHEN @AlreadyCurrentRawCount < 0 THEN 0 ELSE @AlreadyCurrentRawCount END;

SELECT
  @InsertedCount AS ProjectsInserted,
  @UpdatedCount AS ProjectsUpdated,
  @AlreadyCurrentCount AS ProjectsAlreadyCurrent,
  @InvalidSourceCount AS ProjectsInvalidFromSource,
  @WithoutClientCount AS ProjectsWithoutClient,
  @DuplicateLegacyDepartmentCount AS ProjectsDuplicateLegacyDepartmentIDOmitted,
  @DuplicateClientProjectCount AS ProjectsDuplicateClientProjectOmitted;

SELECT
  r.ActionName,
  r.LegacyDepartmentID,
  r.ProjectName,
  c.ClientName
FROM @MigrationResults r
INNER JOIN dbo.Clients c ON c.ClientID = r.ClientID
ORDER BY ActionName, ClientName, ProjectName;

SELECT
  p.ProjectID,
  p.LegacyDepartmentID,
  p.ProjectName,
  c.ClientName,
  p.Description,
  p.IsActive,
  p.CreatedAt,
  p.UpdatedAt
FROM dbo.Projects p
INNER JOIN dbo.Clients c ON c.ClientID = p.ClientID
WHERE p.LegacyDepartmentID IN (
  SELECT LegacyDepartmentID
  FROM dbo.vw_RealProjects
  WHERE IsValidForMigration = 1
)
ORDER BY c.ClientName, p.ProjectName;
GO

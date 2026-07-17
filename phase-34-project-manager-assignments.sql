USE ServiceBillingDB;
GO

SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

IF EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_Users_Role'
    AND parent_object_id = OBJECT_ID(N'dbo.Users')
)
BEGIN
  ALTER TABLE dbo.Users DROP CONSTRAINT CK_Users_Role;
END;

UPDATE dbo.Users
SET Role = N'ProjectManager',
    UpdatedAt = SYSUTCDATETIME()
WHERE Role = N'Project Manager';

ALTER TABLE dbo.Users WITH CHECK ADD CONSTRAINT CK_Users_Role
CHECK (Role IN (N'Admin', N'ProjectManager', N'Technician', N'User'));

IF OBJECT_ID(N'dbo.UserProjectAssignments', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserProjectAssignments (
    UserProjectAssignmentID INT IDENTITY(1,1) NOT NULL
      CONSTRAINT PK_UserProjectAssignments PRIMARY KEY,
    UserID INT NOT NULL,
    ProjectID INT NOT NULL,
    AssignedByUserID INT NOT NULL,
    AssignedAt DATETIME2(0) NOT NULL
      CONSTRAINT DF_UserProjectAssignments_AssignedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(0) NULL,
    IsActive BIT NOT NULL
      CONSTRAINT DF_UserProjectAssignments_IsActive DEFAULT 1,
    CONSTRAINT UQ_UserProjectAssignments_User_Project UNIQUE (UserID, ProjectID),
    CONSTRAINT FK_UserProjectAssignments_User
      FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_UserProjectAssignments_Project
      FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
    CONSTRAINT FK_UserProjectAssignments_AssignedBy
      FOREIGN KEY (AssignedByUserID) REFERENCES dbo.Users(UserID)
  );
END;

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'IX_UserProjectAssignments_User_Active'
    AND object_id = OBJECT_ID(N'dbo.UserProjectAssignments')
)
BEGIN
  CREATE INDEX IX_UserProjectAssignments_User_Active
    ON dbo.UserProjectAssignments (UserID, IsActive)
    INCLUDE (ProjectID, AssignedAt);
END;

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'IX_UserProjectAssignments_Project_Active'
    AND object_id = OBJECT_ID(N'dbo.UserProjectAssignments')
)
BEGIN
  CREATE INDEX IX_UserProjectAssignments_Project_Active
    ON dbo.UserProjectAssignments (ProjectID, IsActive)
    INCLUDE (UserID, AssignedByUserID);
END;

COMMIT TRANSACTION;
GO

SELECT name, definition
FROM sys.check_constraints
WHERE name = N'CK_Users_Role';

SELECT
  upa.UserProjectAssignmentID,
  upa.UserID,
  u.FullName,
  u.Role,
  upa.ProjectID,
  p.ProjectName,
  upa.AssignedByUserID,
  assignedBy.FullName AS AssignedByName,
  upa.AssignedAt,
  upa.UpdatedAt,
  upa.IsActive
FROM dbo.UserProjectAssignments upa
INNER JOIN dbo.Users u ON u.UserID = upa.UserID
INNER JOIN dbo.Projects p ON p.ProjectID = upa.ProjectID
INNER JOIN dbo.Users assignedBy ON assignedBy.UserID = upa.AssignedByUserID
ORDER BY u.FullName, p.ProjectName;
GO

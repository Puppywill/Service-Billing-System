USE HelpDeskDB;
GO

IF COL_LENGTH('dbo.Tickets', 'CreatedByUserID') IS NULL
BEGIN
  ALTER TABLE dbo.Tickets ADD CreatedByUserID INT NULL;
END
GO

IF COL_LENGTH('dbo.Users', 'CreatedByUserID') IS NULL
BEGIN
  ALTER TABLE dbo.Users ADD CreatedByUserID INT NULL;
END
GO

IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NULL,
    Message NVARCHAR(300) NOT NULL,
    Type NVARCHAR(40) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
  );
END
GO

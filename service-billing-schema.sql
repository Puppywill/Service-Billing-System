IF DB_ID(N'ServiceBillingDB') IS NULL
BEGIN
  CREATE DATABASE ServiceBillingDB;
END
GO

USE ServiceBillingDB;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
CREATE TABLE dbo.Users (
  UserID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
  FullName NVARCHAR(120) NOT NULL,
  Email NVARCHAR(180) NOT NULL,
  Password NVARCHAR(255) NOT NULL,
  Role NVARCHAR(30) NOT NULL,
  Phone NVARCHAR(40) NULL,
  HourlyCost DECIMAL(10,2) NULL,
  IsTechnician BIT NOT NULL CONSTRAINT DF_Users_IsTechnician DEFAULT 0,
  IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CreatedByUserID INT NULL,
  CONSTRAINT UQ_Users_Email UNIQUE (Email),
  CONSTRAINT CK_Users_Role CHECK (Role IN (N'Admin', N'ProjectManager', N'Technician', N'User')),
  CONSTRAINT FK_Users_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID)
);
END
GO

IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
CREATE TABLE dbo.Notifications (
  NotificationID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
  UserID INT NULL,
  Message NVARCHAR(300) NOT NULL,
  Type NVARCHAR(40) NOT NULL,
  IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);
END
GO

IF OBJECT_ID(N'dbo.PasswordResetRequests', N'U') IS NULL
BEGIN
CREATE TABLE dbo.PasswordResetRequests (
  RequestID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PasswordResetRequests PRIMARY KEY,
  UserID INT NULL,
  FullName NVARCHAR(120) NOT NULL,
  Email NVARCHAR(180) NOT NULL,
  Status NVARCHAR(20) NOT NULL CONSTRAINT DF_PasswordResetRequests_Status DEFAULT N'Pending',
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PasswordResetRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  ResolvedAt DATETIME2(0) NULL,
  CONSTRAINT CK_PasswordResetRequests_Status CHECK (Status IN (N'Pending', N'Resolved', N'Canceled')),
  CONSTRAINT FK_PasswordResetRequests_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);
END
GO

IF OBJECT_ID(N'dbo.Clients', N'U') IS NULL
BEGIN
CREATE TABLE dbo.Clients (
  ClientID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Clients PRIMARY KEY,
  ClientName NVARCHAR(160) NOT NULL,
  ContactName NVARCHAR(120) NULL,
  Email NVARCHAR(180) NULL,
  Phone NVARCHAR(40) NULL,
  BillingName NVARCHAR(180) NULL,
  TaxID NVARCHAR(50) NULL,
  AddressLine1 NVARCHAR(180) NULL,
  AddressLine2 NVARCHAR(180) NULL,
  City NVARCHAR(100) NULL,
  StateProvince NVARCHAR(100) NULL,
  PostalCode NVARCHAR(30) NULL,
  Country NVARCHAR(100) NULL,
  IsActive BIT NOT NULL CONSTRAINT DF_Clients_IsActive DEFAULT 1,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Clients_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CreatedByUserID INT NULL,
  CONSTRAINT UQ_Clients_ClientName UNIQUE (ClientName),
  CONSTRAINT FK_Clients_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID)
);
END
GO

IF OBJECT_ID(N'dbo.Projects', N'U') IS NULL
BEGIN
CREATE TABLE dbo.Projects (
  ProjectID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Projects PRIMARY KEY,
  ClientID INT NOT NULL,
  ProjectName NVARCHAR(160) NOT NULL,
  Description NVARCHAR(500) NULL,
  HourlyRate DECIMAL(10,2) NOT NULL,
  IsActive BIT NOT NULL CONSTRAINT DF_Projects_IsActive DEFAULT 1,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Projects_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CreatedByUserID INT NULL,
  CONSTRAINT UQ_Projects_Client_ProjectName UNIQUE (ClientID, ProjectName),
  CONSTRAINT CK_Projects_HourlyRate CHECK (HourlyRate >= 0),
  CONSTRAINT FK_Projects_Clients FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID),
  CONSTRAINT FK_Projects_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID)
);
END
GO

IF OBJECT_ID(N'dbo.Invoices', N'U') IS NULL
BEGIN
CREATE TABLE dbo.Invoices (
  InvoiceID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Invoices PRIMARY KEY,
  InvoiceNumber NVARCHAR(40) NOT NULL,
  ClientID INT NOT NULL,
  InvoiceDate DATE NOT NULL,
  PeriodFrom DATE NOT NULL,
  PeriodTo DATE NOT NULL,
  Subtotal DECIMAL(12,2) NOT NULL CONSTRAINT DF_Invoices_Subtotal DEFAULT 0,
  TaxRate DECIMAL(7,4) NOT NULL CONSTRAINT DF_Invoices_TaxRate DEFAULT 0,
  TaxAmount DECIMAL(12,2) NOT NULL CONSTRAINT DF_Invoices_TaxAmount DEFAULT 0,
  TotalAmount DECIMAL(12,2) NOT NULL CONSTRAINT DF_Invoices_TotalAmount DEFAULT 0,
  Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Invoices_Status DEFAULT N'Draft',
  Notes NVARCHAR(500) NULL,
  IsActive BIT NOT NULL CONSTRAINT DF_Invoices_IsActive DEFAULT 1,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Invoices_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CreatedByUserID INT NULL,
  CONSTRAINT UQ_Invoices_InvoiceNumber UNIQUE (InvoiceNumber),
  CONSTRAINT CK_Invoices_Status CHECK (Status IN (N'Draft', N'Issued', N'Paid', N'Canceled')),
  CONSTRAINT CK_Invoices_Period CHECK (PeriodFrom <= PeriodTo),
  CONSTRAINT CK_Invoices_Amounts CHECK (Subtotal >= 0 AND TaxRate >= 0 AND TaxAmount >= 0 AND TotalAmount >= 0),
  CONSTRAINT FK_Invoices_Clients FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID),
  CONSTRAINT FK_Invoices_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID)
);
END
GO

IF OBJECT_ID(N'dbo.ServiceRecords', N'U') IS NULL
BEGIN
CREATE TABLE dbo.ServiceRecords (
  ServiceRecordID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ServiceRecords PRIMARY KEY,
  TechnicianUserID INT NOT NULL,
  ClientID INT NOT NULL,
  ProjectID INT NOT NULL,
  ServiceDate DATE NOT NULL,
  MorningStart TIME(0) NULL,
  MorningEnd TIME(0) NULL,
  AfternoonStart TIME(0) NULL,
  AfternoonEnd TIME(0) NULL,
  TotalHours DECIMAL(6,2) NOT NULL,
  ServiceDescription NVARCHAR(MAX) NOT NULL,
  Status NVARCHAR(20) NOT NULL CONSTRAINT DF_ServiceRecords_Status DEFAULT N'Recorded',
  InvoiceID INT NULL,
  IsActive BIT NOT NULL CONSTRAINT DF_ServiceRecords_IsActive DEFAULT 1,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ServiceRecords_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CreatedByUserID INT NULL,
  CONSTRAINT CK_ServiceRecords_Status CHECK (Status IN (N'Recorded', N'Billed', N'Canceled')),
  CONSTRAINT CK_ServiceRecords_TotalHours CHECK (TotalHours >= 0 AND TotalHours <= 24),
  CONSTRAINT CK_ServiceRecords_MorningRange CHECK (MorningStart IS NULL OR MorningEnd IS NULL OR MorningStart < MorningEnd),
  CONSTRAINT CK_ServiceRecords_AfternoonRange CHECK (AfternoonStart IS NULL OR AfternoonEnd IS NULL OR AfternoonStart < AfternoonEnd),
  CONSTRAINT FK_ServiceRecords_Technician FOREIGN KEY (TechnicianUserID) REFERENCES dbo.Users(UserID),
  CONSTRAINT FK_ServiceRecords_Clients FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID),
  CONSTRAINT FK_ServiceRecords_Projects FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID),
  CONSTRAINT FK_ServiceRecords_Invoices FOREIGN KEY (InvoiceID) REFERENCES dbo.Invoices(InvoiceID),
  CONSTRAINT FK_ServiceRecords_CreatedBy FOREIGN KEY (CreatedByUserID) REFERENCES dbo.Users(UserID)
);
END
GO

IF OBJECT_ID(N'dbo.InvoiceLines', N'U') IS NULL
BEGIN
CREATE TABLE dbo.InvoiceLines (
  InvoiceLineID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_InvoiceLines PRIMARY KEY,
  InvoiceID INT NOT NULL,
  ServiceRecordID INT NULL,
  ProjectID INT NOT NULL,
  Description NVARCHAR(500) NOT NULL,
  ServiceDate DATE NULL,
  Hours DECIMAL(6,2) NOT NULL,
  HourlyRate DECIMAL(10,2) NOT NULL,
  LineTotal DECIMAL(12,2) NOT NULL,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_InvoiceLines_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CONSTRAINT CK_InvoiceLines_Amounts CHECK (Hours >= 0 AND HourlyRate >= 0 AND LineTotal >= 0),
  CONSTRAINT FK_InvoiceLines_Invoices FOREIGN KEY (InvoiceID) REFERENCES dbo.Invoices(InvoiceID),
  CONSTRAINT FK_InvoiceLines_ServiceRecords FOREIGN KEY (ServiceRecordID) REFERENCES dbo.ServiceRecords(ServiceRecordID),
  CONSTRAINT FK_InvoiceLines_Projects FOREIGN KEY (ProjectID) REFERENCES dbo.Projects(ProjectID)
);
END
GO

IF OBJECT_ID(N'dbo.AppSettings', N'U') IS NULL
BEGIN
CREATE TABLE dbo.AppSettings (
  SettingID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AppSettings PRIMARY KEY,
  SettingKey NVARCHAR(120) NOT NULL,
  SettingValue NVARCHAR(MAX) NULL,
  Description NVARCHAR(300) NULL,
  IsActive BIT NOT NULL CONSTRAINT DF_AppSettings_IsActive DEFAULT 1,
  CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AppSettings_CreatedAt DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2(0) NULL,
  CONSTRAINT UQ_AppSettings_SettingKey UNIQUE (SettingKey)
);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Notifications_UserID_CreatedAt' AND object_id = OBJECT_ID(N'dbo.Notifications'))
  CREATE INDEX IX_Notifications_UserID_CreatedAt ON dbo.Notifications (UserID, CreatedAt DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_PasswordResetRequests_Email_Status' AND object_id = OBJECT_ID(N'dbo.PasswordResetRequests'))
  CREATE INDEX IX_PasswordResetRequests_Email_Status ON dbo.PasswordResetRequests (Email, Status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Projects_ClientID' AND object_id = OBJECT_ID(N'dbo.Projects'))
  CREATE INDEX IX_Projects_ClientID ON dbo.Projects (ClientID);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ServiceRecords_Date' AND object_id = OBJECT_ID(N'dbo.ServiceRecords'))
  CREATE INDEX IX_ServiceRecords_Date ON dbo.ServiceRecords (ServiceDate);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ServiceRecords_Client_Project' AND object_id = OBJECT_ID(N'dbo.ServiceRecords'))
  CREATE INDEX IX_ServiceRecords_Client_Project ON dbo.ServiceRecords (ClientID, ProjectID);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ServiceRecords_Technician' AND object_id = OBJECT_ID(N'dbo.ServiceRecords'))
  CREATE INDEX IX_ServiceRecords_Technician ON dbo.ServiceRecords (TechnicianUserID);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ServiceRecords_Status_Invoice' AND object_id = OBJECT_ID(N'dbo.ServiceRecords'))
  CREATE INDEX IX_ServiceRecords_Status_Invoice ON dbo.ServiceRecords (Status, InvoiceID);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Invoices_Client_Period' AND object_id = OBJECT_ID(N'dbo.Invoices'))
  CREATE INDEX IX_Invoices_Client_Period ON dbo.Invoices (ClientID, PeriodFrom, PeriodTo);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InvoiceLines_InvoiceID' AND object_id = OBJECT_ID(N'dbo.InvoiceLines'))
  CREATE INDEX IX_InvoiceLines_InvoiceID ON dbo.InvoiceLines (InvoiceID);
GO

DECLARE @AdminPassword NVARCHAR(255) = N'$2b$10$itsi/XtN0jUlSPMv/oQhRegkk9SBXgV5xAGX6oQUobiDi9mowDyNe';
DECLARE @TechPassword NVARCHAR(255) = N'$2b$10$sMXTjZ5VQ5vjRp3nJgsrs.NGNt3rjn51liZ3kJzlJXFqDChZ/7uDq';

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = N'william@servicebilling.local')
  INSERT INTO dbo.Users (FullName, Email, Password, Role, Phone, HourlyCost, IsTechnician, IsActive)
  VALUES (N'William Rosado', N'william@servicebilling.local', @AdminPassword, N'Admin', N'787-555-0101', NULL, 0, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = N'sofia@servicebilling.local')
  INSERT INTO dbo.Users (FullName, Email, Password, Role, Phone, HourlyCost, IsTechnician, IsActive)
  VALUES (N'Sofia Martinez', N'sofia@servicebilling.local', @AdminPassword, N'Admin', N'787-555-0102', NULL, 0, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = N'carlos@servicebilling.local')
  INSERT INTO dbo.Users (FullName, Email, Password, Role, Phone, HourlyCost, IsTechnician, IsActive)
  VALUES (N'Carlos Rivera', N'carlos@servicebilling.local', @TechPassword, N'Technician', N'787-555-0201', 35.00, 1, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = N'maria@servicebilling.local')
  INSERT INTO dbo.Users (FullName, Email, Password, Role, Phone, HourlyCost, IsTechnician, IsActive)
  VALUES (N'Maria Lopez', N'maria@servicebilling.local', @TechPassword, N'Technician', N'787-555-0202', 38.00, 1, 1);

DECLARE @WilliamID INT = (SELECT UserID FROM dbo.Users WHERE Email = N'william@servicebilling.local');
DECLARE @SofiaID INT = (SELECT UserID FROM dbo.Users WHERE Email = N'sofia@servicebilling.local');
DECLARE @CarlosID INT = (SELECT UserID FROM dbo.Users WHERE Email = N'carlos@servicebilling.local');
DECLARE @MariaID INT = (SELECT UserID FROM dbo.Users WHERE Email = N'maria@servicebilling.local');

UPDATE dbo.Users
SET CreatedByUserID = @WilliamID
WHERE CreatedByUserID IS NULL;

IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE ClientName = N'Acme Manufacturing')
  INSERT INTO dbo.Clients (ClientName, ContactName, Email, Phone, BillingName, TaxID, AddressLine1, City, StateProvince, PostalCode, Country, CreatedByUserID)
  VALUES (N'Acme Manufacturing', N'Laura Torres', N'laura.torres@acme.example', N'787-555-1001', N'Acme Manufacturing LLC', N'66-0001001', N'100 Industrial Ave', N'San Juan', N'PR', N'00901', N'USA', @WilliamID);

IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE ClientName = N'Northwind Services')
  INSERT INTO dbo.Clients (ClientName, ContactName, Email, Phone, BillingName, TaxID, AddressLine1, City, StateProvince, PostalCode, Country, CreatedByUserID)
  VALUES (N'Northwind Services', N'Pedro Sanchez', N'pedro.sanchez@northwind.example', N'787-555-1002', N'Northwind Services Inc.', N'66-0001002', N'45 Commerce St', N'Bayamon', N'PR', N'00959', N'USA', @WilliamID);

IF NOT EXISTS (SELECT 1 FROM dbo.Clients WHERE ClientName = N'Contoso Retail')
  INSERT INTO dbo.Clients (ClientName, ContactName, Email, Phone, BillingName, TaxID, AddressLine1, City, StateProvince, PostalCode, Country, CreatedByUserID)
  VALUES (N'Contoso Retail', N'Elena Vega', N'elena.vega@contoso.example', N'787-555-1003', N'Contoso Retail Corp.', N'66-0001003', N'250 Market Road', N'Carolina', N'PR', N'00983', N'USA', @SofiaID);

DECLARE @AcmeID INT = (SELECT ClientID FROM dbo.Clients WHERE ClientName = N'Acme Manufacturing');
DECLARE @NorthwindID INT = (SELECT ClientID FROM dbo.Clients WHERE ClientName = N'Northwind Services');
DECLARE @ContosoID INT = (SELECT ClientID FROM dbo.Clients WHERE ClientName = N'Contoso Retail');

IF NOT EXISTS (SELECT 1 FROM dbo.Projects WHERE ClientID = @AcmeID AND ProjectName = N'Monthly IT Support')
  INSERT INTO dbo.Projects (ClientID, ProjectName, Description, HourlyRate, CreatedByUserID)
  VALUES (@AcmeID, N'Monthly IT Support', N'Recurring technical support and system maintenance.', 95.00, @WilliamID);

IF NOT EXISTS (SELECT 1 FROM dbo.Projects WHERE ClientID = @NorthwindID AND ProjectName = N'Access Migration Planning')
  INSERT INTO dbo.Projects (ClientID, ProjectName, Description, HourlyRate, CreatedByUserID)
  VALUES (@NorthwindID, N'Access Migration Planning', N'Planning and support for replacing legacy Microsoft Access workflows.', 110.00, @WilliamID);

IF NOT EXISTS (SELECT 1 FROM dbo.Projects WHERE ClientID = @ContosoID AND ProjectName = N'Billing Operations Support')
  INSERT INTO dbo.Projects (ClientID, ProjectName, Description, HourlyRate, CreatedByUserID)
  VALUES (@ContosoID, N'Billing Operations Support', N'Operational support for service tracking and billing reports.', 105.00, @SofiaID);

DECLARE @AcmeSupportProjectID INT = (
  SELECT ProjectID FROM dbo.Projects WHERE ClientID = @AcmeID AND ProjectName = N'Monthly IT Support'
);
DECLARE @NorthwindProjectID INT = (
  SELECT ProjectID FROM dbo.Projects WHERE ClientID = @NorthwindID AND ProjectName = N'Access Migration Planning'
);
DECLARE @ContosoProjectID INT = (
  SELECT ProjectID FROM dbo.Projects WHERE ClientID = @ContosoID AND ProjectName = N'Billing Operations Support'
);

IF NOT EXISTS (SELECT 1 FROM dbo.ServiceRecords)
BEGIN
  INSERT INTO dbo.ServiceRecords (
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
    CreatedByUserID
  )
  VALUES
    (@CarlosID, @AcmeID, @AcmeSupportProjectID, '2026-06-01', '08:30', '11:30', '13:00', '15:00', 5.00, N'Preventive maintenance, workstation updates, and backup verification.', N'Recorded', @CarlosID),
    (@MariaID, @AcmeID, @AcmeSupportProjectID, '2026-06-03', '09:00', '12:00', NULL, NULL, 3.00, N'Network printer troubleshooting and user support.', N'Recorded', @MariaID),
    (@CarlosID, @NorthwindID, @NorthwindProjectID, '2026-06-05', '08:00', '12:00', '13:00', '17:00', 8.00, N'Reviewed Access workflow and documented replacement requirements.', N'Recorded', @CarlosID),
    (@MariaID, @NorthwindID, @NorthwindProjectID, '2026-06-08', NULL, NULL, '13:30', '16:30', 3.00, N'Prepared sample billing report structure for migration planning.', N'Recorded', @MariaID),
    (@CarlosID, @ContosoID, @ContosoProjectID, '2026-06-10', '10:00', '12:00', '13:00', '16:00', 5.00, N'Configured service tracking spreadsheet export for billing review.', N'Recorded', @CarlosID),
    (@MariaID, @ContosoID, @ContosoProjectID, '2026-06-12', '08:30', '11:00', '12:30', '15:30', 5.50, N'Validated client project codes and corrected hourly billing categories.', N'Recorded', @MariaID),
    (@CarlosID, @AcmeID, @AcmeSupportProjectID, '2026-06-15', '09:00', '10:30', NULL, NULL, 1.50, N'Canceled follow-up visit after client rescheduled remaining work.', N'Canceled', @CarlosID);
END

INSERT INTO dbo.AppSettings (SettingKey, SettingValue, Description)
SELECT SettingKey, SettingValue, Description
FROM (VALUES
  (N'CompanyName', N'Service Billing Company', N'Default company name used in reports and invoices.'),
  (N'DefaultCurrency', N'USD', N'Default billing currency.'),
  (N'DefaultTaxRate', N'0.0000', N'Default tax rate used when creating invoices.'),
  (N'NextInvoiceNumber', N'1001', N'Next invoice number seed for future invoice generation.')
) AS SeedSettings(SettingKey, SettingValue, Description)
WHERE NOT EXISTS (
  SELECT 1
  FROM dbo.AppSettings existing
  WHERE existing.SettingKey = SeedSettings.SettingKey
);

IF NOT EXISTS (SELECT 1 FROM dbo.Notifications WHERE Type = N'SCHEMA_CREATED')
  INSERT INTO dbo.Notifications (UserID, Message, Type)
  VALUES (@WilliamID, N'Service Billing schema created with demo data.', N'SCHEMA_CREATED');

IF NOT EXISTS (SELECT 1 FROM dbo.Notifications WHERE Type = N'DEMO_DATA_CREATED')
  INSERT INTO dbo.Notifications (UserID, Message, Type)
  VALUES (@SofiaID, N'Demo clients, projects, and service records are ready for review.', N'DEMO_DATA_CREATED');
GO

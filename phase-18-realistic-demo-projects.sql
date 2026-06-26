USE ServiceBillingDB;
GO

SET NOCOUNT ON;
GO

IF COL_LENGTH(N'dbo.Projects', N'ContractNumber') IS NULL
  THROW 51000, 'Project contract columns are missing. Run phase-17-project-contracts.sql before this script.', 1;
GO

IF OBJECT_ID(N'dbo.vw_ProjectContractStatus', N'V') IS NULL
  THROW 51001, 'dbo.vw_ProjectContractStatus is missing. Run phase-17-project-contracts.sql before this script.', 1;
GO

DECLARE @WilliamID INT = (
  SELECT UserID
  FROM dbo.Users
  WHERE Email = N'william@servicebilling.local'
);
DECLARE @CarlosID INT = (
  SELECT UserID
  FROM dbo.Users
  WHERE Email = N'carlos@servicebilling.local'
);
DECLARE @MariaID INT = (
  SELECT UserID
  FROM dbo.Users
  WHERE Email = N'maria@servicebilling.local'
);

IF @WilliamID IS NULL OR @CarlosID IS NULL OR @MariaID IS NULL
  THROW 51002, 'Required demo users were not found. Verify William, Carlos, and Maria demo users exist.', 1;

UPDATE dbo.Projects
SET
  IsActive = 0,
  UpdatedAt = SYSUTCDATETIME()
WHERE IsActive = 1
  AND (
    ProjectName IN (
      N'Monthly IT Support',
      N'Billing Operations Support',
      N'Access Migration Planning'
    )
    OR ProjectName LIKE N'%Demo%'
    OR ProjectName LIKE N'%Sample%'
    OR ProjectName LIKE N'%Test Project%'
  );

IF EXISTS (SELECT 1 FROM dbo.Clients WHERE ClientName = N'ALDL La Montaña')
BEGIN
  UPDATE dbo.Clients
  SET
    ContactName = COALESCE(ContactName, N'Contacto ALDL'),
    Email = COALESCE(Email, N'aldl@example.local'),
    Phone = COALESCE(Phone, N'787-555-2101'),
    BillingName = COALESCE(BillingName, N'ALDL La Montaña'),
    TaxID = COALESCE(TaxID, N'ALDL-0001'),
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
  WHERE ClientName = N'ALDL La Montaña';
END
ELSE
BEGIN
  INSERT INTO dbo.Clients (
    ClientName,
    ContactName,
    Email,
    Phone,
    BillingName,
    TaxID,
    AddressLine1,
    City,
    StateProvince,
    PostalCode,
    Country,
    CreatedByUserID
  )
  VALUES (
    N'ALDL La Montaña',
    N'Contacto ALDL',
    N'aldl@example.local',
    N'787-555-2101',
    N'ALDL La Montaña',
    N'ALDL-0001',
    N'Carr. Principal',
    N'San Juan',
    N'PR',
    N'00901',
    N'USA',
    @WilliamID
  );
END

IF EXISTS (SELECT 1 FROM dbo.Clients WHERE ClientName = N'MB WIA')
BEGIN
  UPDATE dbo.Clients
  SET
    ContactName = COALESCE(ContactName, N'Contacto MB WIA'),
    Email = COALESCE(Email, N'mbwia@example.local'),
    Phone = COALESCE(Phone, N'787-555-2102'),
    BillingName = COALESCE(BillingName, N'MB WIA'),
    TaxID = COALESCE(TaxID, N'MB-WIA-0001'),
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
  WHERE ClientName = N'MB WIA';
END
ELSE
BEGIN
  INSERT INTO dbo.Clients (
    ClientName,
    ContactName,
    Email,
    Phone,
    BillingName,
    TaxID,
    AddressLine1,
    City,
    StateProvince,
    PostalCode,
    Country,
    CreatedByUserID
  )
  VALUES (
    N'MB WIA',
    N'Contacto MB WIA',
    N'mbwia@example.local',
    N'787-555-2102',
    N'MB WIA',
    N'MB-WIA-0001',
    N'Oficina Administrativa',
    N'Bayamon',
    N'PR',
    N'00959',
    N'USA',
    @WilliamID
  );
END

IF EXISTS (SELECT 1 FROM dbo.Clients WHERE ClientName = N'DP FAM')
BEGIN
  UPDATE dbo.Clients
  SET
    ContactName = COALESCE(ContactName, N'Contacto DP FAM'),
    Email = COALESCE(Email, N'dpfam@example.local'),
    Phone = COALESCE(Phone, N'787-555-2103'),
    BillingName = COALESCE(BillingName, N'DP FAM'),
    TaxID = COALESCE(TaxID, N'DP-FAM-0001'),
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
  WHERE ClientName = N'DP FAM';
END
ELSE
BEGIN
  INSERT INTO dbo.Clients (
    ClientName,
    ContactName,
    Email,
    Phone,
    BillingName,
    TaxID,
    AddressLine1,
    City,
    StateProvince,
    PostalCode,
    Country,
    CreatedByUserID
  )
  VALUES (
    N'DP FAM',
    N'Contacto DP FAM',
    N'dpfam@example.local',
    N'787-555-2103',
    N'DP FAM',
    N'DP-FAM-0001',
    N'Centro de Servicios',
    N'Carolina',
    N'PR',
    N'00983',
    N'USA',
    @WilliamID
  );
END

DECLARE @AldlClientID INT = (SELECT ClientID FROM dbo.Clients WHERE ClientName = N'ALDL La Montaña');
DECLARE @MbWiaClientID INT = (SELECT ClientID FROM dbo.Clients WHERE ClientName = N'MB WIA');
DECLARE @DpFamClientID INT = (SELECT ClientID FROM dbo.Clients WHERE ClientName = N'DP FAM');

IF EXISTS (
  SELECT 1
  FROM dbo.Projects
  WHERE ClientID = @AldlClientID
    AND ProjectName = N'DESARROLLO DE PÁGINA WEB 2025'
)
BEGIN
  UPDATE dbo.Projects
  SET
    Description = N'Desarrollo y mantenimiento de página web para servicios del cliente.',
    HourlyRate = 0,
    ContractNumber = N'WEB-2025-001',
    ContractType = N'Signed',
    SignedBy = N'William Rosado',
    ContractStartDate = '2026-01-01',
    ContractEndDate = '2026-12-31',
    ContractedHours = 500.00,
    LowHoursThreshold = 50.00,
    ExpirationAlertDays = 30,
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
  WHERE ClientID = @AldlClientID
    AND ProjectName = N'DESARROLLO DE PÁGINA WEB 2025';
END
ELSE
BEGIN
  INSERT INTO dbo.Projects (
    ClientID,
    ProjectName,
    Description,
    HourlyRate,
    ContractNumber,
    ContractType,
    SignedBy,
    ContractStartDate,
    ContractEndDate,
    ContractedHours,
    LowHoursThreshold,
    ExpirationAlertDays,
    IsActive,
    CreatedByUserID
  )
  VALUES (
    @AldlClientID,
    N'DESARROLLO DE PÁGINA WEB 2025',
    N'Desarrollo y mantenimiento de página web para servicios del cliente.',
    0,
    N'WEB-2025-001',
    N'Signed',
    N'William Rosado',
    '2026-01-01',
    '2026-12-31',
    500.00,
    50.00,
    30,
    1,
    @WilliamID
  );
END

IF EXISTS (
  SELECT 1
  FROM dbo.Projects
  WHERE ClientID = @MbWiaClientID
    AND ProjectName = N'MB WIA'
)
BEGIN
  UPDATE dbo.Projects
  SET
    Description = N'Servicios de soporte y registro de horas para programa MB WIA.',
    HourlyRate = 0,
    ContractNumber = N'MB-WIA-2026-001',
    ContractType = N'Signed',
    SignedBy = N'William Rosado',
    ContractStartDate = '2026-01-01',
    ContractEndDate = '2026-12-31',
    ContractedHours = 300.00,
    LowHoursThreshold = 40.00,
    ExpirationAlertDays = 30,
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
  WHERE ClientID = @MbWiaClientID
    AND ProjectName = N'MB WIA';
END
ELSE
BEGIN
  INSERT INTO dbo.Projects (
    ClientID,
    ProjectName,
    Description,
    HourlyRate,
    ContractNumber,
    ContractType,
    SignedBy,
    ContractStartDate,
    ContractEndDate,
    ContractedHours,
    LowHoursThreshold,
    ExpirationAlertDays,
    IsActive,
    CreatedByUserID
  )
  VALUES (
    @MbWiaClientID,
    N'MB WIA',
    N'Servicios de soporte y registro de horas para programa MB WIA.',
    0,
    N'MB-WIA-2026-001',
    N'Signed',
    N'William Rosado',
    '2026-01-01',
    '2026-12-31',
    300.00,
    40.00,
    30,
    1,
    @WilliamID
  );
END

IF EXISTS (
  SELECT 1
  FROM dbo.Projects
  WHERE ClientID = @DpFamClientID
    AND ProjectName = N'DP FAM'
)
BEGIN
  UPDATE dbo.Projects
  SET
    Description = N'Servicios administrativos y técnicos para proyecto DP FAM.',
    HourlyRate = 0,
    ContractNumber = N'DP-FAM-2026-001',
    ContractType = N'Direct',
    SignedBy = N'William Rosado',
    ContractStartDate = '2026-01-01',
    ContractEndDate = '2026-12-31',
    ContractedHours = 250.00,
    LowHoursThreshold = 30.00,
    ExpirationAlertDays = 30,
    IsActive = 1,
    UpdatedAt = SYSUTCDATETIME()
  WHERE ClientID = @DpFamClientID
    AND ProjectName = N'DP FAM';
END
ELSE
BEGIN
  INSERT INTO dbo.Projects (
    ClientID,
    ProjectName,
    Description,
    HourlyRate,
    ContractNumber,
    ContractType,
    SignedBy,
    ContractStartDate,
    ContractEndDate,
    ContractedHours,
    LowHoursThreshold,
    ExpirationAlertDays,
    IsActive,
    CreatedByUserID
  )
  VALUES (
    @DpFamClientID,
    N'DP FAM',
    N'Servicios administrativos y técnicos para proyecto DP FAM.',
    0,
    N'DP-FAM-2026-001',
    N'Direct',
    N'William Rosado',
    '2026-01-01',
    '2026-12-31',
    250.00,
    30.00,
    30,
    1,
    @WilliamID
  );
END

DECLARE @WebProjectID INT = (
  SELECT ProjectID
  FROM dbo.Projects
  WHERE ClientID = @AldlClientID
    AND ProjectName = N'DESARROLLO DE PÁGINA WEB 2025'
);
DECLARE @MbWiaProjectID INT = (
  SELECT ProjectID
  FROM dbo.Projects
  WHERE ClientID = @MbWiaClientID
    AND ProjectName = N'MB WIA'
);
DECLARE @DpFamProjectID INT = (
  SELECT ProjectID
  FROM dbo.Projects
  WHERE ClientID = @DpFamClientID
    AND ProjectName = N'DP FAM'
);

IF NOT EXISTS (
  SELECT 1 FROM dbo.ServiceRecords
  WHERE TechnicianUserID = @WilliamID
    AND ProjectID = @WebProjectID
    AND ServiceDate = '2026-06-03'
    AND ServiceDescription = N'Servicio ofrecido de prueba - revisión y planificación de página web.'
)
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
  VALUES (
    @WilliamID,
    @AldlClientID,
    @WebProjectID,
    '2026-06-03',
    '08:00',
    '12:00',
    NULL,
    NULL,
    4.00,
    N'Servicio ofrecido de prueba - revisión y planificación de página web.',
    N'Recorded',
    @WilliamID
  );
END

IF NOT EXISTS (
  SELECT 1 FROM dbo.ServiceRecords
  WHERE TechnicianUserID = @CarlosID
    AND ProjectID = @WebProjectID
    AND ServiceDate = '2026-06-05'
    AND ServiceDescription = N'Servicio ofrecido de prueba - actualización de contenido web.'
)
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
  VALUES (
    @CarlosID,
    @AldlClientID,
    @WebProjectID,
    '2026-06-05',
    '08:00',
    '12:00',
    NULL,
    NULL,
    4.00,
    N'Servicio ofrecido de prueba - actualización de contenido web.',
    N'Recorded',
    @CarlosID
  );
END

IF NOT EXISTS (
  SELECT 1 FROM dbo.ServiceRecords
  WHERE TechnicianUserID = @CarlosID
    AND ProjectID = @MbWiaProjectID
    AND ServiceDate = '2026-06-10'
    AND ServiceDescription = N'Servicio ofrecido de prueba - soporte de registros MB WIA.'
)
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
  VALUES (
    @CarlosID,
    @MbWiaClientID,
    @MbWiaProjectID,
    '2026-06-10',
    '08:00',
    '12:00',
    NULL,
    NULL,
    4.00,
    N'Servicio ofrecido de prueba - soporte de registros MB WIA.',
    N'Recorded',
    @CarlosID
  );
END

IF NOT EXISTS (
  SELECT 1 FROM dbo.ServiceRecords
  WHERE TechnicianUserID = @MariaID
    AND ProjectID = @MbWiaProjectID
    AND ServiceDate = '2026-06-12'
    AND ServiceDescription = N'Servicio ofrecido de prueba - validación de información del programa.'
)
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
  VALUES (
    @MariaID,
    @MbWiaClientID,
    @MbWiaProjectID,
    '2026-06-12',
    '08:00',
    '12:00',
    NULL,
    NULL,
    4.00,
    N'Servicio ofrecido de prueba - validación de información del programa.',
    N'Recorded',
    @MariaID
  );
END

IF NOT EXISTS (
  SELECT 1 FROM dbo.ServiceRecords
  WHERE TechnicianUserID = @WilliamID
    AND ProjectID = @DpFamProjectID
    AND ServiceDate = '2026-06-17'
    AND ServiceDescription = N'Servicio ofrecido de prueba - seguimiento administrativo DP FAM.'
)
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
  VALUES (
    @WilliamID,
    @DpFamClientID,
    @DpFamProjectID,
    '2026-06-17',
    '08:00',
    '12:00',
    NULL,
    NULL,
    4.00,
    N'Servicio ofrecido de prueba - seguimiento administrativo DP FAM.',
    N'Recorded',
    @WilliamID
  );
END

IF NOT EXISTS (
  SELECT 1 FROM dbo.ServiceRecords
  WHERE TechnicianUserID = @CarlosID
    AND ProjectID = @DpFamProjectID
    AND ServiceDate = '2026-06-19'
    AND ServiceDescription = N'Servicio ofrecido de prueba - apoyo técnico DP FAM.'
)
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
  VALUES (
    @CarlosID,
    @DpFamClientID,
    @DpFamProjectID,
    '2026-06-19',
    '08:00',
    '12:00',
    NULL,
    NULL,
    4.00,
    N'Servicio ofrecido de prueba - apoyo técnico DP FAM.',
    N'Recorded',
    @CarlosID
  );
END
GO

SELECT *
FROM dbo.Clients
WHERE IsActive = 1
ORDER BY ClientName;

SELECT *
FROM dbo.Projects
WHERE IsActive = 1
ORDER BY ProjectName;

SELECT *
FROM dbo.vw_ProjectContractStatus
ORDER BY ProjectName;

SELECT *
FROM dbo.ServiceRecords
ORDER BY ServiceDate DESC, ServiceRecordID DESC;
GO

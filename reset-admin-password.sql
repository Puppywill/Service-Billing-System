USE HelpDeskDB;
GO

DECLARE @Email NVARCHAR(180) = 'admin@helpdesk.local';
DECLARE @PasswordHash NVARCHAR(255) = '$2b$10$rzIaVPfH7W1X9w9G86W1pu4Wn0ZaFMCORlv9Dx5khDl/Ki7OcRLGO';

UPDATE dbo.Users
SET Password = @PasswordHash
WHERE Email = @Email;
GO

IF COL_LENGTH('dbo.Users', 'PasswordHash') IS NOT NULL
BEGIN
  UPDATE dbo.Users
  SET PasswordHash = '$2b$10$rzIaVPfH7W1X9w9G86W1pu4Wn0ZaFMCORlv9Dx5khDl/Ki7OcRLGO'
  WHERE Email = 'admin@helpdesk.local';
END
GO

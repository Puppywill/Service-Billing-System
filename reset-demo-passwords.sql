USE HelpDeskDB;
GO

UPDATE dbo.Users
SET Password = '$2b$10$f0DzdI5XvvNqmlR7PGHLpe0ym1NQoWz/6IXbYi5p4JGT06oYMkP96'
WHERE Email = 'admin@helpdesk.local';
GO

UPDATE dbo.Users
SET Password = '$2b$10$psjaYCxeKnj0yjWs0tzB8.NSE0ZonzF3QhcICwsPue4H8rW4eYMM.'
WHERE Email = 'user@helpdesk.local';
GO

IF COL_LENGTH('dbo.Users', 'PasswordHash') IS NOT NULL
BEGIN
  UPDATE dbo.Users
  SET PasswordHash = '$2b$10$f0DzdI5XvvNqmlR7PGHLpe0ym1NQoWz/6IXbYi5p4JGT06oYMkP96'
  WHERE Email = 'admin@helpdesk.local';

  UPDATE dbo.Users
  SET PasswordHash = '$2b$10$psjaYCxeKnj0yjWs0tzB8.NSE0ZonzF3QhcICwsPue4H8rW4eYMM.'
  WHERE Email = 'user@helpdesk.local';
END
GO

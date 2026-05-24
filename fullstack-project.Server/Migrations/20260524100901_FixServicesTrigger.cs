using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fullstack_project.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixServicesTrigger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the failed trigger if it was partially created
            migrationBuilder.Sql("IF OBJECT_ID('trg_Services_Audit', 'TR') IS NOT NULL DROP TRIGGER trg_Services_Audit;");

            migrationBuilder.Sql(@"
CREATE TRIGGER trg_Services_Audit
ON Services
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @action NVARCHAR(10);
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        SET @action = 'UPDATE';
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        SET @action = 'INSERT';
    ELSE
        SET @action = 'DELETE';

    IF @action = 'INSERT'
        INSERT INTO AuditLogs (TableName, Action, RecordId, OldValues, NewValues, ChangedAt)
        SELECT 'Services', 'INSERT', CAST(i.Id AS NVARCHAR(50)),
               NULL,
               CONCAT('{""Title"":""', i.Title, '"",""Price"":', i.Price, '}'),
               GETUTCDATE()
        FROM inserted i;

    IF @action = 'UPDATE'
        INSERT INTO AuditLogs (TableName, Action, RecordId, OldValues, NewValues, ChangedAt)
        SELECT 'Services', 'UPDATE', CAST(i.Id AS NVARCHAR(50)),
               CONCAT('{""Title"":""', d.Title, '"",""Price"":', d.Price, '}'),
               CONCAT('{""Title"":""', i.Title, '"",""Price"":', i.Price, '}'),
               GETUTCDATE()
        FROM inserted i JOIN deleted d ON i.Id = d.Id;

    IF @action = 'DELETE'
        INSERT INTO AuditLogs (TableName, Action, RecordId, OldValues, NewValues, ChangedAt)
        SELECT 'Services', 'DELETE', CAST(d.Id AS NVARCHAR(50)),
               CONCAT('{""Title"":""', d.Title, '""}'),
               NULL,
               GETUTCDATE()
        FROM deleted d;
END;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF OBJECT_ID('trg_Services_Audit', 'TR') IS NOT NULL DROP TRIGGER trg_Services_Audit;");
        }
    }
}

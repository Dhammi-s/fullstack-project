using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fullstack_project.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogsAndApiLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApiRequestLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Method = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Path = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    QueryString = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequestBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponseBody = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMs = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiRequestLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecordId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            // ── Trigger: Orders ──────────────────────────────────────────────
            migrationBuilder.Sql(@"
CREATE TRIGGER trg_Orders_Audit
ON Orders
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
        SELECT 'Orders', 'INSERT', CAST(i.Id AS NVARCHAR),
               NULL,
               CONCAT('{""OrderNumber"":""', i.OrderNumber, '"",""Status"":""', i.Status,
                      '"",""TotalAmount"":', i.TotalAmount, ',""CustomerId"":""', i.CustomerId, '""}'),
               GETUTCDATE()
        FROM inserted i;

    IF @action = 'UPDATE'
        INSERT INTO AuditLogs (TableName, Action, RecordId, OldValues, NewValues, ChangedAt)
        SELECT 'Orders', 'UPDATE', CAST(i.Id AS NVARCHAR),
               CONCAT('{""Status"":""', d.Status, '"",""PaymentStatus"":""', d.PaymentStatus, '""}'),
               CONCAT('{""Status"":""', i.Status, '"",""PaymentStatus"":""', i.PaymentStatus, '""}'),
               GETUTCDATE()
        FROM inserted i JOIN deleted d ON i.Id = d.Id;

    IF @action = 'DELETE'
        INSERT INTO AuditLogs (TableName, Action, RecordId, OldValues, NewValues, ChangedAt)
        SELECT 'Orders', 'DELETE', CAST(d.Id AS NVARCHAR),
               CONCAT('{""OrderNumber"":""', d.OrderNumber, '"",""Status"":""', d.Status, '""}'),
               NULL,
               GETUTCDATE()
        FROM deleted d;
END;
");

            // ── Trigger: Reviews ─────────────────────────────────────────────
            migrationBuilder.Sql(@"
CREATE TRIGGER trg_Reviews_Audit
ON Reviews
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
        SELECT 'Reviews', 'INSERT', CAST(i.Id AS NVARCHAR),
               NULL,
               CONCAT('{""Rating"":', i.Rating, ',""UserId"":""', i.UserId, '""}'),
               GETUTCDATE()
        FROM inserted i;

    IF @action = 'UPDATE'
        INSERT INTO AuditLogs (TableName, Action, RecordId, OldValues, NewValues, ChangedAt)
        SELECT 'Reviews', 'UPDATE', CAST(i.Id AS NVARCHAR),
               CONCAT('{""Rating"":', d.Rating, '}'),
               CONCAT('{""Rating"":', i.Rating, '}'),
               GETUTCDATE()
        FROM inserted i JOIN deleted d ON i.Id = d.Id;

    IF @action = 'DELETE'
        INSERT INTO AuditLogs (TableName, Action, RecordId, OldValues, NewValues, ChangedAt)
        SELECT 'Reviews', 'DELETE', CAST(d.Id AS NVARCHAR),
               CONCAT('{""Rating"":', d.Rating, ',""UserId"":""', d.UserId, '""}'),
               NULL,
               GETUTCDATE()
        FROM deleted d;
END;
");

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
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_Orders_Audit;");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_Reviews_Audit;");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_Services_Audit;");

            migrationBuilder.DropTable(name: "ApiRequestLogs");
            migrationBuilder.DropTable(name: "AuditLogs");
        }
    }
}

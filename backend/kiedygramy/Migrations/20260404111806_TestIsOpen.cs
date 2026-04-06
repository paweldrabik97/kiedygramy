using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kiedygramy.Migrations
{
    /// <inheritdoc />
    public partial class TestIsOpen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxGuests",
                table: "SessionInviteLinks");

            migrationBuilder.AddColumn<bool>(
                name: "IsOpen",
                table: "Sessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOpen",
                table: "Sessions");

            migrationBuilder.AddColumn<int>(
                name: "MaxGuests",
                table: "SessionInviteLinks",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}

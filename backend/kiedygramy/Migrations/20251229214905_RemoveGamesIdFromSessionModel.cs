using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kiedygramy.Migrations
{
    /// <inheritdoc />
    public partial class RemoveGamesIdFromSessionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GameIds",
                table: "Sessions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int[]>(
                name: "GameIds",
                table: "Sessions",
                type: "integer[]",
                nullable: true);
        }
    }
}

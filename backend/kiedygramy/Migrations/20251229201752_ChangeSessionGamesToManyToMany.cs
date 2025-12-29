using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kiedygramy.Migrations
{
    /// <inheritdoc />
    public partial class ChangeSessionGamesToManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sessions_Games_GameId",
                table: "Sessions");

            migrationBuilder.DropIndex(
                name: "IX_Sessions_GameId",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "GameId",
                table: "Sessions");

            migrationBuilder.AddColumn<int[]>(
                name: "GameIds",
                table: "Sessions",
                type: "integer[]",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SessionGame",
                columns: table => new
                {
                    GameId = table.Column<int>(type: "integer", nullable: false),
                    SessionId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionGame", x => new { x.GameId, x.SessionId });
                    table.ForeignKey(
                        name: "FK_SessionGame_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SessionGame_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SessionGame_SessionId",
                table: "SessionGame",
                column: "SessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionGame");

            migrationBuilder.DropColumn(
                name: "GameIds",
                table: "Sessions");

            migrationBuilder.AddColumn<int>(
                name: "GameId",
                table: "Sessions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_GameId",
                table: "Sessions",
                column: "GameId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sessions_Games_GameId",
                table: "Sessions",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}

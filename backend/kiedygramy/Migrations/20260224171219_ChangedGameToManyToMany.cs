using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kiedygramy.Migrations
{
    /// <inheritdoc />
    public partial class ChangedGameToManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Games_AspNetUsers_OwnerId",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_OwnerId_Title",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Games");

            migrationBuilder.AddColumn<int>(
                name: "BggId",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCustom",
                table: "Games",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "UserGames",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    GameId = table.Column<int>(type: "integer", nullable: false),
                    LocalTitle = table.Column<string>(type: "text", nullable: true),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserGames", x => new { x.UserId, x.GameId });
                    table.ForeignKey(
                        name: "FK_UserGames_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserGames_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Games_BggId",
                table: "Games",
                column: "BggId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserGames_GameId",
                table: "UserGames",
                column: "GameId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserGames");

            migrationBuilder.DropIndex(
                name: "IX_Games_BggId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "BggId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "IsCustom",
                table: "Games");

            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Games_OwnerId_Title",
                table: "Games",
                columns: new[] { "OwnerId", "Title" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Games_AspNetUsers_OwnerId",
                table: "Games",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

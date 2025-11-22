using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kiedygramy.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionParticipants2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SesionParticipants_AspNetUsers_UserId",
                table: "SesionParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_SesionParticipants_Sessions_SessionId",
                table: "SesionParticipants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SesionParticipants",
                table: "SesionParticipants");

            migrationBuilder.RenameTable(
                name: "SesionParticipants",
                newName: "SessionParticipants");

            migrationBuilder.RenameIndex(
                name: "IX_SesionParticipants_UserId",
                table: "SessionParticipants",
                newName: "IX_SessionParticipants_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_SesionParticipants_SessionId_UserId",
                table: "SessionParticipants",
                newName: "IX_SessionParticipants_SessionId_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "Sessions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "GameId",
                table: "Sessions",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Sessions",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SessionParticipants",
                table: "SessionParticipants",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SessionParticipants_AspNetUsers_UserId",
                table: "SessionParticipants",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SessionParticipants_Sessions_SessionId",
                table: "SessionParticipants",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SessionParticipants_AspNetUsers_UserId",
                table: "SessionParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_SessionParticipants_Sessions_SessionId",
                table: "SessionParticipants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SessionParticipants",
                table: "SessionParticipants");

            migrationBuilder.RenameTable(
                name: "SessionParticipants",
                newName: "SesionParticipants");

            migrationBuilder.RenameIndex(
                name: "IX_SessionParticipants_UserId",
                table: "SesionParticipants",
                newName: "IX_SesionParticipants_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_SessionParticipants_SessionId_UserId",
                table: "SesionParticipants",
                newName: "IX_SesionParticipants_SessionId_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Location",
                table: "Sessions",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "GameId",
                table: "Sessions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Sessions",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_SesionParticipants",
                table: "SesionParticipants",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SesionParticipants_AspNetUsers_UserId",
                table: "SesionParticipants",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SesionParticipants_Sessions_SessionId",
                table: "SesionParticipants",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

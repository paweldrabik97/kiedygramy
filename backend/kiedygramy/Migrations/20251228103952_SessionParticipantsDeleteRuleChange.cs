using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace kiedygramy.Migrations
{
    /// <inheritdoc />
    public partial class SessionParticipantsDeleteRuleChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SessionParticipants_Sessions_SessionId",
                table: "SessionParticipants");

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
                name: "FK_SessionParticipants_Sessions_SessionId",
                table: "SessionParticipants");

            migrationBuilder.AddForeignKey(
                name: "FK_SessionParticipants_Sessions_SessionId",
                table: "SessionParticipants",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

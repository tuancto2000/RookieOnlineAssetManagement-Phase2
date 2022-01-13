using Microsoft.EntityFrameworkCore.Migrations;

namespace RookieOnlineAssetManagement.Migrations
{
    public partial class Migrate_Claim_UserType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
             @"
                 update AspNetUserClaims set ClaimValue = 'Admin' where ClaimValue = 'admin'
                 go
                 update AspNetUserClaims set ClaimValue = 'Staff' where ClaimValue = 'staff'
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

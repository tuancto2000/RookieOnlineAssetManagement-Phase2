using Microsoft.EntityFrameworkCore.Migrations;

namespace RookieOnlineAssetManagement.Migrations
{
    public partial class Fix_Migrate_Claim_UserType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
            @"
                delete from AspNetUserClaims
                go
                insert into [AspNetUserClaims] select u.Id,'location',u.Location from Users u;
                go
                insert into [AspNetUserClaims] select u.Id,'userId',CAST(u.Id as nvarchar(max))
						                from Users u;
                go
                insert into [AspNetUserClaims] select u.Id,'type',case 
						                when u.Type = 1 then 'Staff'
						                when u.Type = 2 then 'Admin'
						                end
						                from Users u;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

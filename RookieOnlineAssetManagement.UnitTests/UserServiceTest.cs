using Microsoft.EntityFrameworkCore;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace RookieOnlineAssetManagement.UnitTests
{
    public class UserServiceTest
    {
        private readonly UserService _userService;
        public UserServiceTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
             .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
             .Options;
            using (var context = new ApplicationDbContext(options))
            {
                context.Users.AddRange(
                    new User
                    {
                        Id = 1,
                        Code = "SD00001",
                        UserName = "chienp",
                        FirstName = "Chien",
                        LastName = "Phung",
                        DoB = DateTime.Now,
                        Gender = true,
                        JoinedDate = DateTime.Now,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        State = StateType.Available,
                        Location = "HCM"
                    },
                    new User
                    {
                        Id = 1,
                        Code = "SD00001",
                        UserName = "chienp",
                        FirstName = "Chien",
                        LastName = "Phung",
                        DoB = DateTime.Now,
                        Gender = true,
                        JoinedDate = DateTime.Now,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        State = StateType.Available,
                        Location = "HCM"
                    },
                    new User
                    {
                        Id = 1,
                        Code = "SD00001",
                        UserName = "chienp",
                        FirstName = "Chien",
                        LastName = "Phung",
                        DoB = DateTime.Now,
                        Gender = true,
                        JoinedDate = DateTime.Now,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        State = StateType.Available,
                        Location = "HCM"
                    },
                    new User
                    {
                        Id = 1,
                        Code = "SD00001",
                        UserName = "chienp",
                        FirstName = "Chien",
                        LastName = "Phung",
                        DoB = DateTime.Now,
                        Gender = true,
                        JoinedDate = DateTime.Now,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        State = StateType.Available,
                        Location = "HCM"
                    });

                context.SaveChanges();
               
                    

            }
            var mockContext = new ApplicationDbContext(options);
            _userService = new UserService(mockContext, null, null);
        }

        //[Fact]
        //public void GenerateCategoryCode()
        //{
        //    //Arrange
        //    string input1 = "Chien";
        //    string input2 = "Phung Cong";
        //    string input3 = "Phuong";
        //    string input4 = "Ho Thi Thuy";
        //    var expectedOutput1 = "chienpc";
        //    var expectedOutput2 = "phuonghtt";
        //    // Act 
        //    //string output1 = _userService.GenerateUserCode(input1);
        //    //string output2 = _userService.GenerateUserCode(input3, input4);
        //    // Assert
        //    //Assert.Equal(output1, expectedOutput1);
        //    //Assert.Equal(output2, expectedOutput2);
        //}
    }
}

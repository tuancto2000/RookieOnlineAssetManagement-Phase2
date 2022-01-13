using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using RookieOnlineAssetManagement.Controllers;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Data.ViewModel;
using RookieOnlineAssetManagement.Services;
using System;
using System.Collections.Generic;
using System.Net;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using Xunit;

namespace RookieOnlineAssetManagement.UnitTests
{
    public class UsersControllerTest
    {
        private readonly UserService _userService;
        private readonly ApplicationDbContext _dbContext;
        private Mock<FakeUserManager> _mockUserManager;
        private Mock<FakeSignInManager> _mockSignInManager;
        public UsersControllerTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
             .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
             .Options;
            using (var context = new ApplicationDbContext(options))
            {
                context.Add(new User
                {
                    Id = 1,
                    Code = "SD0001",
                    FirstName = "A",
                    LastName = "Nguyễn Văn",
                    DoB = new DateTime(1999, 11, 19),
                    JoinedDate = new DateTime(2020, 11, 19),
                    Gender = false,
                    Type = UserType.Admin,
                    State = StateType.Available,
                    Location = "HCM",
                    UserName = "admin",
                    NormalizedUserName = "ADMIN",
                    Email = "admin",
                    PasswordHash = "AQAAAAEAACcQAAAAEP9LsCgOYz5eEZutumo1M+iY8dXqgJ+Db3Wa8tXy0xn+/x8XkH5P3zEKMMqmXW44CQ==",
                    PhoneNumber = "0123456789"
                });

                context.SaveChanges();
            }

            _dbContext = new ApplicationDbContext(options);
            _mockUserManager = new Mock<FakeUserManager>();
            _mockSignInManager = new Mock<FakeSignInManager>();
            _userService = new UserService(_dbContext, _mockUserManager.Object, _mockSignInManager.Object);
        }

        [Fact]
        public async Task GetUserLogin_ReturnOk()
        {
            //Arrange
            var user = await _dbContext.Users.FindAsync(1);
            _mockUserManager.Setup(userManager => userManager.FindByNameAsync(It.IsAny<string>())).ReturnsAsync(user);
            var userService = new UserService(_dbContext, _mockUserManager.Object, _mockSignInManager.Object);
            var controller = new UsersController(userService);

            var userClaim = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
{
                new Claim(ClaimTypes.Name, "admin"),
                new Claim(ClaimTypes.NameIdentifier, "1"),
            }, "mock"));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = userClaim }
            };

            //Action
            var result = await controller.GetUserLogin() as OkObjectResult;

            //Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public async Task Logout_ReturnOk()
        {
            //Arrange
            var controller = new UsersController(_userService);

            //Action
            var result = await controller.Logout() as OkObjectResult;

            //Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public async Task ChangePasswordFirstTime_WithPasswordNewNotEmpty_ReturnOk()
        {
            //Arrange
            var vm = new ChangePasswordVM { userId = 1, passwordNew = "123456" };
            var controller = new UsersController(_userService);

            //Action
            var result = await controller.ChangePasswordFirstTime(vm) as OkObjectResult;

            //Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public async Task ChangePasswordFirstTime_WithPasswordNewEmpty_ReturnBadRequest()
        {
            //Arrange
            var vm = new ChangePasswordVM { userId = 1, passwordNew = "" };
            var controller = new UsersController(_userService);

            //Action
            var result = await controller.ChangePasswordFirstTime(vm) as BadRequestResult;

            //Assert
            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
        }

        [Fact]
        public async Task ChangePassword_WithCorrectPasswordOldAndBothPasswordNotEmpty_ReturnOk()
        {
            //Arrange
            var vm = new ChangePasswordVM { userId = 1, passwordOld = "123456", passwordNew = "123" };
            var controller = new UsersController(_userService);

            //Action
            var result = await controller.ChangePassword(vm) as OkObjectResult;

            //Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
        }

        [Fact]
        public async Task ChangePassword_WithIncorrectPasswordOldAndBothPasswordNotEmpty_ReturnBadRequest()
        {
            //Arrange
            var vm = new ChangePasswordVM { userId = 1, passwordOld = "test123", passwordNew = "123" };
            var controller = new UsersController(_userService);

            //Action
            var result = await controller.ChangePassword(vm) as BadRequestObjectResult;

            //Assert
            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
        }

        [Fact]
        public async Task ChangePassword_WithBothPasswordEmpty_ReturnBadRequest()
        {
            //Arrange
            var vm = new ChangePasswordVM { userId = 1, passwordOld = "", passwordNew = "" };
            var controller = new UsersController(_userService);

            //Action
            var result = await controller.ChangePassword(vm) as BadRequestObjectResult;

            //Assert
            Assert.NotNull(result);
            Assert.Equal(400, result.StatusCode);
        }
    }
}

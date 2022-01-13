using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Moq;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Models.Reports;
using RookieOnlineAssetManagement.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace RookieOnlineAssetManagement.UnitTests
{
    public class ReportServiceTest
    {
        private readonly ReportService _reportService;
        private readonly ApplicationDbContext _dbContext;
        private Mock<FakeUserManager> _mockUserManager;

        public ReportServiceTest()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
             .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
             .Options;
            using (var context = new ApplicationDbContext(options))
            {
                context.Categories.AddRange(
                   new Category
                   {
                       Id = 1,
                       Name = "Personal Computer",
                       Code = "PC",
                   },
                   new Category
                   {
                       Id = 2,
                       Name = "Laptop",
                       Code = "LA",
                   });
                context.Assets.AddRange(
                    new Asset
                    {
                        Id = 1,
                        Code = "PC000001",
                        Name = "Tuan",
                        Specification = "Lorem ipsum ",
                        InstalledDate = DateTime.Now,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        State = AssetState.Assigned,
                        CategoryId = 1,
                        Location = "HCM"
                    },
                    new Asset
                    {
                        Id = 2,
                        Code = "PC000002",
                        Name = "Xuan",
                        Specification = "Lorem ipsum ",
                        InstalledDate = DateTime.Now,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        State = AssetState.Available,
                        CategoryId = 2,
                        Location = "HCM"
                    },
                    new Asset
                    {
                        Id = 3,
                        Code = "LA000002",
                        Name = "Tuan",
                        Specification = "Lorem ipsum ",
                        InstalledDate = DateTime.Now,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        State = AssetState.Assigned,
                        CategoryId = 2,
                        Location = "HCM"
                    });
                context.Users.AddRange(
                    new User
                    {
                        Id = 1,
                        FirstName = "xuan",
                        LastName = "tuan",
                        UserName = "xuantuan1",
                    },
                     new User
                     {
                         Id = 2,
                         FirstName = "xuan",
                         LastName = "tuan",
                         UserName = "xuantuan2",
                     }
                    );
                context.Assignments.AddRange(
                    new Assignment
                    {
                        Id = 1,
                        AssignedBy = 1,
                        AssignedTo = 2,
                        AssignedDate = new DateTime(2021, 9, 28),
                        AssetId = 1,
                        State = AssignmentState.Accepted,
                    }, new Assignment
                    {
                        Id = 2,
                        AssignedBy = 1,
                        AssignedTo = 2,
                        AssignedDate = new DateTime(2021, 9, 28),
                        AssetId = 1,
                        State = AssignmentState.Returned,
                    }, new Assignment
                    {
                        Id = 3,
                        AssignedBy = 1,
                        AssignedTo = 2,
                        AssignedDate = new DateTime(2021, 9, 28),
                        AssetId = 1,
                        State = AssignmentState.WaitingForAcceptance,
                    });
                context.ReturnRequests.Add(new ReturnRequest
                {
                    Id = 1,
                    AssignmentId = 2,
                    AcceptedBy = 2,
                    RequestedBy = 1,
                    ReturnedDate = new DateTime(2016, 9, 28),
                    State = ReturnRequestState.Completed
                });
                context.SaveChanges();

            }
            _dbContext = new ApplicationDbContext(options);
            _mockUserManager = new Mock<FakeUserManager>();
            _reportService = new ReportService(_dbContext);
        }

        [Fact]
        public async Task GetReports_WithSortByCategoryAndIsAscendingTrue_ReturnListReportVM()
        {
            // Arrange
            string sortBy = "category";
            bool isAscending = true;
            // Act
            var reports = await _reportService.GetReports(sortBy, isAscending);
            // Assert
            Assert.NotNull(reports);
            Assert.IsType<List<ReportVM>>(reports);
        }

        [Fact]
        public async Task ExportReports_WithReportList_ReturnResultTypeXLWorkbook()
        {
            // Arrange
            string sortBy = "category";
            bool isAscending = true;
            // Act
            var reports = await _reportService.GetReports(sortBy, isAscending);
            var result = _reportService.ExportReports(reports);
            // Assert
            Assert.NotNull(result);
            Assert.IsType<XLWorkbook>(result);
        }
    }
}

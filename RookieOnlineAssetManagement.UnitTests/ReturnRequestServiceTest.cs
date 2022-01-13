using Microsoft.EntityFrameworkCore;
using Moq;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Models.ReturnRequests;
using RookieOnlineAssetManagement.Services;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Threading.Tasks;
using Xunit;

namespace RookieOnlineAssetManagement.UnitTests
{
    public class ReturnRequestServiceTest
    {
        private readonly ReturnRequestService _returnRequestService;
        private readonly ApplicationDbContext _dbContext;
        private Mock<FakeUserManager> _mockUserManager;

        public ReturnRequestServiceTest()
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
                    }, new Assignment
                    {
                        Id = 4,
                        AssignedBy = 1,
                        AssignedTo = 2,
                        AssignedDate = new DateTime(2021, 9, 28),
                        AssetId = 1,
                        State = AssignmentState.WaitingForReturning,
                    });
                context.ReturnRequests.AddRange(
                    new ReturnRequest
                    {
                        Id = 1,
                        AssignmentId = 2,
                        AcceptedBy = 2,
                        RequestedBy = 1,
                        ReturnedDate = new DateTime(2016, 9, 28),
                        State = ReturnRequestState.Completed
                    }, new ReturnRequest
                    {
                        Id = 2,
                        AssignmentId = 2,
                        AcceptedBy = 2,
                        RequestedBy = 1,
                        ReturnedDate = new DateTime(2016, 9, 28),
                        State = ReturnRequestState.WaitingForReturning
                    }, new ReturnRequest
                    {
                        Id = 3,
                        AssignmentId = 2,
                        AcceptedBy = 2,
                        RequestedBy = 1,
                        ReturnedDate = new DateTime(2016, 9, 28),
                        State = ReturnRequestState.WaitingForReturning
                    },
                     new ReturnRequest
                     {
                         Id = 4,
                         AssignmentId = 4,
                         AcceptedBy = 2,
                         RequestedBy = 1,
                         ReturnedDate = new DateTime(2016, 9, 28),
                         State = ReturnRequestState.WaitingForReturning
                     });
                context.SaveChanges();

            }
            _dbContext = new ApplicationDbContext(options);
            _mockUserManager = new Mock<FakeUserManager>();
            _returnRequestService = new ReturnRequestService(_dbContext, _mockUserManager.Object);
        }

        [Fact]
        public async Task Create_WithAssignmentOfUser_ReturnOk()
        {
            // Arrange
            var request = new ReturnRequestCreate
            {
                AssignmentId = 1
            };
            // Act
            var requestId = await _returnRequestService.Create(request);
            var assignment = await _dbContext.Assignments.FindAsync(request.AssignmentId);
            // Assert
            Assert.True(requestId > 0);
            Asset.Equals(assignment.State, ReturnRequestState.WaitingForReturning);
        }
        [Fact]
        public async Task GetReturnRequestPagingFilterWithStatesAndReturnedDateFilter_ReturnPagedResultIncludeOneItem()
        {
            // Arrange
            var request = new ReturnRequestPagingFilterRequest
            {
                StatesFilter = $"{(int)ReturnRequestState.Completed},{(int)ReturnRequestState.Declined}",
                ReturnedDateFilter = new DateTime(2016, 9, 28).Date.ToString()
            };
            // Act
            var returnRequests = await _returnRequestService.GetReturnRequestPagingFilter(request);
            // Assert
            Assert.IsType<PagedResultBase<ReturnRequestVM>>(returnRequests);
            Assert.Equal(1, returnRequests.TotalRecords);
        }
        [Fact]
        public async Task GetDetailedReturnRequestWhichHasStateWaitingForReturning_ReturnReturnRequestVM()
        {
            // Arrange
            int returnRequestId = 2;
            // Act
            var returnRequest = await _returnRequestService.GetDetailedReturnRequest(returnRequestId);
            // Assert
            Assert.IsType<ReturnRequestVM>(returnRequest);
            Assert.Equal(ReturnRequestState.WaitingForReturning, _dbContext.ReturnRequests.Find(returnRequestId).State);
        }
        [Fact]
        public async Task CancelReturnRequestWithStateWaitingForReturning_ReturnTrue_ThenCheckReturnRequestIsDeclinedAndAssignmentStateIsAccepted()
        {
            // Arrange
            int returnRequestId = 4;
            // Act
            var returnRequest = await _dbContext.ReturnRequests.Include(r => r.Assignment).FirstOrDefaultAsync(x => x.Id == returnRequestId);
            var result = await _returnRequestService.CancelReturnRequest(returnRequestId);
            // Assert
            Assert.True(result);
            Assert.True(returnRequest.State == ReturnRequestState.Declined);
            Assert.True(returnRequest.Assignment.State == AssignmentState.Accepted);
        }
        [Fact]
        public async Task CancelReturnRequestWithStateIsNotCompleted_ReturnExeption()
        {
            // Arrange
            int returnRequestId = 1;
            // Act
            Func<Task> act = async () => await _returnRequestService.CancelReturnRequest(returnRequestId);
            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Contains("Cancel is only enabled for requests having state is “Waiting for returning”", exception.Message);
        }
    }
}

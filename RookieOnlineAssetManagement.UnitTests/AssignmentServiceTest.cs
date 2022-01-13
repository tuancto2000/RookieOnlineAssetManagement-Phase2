using Microsoft.EntityFrameworkCore;
using Moq;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Models.Assignments;
using RookieOnlineAssetManagement.Services;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace RookieOnlineAssetManagement.UnitTests
{
    public class AssignmentServiceTest
    {
        private readonly AssignmentService _assignmentService;
        private readonly ApplicationDbContext _dbContext;
        private Mock<FakeUserManager> _mockUserManager;

        public AssignmentServiceTest()
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
                        State = AssignmentState.Declined,
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
            _assignmentService = new AssignmentService(_dbContext, _mockUserManager.Object);
        }
        /*
         * Get paging full property filter by state filter by date
         * Get detailed with state diff Accepted and Wating for Acceptance state
         */
        [Fact]
        public async Task GetDetailedAssignmentWhichHasStateAccepted_ReturnAssignmentVM()
        {
            // Arrange
            int assignmentId = 1;
            // Act
            var assignment = await _assignmentService.GetDetailedAssignment(assignmentId);
            // Assert
            Assert.IsType<AssignmentVM>(assignment);
        }
        [Fact]
        public async Task GetDetailedAssignmentWhichHasStateDeclined_ReturnExeption()
        {
            // Arrange
            int assignmentId = 2;
            // Act
            Func<Task> act = async () => await _assignmentService.GetDetailedAssignment(assignmentId);
            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Contains("Get detaled assignment will be disable with Declined state", exception.Message);
        }
        [Fact]
        public async Task GetAssignmentPagingWithStatesAndAssignedDateFilter_ReturnPagedResultIncludeTwoItem()
        {
            // Arrange
            var request = new AssignmentPagingFilterRequest
            {
                StatesFilter = $"{(int)AssignmentState.Accepted},{(int)AssignmentState.WaitingForAcceptance}",
                AssignedDateFilter = new DateTime(2021, 9, 28).Date.ToString()
            };
            // Act
            var assignments = await _assignmentService.GetAssignmentPagingFilter(request);
            // Assert
            Assert.IsType<PagedResultBase<AssignmentVM>>(assignments);
            Assert.Equal(2, assignments.TotalRecords);
        }
        [Fact]
        public async Task GetOwnAssignments_WithUserName_ReturnAssignmentsOfThisUserName()
        {
            // Arrange
            var userName = "xuantuan1";
            var user = await _dbContext.Users.SingleOrDefaultAsync(x => x.UserName == userName);
            _mockUserManager.Setup(userManager => userManager.FindByNameAsync(It.IsAny<string>())).ReturnsAsync(user);
            
            var request = new AssignmentPagingFilterRequest
            {
                Location = "HCM"
            };
            // Act
            var assignments = await _assignmentService.GetOwnAssignments(request, userName);
            // Assert
            Assert.IsType<List<AssignmentVM>>(assignments);
        }
        [Fact]
        public async Task RespondAssignment_WithAssignmentIdAndIsAcceptTrue_ReturnAssignmentStateChangeToAcceptedSuccessfully()
        {
            // Arrange
            var assignmentId = 3;
            var isAccepted = true;
            // Act
            var assignments = await _assignmentService.RespondAssignment(assignmentId, isAccepted);
            // Assert
            Assert.True(assignments);
            Assert.Equal(AssignmentState.Accepted, _dbContext.Assignments.Find(assignmentId).State);
        }
        [Fact]
        public async Task RespondAssignment_WithAssignmentIdAndIsAcceptFalse_ReturnAssignmentStateChangeToDeclinedSuccessfully()
        {
            // Arrange
            var assignmentId = 3;
            var isAccepted = false;
            // Act
            var assignments = await _assignmentService.RespondAssignment(assignmentId, isAccepted);
            // Assert
            Assert.True(assignments);
            Assert.Equal(AssignmentState.Declined, _dbContext.Assignments.Find(assignmentId).State);
        }

        [Fact]
        public async Task CreateAssignment_ReturnNewDetailedAssignment()
        {
            //Arrange
            var assignment = new AssignmentCreateRequest()
            {
                AssignedBy = 1,
                AssignedTo = 2,
                AssetId = 2,
                AssignedDate = DateTime.Now,
                Note = "chien neymar jr"
            };
            // Act 
            var assignmentId = await _assignmentService.Create(assignment);
            //var newAssignment = await _assignmentService.GetDetailedAssignment(assignmentId);

            // Assert
            Assert.IsType<int>(assignmentId);
            //Assert.IsType<AssignmentVM>(newAssignment);
        }

        [Fact]
        public async Task EditAssignment_Test()
        {
            //Arrange
            var assignment = new AssignmentUpdateRequest()
            {
                Id = 2,
                AssignedDate = DateTime.Now,
                Note = "Ok cong chien"
            };
            // Act 
            var temp = await _assignmentService.Update(assignment);

            // Assert
            Assert.IsType<bool>(temp);
        }
        [Fact]
        public async Task DeleteAssignment_Test()
        {
            //Arrange
            int assignmentId = 3;
            // Act 
            var temp = await _assignmentService.Delete(assignmentId);

            // Assert
            Assert.IsType<bool>(temp);
        }
    }
}

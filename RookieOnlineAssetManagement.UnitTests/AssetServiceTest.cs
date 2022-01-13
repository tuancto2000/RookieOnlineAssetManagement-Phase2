using Microsoft.EntityFrameworkCore;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Models.Assets;
using RookieOnlineAssetManagement.Services;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace RookieOnlineAssetManagement.UnitTests
{
    public class AssetServiceTest
    {
        private readonly AssetService _assetService;

        public AssetServiceTest()
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
                        AssignedDate = new DateTime(2015, 9, 28),
                        AssetId = 1,
                        State = AssignmentState.Accepted,
                    });
                context.ReturnRequests.Add(new ReturnRequest
                {
                    Id = 1,
                    AssignmentId = 1,
                    AcceptedBy = 2,
                    RequestedBy = 1,
                    ReturnedDate = new DateTime(2016, 9, 28),
                    State = ReturnRequestState.Completed
                });
                context.SaveChanges();

            }
            var mockContext = new ApplicationDbContext(options);
            _assetService = new AssetService(mockContext);
        }
        [Fact]
        public async Task CreateAssetWithExistedCategory_ReturnNewDetailedAsset()
        {
            //Arrange
            var request = new AssetCreateRequest()
            {
                Name = "Lorem Ipsum",
                Specification = "Lorem ipsum ",
                InstalledDate = new DateTime(2015, 12, 28),
                IsAvailable = true,
                CategoryId = 1,
            };
            // Act 
            var assetId = await _assetService.Create(request);
            var newAsset = await _assetService.GetDetailedAsset(assetId);

            // Assert
            Assert.IsType<int>(assetId);
            Assert.IsType<AssetVM>(newAsset);
            Assert.Equal(request.Specification, newAsset.Specification);
            Assert.Equal(request.Name, newAsset.Name);
        }
        [Fact]
        public async Task CreateAssetWithNewCategory_ReturnNewDetailedAsset()
        {
            //Arrange
            var request = new AssetCreateRequest()
            {
                Name = "Lorem Ipsum",
                Specification = "Lorem ipsum ",
                InstalledDate = new DateTime(2015, 12, 28),
                IsAvailable = true,
                CategoryName = "laptop Dell"
            };
            // Act 
            var assetId = await _assetService.Create(request);
            var newAsset = await _assetService.GetDetailedAsset(assetId);
            var newCategoryCode = _assetService.GenerateCategoryCode(request.CategoryName);
            var newCategory = await _assetService.GetCategoryByCode(newCategoryCode);
            // Assert
            Assert.Equal("LD", newCategoryCode);
            Assert.IsType<CategoryVM>(newCategory);
            Assert.IsType<int>(assetId);
            Assert.IsType<AssetVM>(newAsset);
            Assert.Equal(request.Specification, newAsset.Specification);
            Assert.Equal(request.Name, newAsset.Name);
        }
        [Fact]
        public void GenerateCategoryCode()
        {
            //Arrange
            var input1 = "laptop";
            var input2 = "laptop Dell";
            var input3 = "laptop dell gaming";
            var expectedOutput1 = "LA";
            var expectedOutput2 = "LD";
            var expectedOutput3 = "LDG";
            // Act 
            var output1 = _assetService.GenerateCategoryCode(input1);
            var output2 = _assetService.GenerateCategoryCode(input2);
            var output3 = _assetService.GenerateCategoryCode(input3);
            // Assert
            Assert.Equal(output1, expectedOutput1);
            Assert.Equal(output2, expectedOutput2);
            Assert.Equal(output3, expectedOutput3);
        }
        [Fact]
        public async Task EditAssetSuccessfully()
        {
            //Arrange
            var request = new AssetUpdateRequest()
            {
                Id = 2,
                Name = "Lorem Ipsum",
                Specification = "Lorem ipsum ",
                InstalledDate = new DateTime(2015, 12, 28),
                State = AssetState.Available,
            };
            // Act
            var result = await _assetService.Update(request);
            var asset = await _assetService.GetDetailedAsset(request.Id);
            // Assert
            Assert.True(result);
            Assert.IsType<AssetVM>(asset);
            Assert.Equal(request.Specification, asset.Specification);
            Assert.Equal(request.Name, asset.Name);
            Assert.Equal(request.State, asset.State);
        }
        // Edit on assigned asset
        [Fact]
        public async Task EditOnAssignedAsset_ReturnExeption()
        {
            //Arrange
            var request = new AssetUpdateRequest()
            {
                Id = 3,
                Name = "Lorem Ipsum",
                Specification = "Lorem ipsum ",
                InstalledDate = new DateTime(2015, 12, 28),
                State = AssetState.Available,
            };
            // Act
            Func<Task> act = async () => await _assetService.Update(request);
            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Contains("Cannot edit a asset with state Assigned", exception.Message);
        }
        [Fact]
        public async Task DeleteAssetSuccessfullyThenCheckDeletedAssetIsExisted()
        {
            // Arrange
            int assetId = 2;
            // Act
            var result = await _assetService.Delete(assetId);
            Func<Task> act = async () => await _assetService.GetDetailedAsset(assetId);
            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.True(result);
            Assert.Contains("Cannot find a asset with id", exception.Message);

        }
        [Fact]
        public async Task DeleteAssetHasAssignmentHistories_ReturnExeption()
        {
            // Arrange
            int assetId = 1;
            // Act
            Func<Task> act = async () => await _assetService.Delete(assetId);
            // Assert
            var exception = await Assert.ThrowsAsync<Exception>(act);
            Assert.Contains("Cannot delete the asset because it belongs to one or more historical assignments", exception.Message);
        }
        [Fact]
        public async Task GetDetailsAssetHasAssignmentHistories()
        {
            // Arrange
            int assetId = 1;
            // Act
            var asset = await _assetService.GetDetailedAsset(assetId);
            // Assert
            Assert.IsType<AssetVM>(asset);
            Assert.True(asset.Histories.Count > 0);
        }
        [Fact]
        public async Task GetAssetPagingFilter()
        {
            // Arrange
            var request = new AssetPagingFilterRequest
            {
                KeyWord = "tuan",
                CategoriesFilter = "1,2"
            };
            // Act
            var assets = await _assetService.GetAssetsPagingFilter(request);
            // Assert
            Assert.IsType<PagedResultBase<AssetVM>>(assets);
        }
    }
}

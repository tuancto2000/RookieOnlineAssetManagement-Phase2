using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Interfaces;
using RookieOnlineAssetManagement.Models;
using RookieOnlineAssetManagement.Models.Assets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RookieOnlineAssetManagement.Data.Enums;
using System.Text;
using RookieOnlineAssetManagement.ExtensionMethods;
using RookieOnlineAssetManagement.Shared;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text.RegularExpressions;

namespace RookieOnlineAssetManagement.Services
{
    public class AssetService : IAssetService
    {
        private readonly ApplicationDbContext _context;

        public AssetService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<int> Create(AssetCreateRequest request)
        {
            var checkCategory = await _context.Categories.FindAsync(request.CategoryId);
            if (checkCategory == null)
            {
                string newCode = GenerateCategoryCode(request.CategoryName);
                var checkCodeExist = _context.Categories.FirstOrDefault(x => x.Code == newCode);
                if (checkCodeExist != null)
                    throw new Exception("Category code is already existed");
                var category = await _context.Categories.FindAsync(request.CategoryId);
                var newCategory = new Category()
                {
                    Name = CapitalizeEachWord(request.CategoryName),
                    Code = newCode,
                    CreatedDate = DateTime.Now
                };
                _context.Categories.Add(newCategory);
                await _context.SaveChangesAsync();
                request.CategoryId = newCategory.Id;
            }
            var asset = new Asset()
            {
                Name = request.Name,
                Specification = request.Specification,
                State = request.IsAvailable == true ? AssetState.Available : AssetState.NotAvailable,
                InstalledDate = request.InstalledDate,
                CreatedDate = DateTime.Now,
                CategoryId = request.CategoryId,
                Location = request.Location
            };
            asset.Code = GenerateAssetCode(asset.CategoryId);
            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();
            return asset.Id;
        }

        public async Task<bool> Delete(int assetId)
        {
            var asset = await _context.Assets.Include(a => a.Assignments).FirstOrDefaultAsync(a => a.Id == assetId);
            if (asset == null)
                throw new Exception($"Cannot find a asset with id {assetId}");
            if (asset.Assignments.Count > 0)
                throw new Exception($"Cannot delete the asset because it belongs to one or more historical assignments.");
            _context.Assets.Remove(asset);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<AssetVM> GetDetailedAsset(int assetId)
        {
            var asset = await _context.Assets.Include(a => a.Assignments).FirstOrDefaultAsync(a => a.Id == assetId);
            if (asset == null)
                throw new Exception($"Cannot find a asset with id {assetId}");
            var histories = new List<AssignmentHistory>();
            if (asset.Assignments.Count > 0)
                foreach (var assignment in asset.Assignments)
                {
                    var query = _context.ReturnRequests.FirstOrDefault(rr => rr.AssignmentId == assignment.Id
                                        && rr.State == ReturnRequestState.Completed);
                    if (query == null) continue;
                    histories.Add(new AssignmentHistory()
                    {

                        ReturnedDate = query.ReturnedDate,
                        AssignedDate = assignment.AssignedDate,
                        AssignedBy = _context.Users.Find(assignment.AssignedBy).UserName,
                        AssignedTo = _context.Users.Find(assignment.AssignedTo).UserName,

                    });
                }
            var category = await _context.Categories.FindAsync(asset.CategoryId);
            var detailedAsset = new AssetVM()
            {
                Id = asset.Id,
                Code = asset.Code,
                Name = asset.Name,
                Category = new CategoryVM
                {
                    Id = category.Id,
                    Code = category.Code,
                    Name = category.Name,
                },
                InstalledDate = asset.InstalledDate,
                State = asset.State,
                Location = asset.Location,
                Specification = asset.Specification,
                Histories = histories != null && histories.Count > 0 ? histories : null
            };
            return detailedAsset;
        }

        public async Task<PagedResultBase<AssetVM>> GetAssetsPagingFilter(AssetPagingFilterRequest request)
        {
            // Standardize
            if (request.IsSortByUpdatedDate == true) request.StatesFilter += ",3,4";
            List<int> categories = request.CategoriesFilter != null ? request.CategoriesFilter.Split(',').Select(Int32.Parse).ToList() : new List<int>();
            List<int> states = request.StatesFilter != null ? request.StatesFilter.Split(',').Select(Int32.Parse).ToList() : new List<int>();
            // Filter
            IQueryable<Asset> query = _context.Assets.AsQueryable();
            query = query.WhereIf(request.Location != null, x => x.Location == request.Location);
            query = query.WhereIf(request.KeyWord != null, x => x.Name.Contains(request.KeyWord) || x.Code.Contains(request.KeyWord));
            query = query.WhereIf(categories != null && categories.Count > 0, x => categories.Contains(x.CategoryId));
            // Sort
            if (request.IsSortByCreatedDate == true || request.IsSortByUpdatedDate == true)
            {
                var latestElement = query.FirstIf(request.IsSortByCreatedDate == true, request.IsSortByUpdatedDate == true, x => x.CreatedDate, x => x.UpdatedDate);
                query = query.OrderBy(x => x.Id == latestElement.Id ? 0 : 1).ThenBy(x => x.Code);
            }
            else
            {
               
                query = query.WhereIf(states != null && states.Count > 0, x => states.Contains((int)x.State));
                query = query.OrderByIf(request.SortBy == "name", x => x.Name, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "category", x => x.Category.Name, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "state", x => x.State, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "code", x => x.Code, request.IsAscending);
            }

            // Paging and Projection
            var totalRecord = await query.CountAsync();
            var data = await query.Paged(request.PageIndex, request.PageSize).Select(a => new AssetVM()
            {
                Id = a.Id,
                Code = a.Code,
                Name = a.Name,
                Category = new CategoryVM
                {
                    Id = a.Category.Id,
                    Code = a.Category.Code,
                    Name = a.Category.Name,
                },
                State = a.State
            }).ToListAsync();
            var pagedResult = new PagedResultBase<AssetVM>()
            {
                TotalRecords = totalRecord,
                PageSize = request.PageSize,
                PageIndex = request.PageIndex,
                Items = data
            };
            return pagedResult;
        }

        public async Task<bool> Update(AssetUpdateRequest request)
        {
            var asset = await _context.Assets.FindAsync(request.Id);
            if (asset == null)
                throw new Exception($"Cannot find a asset with id {request.Id}");
            if (asset.State == AssetState.Assigned)
                throw new Exception($"Cannot edit a asset with state Assigned");
            asset.State = request.State;
            asset.Name = request.Name;
            asset.Specification = request.Specification;
            asset.InstalledDate = request.InstalledDate;
            asset.UpdatedDate = DateTime.Now;
            _context.Assets.Update(asset);
            return await _context.SaveChangesAsync() > 0;

        }

        public List<CategoryVM> GetAllCategories()
        {
            var categories = _context.Categories.OrderBy(x => x.Name).Select(c => new CategoryVM
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code
            }).ToList();
            return categories;
        }
        public async Task<CategoryVM> GetCategoryByCode(string code)
        {
            var query = await _context.Categories.FirstOrDefaultAsync(c => c.Code == code);
            var category = new CategoryVM
            {
                Id = query.Id,
                Name = query.Name,
                Code = query.Code
            };
            return category;
        }
        public List<StateVM> GetAllAssetStates()
        {
            List<StateVM> assetStateList = new List<StateVM>();
            foreach (var state in (AssetState[])Enum.GetValues(typeof(AssetState)))
            {
                assetStateList.Add(new StateVM
                {
                    Name = AddSpacesToSentence(state.ToString()),
                    Value = (int)state,

                });
            }
            return assetStateList;
        }
        public string GenerateAssetCode(int categoryId)
        {
            string categoryCode = _context.Categories.FirstOrDefault(c => c.Id == categoryId).Code;
            var maxAssetCode = _context.Assets.Where(a => a.CategoryId == categoryId)
                                              .OrderByDescending(a => a.Code).FirstOrDefault();

            int number = maxAssetCode != null ? Convert.ToInt32(maxAssetCode.Code.Replace(categoryCode, "")) + 1 : 1;
            string newAssetCode = categoryCode + number.ToString("D6");
            return newAssetCode;
        }
        public string GenerateCategoryCode(string categoryName)
        {
            List<string> words = categoryName.Split(' ').ToList();
            if (words.Count == 1)
                return categoryName.Substring(0, 2).ToUpper();
            StringBuilder categoryCode = new StringBuilder();
            foreach (var word in words)
            {
                categoryCode.Append(Char.ToUpper(word[0]));
            };
            return categoryCode.ToString();
        }
        public string CapitalizeEachWord(string categoryName)
        {
            TextInfo textInfo = new CultureInfo("en-US", false).TextInfo;
            return textInfo.ToTitleCase(categoryName);
        }
        private string AddSpacesToSentence(string text)
        {
            return Regex.Replace(text, "([a-z])([A-Z])", "$1 $2");
        }
        public async Task<int> CreateCategory(string request)
        {
            string newCode = GenerateCategoryCode(request);
            var checkCodeExist = _context.Categories.FirstOrDefault(x => x.Code == newCode);
            var newCategory = new Category()
            {
                Name = CapitalizeEachWord(request),
                Code = newCode,
                CreatedDate = DateTime.Now
            };
            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();
            return newCategory.Id;
        }
    }
}

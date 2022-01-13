using RookieOnlineAssetManagement.Models;
using RookieOnlineAssetManagement.Models.Assets;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Interfaces
{
    public interface IAssetService
    {
        public Task<int> Create(AssetCreateRequest request);
        public Task<bool> Delete(int assetId);
        public Task<AssetVM> GetDetailedAsset(int assetId);
        public Task<bool> Update(AssetUpdateRequest request);
        public Task<PagedResultBase<AssetVM>> GetAssetsPagingFilter(AssetPagingFilterRequest request);
        public List<CategoryVM> GetAllCategories();
        public List<StateVM> GetAllAssetStates();
        public Task<int> CreateCategory(string request);

    }
}

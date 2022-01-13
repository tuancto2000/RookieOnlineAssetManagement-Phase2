using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assets
{
    public class AssetPagingFilterRequest 
    {
        public string KeyWord { get; set; }
        public string StatesFilter { get; set; }
        public string CategoriesFilter { get; set; }
        public string SortBy { get; set; }
        public bool IsAscending { get; set; }
        public bool IsSortByUpdatedDate { get; set; }
        public bool IsSortByCreatedDate { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public AssetPagingFilterRequest()
        {
            IsAscending = true;
            //StatesFilter = $"{(int)AssetState.Available},{(int)AssetState.NotAvailable},{(int)AssetState.Assigned}";
            PageIndex = 1;
            PageSize = 5;
        }
        public string Location { get; set; }
    }
}

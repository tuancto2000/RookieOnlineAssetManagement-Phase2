using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.ReturnRequests
{
    public class ReturnRequestPagingFilterRequest
    {
        public string KeyWord { get; set; }
        public string StatesFilter { get; set; }
        public string ReturnedDateFilter { get; set; }
        public string SortBy { get; set; }
        public bool IsAscending { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public ReturnRequestPagingFilterRequest()
        {
            IsAscending = true;
            //StatesFilter = $"{(int)AssetState.Available},{(int)AssetState.NotAvailable},{(int)AssetState.Assigned}";
            PageIndex = 1;
            PageSize = 5;
        }
        public string Location { get; set; }
    }
}

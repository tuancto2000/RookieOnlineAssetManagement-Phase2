using RookieOnlineAssetManagement.Models;
using RookieOnlineAssetManagement.Models.Assignments;
using RookieOnlineAssetManagement.Models.ReturnRequests;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Interfaces
{
    public interface IReturnRequestService
    {
        public Task<int> Create(ReturnRequestCreate request);
        public Task<ReturnRequestVM> GetDetailedReturnRequest(int returnRequestId);
        public Task<PagedResultBase<ReturnRequestVM>> GetReturnRequestPagingFilter(ReturnRequestPagingFilterRequest request);
        public Task<bool> CancelReturnRequest(int returnRequestId);
        public List<StateVM> GetRequestStates();
        public Task<int> IsCreating(ReturnRequestCreateRequest request);
        public Task<bool> Complete(ReturnRequestCreateRequest request);
    }
}

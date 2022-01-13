using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.ExtensionMethods;
using RookieOnlineAssetManagement.Interfaces;
using RookieOnlineAssetManagement.Models;
using RookieOnlineAssetManagement.Models.ReturnRequests;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Services
{
    public class ReturnRequestService : IReturnRequestService
    {
        private readonly ApplicationDbContext _dbcontext;
        private readonly UserManager<User> _userManager;

        public ReturnRequestService(ApplicationDbContext dbcontext, UserManager<User> userManager)
        {
            _dbcontext = dbcontext;
            _userManager = userManager;
        }

        public async Task<int> Create(ReturnRequestCreate request)
        {
            var assignment = await _dbcontext.Assignments.FindAsync(request.AssignmentId);
            if (assignment == null)
                throw new Exception($"Cannot find assignment with ID {request.AssignmentId}");
            if (assignment.State != AssignmentState.Accepted)
                throw new Exception($"Assignment have to be Accepted before");

            var returnRequest = new ReturnRequest
            {
                State = ReturnRequestState.WaitingForReturning,
                RequestedBy = request.RequestBy,
                AssignmentId = request.AssignmentId
            };
            _dbcontext.ReturnRequests.Add(returnRequest);

            assignment.State = AssignmentState.WaitingForReturning;
            await _dbcontext.SaveChangesAsync();

            return returnRequest.Id;
        }

        public async Task<PagedResultBase<ReturnRequestVM>> GetReturnRequestPagingFilter(ReturnRequestPagingFilterRequest request)
        {
            // Standardize
            var returnedDate = Convert.ToDateTime(request.ReturnedDateFilter);
            var a = returnedDate.Date;
            List<int> states = request.StatesFilter != null ? request.StatesFilter.Split(',').Select(Int32.Parse).ToList() : new List<int>();

            // Filter
            IQueryable<ReturnRequest> query = _dbcontext.ReturnRequests.AsQueryable();
            query = query.WhereIf(request.KeyWord != null, x => x.Assignment.Asset.Code.Contains(request.KeyWord)
                                    || x.Assignment.Asset.Name.Contains(request.KeyWord) || x.RequestedUser.UserName.Contains(request.KeyWord));
            query = query.WhereIf(states != null && states.Count > 0, x => states.Contains((int)x.State));
            query = query.WhereIf(returnedDate != System.DateTime.MinValue, x => x.ReturnedDate.Value.Date == returnedDate.Date);
            query = query.WhereIf(request.Location != null, x => x.Assignment.Asset.Location == request.Location);

            // Sort
            query = query.OrderByIf(request.SortBy == "no.", x => x.Id, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "assetCode", x => x.Assignment.Asset.Code, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "assetName", x => x.Assignment.Asset.Name, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "requestedBy", x => x.RequestedUser.UserName, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "acceptedBy", x => x.AcceptedUser.UserName, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "assignedDate", x => x.Assignment.AssignedDate, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "returnedDate", x => x.ReturnedDate, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "state", x => x.State, !request.IsAscending);

            // Paging and Projection
            var totalRecord = await query.CountAsync();
            var data = await query.Paged(request.PageIndex, request.PageSize).Select((a) => new ReturnRequestVM()
            {
                Id = a.Id,
                // Ordinal = index,
                AssignedDate = a.Assignment.AssignedDate,
                ReturnedDate = a.ReturnedDate,
                State = a.State,
                AssetCode = a.Assignment.Asset.Code,
                AssetName = a.Assignment.Asset.Name,
                RequestByName = a.RequestedUser.UserName,
                AcceptedByName = a.AcceptedUser.UserName,
            }).ToListAsync();
            for (int i = 0; i < data.Count; i++)
            {
                data[i].Ordinal = request.IsAscending ? (request.PageIndex - 1) * request.PageSize + i + 1
                    : (request.PageIndex - 1) * request.PageSize + data.Count - i;
            }
            var pagedResult = new PagedResultBase<ReturnRequestVM>()
            {
                TotalRecords = totalRecord,
                PageSize = request.PageSize,
                PageIndex = request.PageIndex,
                Items = data
            };
            return pagedResult;
        }

        public async Task<ReturnRequestVM> GetDetailedReturnRequest(int returnRequestId)
        {
            var returnRequest = await _dbcontext.ReturnRequests.Include(a => a.Assignment)
                                                               .Include(a => a.Assignment.Asset)
                                                               .Include(a => a.RequestedUser)
                                                               .Include(a => a.AcceptedUser)
                                                               .FirstOrDefaultAsync(a => a.Id == returnRequestId);
            if (returnRequest == null)
                throw new Exception($"Cannot find Return Request with id {returnRequestId}");

            var detailedReturnRequest = new ReturnRequestVM
            {
                Id = returnRequest.Id,
                AssignedDate = returnRequest.Assignment.AssignedDate,
                ReturnedDate = returnRequest.ReturnedDate,
                State = returnRequest.State,
                AssetCode = returnRequest.Assignment.Asset.Code,
                AssetName = returnRequest.Assignment.Asset.Name,
                RequestByName = returnRequest.RequestedUser.UserName,
                AcceptedByName = returnRequest.AcceptedUser?.UserName,
            };
            return detailedReturnRequest;
        }

        public List<StateVM> GetRequestStates()
        {
            List<StateVM> stateList = new List<StateVM>();
            stateList.Add(new StateVM
            {
                Name = ReturnRequestState.Completed.ToString(),
                Value = (int)ReturnRequestState.Completed
            });
            stateList.Add(new StateVM
            {
                Name = AddSpacesToSentence(ReturnRequestState.WaitingForReturning.ToString()),
                Value = (int)ReturnRequestState.WaitingForReturning
            });
            return stateList;
        }

        public async Task<int> IsCreating(ReturnRequestCreateRequest request)
        {
            var assignment = await _dbcontext.Assignments.FindAsync(request.AssignmentId);
            if (assignment == null)
                throw new Exception($"Cannot find assignment with ID {request.AssignmentId}");
            if (assignment.State != AssignmentState.Accepted)
                throw new Exception($"Assignment have to be Accepted before");

            var returnRequest = new ReturnRequest
            {
                AssignmentId = request.AssignmentId,
                //ReturnedDate = DateTime.Now,
                State = ReturnRequestState.WaitingForReturning,
                RequestedBy = request.RequestedBy,
                //AcceptedBy = request.AcceptedBy
            };
            _dbcontext.ReturnRequests.Add(returnRequest);
            assignment.State = AssignmentState.WaitingForReturning;
            await _dbcontext.SaveChangesAsync();
            return returnRequest.Id;
        }

        public async Task<bool> Complete(ReturnRequestCreateRequest request)
        {

            var returnRequest = await _dbcontext.ReturnRequests.FindAsync(request.Id);
            if (returnRequest.State != ReturnRequestState.WaitingForReturning)
            {
                throw new Exception("Completed is enabled for only requests having state is “Waiting for returning”");
            }
            returnRequest.ReturnedDate = DateTime.Now;
            returnRequest.State = ReturnRequestState.Completed;
            returnRequest.AcceptedBy = request.AcceptedBy;

            _dbcontext.ReturnRequests.Update(returnRequest);
            var assignment = await _dbcontext.Assignments.Include(x => x.Asset).FirstOrDefaultAsync(x => x.Id == returnRequest.AssignmentId);
            assignment.State = AssignmentState.Returned;
            assignment.Asset.State = AssetState.Available;


            return await _dbcontext.SaveChangesAsync() > 0;
        }

        public async Task<bool> CancelReturnRequest(int returnRequestId)
        {
            var returnRequest = await _dbcontext.ReturnRequests.FindAsync(returnRequestId);
            if (returnRequest == null)
                throw new Exception($"Cannot find return request with ID {returnRequestId}");
            if (returnRequest.State != ReturnRequestState.WaitingForReturning)
                throw new Exception($"Cancel is only enabled for requests having state is “Waiting for returning”");

            returnRequest.State = ReturnRequestState.Declined;
            _dbcontext.ReturnRequests.Update(returnRequest);

            var assignment = await _dbcontext.Assignments.FindAsync(returnRequest.AssignmentId);
            assignment.State = AssignmentState.Accepted;
            // _dbcontext.Assignments.Update(assignment);
            return await _dbcontext.SaveChangesAsync() > 0;
        }

        private string AddSpacesToSentence(string text)
        {
            return Regex.Replace(text, "([a-z])([A-Z])", "$1 $2");
        }
    }
}

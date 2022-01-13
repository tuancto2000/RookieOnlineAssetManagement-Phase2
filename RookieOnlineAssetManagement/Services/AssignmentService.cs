using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.ExtensionMethods;
using RookieOnlineAssetManagement.Interfaces;
using RookieOnlineAssetManagement.Models;
using RookieOnlineAssetManagement.Models.Assignments;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly ApplicationDbContext _dbcontext;
        private readonly UserManager<User> _userManager;

        public AssignmentService(ApplicationDbContext dbcontext, UserManager<User> userManager)
        {
            _dbcontext = dbcontext;
            _userManager = userManager;
        }

        public async Task<int> Create(AssignmentCreateRequest request)
        {
            if (request.AssignedDate < DateTime.Now.Date)
                throw new Exception("Admin can select only current or future date for Assigned Date");
            var assignment = new Assignment
            {
                AssetId = request.AssetId,
                AssignedDate = request.AssignedDate,
                Note = request.Note,
                AssignedTo = request.AssignedTo,
                AssignedBy = request.AssignedBy,
                CreatedDate = DateTime.Now,
                State = AssignmentState.WaitingForAcceptance
            };
            _dbcontext.Assignments.Add(assignment);

            var asset = await _dbcontext.Assets.FindAsync(assignment.AssetId);
            asset.State = AssetState.Assigned;
            _dbcontext.Assets.Update(asset);
            await _dbcontext.SaveChangesAsync();

            return assignment.Id;
        }

        public async Task<bool> Delete(int assignmentId)
        {
            var assignment = await _dbcontext.Assignments.FindAsync(assignmentId);
            if (assignment == null)
                throw new Exception($"Cannot find assignment with id {assignmentId}");
            if (assignment.State != AssignmentState.WaitingForAcceptance)
                throw new Exception("Delete is enabled for only \"Waiting for acceptance\" assignment");
            _dbcontext.Assignments.Remove(assignment);

            var asset = await _dbcontext.Assets.FindAsync(assignment.AssetId);
            asset.State = AssetState.Available;
            _dbcontext.Assets.Update(asset);

            return await _dbcontext.SaveChangesAsync() > 0;
        }

        public async Task<PagedResultBase<AssignmentVM>> GetAssignmentPagingFilter(AssignmentPagingFilterRequest request)
        {
            // Standardize
            var assignedDate = Convert.ToDateTime(request.AssignedDateFilter);
            List<int> states = request.StatesFilter != null ? request.StatesFilter.Split(',').Select(Int32.Parse).ToList() : new List<int>();
            // Filter
            IQueryable<Assignment> query = _dbcontext.Assignments.AsQueryable();
           
            query = query.WhereIf(states != null && states.Count > 0, x => states.Contains((int)x.State));
            query = query.WhereIf(assignedDate != System.DateTime.MinValue, x => x.AssignedDate == assignedDate);
            query = query.WhereIf(request.Location != null, x => x.Asset.Location == request.Location);
            // Sort
            if (request.IsSortByCreatedDate == true || request.IsSortByUpdatedDate == true)
            {
                var latestElement = query.FirstIf(request.IsSortByCreatedDate == true, request.IsSortByUpdatedDate == true, x => x.CreatedDate, x => x.UpdatedDate);
                query = query.OrderBy(x => x.Id == latestElement.Id ? 0 : 1).ThenBy(x => x.Asset.Code);
            }
            else
            {
                query = query.OrderByIf(request.SortBy == "no.", x => x.Id, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "assetCode", x => x.Asset.Code, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "assetName", x => x.Asset.Name, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "assignedTo", x => x.AssignToUser.UserName, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "assignedBy", x => x.AssignByUser.UserName, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "assignedDate", x => x.AssignedDate, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "state", x => x.State, !request.IsAscending);
            }
            query = query.WhereIf(request.KeyWord != null, x => x.Asset.Code.Contains(request.KeyWord)
                                   || x.Asset.Name.Contains(request.KeyWord) || x.AssignToUser.UserName.Contains(request.KeyWord));
            // Paging and Projection
            var totalRecord = query.Any() ? await query.CountAsync() : 0;
            var data = await query.Paged(request.PageIndex, request.PageSize).Select((a) => new AssignmentVM()
            {
                Id = a.Id,
                // Ordinal = index,
                AssignedDate = a.AssignedDate,
                State = a.State,
                AssetCode = a.Asset.Code,
                AssetName = a.Asset.Name,
                AssignedByName = a.AssignByUser.UserName,
                AssignedToName = a.AssignToUser.UserName,
            }).ToListAsync();
            for (int i = 0; i < data.Count; i++)
            {
                data[i].Ordinal = request.IsAscending ? (request.PageIndex - 1) * request.PageSize + i + 1
                    : (request.PageIndex -1) * request.PageSize + data.Count - i;
            }
            var pagedResult = new PagedResultBase<AssignmentVM>()
            {
                TotalRecords = totalRecord,
                PageSize = request.PageSize,
                PageIndex = request.PageIndex,
                Items = data
            };
            return pagedResult;
        }

        public List<StateVM> GetAssignmentStates()
        {
            List<StateVM> stateList = new List<StateVM>();
            stateList.Add(new StateVM
            {
                Name = AddSpacesToSentence(AssignmentState.Accepted.ToString()),
                Value = (int)AssignmentState.Accepted
            });
            stateList.Add(new StateVM
            {
                Name = AddSpacesToSentence(AssignmentState.WaitingForAcceptance.ToString()),
                Value = (int)AssignmentState.WaitingForAcceptance
            });
            stateList.Add(new StateVM
            {
                Name = AddSpacesToSentence(AssignmentState.WaitingForReturning.ToString()),
                Value = (int)AssignmentState.WaitingForReturning
            });
            return stateList;
        }

        public async Task<AssignmentVM> GetDetailedAssignment(int assignmentId)
        {
            var assignment = await _dbcontext.Assignments.Include(a => a.AssignByUser).Include(a => a.AssignToUser)
                                                          .Include(a => a.Asset).FirstOrDefaultAsync(a => a.Id == assignmentId);
            if (assignment == null)
                throw new Exception($"Cannot find assignment with id {assignmentId}");
            if(assignment.State != AssignmentState.Accepted 
                && assignment.State != AssignmentState.WaitingForAcceptance 
                && assignment.State != AssignmentState.WaitingForReturning
                && assignment.State != AssignmentState.Returned)
            {
                throw new Exception($"Get detaled assignment will be disable with Declined state");
            }
            var detailedAssignment = new AssignmentVM
            {
                Id = assignment.Id,
                AssignedDate = assignment.AssignedDate,
                State = assignment.State,
                AssetCode = assignment.Asset.Code,
                AssetName = assignment.Asset.Name,
                Note = assignment.Note,
                Specification = assignment.Asset.Specification,
                AssignedByName = assignment.AssignByUser.UserName,
                AssignedToName = assignment.AssignToUser.UserName,
            };
            return detailedAssignment;
        }

        public async Task<bool> RespondAssignment(int assignmentId, bool isAccepted)
        {
            var assignment = await _dbcontext.Assignments.Include(a => a.Asset).FirstOrDefaultAsync(a => a.Id == assignmentId);
            if (assignment == null)
                throw new Exception($"Cannot find assignment with id {assignmentId}");
            if (assignment.State != AssignmentState.WaitingForAcceptance)
                throw new Exception("RespondAssignment is enabled for only assignments have state is Waiting for acceptance");
            assignment.State = isAccepted ? AssignmentState.Accepted : AssignmentState.Declined;
            _dbcontext.Assignments.Update(assignment);

            if(!isAccepted)
            {
                var asset = await _dbcontext.Assets.FindAsync(assignment.AssetId);
                asset.State = AssetState.Available;
                _dbcontext.Assets.Update(asset);
            }
          
            return await _dbcontext.SaveChangesAsync() > 0;

        }

        public async Task<bool> Update(AssignmentUpdateRequest request)
        {
            if (request.AssignedDate < DateTime.Now.Date)
                throw new Exception("Admin can select only current or future date for Assigned Date");
            var assignment = await _dbcontext.Assignments.FindAsync(request.Id);
            if (assignment == null)
                throw new Exception($"Cannot find assignment with id {request.Id}");
            assignment.AssignedDate = request.AssignedDate;
            if (request.Note != null && request.Note != "null")
                assignment.Note = request.Note;
            else assignment.Note = null;
            assignment.UpdatedDate = DateTime.Now;
            _dbcontext.Assignments.Update(assignment);
            return await _dbcontext.SaveChangesAsync() > 0;
        }

        public async Task<List<AssignmentVM>> GetOwnAssignments(AssignmentPagingFilterRequest request, string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                throw new Exception($"Cannot find user with id {user.Id}");

            // Filter
            IQueryable<Assignment> query = _dbcontext.Assignments.AsQueryable();

            query = query.WhereIf(user != null, x => x.AssignToUser.Id == user.Id);
            query = query.WhereIf(user != null, x => x.AssignedDate <= DateTime.Now);
            query = query.WhereIf(request.Location != null, x => x.Asset.Location == request.Location);

            query = query.OrderByIf(request.SortBy == "assetCode", x => x.Asset.Code, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "assetName", x => x.Asset.Name, request.IsAscending);
            query = query.OrderByIf(request.SortBy == "state", x => x.State, !request.IsAscending);

            var assignments = await query.Select((x) => new AssignmentVM()
            {
                Id = x.Id,
                AssetCode = x.Asset.Code,
                AssetName = x.Asset.Name,
                Specification = x.Asset.Specification,
                AssignedToName = x.AssignToUser.UserName,
                AssignedByName = x.AssignByUser.UserName,
                State = x.State,
                Note = x.Note

            }).ToListAsync();

            return assignments;
        }
        private string AddSpacesToSentence(string text)
        {
            return Regex.Replace(text, "([a-z])([A-Z])", "$1 $2");
        }
    }
}

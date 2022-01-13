using RookieOnlineAssetManagement.Models;
using RookieOnlineAssetManagement.Models.Assignments;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Interfaces
{
    public interface IAssignmentService
    {
        public Task<int> Create(AssignmentCreateRequest request);
        public Task<bool> Delete(int assignmentId); 
        public Task<AssignmentVM> GetDetailedAssignment(int assignmentId);
        public Task<bool> Update(AssignmentUpdateRequest request);
        public Task<PagedResultBase<AssignmentVM>> GetAssignmentPagingFilter(AssignmentPagingFilterRequest request);
        public List<StateVM> GetAssignmentStates();
        public Task<bool> RespondAssignment(int assignmentId, bool isAccepted);
        public Task<List<AssignmentVM>> GetOwnAssignments(AssignmentPagingFilterRequest request, string userName);
    }
}

using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assignments
{
    public class AssignmentPagingFilterRequest
    {
        public string KeyWord { get; set; }
        public string StatesFilter { get; set; }
        public string AssignedDateFilter { get; set; }
        public string SortBy { get; set; }
        public bool IsAscending { get; set; }
        public bool IsSortByUpdatedDate { get; set; }
        public bool IsSortByCreatedDate { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public AssignmentPagingFilterRequest()
        {

            StatesFilter = $"{(int)AssignmentState.Accepted},{(int)AssignmentState.WaitingForAcceptance},{(int)AssignmentState.WaitingForReturning}";
            IsAscending = true;
            PageIndex = 1;
            PageSize = 5;
        }
        public string Location { get; set; }
    }
}

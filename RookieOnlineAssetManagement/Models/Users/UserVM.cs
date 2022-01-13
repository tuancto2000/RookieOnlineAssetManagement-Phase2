using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Users
{
    public class UserVM
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DoB { get; set; }
        public DateTime JoinedDate { get; set; }
        public bool Gender { get; set; }
        public UserType Type { get; set; }
        public StateType State { get; set; }
        public string Location { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool isHistory { get; set; }
        public List<ReturnRequest> ReturnsRequests { get; set; }
        public List<ReturnRequest> ReturnsAccepts { get; set; }
        public List<Assignment> AssignmentsTos { get; set; }
        public List<Assignment> AssignmentsBys { get; set; }
    }
}

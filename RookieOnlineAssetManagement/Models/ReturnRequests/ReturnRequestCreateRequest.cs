using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.ReturnRequests
{
    public class ReturnRequestCreateRequest
    {
        public int Id { get; set; }
        public DateTime ReturnedDate { get; set; }
        public ReturnRequestState State { get; set; }
        public int RequestedBy { get; set; }
        public int AcceptedBy { get; set; }
        public int AssignmentId { get; set; }
    }
}

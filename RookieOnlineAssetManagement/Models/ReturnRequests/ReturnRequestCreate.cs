using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.ReturnRequests
{
    public class ReturnRequestCreate
    {
        public int RequestBy { get; set; }
        public int AssignmentId { get; set; }
    }
}

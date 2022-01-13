using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assignments
{
    public class AssignmentCreateRequest
    {
        public DateTime AssignedDate { get; set; }
        public int AssetId { get; set; }
        public string Note { get; set; }
        public int AssignedBy { get; set; }
        public int AssignedTo { get; set; }
    }
}

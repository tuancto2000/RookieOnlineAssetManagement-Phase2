using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assignments
{
    public class AssignmentUpdateRequest
    {
        public int Id { get; set; }
        public DateTime AssignedDate { get; set; }
        public string Note { get; set; }
    }
}

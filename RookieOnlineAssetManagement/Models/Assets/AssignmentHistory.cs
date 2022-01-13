using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assets
{
    public class AssignmentHistory
    {
        public DateTime AssignedDate { get; set; }
        public string AssignedTo { get; set; }
        public string AssignedBy { get; set; }
        public DateTime? ReturnedDate { get; set; }
    }
}

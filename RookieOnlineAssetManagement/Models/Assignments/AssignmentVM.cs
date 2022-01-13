using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assignments
{
    public class AssignmentVM
    {
        public int Id { get; set; }
        public int Ordinal { get; set; }
        public DateTime AssignedDate { get; set; }
        public AssignmentState State { get; set; }
        public string AssetCode { get; set; }
        public string AssetName { get; set; }
        public string AssignedByName { get; set; }
        public string AssignedToName { get; set; }
        public string Specification { get; set; }
        public string Note { get; set; }
    }
}

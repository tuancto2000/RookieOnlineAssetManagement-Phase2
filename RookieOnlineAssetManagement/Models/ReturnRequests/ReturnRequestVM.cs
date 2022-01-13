using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.ReturnRequests
{
    public class ReturnRequestVM
    {
        public int Id { get; set; }
        public int Ordinal { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime? ReturnedDate { get; set; }
        public ReturnRequestState State { get; set; }
        public string AssetCode { get; set; }
        public string AssetName { get; set; }
        public string RequestByName { get; set; }
        public string AcceptedByName { get; set; }
    }
}

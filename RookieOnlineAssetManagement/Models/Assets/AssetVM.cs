using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assets
{
    public class AssetVM
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public CategoryVM Category { get; set; }
        public DateTime InstalledDate { get; set; }
        public AssetState State { get; set; }
        public string Location { get; set; }
        public string Specification { get; set; }
        public List<AssignmentHistory> Histories { get; set; }
    }
}

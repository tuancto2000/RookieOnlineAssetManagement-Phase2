using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Models.Assets
{
    public class AssetUpdateRequest
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Specification { get; set; }
        [Required]
        public DateTime InstalledDate { get; set; }
        [Required]
        public AssetState State { get; set; }
    }
}

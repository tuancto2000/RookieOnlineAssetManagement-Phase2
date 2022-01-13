using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Data.ViewModel
{
    public class ChangePasswordVM
    {
        public int userId { get; set; }
        public string passwordOld { get; set; }
        public string passwordNew { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Data.Enums
{
    public enum AssetState
    {
        Available,
        NotAvailable,
        Assigned,
        WaitingForRecycling,
        Recycled
    }
}

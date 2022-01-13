using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;

[assembly: HostingStartup(typeof(RookieOnlineAssetManagement.Areas.Identity.IdentityHostingStartup))]
namespace RookieOnlineAssetManagement.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
            });
        }
    }
}
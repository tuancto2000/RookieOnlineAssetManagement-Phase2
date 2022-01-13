using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RookieOnlineAssetManagement.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Data.Configurations
{
    public class ReturnRequestConfiguration : IEntityTypeConfiguration<ReturnRequest>
    {
        public void Configure(EntityTypeBuilder<ReturnRequest> builder)
        {
            builder.ToTable("ReturnRequests");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.HasOne(x => x.RequestedUser).WithMany(x => x.ReturnsRequests).HasForeignKey(x => x.RequestedBy)
                     .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.AcceptedUser).WithMany(x => x.ReturnsAccepts).HasForeignKey(x => x.AcceptedBy)
                     .OnDelete(DeleteBehavior.Restrict); 
            builder.HasOne(x => x.Assignment).WithMany(x => x.ReturnRequests).HasForeignKey(x => x.AssignmentId);
        }
    }
}

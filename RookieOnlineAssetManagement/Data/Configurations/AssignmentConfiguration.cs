using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RookieOnlineAssetManagement.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Data.Configurations
{
    public class AssetmentConfiguration : IEntityTypeConfiguration<Assignment>
    {
        public void Configure(EntityTypeBuilder<Assignment> builder)
        {
            builder.ToTable("Assignments");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();
            builder.HasOne(x => x.AssignByUser).WithMany(x => x.AssignmentsBys).HasForeignKey(x => x.AssignedBy)
                    .OnDelete(DeleteBehavior.Restrict); ;
            builder.HasOne(x => x.AssignToUser).WithMany(x => x.AssignmentsTos).HasForeignKey(x => x.AssignedTo)
                    .OnDelete(DeleteBehavior.Restrict); ;
            builder.HasOne(x => x.Asset).WithMany(x => x.Assignments).HasForeignKey(x => x.AssetId);
        }
    }
}

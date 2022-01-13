using RookieOnlineAssetManagement.Data.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace RookieOnlineAssetManagement.Models.Users
{
    public class UserModel
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public DateTime DoB { get; set; }
        [Required]
        public DateTime JoinedDate { get; set; }
        [Required]
        public bool Gender { get; set; }
        [Required]
        public UserType Type { get; set; }
        public string Location { get; set; }
    }
}

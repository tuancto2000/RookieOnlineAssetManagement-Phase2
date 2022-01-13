using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.ViewModel;
using RookieOnlineAssetManagement.Models.Users;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Interfaces
{
    public interface IUserService
    {
        Task<User> GetUserLogin(string email);
        Task<int> ChangePassword(ChangePasswordVM vm);
        Task<bool> ChangePasswordFirstTime(ChangePasswordVM vm);
        Task<bool> Logout();
        public Task<int> Create(UserModel model);
        public Task<bool> Update(UserUpdate model);
        public Task<bool> Disabled(int userId);
        public Task<UserVM> GetUser(int userId);
        public Task<PagedResultBase<UserVM>> GetUsersPagingFilter(UserPagingFilter request);
    }
}

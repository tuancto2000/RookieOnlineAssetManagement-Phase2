using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RookieOnlineAssetManagement.Data;
using RookieOnlineAssetManagement.Data.Entities;
using RookieOnlineAssetManagement.Data.Enums;
using RookieOnlineAssetManagement.Data.ViewModel;
using RookieOnlineAssetManagement.ExtensionMethods;
using RookieOnlineAssetManagement.Interfaces;
using RookieOnlineAssetManagement.Models.Users;
using RookieOnlineAssetManagement.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace RookieOnlineAssetManagement.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        public UserService(ApplicationDbContext dbContext, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<int> Create(UserModel model)
        {
            string staffCode = GenerateUserCode();
            string username = GenerateUserName(model.FirstName, model.LastName);
            string password = GeneratePassword(username, model.DoB);

            var user = new User
            {
                UserName = username,
                Code = staffCode,
                FirstName = model.FirstName,
                LastName = model.LastName,
                DoB = model.DoB,
                JoinedDate = model.JoinedDate,
                Gender = model.Gender,
                Type = model.Type,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                Location = model.Location
            };
            var result = await _userManager.CreateAsync(user, password);
            await _userManager.AddClaimAsync(user, new Claim("location", user.Location));
            await _userManager.AddClaimAsync(user, new Claim("userId", user.Id.ToString()));
            await _userManager.AddClaimAsync(user, new Claim("type", user.Type.ToString()));
            return user.Id;
        }
        public async Task<UserVM> GetUser(int userId)
        {
            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
                throw new Exception($"Cannot find a user with id {userId}");
            var result = new UserVM()
            {
                Code = user.Code,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DoB = user.DoB,
                JoinedDate = user.JoinedDate,
                Gender = user.Gender,
                Type = user.Type,
                State = user.State,
                Location = user.Location,
                CreatedDate = user.CreatedDate,
                UpdatedDate = user.UpdatedDate
            };
            return result;
        }


        public async Task<bool> Update(UserUpdate model)
        {
            var user = await _dbContext.Users.FindAsync(model.Id);
            if (user == null)
                throw new Exception($"Cannot find a user with id {model.Id}");
            user.DoB = model.DoB;
            user.Gender = model.Gender;
            user.JoinedDate = model.JoinedDate;
            user.Type = model.Type;
            user.UpdatedDate = DateTime.Now;
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Disabled(int userId)
        {
            var user = await _dbContext.Users.Include(a => a.AssignmentsTos).Include(a => a.AssignmentsBys).FirstOrDefaultAsync(a => a.Id == userId);
            if (user == null)
                throw new Exception($"Cannot find a user with id {userId}");
            if (user.AssignmentsTos.Count > 0 || user.AssignmentsBys.Count > 0)
                return false;

            user.State = StateType.Disable;
            _dbContext.Users.Update(user);
            return await _dbContext.SaveChangesAsync() > 0;
        }


        public string GenerateUserCode()
        {
            string staffPrefix = "SD";
            var maxUserCode = _dbContext.Users.OrderByDescending(a => a.Code).FirstOrDefault();
            int number = maxUserCode != null ? Convert.ToInt32(maxUserCode.Code.Replace(staffPrefix, "")) + 1 : 1;
            string newUserCode = staffPrefix + number.ToString("D4");
            return newUserCode;
        }
        public string GenerateUserName(string firstName, string lastName)
        {
            StringBuilder username = new StringBuilder();
            username.Append(firstName.Trim().ToLower());
            List<string> words = lastName.Split(' ').ToList();
            
            foreach (var word in words)
            {
                username.Append(Char.ToLower(word[0]));
            };
            var userCount = _dbContext.Users.Where(s => s.UserName.Contains(username.ToString())).ToList().Count();
            if(userCount > 0)
            {
                username.Append(userCount);
            }
            return username.ToString();
        }
        public string GeneratePassword(string username, DateTime dob)
        {
            StringBuilder password = new StringBuilder();
            password.Append(username);
            password.Append("@");
            string day = dob.ToString("dd");
            string month = dob.Month.ToString("D2");
            string year = dob.ToString("yyyy");
            password.Append(day);
            password.Append(month);
            password.Append(year);

            return password.ToString();
        }
        public async Task<PagedResultBase<UserVM>> GetUsersPagingFilter(UserPagingFilter request)
        {

            List<int> types = request.TypeFilter != null ? request.TypeFilter.Split(',').Select(Int32.Parse).ToList() : new List<int>();
            // Filter

            IQueryable<User> query = _dbContext.Users.AsQueryable();
            query = query.WhereIf(request.Location != null, x => x.Location == request.Location);

            query = query.WhereIf(request.KeyWord != null, x => x.UserName.Contains(request.KeyWord) || x.Code.Contains(request.KeyWord) 
                || (x.FirstName + " " + x.LastName).Contains(request.KeyWord));
            query = query.WhereIf(types != null && types.Count > 0, x => types.Contains((int)x.Type));
            query = query.Where(x => x.State == StateType.FirstTime || x.State == StateType.Available);

            // Sort
            if (request.IsSortByCreatedDate == true || request.IsSortByUpdatedDate == true)
            {
                var latestElement = query.FirstIf(request.IsSortByCreatedDate == true, request.IsSortByUpdatedDate == true, x => x.CreatedDate, x => x.UpdatedDate);
                query = query.OrderBy(x => x.Id == latestElement.Id ? 0 : 1).ThenBy(x => x.Id);
            }
            else
            {
                query = query.OrderByIf(request.SortBy == "code", x => x.Code, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "fullName", x => x.FirstName, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "userName", x => x.UserName, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "joinedDate", x => x.JoinedDate, request.IsAscending);
                query = query.OrderByIf(request.SortBy == "type", x => x.Type, !request.IsAscending);
            }

            // Sort

            var totalRecord = await query.CountAsync();
            var data = await query.Paged(request.PageIndex, request.PageSize).Select(a => new UserVM()
            {
                Id = a.Id,
                Code = a.Code,
                UserName = a.UserName,
                FirstName = a.FirstName,
                LastName = a.LastName,
                DoB = a.DoB,
                Gender = a.Gender,
                JoinedDate = a.JoinedDate,
                Type = a.Type,
                State = a.State,
                CreatedDate = a.CreatedDate,
                UpdatedDate = a.UpdatedDate,
                isHistory = (a.AssignmentsBys.Count > 0 || a.AssignmentsTos.Count > 0) ? true : false,
            }).ToListAsync();
            var pagedResult = new PagedResultBase<UserVM>()
            {
                TotalRecords = totalRecord,
                PageSize = request.PageSize,
                PageIndex = request.PageIndex,
                Items = data
            };
            return pagedResult;
        }

        public async Task<User> GetUserLogin(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            return user;
        }

        public async Task<bool> Logout()
        {
            await _signInManager.SignOutAsync();
            return true;
        }

        public async Task<bool> ChangePasswordFirstTime(ChangePasswordVM vm)
        {
            var user = await _dbContext.Users.FindAsync(vm.userId);
            if (user != null && vm.passwordNew != "")
            {
                PasswordHasher<User> hash = new PasswordHasher<User>();
                var hashPassword = hash.HashPassword(user, vm.passwordNew);
                user.PasswordHash = hashPassword;
                user.State = StateType.Available;

                return await _dbContext.SaveChangesAsync() > 0;
            }
            else
            {
                return false;
            }
        }

        public async Task<int> ChangePassword(ChangePasswordVM vm)
        {
            var user = await _dbContext.Users.FindAsync(vm.userId);
            if (user != null && vm.passwordNew != "" && vm.passwordOld != "")
            {
                PasswordHasher<User> hash = new PasswordHasher<User>();
                var verifyPasswordResult = hash.VerifyHashedPassword(user, user.PasswordHash, vm.passwordOld);

                if (verifyPasswordResult.ToString() == "Success")
                {
                    var hashPassword = hash.HashPassword(user, vm.passwordNew);
                    user.PasswordHash = hashPassword;
                    _dbContext.SaveChanges();

                    return 1;
                }
                else
                {
                    return 2;
                }
            }
            else
            {
                return 0;
            }
        }
    }
}

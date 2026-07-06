using DotnetBestPractices.Api.Models;

namespace DotnetBestPractices.Api.Services;

public interface IUserService
{
    Task<IEnumerable<User>> GetUsersAsync();
    Task<User> AddUserAsync(CreateUserDto userDto);
    Task<bool> DeleteUserAsync(int id);
}

using DotnetBestPractices.Api.Models;

namespace DotnetBestPractices.Api.Services;

public class UserService : IUserService
{
    private readonly List<User> _users = new()
    {
        new User { Id = 1, FirstName = "Ada", LastName = "Lovelace", Email = "ada@example.com", Role = UserRole.Admin, IsActive = true, AvatarUrl = "https://i.pravatar.cc/150?u=ada" },
        new User { Id = 2, FirstName = "Alan", LastName = "Turing", Email = "alan@example.com", Role = UserRole.User, IsActive = true, AvatarUrl = "https://i.pravatar.cc/150?u=alan" },
        new User { Id = 3, FirstName = "Grace", LastName = "Hopper", Email = "grace@example.com", Role = UserRole.Admin, IsActive = false, AvatarUrl = "https://i.pravatar.cc/150?u=grace" }
    };

    public Task<IEnumerable<User>> GetUsersAsync()
    {
        return Task.FromResult<IEnumerable<User>>(_users);
    }

    public Task<User?> GetUserByIdAsync(int id)
    {
        var user = _users.FirstOrDefault(u => u.Id == id);
        return Task.FromResult(user);
    }

    public Task<User> AddUserAsync(CreateUserDto userDto)
    {
        var newUser = new User
        {
            Id = _users.Any() ? _users.Max(u => u.Id) + 1 : 1,
            FirstName = userDto.FirstName,
            LastName = userDto.LastName,
            Email = userDto.Email,
            Role = userDto.Role,
            IsActive = userDto.IsActive,
            AvatarUrl = userDto.AvatarUrl
        };

        _users.Add(newUser);
        return Task.FromResult(newUser);
    }

    public Task<bool> DeleteUserAsync(int id)
    {
        var user = _users.FirstOrDefault(u => u.Id == id);
        if (user != null)
        {
            _users.Remove(user);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }
}

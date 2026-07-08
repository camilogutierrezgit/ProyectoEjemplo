using DotnetBestPractices.Api.Models;
using DotnetBestPractices.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace DotnetBestPractices.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User> AddUserAsync(CreateUserDto userDto)
    {
        var newUser = new User
        {
            FirstName = userDto.FirstName,
            LastName = userDto.LastName,
            Email = userDto.Email,
            Role = userDto.Role,
            IsActive = userDto.IsActive,
            AvatarUrl = userDto.AvatarUrl
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();
        
        return newUser;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }
}

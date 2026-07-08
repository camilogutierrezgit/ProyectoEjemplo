using DotnetBestPractices.Api.Models;
using DotnetBestPractices.Api.Services;
using DotnetBestPractices.Api.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;
namespace DotnetBestPractices.Tests.Services;

public class UserServiceTests
{
    [Fact]
    public async Task GetUsersAsync_ShouldReturnInitialUsers()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        
        context.Users.AddRange(
            new User { Id = 1, FirstName = "User1" },
            new User { Id = 2, FirstName = "User2" },
            new User { Id = 3, FirstName = "User3" }
        );
        context.SaveChanges();
        
        var service = new UserService(context);

        // Act
        var users = await service.GetUsersAsync();

        // Assert
        Assert.NotNull(users);
        Assert.Equal(3, users.Count());
    }

    [Fact]
    public async Task AddUserAsync_ShouldAddNewUser()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        
        context.Users.AddRange(
            new User { FirstName = "User1" },
            new User { FirstName = "User2" },
            new User { FirstName = "User3" }
        );
        context.SaveChanges();
        
        var service = new UserService(context);
        var newUserDto = new CreateUserDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Role = UserRole.Guest,
            IsActive = true
        };

        // Act
        var result = await service.AddUserAsync(newUserDto);
        var users = await service.GetUsersAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test", result.FirstName);
        Assert.Equal(4, Enumerable.Count(users));
    }

    [Fact]
    public async Task DeleteUserAsync_ShouldRemoveUser_WhenUserExists()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        
        // Add a user to delete and another one to keep
        context.Users.Add(new User { Id = 1, FirstName = "To Delete" });
        context.Users.Add(new User { Id = 2, FirstName = "To Keep" });
        context.SaveChanges();
        
        var service = new UserService(context);

        // Act
        var result = await service.DeleteUserAsync(1);
        var users = await service.GetUsersAsync();

        // Assert
        Assert.True(result);
        Assert.Equal(1, users.Count());
        Assert.DoesNotContain(users, u => u.Id == 1);
    }
}

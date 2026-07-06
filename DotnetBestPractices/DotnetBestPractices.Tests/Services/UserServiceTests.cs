using DotnetBestPractices.Api.Models;
using DotnetBestPractices.Api.Services;
using Xunit;

namespace DotnetBestPractices.Tests.Services;

public class UserServiceTests
{
    [Fact]
    public async Task GetUsersAsync_ShouldReturnInitialUsers()
    {
        // Arrange
        var service = new UserService();

        // Act
        var users = await service.GetUsersAsync();

        // Assert
        Assert.NotNull(users);
        Assert.Equal(3, users.Count());
    }

    [Fact]
    public async Task AddUserAsync_ShouldAddNewUser()
    {
        // Arrange
        var service = new UserService();
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
        Assert.Equal(4, result.Id);
        Assert.Equal(4, users.Count());
    }

    [Fact]
    public async Task DeleteUserAsync_ShouldRemoveUser_WhenUserExists()
    {
        // Arrange
        var service = new UserService();

        // Act
        var result = await service.DeleteUserAsync(1);
        var users = await service.GetUsersAsync();

        // Assert
        Assert.True(result);
        Assert.Equal(2, users.Count());
        Assert.DoesNotContain(users, u => u.Id == 1);
    }

    [Fact]
    public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var service = new UserService();

        // Act
        var user = await service.GetUserByIdAsync(1);

        // Assert
        Assert.NotNull(user);
        Assert.Equal(1, user.Id);
        Assert.Equal("Ada", user.FirstName);
    }

    [Fact]
    public async Task GetUserByIdAsync_ShouldReturnNull_WhenUserDoesNotExist()
    {
        // Arrange
        var service = new UserService();

        // Act
        var user = await service.GetUserByIdAsync(999);

        // Assert
        Assert.Null(user);
    }
}

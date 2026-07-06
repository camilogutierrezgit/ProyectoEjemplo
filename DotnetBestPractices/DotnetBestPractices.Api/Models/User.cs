namespace DotnetBestPractices.Api.Models;

public enum UserRole
{
    Admin,
    User,
    Guest
}

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    public string AvatarUrl { get; set; } = string.Empty;
}

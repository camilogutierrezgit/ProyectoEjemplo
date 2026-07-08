using DotnetBestPractices.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DotnetBestPractices.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
}

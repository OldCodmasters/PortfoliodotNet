using Microsoft.Extensions.DependencyInjection;
using Resume.Application;

namespace Resume.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddResumeModule(this IServiceCollection services)
    {
        services.AddSingleton<IResumeService, FileSystemResumeService>();
        return services;
    }
}

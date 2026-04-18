using Content.Application;
using Microsoft.Extensions.DependencyInjection;

namespace Content.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddContentModule(this IServiceCollection services)
    {
        services.AddSingleton<IPortfolioContentService, HardcodedPortfolioContentService>();
        return services;
    }
}

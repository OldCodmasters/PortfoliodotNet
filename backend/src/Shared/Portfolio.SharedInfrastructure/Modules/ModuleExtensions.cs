using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Portfolio.SharedInfrastructure.Modules;

public static class ModuleExtensions
{
    public static IServiceCollection RegisterModules(
        this IServiceCollection services,
        IConfiguration configuration,
        params IModule[] modules)
    {
        foreach (var module in modules)
        {
            module.RegisterServices(services, configuration);
        }
        services.AddSingleton<IReadOnlyCollection<IModule>>(modules);
        return services;
    }

    public static IEndpointRouteBuilder MapModules(
        this IEndpointRouteBuilder endpoints,
        IReadOnlyCollection<IModule> modules)
    {
        foreach (var module in modules)
        {
            module.MapEndpoints(endpoints);
        }
        return endpoints;
    }
}

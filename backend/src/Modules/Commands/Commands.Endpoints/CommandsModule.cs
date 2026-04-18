using Commands.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.SharedInfrastructure.Modules;

namespace Commands.Endpoints;

public sealed class CommandsModule : IModule
{
    public string Name => "Commands";

    public IServiceCollection RegisterServices(IServiceCollection services, IConfiguration configuration) =>
        services.AddCommandsModule();

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints) =>
        endpoints.MapCommandsEndpoints();
}

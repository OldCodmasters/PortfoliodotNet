using Content.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.SharedInfrastructure.Modules;

namespace Content.Endpoints;

public sealed class ContentModule : IModule
{
    public string Name => "Content";

    public IServiceCollection RegisterServices(IServiceCollection services, IConfiguration configuration) =>
        services.AddContentModule();

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints) =>
        endpoints.MapContentEndpoints();
}

using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.SharedInfrastructure.Modules;
using Resume.Infrastructure;

namespace Resume.Endpoints;

public sealed class ResumeModule : IModule
{
    public string Name => "Resume";

    public IServiceCollection RegisterServices(IServiceCollection services, IConfiguration configuration) =>
        services.AddResumeModule();

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints) =>
        endpoints.MapResumeEndpoints();
}

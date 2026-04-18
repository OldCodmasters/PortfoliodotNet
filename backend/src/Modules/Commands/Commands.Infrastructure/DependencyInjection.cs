using Commands.Application;
using Commands.Application.Handlers;
using Microsoft.Extensions.DependencyInjection;

namespace Commands.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCommandsModule(this IServiceCollection services)
    {
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<ICommandExecutor, CommandExecutor>();

        services.AddSingleton<ICommandHandler, HelpHandler>();
        services.AddSingleton<ICommandHandler, AboutHandler>();
        services.AddSingleton<ICommandHandler, SkillsHandler>();
        services.AddSingleton<ICommandHandler, EducationHandler>();
        services.AddSingleton<ICommandHandler, ExperienceHandler>();
        services.AddSingleton<ICommandHandler, ProjectsHandler>();
        services.AddSingleton<ICommandHandler, ContactHandler>();
        services.AddSingleton<ICommandHandler, PortfolioHandler>();
        services.AddSingleton<ICommandHandler, ResumeHandler>();
        services.AddSingleton<ICommandHandler, SocialHandler>();
        services.AddSingleton<ICommandHandler, WhoamiHandler>();
        services.AddSingleton<ICommandHandler, PwdHandler>();
        services.AddSingleton<ICommandHandler, LsHandler>();
        services.AddSingleton<ICommandHandler, EchoHandler>();
        services.AddSingleton<ICommandHandler, DateHandler>();
        services.AddSingleton<ICommandHandler, ClearHandler>();

        return services;
    }
}

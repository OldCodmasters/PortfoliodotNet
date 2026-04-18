using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class ProjectsHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["projects"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Recent Projects:

        1. PortfolioWebDotNet - Personal Portfolio Website
           • .NET 10 modular monolith + Next.js 15 frontend
           • iOS 26 Liquid Glass UI
           • Interactive terminal interface

        2. [Project Name] - [Description]
           • [Technology stack]
           • [Key features]

        Type 'projects/index' to view detailed projects page
        """);
}

using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class SkillsHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["skills"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Technical Skills:

        Programming Languages:
        • C#, C++, Python, SQL, JavaScript

        Technologies & Frameworks:
        • .NET, ASP Web, Docker, Kubernetes
        • REST, GraphQL, gRPC, SOAP, LUA
        • React, TypeScript

        Databases:
        • MySQL, PostgreSQL, Microsoft SQL Server, MongoDB

        DevOps & Tools:
        • CI/CD, Azure systems, Dev.Azure
        • Redis, Hardware Maintenance

        Other Skills:
        • Data Structures, Data Analysis
        • Team Collaboration, Project Management
        """);
}

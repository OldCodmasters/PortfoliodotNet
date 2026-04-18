using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class ExperienceHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["experience"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Work Experience:

        Backend Developer - [Company Name]
        • Developed scalable backend solutions
        • Worked with microservices architecture
        • Implemented CI/CD pipelines

        [Additional experience details]
        Type 'experience/index' to view detailed experience page
        """);
}

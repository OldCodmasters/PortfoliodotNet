using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class LsHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["ls", "dir"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        about.html     skills.html    education.html
        projects.html  contact.html   resume.pdf
        experience.html README.md
        """);
}

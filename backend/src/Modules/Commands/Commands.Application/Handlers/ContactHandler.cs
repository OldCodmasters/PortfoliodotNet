using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class ContactHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["contact"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Contact Information:

        LinkedIn: https://www.linkedin.com/in/dehghaniamin
        Email: [Your email]
        GitHub: [Your GitHub]

        Feel free to reach out for collaboration opportunities!
        """);
}

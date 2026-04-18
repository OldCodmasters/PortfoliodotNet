using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class EducationHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["education"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Education Background:

        [Your education details would go here]
        Type 'education/index' to view detailed education page
        """);
}

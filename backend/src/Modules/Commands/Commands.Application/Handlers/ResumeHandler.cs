using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class ResumeHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["resume", "cv"];

    public CommandResult Handle(string args) =>
        CommandResult.Text("Opening resume... Click the CV button above to download my resume.");
}

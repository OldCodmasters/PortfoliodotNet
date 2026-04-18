using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class ClearHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["clear"];
    public CommandResult Handle(string args) => CommandResult.Clear();
}

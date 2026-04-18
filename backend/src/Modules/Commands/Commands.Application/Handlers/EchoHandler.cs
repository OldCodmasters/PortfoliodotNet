using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class EchoHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["echo"];
    public CommandResult Handle(string args) => CommandResult.Text(args);
}

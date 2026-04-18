using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class PwdHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["pwd"];
    public CommandResult Handle(string args) => CommandResult.Text("/home/visitor/portfolio");
}

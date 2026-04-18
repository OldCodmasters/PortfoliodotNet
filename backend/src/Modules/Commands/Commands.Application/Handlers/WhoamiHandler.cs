using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class WhoamiHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["whoami"];
    public CommandResult Handle(string args) => CommandResult.Text("visitor@amindehghani.dev");
}

using Commands.Domain;

namespace Commands.Application;

public interface ICommandHandler
{
    IReadOnlyCollection<string> Names { get; }
    CommandResult Handle(string args);
}

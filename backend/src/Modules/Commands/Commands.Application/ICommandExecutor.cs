using Commands.Domain;

namespace Commands.Application;

public interface ICommandExecutor
{
    CommandResult Execute(string input);
}

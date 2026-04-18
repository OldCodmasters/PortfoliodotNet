using System.Globalization;
using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class DateHandler(IClock clock) : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["date"];

    public CommandResult Handle(string args) =>
        CommandResult.Text(clock.Now.ToString("ddd MMM dd HH:mm:ss 'UTC' yyyy", CultureInfo.InvariantCulture));
}

using Commands.Domain;

namespace Commands.Application;

public sealed class CommandExecutor : ICommandExecutor
{
    private readonly IReadOnlyDictionary<string, ICommandHandler> _handlers;

    public CommandExecutor(IEnumerable<ICommandHandler> handlers)
    {
        _handlers = handlers
            .SelectMany(h => h.Names.Select(n => (Name: n, Handler: h)))
            .ToDictionary(x => x.Name, x => x.Handler, StringComparer.OrdinalIgnoreCase);
    }

    public CommandResult Execute(string input)
    {
        var trimmed = (input ?? string.Empty).Trim();
        if (trimmed.Length == 0)
            return CommandResult.Text(string.Empty);

        var spaceIdx = trimmed.IndexOf(' ');
        var name = (spaceIdx < 0 ? trimmed : trimmed[..spaceIdx]).ToLowerInvariant();
        var args = spaceIdx < 0 ? string.Empty : trimmed[(spaceIdx + 1)..];

        return _handlers.TryGetValue(name, out var handler)
            ? handler.Handle(args)
            : CommandResult.NotFound(name);
    }
}

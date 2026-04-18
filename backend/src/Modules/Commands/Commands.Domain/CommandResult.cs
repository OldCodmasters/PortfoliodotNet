namespace Commands.Domain;

public sealed record CommandResult(string Output, bool ClearTerminal = false)
{
    public static CommandResult Text(string output) => new(output);
    public static CommandResult Clear() => new(string.Empty, ClearTerminal: true);
    public static CommandResult NotFound(string command) =>
        new($"Command '{command}' not found. Type 'help' for available commands.");
}

namespace Commands.Application;

public interface IClock
{
    DateTimeOffset Now { get; }
}

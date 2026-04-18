using Commands.Application;

namespace Commands.Infrastructure;

public sealed class SystemClock : IClock
{
    public DateTimeOffset Now => DateTimeOffset.UtcNow;
}

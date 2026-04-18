using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class SocialHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["social"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Social Media & Links:

        LinkedIn: https://www.linkedin.com/in/dehghaniamin
        [Add other social media links here]
        """);
}

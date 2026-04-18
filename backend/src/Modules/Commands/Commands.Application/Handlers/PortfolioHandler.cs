using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class PortfolioHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["portfolio"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Portfolio Sections:

        • home/index     - Main landing page
        • about/index    - About me
        • skills/index   - Technical skills
        • education/index - Education background
        • projects/index - My projects
        • experience/index - Work experience

        Navigate to any section by typing the command above.
        """);
}

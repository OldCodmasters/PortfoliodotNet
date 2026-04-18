using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class AboutHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["about"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Hi, I'm Amin Dehghani - Backend Developer

        Software Developer & Engineer specializing in Backend Development
        Focus areas: E-Commerce, Game Design, Cybersecurity

        I'm passionate about creating robust and scalable backend solutions
        with expertise in modern technologies and best practices.
        """);
}

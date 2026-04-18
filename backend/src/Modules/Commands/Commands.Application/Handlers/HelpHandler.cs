using Commands.Domain;

namespace Commands.Application.Handlers;

public sealed class HelpHandler : ICommandHandler
{
    public IReadOnlyCollection<string> Names => ["help"];

    public CommandResult Handle(string args) => CommandResult.Text(
        """
        Available commands:
        help        - Show this help message
        about       - Learn about me
        skills      - View my technical skills
        education   - See my education background
        experience  - View my work experience
        projects    - See my projects
        contact     - Get my contact information
        portfolio   - View portfolio sections
        resume      - Download my resume
        social      - View social media links
        whoami      - Display current user
        date        - Show current date
        pwd         - Print working directory
        ls/dir      - List directory contents
        echo [text] - Echo text back
        clear       - Clear terminal
        """);
}

using Resume.Domain;

namespace Resume.Application;

public interface IResumeService
{
    ResumeDocument? GetCurrentResume();
}

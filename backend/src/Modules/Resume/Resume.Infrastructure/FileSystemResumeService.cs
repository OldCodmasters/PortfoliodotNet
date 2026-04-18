using Microsoft.AspNetCore.Hosting;
using Resume.Application;
using Resume.Domain;

namespace Resume.Infrastructure;

public sealed class FileSystemResumeService(IWebHostEnvironment environment) : IResumeService
{
    private const string ResumeFileName = "Amin-DehghaniCV2024.pdf";
    private const string ResumeSubfolder = "pdfs";

    public ResumeDocument? GetCurrentResume()
    {
        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var path = Path.Combine(webRoot, ResumeSubfolder, ResumeFileName);
        return File.Exists(path)
            ? new ResumeDocument(ResumeFileName, "application/pdf", path)
            : null;
    }
}

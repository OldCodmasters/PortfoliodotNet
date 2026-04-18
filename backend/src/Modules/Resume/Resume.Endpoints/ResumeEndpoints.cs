using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;
using Resume.Application;

namespace Resume.Endpoints;

public static class ResumeEndpoints
{
    public static IEndpointRouteBuilder MapResumeEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/resume").WithTags("Resume");

        group.MapGet("/download", Results<PhysicalFileHttpResult, NotFound> (IResumeService service) =>
        {
            var doc = service.GetCurrentResume();
            return doc is null
                ? TypedResults.NotFound()
                : TypedResults.PhysicalFile(doc.AbsolutePath, doc.ContentType, doc.FileName);
        })
        .WithName("DownloadResume")
        .WithSummary("Download the current CV as a PDF attachment.");

        return endpoints;
    }
}

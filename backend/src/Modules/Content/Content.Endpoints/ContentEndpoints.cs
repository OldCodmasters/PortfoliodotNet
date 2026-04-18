using Content.Application;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Content.Endpoints;

public static class ContentEndpoints
{
    public static IEndpointRouteBuilder MapContentEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/content").WithTags("Content");

        group.MapGet("/", (IPortfolioContentService content) =>
            TypedResults.Ok(content.GetPortfolio()))
            .WithName("GetPortfolio")
            .WithSummary("Return the full portfolio payload (hero, experience, skills, awards).");

        group.MapGet("/hero", (IPortfolioContentService content) =>
            TypedResults.Ok(content.GetPortfolio().Hero));

        group.MapGet("/experience", (IPortfolioContentService content) =>
            TypedResults.Ok(content.GetPortfolio().Experience));

        group.MapGet("/skills", (IPortfolioContentService content) =>
            TypedResults.Ok(content.GetPortfolio().Skills));

        group.MapGet("/awards", (IPortfolioContentService content) =>
            TypedResults.Ok(content.GetPortfolio().Awards));

        return endpoints;
    }
}

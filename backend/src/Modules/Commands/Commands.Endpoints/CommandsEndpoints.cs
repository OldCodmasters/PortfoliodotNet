using Commands.Application;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace Commands.Endpoints;

public sealed record ExecuteCommandRequest(string Command);
public sealed record ExecuteCommandResponse(string Result, bool ClearTerminal);

public static class CommandsEndpoints
{
    public static IEndpointRouteBuilder MapCommandsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/commands").WithTags("Commands");

        group.MapPost("/execute", (ExecuteCommandRequest req, ICommandExecutor executor) =>
        {
            var result = executor.Execute(req.Command ?? string.Empty);
            return TypedResults.Ok(new ExecuteCommandResponse(result.Output, result.ClearTerminal));
        })
        .WithName("ExecuteCommand")
        .WithSummary("Execute a terminal command against the portfolio CLI.");

        return endpoints;
    }
}

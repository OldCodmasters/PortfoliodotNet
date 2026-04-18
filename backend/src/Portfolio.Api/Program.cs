using Commands.Endpoints;
using Content.Endpoints;
using Microsoft.AspNetCore.Http.Json;
using Portfolio.SharedInfrastructure.Modules;
using Resume.Endpoints;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "PortfolioFrontend";
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicyName, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

IModule[] modules =
[
    new CommandsModule(),
    new ContentModule(),
    new ResumeModule(),
];

builder.Services.RegisterModules(builder.Configuration, modules);

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors(CorsPolicyName);

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", modules = modules.Select(m => m.Name) }))
    .WithTags("System");

app.MapModules(modules);

app.Run();

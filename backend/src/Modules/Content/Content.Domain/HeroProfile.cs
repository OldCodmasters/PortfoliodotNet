namespace Content.Domain;

public sealed record HeroProfile(
    string Name,
    string Tagline,
    IReadOnlyList<string> BioLines,
    string CvUrl,
    string LinkedInUrl,
    string ImageUrl,
    IReadOnlyList<string> Highlights);

namespace Content.Domain;

public sealed record ExperienceItem(
    string Role,
    string Company,
    string DateRange,
    IReadOnlyList<string> Bullets);

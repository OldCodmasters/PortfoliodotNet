namespace Content.Domain;

public sealed record PortfolioContent(
    HeroProfile Hero,
    IReadOnlyList<ExperienceItem> Experience,
    IReadOnlyList<SkillCategory> Skills,
    IReadOnlyList<Award> Awards);

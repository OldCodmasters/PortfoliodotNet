export type HeroProfile = {
  name: string;
  tagline: string;
  bioLines: string[];
  cvUrl: string;
  linkedInUrl: string;
  imageUrl: string;
  highlights: string[];
};

export type ExperienceItem = {
  role: string;
  company: string;
  dateRange: string;
  bullets: string[];
};

export type SkillCategory = {
  title: string;
  description: string;
};

export type Award = {
  title: string;
  description: string;
};

export type Portfolio = {
  hero: HeroProfile;
  experience: ExperienceItem[];
  skills: SkillCategory[];
  awards: Award[];
};

export type ExecuteCommandResponse = {
  result: string;
  clearTerminal: boolean;
};

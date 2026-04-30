export const SECTION_ORDER = ["home", "experience", "workflow", "skills", "awards"] as const;
export type SectionKey = (typeof SECTION_ORDER)[number];

export const SECTION_LABEL: Record<SectionKey, string> = {
  home: "Home",
  experience: "Experience",
  workflow: "My Work Life",
  skills: "Skills",
  awards: "Awards",
};

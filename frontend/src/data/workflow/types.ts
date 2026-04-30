import type { SVGProps, ReactElement } from "react";

// Shared types for WorkflowSection and its per-track data files.

export type MachineShape =
  | "placer"
  | "printer"
  | "oven"
  | "inspection"
  | "wave"
  | "selective"
  | "rework"
  | "ict"
  | "probe"
  | "fct"
  | "dispenser"
  | "lamp"
  | "router"
  | "xray";

export type Machine = {
  brand: string;
  model: string;
  shape: MachineShape;
  function: string;
  how: string;
  standards: string[];
};

export type SubStage = {
  id: string;
  label: string;
  detail: string;
  standards: string[];
  machines?: Machine[];
};

export type Stage = {
  key: string;
  label: string;
  desc: string;
  overview: string;
  machines?: Machine[];
  subStages?: SubStage[];
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
};

export type TrackId = "process" | "software" | "hardware";

export type Track = {
  id: TrackId;
  label: string;
  subtitle: string;
  intro: string;
  stages: Stage[];
};

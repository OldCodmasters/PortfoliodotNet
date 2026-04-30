import type { SVGProps } from "react";
import type { Stage } from "./types";

// ---------------------------------------------------------------------------
// Hardware Maintenance — the corrective / preventive loop from Vapayesh Sanaat
// Fars and the maintenance side of the SolarEdge line.
// ---------------------------------------------------------------------------

function baseProps(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 40 40",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

function TriageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="17" cy="17" r="8" />
      <line x1="23" y1="23" x2="32" y2="32" />
      <line x1="13" y1="17" x2="21" y2="17" />
      <line x1="17" y1="13" x2="17" y2="21" />
    </svg>
  );
}

function RepairIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M25 8 L32 15 L27 20 L20 13 Z" />
      <line x1="20" y1="13" x2="10" y2="23" />
      <path d="M7 26 L14 33" />
      <circle cx="8.5" cy="24.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PreventiveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="7" y="9" width="26" height="24" rx="1.5" />
      <line x1="7" y1="15" x2="33" y2="15" />
      <line x1="13" y1="6" x2="13" y2="12" />
      <line x1="27" y1="6" x2="27" y2="12" />
      <circle cx="20" cy="24" r="5" />
      <path d="M20 21 L20 24 L22 26" />
    </svg>
  );
}

function VerifyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <rect x="6" y="6" width="28" height="28" rx="1.5" />
      <line x1="6" y1="14" x2="34" y2="14" />
      <line x1="6" y1="22" x2="34" y2="22" />
      <line x1="6" y1="30" x2="34" y2="30" />
      <line x1="14" y1="6" x2="14" y2="34" />
      <line x1="22" y1="6" x2="22" y2="34" />
      <path d="M24 19 L27 22 L32 16" />
    </svg>
  );
}

function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path d="M11 6 H25 L29 10 V34 H11 Z" />
      <line x1="25" y1="6" x2="25" y2="10" />
      <line x1="25" y1="10" x2="29" y2="10" />
      <line x1="15" y1="16" x2="25" y2="16" />
      <line x1="15" y1="21" x2="25" y2="21" />
      <line x1="15" y1="26" x2="22" y2="26" />
    </svg>
  );
}

export const HARDWARE_STAGES: Stage[] = [
  {
    key: "triage",
    label: "Triage & Diagnosis",
    desc: "Isolate, inspect, diagnose.",
    overview:
      "A machine goes down; the line feels it inside a minute. The first job is safety, the second is honest diagnosis. Lockout/tagout, then a structured walk from the symptom back through the signal chain — visual, electrical, mechanical — until the failure mode is named, not guessed at.",
    Icon: TriageIcon,
    subStages: [
      {
        id: "lockout",
        label: "Safety · LOTO · PPE",
        detail:
          "Before a tool comes off the belt: lockout/tagout on every hazardous energy source — electrical, pneumatic, hydraulic, stored mechanical. PPE matched to the arc-flash category and chemistry on the line. The goal is zero-energy verified with a meter, not assumed from a label.",
        standards: ["OSHA 1910.147 (LOTO)", "NFPA 70E", "ANSI Z87.1"],
      },
      {
        id: "visual",
        label: "Visual Inspection",
        detail:
          "Walk the equipment. Burn marks, discolored connectors, melted insulation, loose fasteners, oil seepage around bearings, contamination on sensors. A magnifier and good lighting find eight problems out of ten before a single meter comes out. Photograph the findings for the ticket.",
        standards: ["IPC-A-610 (PCBA visual)", "ISO 9001 visual inspection"],
      },
      {
        id: "electrical",
        label: "Electrical Measurements",
        detail:
          "DMM, clamp meter, scope when needed. Continuity on fuses and interlocks; voltage on supply rails; current on motor windings and heaters; signal integrity on sensor lines. Measure at the failure, compare against the schematic's expected value, document the delta.",
        standards: ["IEC 61010 (measurement safety)", "NIST-traceable calibration"],
      },
      {
        id: "mechanical",
        label: "Mechanical / Pneumatic Inspection",
        detail:
          "Spin shafts by hand to feel bearing wear. Check belt tension and alignment. Listen for leaks in pneumatic lines and confirm cylinder stroke. Verify conveyor levelness and guide-rail parallelism. Mechanical drift is usually slow and shows up as yield loss long before hard failure.",
        standards: ["ISO 10816 (vibration)", "Manufacturer tolerance specs"],
      },
      {
        id: "confirm",
        label: "Fault Confirmation · RCA Plan",
        detail:
          "Name the fault, not the symptom. Reproduce it under controlled conditions if possible. Write the hypothesis, the test that would falsify it, and the expected repair path. This is the artifact that prevents the same fault from being 'fixed' three times by three different shifts.",
        standards: ["5 Whys", "Ishikawa / Fishbone", "FMEA"],
      },
    ],
  },
  {
    key: "repair",
    label: "Corrective Repair",
    desc: "Replace, rework, restore.",
    overview:
      "Once the fault is named, the repair itself is the easy part — if the spares, tools, and process are ready. Board-level rework follows IPC-7711/7721. Mechanical replacements torque to spec. Every repair leaves the equipment in a documented, measurable state — not in 'should be fine now.'",
    Icon: RepairIcon,
    subStages: [
      {
        id: "board",
        label: "Board-Level Rework",
        detail:
          "Rework stations with controlled-temperature tips and nitrogen where the process calls for it. BGA rework with preheat and controlled-cool profiles. IPC-7711/7721 for component removal and replacement; IPC J-STD-001 for the resulting joints. ESD-safe mats, wrist straps, and verified ionizers — silent killer if skipped.",
        standards: ["IPC-7711 / 7721", "IPC J-STD-001", "ANSI/ESD S20.20"],
      },
      {
        id: "component",
        label: "Component Replacement",
        detail:
          "Mechanical, electrical, and electromechanical — motors, drives, solenoids, sensors, actuators, heaters. Match part numbers and revisions exactly; a 'close enough' substitute is a root cause waiting six months to fire. Torque to spec, use thread-locker where the BOM calls for it.",
        standards: ["OEM service manuals", "ISO 9001"],
      },
      {
        id: "wiring",
        label: "Wiring · Connector Repair",
        detail:
          "Re-terminate pulled pins, replace fatigued conductors, reseat connectors with the right lock mechanism. Strain relief restored at every entry. Continuity and hi-pot test before re-energizing. Label everything that was touched so the next tech can trace the change.",
        standards: ["IPC/WHMA-A-620", "UL 486A"],
      },
      {
        id: "alignment",
        label: "Alignment · Calibration",
        detail:
          "Machine-specific alignment — SMT placement head height, AOI lens focus, wave solder pot leveling, selective solder nozzle geometry. Calibration against a known standard, not against the last reading. Record before / after so drift can be tracked over the lifetime of the tool.",
        standards: ["ISO/IEC 17025", "NIST-traceable standards"],
      },
      {
        id: "cleanup",
        label: "Cleanup · Housekeeping",
        detail:
          "Flux residue removed, solder balls vacuumed, chip debris blown out of tracks. Panels and guards reinstalled with every fastener present. A clean machine at handover tells the next shift the job is actually done — and it keeps 5S scores honest.",
        standards: ["5S / Visual Workplace", "IPC-CC-830 (cleanliness)"],
      },
    ],
  },
  {
    key: "preventive",
    label: "Preventive Maintenance",
    desc: "Schedule, inspect, renew.",
    overview:
      "The cheapest repair is the one that never fires. PM schedules are written against manufacturer data and, more importantly, against what the machine has actually failed from. Disciplined PM on the Vapayesh line cut downtime by ~30% — not magic, just a calendar people honored.",
    Icon: PreventiveIcon,
    subStages: [
      {
        id: "schedule",
        label: "PM Schedule · CMMS",
        detail:
          "Every tool owns a PM card in the CMMS. Daily / weekly / monthly / annual tasks tied to runtime hours, cycles, or calendar days — whichever fires first. Work orders auto-generate; completion is signed off; overdue tasks are visible on the board. A missed PM is a near-miss, logged as such.",
        standards: ["ISO 55000 (asset mgmt)", "RCM II"],
      },
      {
        id: "lubrication",
        label: "Lubrication · Wear Parts",
        detail:
          "Grease points hit on schedule with the correct spec — wrong lubricant is worse than none. Filters, belts, brushes, o-rings swapped before they fail. Wear parts kept in kanban bins at the line so a replacement is never 'I'll order it Monday.'",
        standards: ["OEM lubrication charts", "Kanban / 2-bin"],
      },
      {
        id: "calibration",
        label: "Calibration Cycles",
        detail:
          "Meters, gauges, torque drivers, temperature probes all calibrated on a rolling schedule with NIST-traceable standards. Out-of-cal tools pulled off the floor immediately — measurement uncertainty becomes process drift becomes scrap. Certificates filed, due dates visible.",
        standards: ["ISO/IEC 17025", "ANSI/NCSL Z540"],
      },
      {
        id: "condition",
        label: "Condition-Based Monitoring",
        detail:
          "Vibration, temperature, current draw, error-log rates — trended over time, not just spot-checked. A motor that pulls 3% more current this month than last month is telling you something. Condition data beats calendar-based PM on the tools where it's worth the sensor.",
        standards: ["ISO 10816 (vibration)", "Predictive Maintenance (RCM)"],
      },
      {
        id: "inventory",
        label: "Spares · Critical Parts",
        detail:
          "Critical-spare list driven by MTBF and lead time: long-lead parts stocked even if they rarely fail. Min/max on consumables. Obsolescence tracked — a part that goes NRND on a twelve-year line is an emergency, not a surprise. Procurement gets an engineering voice, not just a price voice.",
        standards: ["Criticality analysis", "MIL-STD-1629 (FMECA)"],
      },
    ],
  },
  {
    key: "verify",
    label: "Testing & Verification",
    desc: "Prove it, don't assume.",
    overview:
      "A repair isn't finished until the equipment is provably back in spec. Functional checks, first-off parts, and process capability data all run before the line goes back to production. 'Seems to work' isn't a release criterion — numbers are.",
    Icon: VerifyIcon,
    subStages: [
      {
        id: "functional",
        label: "Functional Test · First-Off",
        detail:
          "Run the machine through its full operating envelope. First-off board or part goes to inspection: AOI, SPI, X-ray, ICT as applicable. Release only when the first-off matches golden samples on every measured attribute.",
        standards: ["IPC-A-610", "AQL sampling"],
      },
      {
        id: "process",
        label: "Process Capability · Cp / Cpk",
        detail:
          "After a repair that could move the process — new nozzle, new thermocouple, new stencil — run a capability study. Cp and Cpk against the spec window, not just an in-spec reading. A capable process is one that can absorb a shift without producing defects.",
        standards: ["Cp / Cpk", "ANSI/ASQ Z1.4"],
      },
      {
        id: "electrical",
        label: "Electrical Safety · Hi-Pot · Bond",
        detail:
          "Any repair that touches mains, earth bonds, or interlocks gets an electrical safety test before re-energizing: hi-pot dielectric withstand, ground-bond resistance, leakage. The machine is not safe until a meter says so, no matter how clean the workmanship looked.",
        standards: ["IEC 60204 (machinery safety)", "NFPA 79"],
      },
      {
        id: "runin",
        label: "Burn-In · Run-In",
        detail:
          "For repairs that could have latent failure modes — solder joints, bearings, power components — run the tool unloaded (or with non-critical jobs) for a defined period. Monitor error logs and temperatures. A clean burn-in is cheap insurance against a midnight pager.",
        standards: ["Infant-mortality testing (bathtub curve)"],
      },
      {
        id: "release",
        label: "Release · Hand-Off",
        detail:
          "Signed hand-off sheet: what failed, what was replaced, what was tested, what to watch for. Operator walks through the first few cycles with the tech. Ticket closes only when the shift supervisor accepts the equipment back into production.",
        standards: ["ISO 9001 control of records"],
      },
    ],
  },
  {
    key: "document",
    label: "Documentation & Escalation",
    desc: "Record, escalate, improve.",
    overview:
      "A repair that isn't documented didn't happen — next shift will re-diagnose it from scratch. Every action gets logged against the asset history. Deviations outside the tech's scope get escalated on a written path, not a hallway conversation. Over time the log is the most valuable asset on the floor.",
    Icon: DocumentIcon,
    subStages: [
      {
        id: "log",
        label: "Maintenance Log · CMMS Entry",
        detail:
          "Every intervention — corrective, preventive, adjustment — logged in the CMMS against the asset. Failure mode coded from a controlled vocabulary so the data is analyzable. Time, parts, labor, root cause. Sloppy entries are sloppy data; sloppy data makes the Pareto chart lie.",
        standards: ["ISO 14224 (reliability data)", "CMMS best practice"],
      },
      {
        id: "runbook",
        label: "Runbook · Standard Work",
        detail:
          "If a fix had to be figured out twice, it belongs in a runbook. Standard-work instructions, photographed, in plain language, held at the line. Updated when the equipment or process changes. The test is: can a qualified tech from a different shift execute it without a phone call?",
        standards: ["Standard Work (Lean)", "Visual Work Instructions"],
      },
      {
        id: "escalate",
        label: "Escalation Procedure",
        detail:
          "Out-of-scope issues — repeat failures, safety concerns, parts obsolescence, process drift that survives repair — follow a written escalation path to engineering. Time-bounded. Documented. 'I told someone once' is not an escalation; a ticket with acknowledgment is.",
        standards: ["ANSI/ISA 18.2 (alarm mgmt)", "Written escalation matrix"],
      },
      {
        id: "capa",
        label: "CAPA · RCA Follow-Through",
        detail:
          "Recurring failures enter a formal CAPA with RCA (5 Whys / fishbone / FMEA), corrective actions, verification of effectiveness, and a close-out date. The CAPA isn't closed when the action ships — it's closed when the next occurrence window passes without recurrence.",
        standards: ["CAPA (21 CFR 820.100)", "8D Problem Solving"],
      },
      {
        id: "improve",
        label: "Continuous Improvement",
        detail:
          "Trend failure codes monthly. Pareto the top three. Kaizen the top one. Preventive maintenance plans, spares lists, operator training, and equipment specs all get updated from the data. The line a year from now should break differently than the line today — fewer repeats, earlier warnings.",
        standards: ["Kaizen", "PDCA", "Six Sigma DMAIC"],
      },
    ],
  },
];
